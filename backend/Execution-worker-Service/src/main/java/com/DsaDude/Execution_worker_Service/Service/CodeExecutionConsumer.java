package com.DsaDude.Execution_worker_Service.Service;

import com.DsaDude.Execution_worker_Service.Client.ExecutionSubmissionClient;
import com.DsaDude.Execution_worker_Service.Client.QuestionServiceClient;
import com.DsaDude.Execution_worker_Service.DTO.ExecutionJob;
import com.DsaDude.Execution_worker_Service.DTO.ExecutionResult;
import com.DsaDude.Execution_worker_Service.DTO.SubmissionUpdate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
public class CodeExecutionConsumer {

    @Autowired
    private ContainerPoolManager containerPoolManager;
    @Autowired
    private QuestionServiceClient questionServiceClient;
    @Autowired
    private RedisService redisService;
    @Autowired
    private ExecutionSubmissionClient submissionClient;

    @Value("${testcase.storage.path:testcase}")
    private String basePath;

    @KafkaListener(topics = "execution-jobs", groupId = "executor-group")
    public void consume(ExecutionJob job) {
        if ("RUN".equals(job.getTypeOfJob())) {
            runCode(job);
        } else if ("SUBMIT".equals(job.getTypeOfJob())) {
            RunOnHiddenTestcases(job);
        } else {
            log.warn("Unknown job type: {} for job: {}", job.getTypeOfJob(), job.getJobId());
        }
    }

    private String readFile(Path path) {
        try {
            return Files.readString(path);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read file: " + path);
        }
    }

    private boolean isOutputMatching(String expected, String actual) {
        if (expected == null && actual == null) return true;
        if (expected == null || actual == null) return false;

        expected = expected
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .trim();

        actual = actual
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .trim();

        return expected.equals(actual);
    }
    public void RunOnHiddenTestcases(ExecutionJob job) {
        String jobId = job.getJobId();
        redisService.markRunning(jobId, job.getSourceCode(), job.getLanguage(), 0, 0);

        String slug = job.getProblemSlug();
        var questionDTO = questionServiceClient.getQuestionBySlug(slug).getData();

        Path problemDir = Path.of(basePath).toAbsolutePath().normalize().resolve(slug);
        if (!Files.exists(problemDir)) {
            redisService.markError(jobId, "ERROR", "Testcases not found", 0, job.getSourceCode(), job.getLanguage(), 0, 0);
            return;
        }

        List<CompletableFuture<ExecutionResult>> futures = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(problemDir, "*.in")) {
            for (Path inputFile : stream) {
                String input = readFile(inputFile);
                ExecutionJob newJob = createSubJob(job, jobId, input, inputFile.getFileName().toString());

                CompletableFuture<ExecutionResult> future = runCode(newJob).thenCompose(result -> {
                    if (!"SUCCESS".equals(result.getStatus())) {
                        return CompletableFuture.completedFuture(result);
                    }

                    // Static Check
                    if (questionDTO.isStaticSolution()) {
                        String expected = readFile(problemDir.resolve(inputFile.getFileName().toString().replace(".in", ".out")));
                        if (isOutputMatching(expected.trim(), result.getOutput())) {
                            result.setStatus("SUCCESS");
                        } else {
                            result.setStatus("WRONG_ANSWER");
                        }
                        return CompletableFuture.completedFuture(result);
                    }

                    // Validator Flow
                    ExecutionJob validatorJob = new ExecutionJob();
                    validatorJob.setJobId(newJob.getJobId() + "_validator");
                    validatorJob.setInput(input + "\n" + result.getOutput());
                    validatorJob.setSourceCode(questionDTO.getChecker().getCode());
                    validatorJob.setLanguage(questionDTO.getChecker().getLanguage());
                    return runCode(validatorJob);
                });
                futures.add(future);
            }

            processAllResults(futures, jobId, job, questionDTO.isStaticSolution());

        } catch (Exception e) {
            redisService.markError(jobId, "ERROR", e.getMessage(), 0, job.getSourceCode(), job.getLanguage(), 0, 0);
        }
    }

    private ExecutionJob createSubJob(ExecutionJob job, String jobId, String input, String fileName) {
        ExecutionJob newJob = new ExecutionJob();
        newJob.setJobId(jobId + "_" + fileName);
        newJob.setInput(input);
        newJob.setSourceCode(job.getSourceCode());
        newJob.setLanguage(job.getLanguage());
        newJob.setProblemSlug(job.getProblemSlug());
        return newJob;
    }

    private void processAllResults(List<CompletableFuture<ExecutionResult>> futures, String jobId, ExecutionJob job, boolean staticSolution) {
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenRun(() -> {
                    int passed = 0;
                    long totalTime = 0;
                    StringBuilder errorMsg = new StringBuilder();

                    for (CompletableFuture<ExecutionResult> f : futures) {
                        try {
                            ExecutionResult res = f.join();
                            totalTime += res.getExecutionTimeMs();
                            String out = res.getOutput().trim();
                            String status = res.getStatus();
                            if ("SUCCESS".equalsIgnoreCase(out) || "SUCCESS".equalsIgnoreCase(status) && staticSolution || "PASS".equalsIgnoreCase(out)) {
                                passed++;
                            } else {
                                errorMsg.append(res.getError()).append("\n");
                            }
                        } catch (Exception e) {
                            errorMsg.append(e.getMessage()).append("\n");
                        }
                    }

                    SubmissionUpdate dto = new SubmissionUpdate();
                    dto.setTotalTestCases(futures.size());
                    dto.setPassedTestCases(passed);
                    dto.setExecutionTime(totalTime);
                    dto.setMemoryUsed(0L);

                    if (passed == futures.size()) {
                        dto.setVerdict("ACCEPTED");
                        redisService.markCompleted(jobId, "ACCEPTED", totalTime, job.getSourceCode(), job.getLanguage(), passed, futures.size(), "");
                    } else {
                        dto.setVerdict("WRONG_ANSWER");
                        dto.setErrorMessage(errorMsg.toString());
                        redisService.markError(jobId, "WRONG_ANSWER", errorMsg.toString(), totalTime, job.getSourceCode(), job.getLanguage(), passed, futures.size());
                    }
                    submissionClient.updateSubmission(jobId, dto);
                })
                .exceptionally(ex -> {
                    redisService.markError(jobId, "SYSTEM_ERROR", ex.getMessage(), 0, job.getSourceCode(), job.getLanguage(), 0, 0);
                    return null;
                });
    }

    public CompletableFuture<ExecutionResult> runCode(ExecutionJob job) {
        String jobId = job.getJobId();
        try {
            redisService.markRunning(jobId, job.getSourceCode(), job.getLanguage(), 0, 0);
            return containerPoolManager.executeCpp(job)
                    .thenApply(result -> {
                        if ("SUCCESS".equals(result.getStatus())) {
                            redisService.markCompleted(jobId, "SUCCESS", result.getExecutionTimeMs(), job.getSourceCode(), job.getLanguage(), 0, 0, result.getOutput());
                        } else {
                            redisService.markError(jobId, result.getStatus(), result.getError(), result.getExecutionTimeMs(), job.getSourceCode(), job.getLanguage(), 0, 0);
                        }
                        return result;
                    })
                    .exceptionally(ex -> {
                        redisService.markError(jobId, "SYSTEM_ERROR", ex.getMessage(), 0, job.getSourceCode(), job.getLanguage(), 0, 0);
                        return new ExecutionResult("SYSTEM_ERROR", 0, ex.getMessage(), "");
                    });
        } catch (Exception e) {
            redisService.markError(jobId, "ERROR", e.getMessage(), 0, job.getSourceCode(), job.getLanguage(), 0, 0);
            return CompletableFuture.completedFuture(new ExecutionResult("ERROR", 0, e.getMessage(), ""));
        }
    }
}