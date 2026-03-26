package com.CE.Execution_worker_Service.Service;

import com.CE.Execution_worker_Service.Client.QuestionServiceClient;
import com.CE.Execution_worker_Service.DTO.ExecutionJob;
import com.CE.Execution_worker_Service.DTO.ExecutionResult;
import io.netty.util.concurrent.CompleteFuture;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;

@Component
@Slf4j
@Service
public class CodeExecutionConsumer {
    @Autowired
    ContainerPoolManager containerPoolManager;
    @Autowired
    QuestionServiceClient questionServiceClient;
    @Autowired
    RedisService redisService;
    @Value("${testcase.storage.path:testcase}")
    private String basePath;

    @KafkaListener(
            topics = "execution-jobs",
            groupId = "executor-group"
    )

    public void consume(ExecutionJob job) {
        if("RUN".equals(job.getTypeOfJob())) {
            runCode(job);
        } else {
            // extract each hidden testcase...
            RunOnHiddenTestcases(job);
        }
    }
    private String readFile(Path path) {
        try {
            return Files.readString(path);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read file: " + path);
        }
    }
    public void RunOnHiddenTestcases(ExecutionJob job) {
        String jobId = job.getJobId();
        redisService.markRunning(jobId);

        String slug = job.getProblemSlug();

        QuestionServiceClient.ApiResponse<QuestionServiceClient.QuestionDTO> apiResponse =
                questionServiceClient.getQuestionBySlug(slug);

        QuestionServiceClient.QuestionDTO questionDTO = apiResponse.getData();

        Path base = Path.of(basePath).toAbsolutePath().normalize();
        Path problemDir = base.resolve(slug);

        if (!Files.exists(problemDir)) {
            redisService.markError(jobId, "ERROR", "Testcases not found", 0);
            return;
        }

        List<CompletableFuture<ExecutionResult>> futures = new ArrayList<>();

        /* - taking input files
           - making stream of files with .in extension */
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(problemDir, "*.in")) {

            for (Path inputFile : stream) {

                String input = readFile(inputFile);

                ExecutionJob newJob = new ExecutionJob();
                newJob.setJobId(jobId + "_" + inputFile.getFileName());
                newJob.setInput(input);
                newJob.setSourceCode(job.getSourceCode());
                newJob.setLanguage(job.getLanguage());
                newJob.setProblemSlug(slug);

                CompletableFuture<ExecutionResult> future =
                        runCode(newJob)
                                .thenCompose(result -> {

                                    // ❌ If execution failed → return as is
                                    if (!"SUCCESS".equals(result.getStatus())) {
                                        return CompletableFuture.completedFuture(result);
                                    }

                                    // ✅ STATIC OUTPUT CHECK
                                    if (questionDTO.isStaticSolution()) {

                                        String fileName = inputFile.getFileName().toString().replace(".in", ".out");
                                        Path outputFile = problemDir.resolve(fileName);

                                        String expected = readFile(outputFile);

                                        if (expected.trim().equals(result.getOutput().trim())) {
                                            result.setStatus("SUCCESS");
                                        } else {
                                            result.setStatus("WRONG_ANSWER");
                                        }

                                        return CompletableFuture.completedFuture(result);
                                    }

                                    // ✅ VALIDATOR FLOW
                                    else {
                                        ExecutionJob validatorJob = new ExecutionJob();
                                        validatorJob.setJobId(newJob.getJobId() + "_validator");
                                        validatorJob.setInput(input + "\n" + result.getOutput());
                                        validatorJob.setSourceCode(questionDTO.getChecker().getCode());
                                        validatorJob.setLanguage(questionDTO.getChecker().getLanguage());

                                        return runCode(validatorJob);
                                    }
                                });

                futures.add(future);
            }

            // 🔥 Combine all futures
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .thenRun(() -> {
                        long passed = 0;
                        long total = futures.size();
                        long totalTime = 0;

                        StringBuilder errorMessage = new StringBuilder();

                        for (CompletableFuture<ExecutionResult> f : futures) {
                            try {
                                ExecutionResult res = f.join(); // safe after allOf

                                totalTime += res.getExecutionTimeMs();

                                if ("SUCCESS".equals(res.getStatus())) {
                                    passed++;
                                } else {
                                    errorMessage.append(res.getError()).append("\n");
                                }

                            } catch (Exception e) {
                                errorMessage.append(e.getMessage()).append("\n");
                            }
                        }

                        if (passed == total) {
                            redisService.markCompleted(
                                    jobId,
                                    "Passed all " + total + " testcases",
                                    totalTime
                            );
                        } else {
                            redisService.markError(
                                    jobId,
                                    "FAILED",
                                    errorMessage.toString(),
                                    totalTime
                            );
                        }
                    })
                    .exceptionally(ex -> {
                        redisService.markError(
                                jobId,
                                "SYSTEM_ERROR",
                                ex.getMessage(),
                                0
                        );
                        return null;
                    });

        } catch (Exception e) {
            redisService.markError(jobId, "ERROR", e.getMessage(), 0);
        }
    }
    public CompletableFuture<ExecutionResult> runCode(ExecutionJob job) {
        String jobId = job.getJobId();

        try {
            redisService.markRunning(jobId);

            return containerPoolManager.executeCpp(job)
                    .thenApply(result -> {
                        String status = result.getStatus();

                        if ("SUCCESS".equals(status)) {
                            redisService.markCompleted(
                                    jobId,
                                    result.getOutput(),
                                    result.getExecutionTimeMs()
                            );
                        } else {
                            redisService.markError(
                                    jobId,
                                    status,
                                    result.getError(),
                                    result.getExecutionTimeMs()
                            );
                        }

                        return result;
                    })
                    .exceptionally(ex -> {
                        redisService.markError(
                                jobId,
                                "SYSTEM_ERROR",
                                ex.toString(),
                                0
                        );

                        // return fallback result instead of null (better practice)
                        return new ExecutionResult(
                                "SYSTEM_ERROR",
                                0,
                                ex.getMessage(),
                                ""
                        );
                    });

        } catch (Exception e) {
            redisService.markError(
                    jobId,
                    "ERROR",
                    e.getMessage(),
                    0
            );

            return CompletableFuture.completedFuture(
                    new ExecutionResult("ERROR", 0, e.getMessage(), "COMPLETED")
            );
        }
    }
}