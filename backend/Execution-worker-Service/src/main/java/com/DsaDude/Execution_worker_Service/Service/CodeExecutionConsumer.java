package com.DsaDude.Execution_worker_Service.Service;

import com.DsaDude.Execution_worker_Service.Client.ExecutionSubmissionClient;
import com.DsaDude.Execution_worker_Service.Client.QuestionServiceClient;
import com.DsaDude.Execution_worker_Service.DTO.ExecutionJob;
import com.DsaDude.Execution_worker_Service.DTO.ExecutionResult;
import com.DsaDude.Execution_worker_Service.DTO.SubmissionUpdate;
import com.DsaDude.Execution_worker_Service.DTO.TestcaseResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
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
            runVisibleJob(job);
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
        boolean match = normalizeOutput(expected).equals(normalizeOutput(actual));
        return match;
    }

    private String normalizeOutput(String value) {
        String normalized = value
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .trim();

        String[] lines = normalized.split("\n", -1);
        for (int i = 0; i < lines.length; i++) {
            lines[i] = lines[i].replaceAll("\\s+$", "");
        }
        return String.join("\n", lines).trim();
    }

    public void RunOnHiddenTestcases(ExecutionJob job) {
        String jobId = job.getJobId();
        redisService.markRunning(jobId, job.getSourceCode(), job.getLanguage(), 0, 0);

        String slug = job.getProblemSlug();
        var questionDTO = questionServiceClient.getQuestionBySlug(slug).getData();
        if (questionDTO == null) {
            failSubmission(jobId, job, "SYSTEM_ERROR", "Question metadata not found");
            return;
        }

        Path problemDir = Path.of(basePath).toAbsolutePath().normalize().resolve(slug);
        if (!Files.exists(problemDir)) {
            failSubmission(jobId, job, "SYSTEM_ERROR", "Testcases not found");
            return;
        }

        List<CompletableFuture<TestcaseResult>> futures = new ArrayList<>();
        try (var stream = Files.list(problemDir)) {
            List<Path> inputFiles = stream
                    .filter(path -> path.getFileName().toString().endsWith(".in"))
                    .sorted(Comparator.comparing(path -> path.getFileName().toString()))
                    .toList();

            if (inputFiles.isEmpty()) {
                failSubmission(jobId, job, "SYSTEM_ERROR", "No testcase input files found");
                return;
            }

            int testcaseNumber = 1;
            for (Path inputFile : inputFiles) {
                int currentTestcase = testcaseNumber++;
                String input = readFile(inputFile);
                ExecutionJob newJob = createSubJob(job, jobId, input, inputFile.getFileName().toString());

                CompletableFuture<TestcaseResult> future = executeInternal(newJob).thenCompose(result -> {
                    if (!"SUCCESS".equals(result.getStatus())) {
                        return CompletableFuture.completedFuture(
                                buildTestcaseResult(currentTestcase, inputFile, input, "", result, result.getStatus())
                        );
                    }

                    // Static Check
                    if (questionDTO.isStaticSolution()) {
                        String expected = readFile(problemDir.resolve(inputFile.getFileName().toString().replace(".in", ".out")));
                        String status = isOutputMatching(expected, result.getOutput()) ? "SUCCESS" : "WRONG_ANSWER";
                        return CompletableFuture.completedFuture(
                                buildTestcaseResult(currentTestcase, inputFile, input, expected, result, status)
                        );
                    }

                    // Validator Flow
                    if (questionDTO.getChecker() == null
                            || questionDTO.getChecker().getCode() == null
                            || questionDTO.getChecker().getCode().isBlank()
                            || questionDTO.getChecker().getLanguage() == null
                            || questionDTO.getChecker().getLanguage().isBlank()) {
                        result.setError("Custom checker is not configured");
                        return CompletableFuture.completedFuture(
                                buildTestcaseResult(currentTestcase, inputFile, input, "", result, "CHECKER_ERROR")
                        );
                    }

                    ExecutionJob validatorJob = new ExecutionJob();
                    validatorJob.setJobId(newJob.getJobId() + "_validator");
                    validatorJob.setInput(input + "\n" + result.getOutput());
                    validatorJob.setSourceCode(questionDTO.getChecker().getCode());
                    validatorJob.setLanguage(questionDTO.getChecker().getLanguage());
                    return executeInternal(validatorJob).thenApply(validatorResult -> {
                        if (!"SUCCESS".equals(validatorResult.getStatus())) {
                            validatorResult.setError("Checker failed: " + validatorResult.getError());
                            return buildTestcaseResult(currentTestcase, inputFile, input, "", validatorResult, "CHECKER_ERROR");
                        }

                        String checkerOutput = normalizeOutput(validatorResult.getOutput()).toUpperCase();
                        String status = ("1".equals(checkerOutput) || "PASS".equals(checkerOutput) || "TRUE".equals(checkerOutput))
                                ? "SUCCESS"
                                : "WRONG_ANSWER";
                        return buildTestcaseResult(currentTestcase, inputFile, input, "", result, status);
                    });
                });
                futures.add(future);
            }

            processAllResults(futures, jobId, job);

        } catch (Exception e) {
            failSubmission(jobId, job, "SYSTEM_ERROR", e.getMessage());
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

    private void processAllResults(List<CompletableFuture<TestcaseResult>> futures, String jobId, ExecutionJob job) {
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenRun(() -> {
                    int passed = 0;
                    long totalTime = 0;
                    StringBuilder errorMsg = new StringBuilder();
                    List<TestcaseResult> testcaseResults = new ArrayList<>();
                    String finalVerdict = "WRONG_ANSWER";

                    for (CompletableFuture<TestcaseResult> f : futures) {
                        try {
                            TestcaseResult res = f.join();
                            testcaseResults.add(res);
                            totalTime += res.getExecutionTimeMs();
                            String status = res.getStatus();
                            if ("SUCCESS".equalsIgnoreCase(status)) {
                                passed++;
                            } else {
                                finalVerdict = chooseVerdict(finalVerdict, status);
                                errorMsg.append("Testcase ")
                                        .append(res.getTestcaseNumber())
                                        .append(": ")
                                        .append(status);
                                if (res.getError() != null && !res.getError().isBlank()) {
                                    errorMsg.append(" - ").append(res.getError());
                                }
                                errorMsg.append("\n");
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
                    dto.setTestcaseResults(testcaseResults);

                    if (passed == futures.size()) {
                        dto.setVerdict("ACCEPTED");
                        redisService.markCompleted(jobId, "ACCEPTED", totalTime, job.getSourceCode(), job.getLanguage(), passed, futures.size(), "");
                    } else {
                        dto.setVerdict(finalVerdict);
                        dto.setErrorMessage(errorMsg.toString());
                        redisService.markError(jobId, finalVerdict, errorMsg.toString(), totalTime, job.getSourceCode(), job.getLanguage(), passed, futures.size());
                    }
                    submissionClient.updateSubmission(jobId, dto);
                })
                .exceptionally(ex -> {
                    failSubmission(jobId, job, "SYSTEM_ERROR", ex.getMessage());
                    return null;
                });
    }

    public CompletableFuture<ExecutionResult> runVisibleJob(ExecutionJob job) {
        String jobId = job.getJobId();
        try {
            redisService.markRunning(jobId, job.getSourceCode(), job.getLanguage(), 0, 0);
            return executeInternal(job)
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

    private CompletableFuture<ExecutionResult> executeInternal(ExecutionJob job) {
        return containerPoolManager.executeCpp(job);
    }

    private void failSubmission(String jobId, ExecutionJob job, String verdict, String message) {
        redisService.markError(jobId, verdict, message, 0, job.getSourceCode(), job.getLanguage(), 0, 0);

        SubmissionUpdate dto = new SubmissionUpdate();
        dto.setVerdict(verdict);
        dto.setExecutionTime(0L);
        dto.setMemoryUsed(0L);
        dto.setTotalTestCases(0);
        dto.setPassedTestCases(0);
        dto.setErrorMessage(message);

        try {
            submissionClient.updateSubmission(jobId, dto);
        } catch (Exception e) {
            log.warn("Failed to mark submission {} as {}", jobId, verdict, e);
        }
    }

    private String chooseVerdict(String currentVerdict, String status) {
        if ("COMPILE_ERROR".equalsIgnoreCase(status)) {
            return "COMPILE_ERROR";
        }
        if ("TIME_LIMIT_EXCEEDED".equalsIgnoreCase(status) && !"COMPILE_ERROR".equals(currentVerdict)) {
            return "TIME_LIMIT_EXCEEDED";
        }
        if ("RUNTIME_ERROR".equalsIgnoreCase(status)
                && !"COMPILE_ERROR".equals(currentVerdict)
                && !"TIME_LIMIT_EXCEEDED".equals(currentVerdict)) {
            return "RUNTIME_ERROR";
        }
        if ("CHECKER_ERROR".equalsIgnoreCase(status)
                && "WRONG_ANSWER".equals(currentVerdict)) {
            return "CHECKER_ERROR";
        }
        return currentVerdict;
    }

    private TestcaseResult buildTestcaseResult(
            int testcaseNumber,
            Path inputFile,
            String input,
            String expected,
            ExecutionResult result,
            String status
    ) {
        TestcaseResult testcaseResult = new TestcaseResult();
        testcaseResult.setTestcaseNumber(testcaseNumber);
        testcaseResult.setTestcaseName(inputFile.getFileName().toString());
        testcaseResult.setStatus(status);
        testcaseResult.setExecutionTimeMs(result.getExecutionTimeMs());
        testcaseResult.setInputPreview(preview(input));
        testcaseResult.setExpectedPreview(preview(expected));
        testcaseResult.setActualPreview(preview(result.getOutput()));
        testcaseResult.setError(preview(result.getError()));
        return testcaseResult;
    }

    private String preview(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String cleaned = value.replace("\r\n", "\n").replace("\r", "\n").trim();
        return cleaned.length() <= 500 ? cleaned : cleaned.substring(0, 500) + "...";
    }
}
