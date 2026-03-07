package com.DsaDude.Code_Execution_Service.services;

import com.DsaDude.Code_Execution_Service.DTO.CodeResponse;
import com.DsaDude.Code_Execution_Service.DTO.HiddenTestResponse;
import com.DsaDude.Code_Execution_Service.Executors.Judge0Executor;
import com.DsaDude.Code_Execution_Service.Feign.QuestionServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PreDestroy;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class CodeExecutionService {

    private final ExecutorService executorService = Executors.newFixedThreadPool(20);
    long total_time= 0;
    @Value("${testcase.storage.path:testcase}")
    private String basePath;

    @Autowired
    private QuestionServiceClient questionServiceClient;

    private record TestResult(String fileName, boolean passed, String failureMessage, long time) {}
    @PreDestroy
    public void shutdownExecutor() {
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(60, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException ie) {
            executorService.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Executes code using Judge0 (via RapidAPI).
     */
    public CodeResponse executeCode(String code, String language, String input) throws IOException {
        Integer languageId = switch (language.toLowerCase()) {
            case "cpp" -> 54;          // GCC C++ (9.2.0)
            case "java" -> 62;         // Java (OpenJDK 13.0.1)
            case "python" -> 71;       // Python (3.8.1)
            case "javascript" -> 63;   // Node.js (12.14.0)
            default -> null;
        };

        if (languageId == null) {
            return new CodeResponse("", "Unsupported language: " + language, -1, 0);
        }

        return Judge0Executor.executeCode(code, input, languageId);
    }

    /**
     * Runs all hidden testcases in parallel using ExecutorService.
     */
    public HiddenTestResponse runHiddenTestcases(String problemSlug, String code, String language) {
        QuestionServiceClient.ApiResponse<QuestionServiceClient.QuestionDTO> apiResponse =
                questionServiceClient.getQuestionBySlug(problemSlug);
        QuestionServiceClient.QuestionDTO questionDTO = apiResponse.getData();

        final QuestionServiceClient.ValidatorDTO validator =
                questionDTO.isStaticSolution() ? null : questionDTO.getChecker();

        Path base = Path.of(basePath).toAbsolutePath().normalize();
        Path problemDir = base.resolve(problemSlug);
        System.out.println("Path : " + problemDir);
        if (!Files.exists(problemDir)) {
            throw new RuntimeException("Testcases not found for problem: " + problemSlug);
        }

        List<CompletableFuture<TestResult>> futures = new ArrayList<>();
        long totaltime = 0;
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(problemDir, "*.in")) {
            for (Path inputFile : stream) {
                CompletableFuture<TestResult> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        return runSingleTestcaseParallel(inputFile, problemDir, code, language, validator);
                    } catch (Exception e) {
                        return new TestResult(inputFile.getFileName().toString(), false,
                                "Error running testcase: " + e.getMessage(), 0);
                    }
                }, executorService);
                futures.add(future);
            }

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            long passed = 0;
            long total = 0;
            StringBuilder messageBuilder = new StringBuilder();

            for (CompletableFuture<TestResult> future : futures) {
                total++;
                TestResult result = future.get();
                if (result.passed()) passed++;
                else messageBuilder.append(result.failureMessage()).append("\n");
            }

            HiddenTestResponse response = new HiddenTestResponse();
            response.setTotal(total);
            response.setPassed(passed);
            response.setFailed(total - passed);
            response.setMessage(messageBuilder.length() == 0
                    ? "Passed " + passed + " / " + total + " testcases"
                    : messageBuilder.toString());
            response.setTime(total_time);

            return response;
        } catch (IOException | InterruptedException | ExecutionException e) {
            HiddenTestResponse errorResponse = new HiddenTestResponse();
            errorResponse.setPassed(0);
            errorResponse.setFailed(1);
            errorResponse.setTotal(1);
            errorResponse.setMessage("Fatal error during parallel execution: " + e.getMessage());
            return errorResponse;
        }
    }

    private TestResult runSingleTestcaseParallel(Path inputFile, Path problemDir, String code, String language,
                                                 QuestionServiceClient.ValidatorDTO validator) throws IOException {

        Path outputFile = problemDir.resolve(inputFile.getFileName().toString().replace(".in", ".out"));
        String inputContent = Files.readString(inputFile).trim();
        String expectedOutput = Files.exists(outputFile) ? Files.readString(outputFile).trim() : "";
        String fileName = inputFile.getFileName().toString();

        // Run user code
        CodeResponse userResponse = executeCode(code, language, inputContent);
        String userOutput = userResponse.getOutput().trim();
        String userError = userResponse.getError().trim();
        total_time += userResponse.getTime();

        boolean passedTestcase = false;
        String failureMessage = "";

        if (!userError.isEmpty()) {
            failureMessage = String.format("Testcase %s failed:\nUser code error: %s", fileName, userError);
        } else if (validator != null) {
            // Run validator
            String validatorInput = inputContent + "\n" + userOutput;
            CodeResponse validatorResponse = executeCode(validator.getCode(), validator.getLanguage(), validatorInput);
            String validatorOutput = validatorResponse.getOutput().trim();
            String validatorError = validatorResponse.getError().trim();

            if (!validatorError.isEmpty()) {
                failureMessage = String.format("Testcase %s validator error:\n%s", fileName, validatorError);
            } else if ("success".equalsIgnoreCase(validatorOutput) || "pass".equalsIgnoreCase(validatorOutput)) {
                passedTestcase = true;
            } else {
                failureMessage = String.format("Testcase %s failed: Validator returned '%s'", fileName, validatorOutput);
            }
        } else {
            // Static problem: compare output
            if (userOutput.equals(expectedOutput)) passedTestcase = true;
            else failureMessage = String.format("Testcase %s failed: Expected '%s' but got '%s'", fileName, expectedOutput, userOutput);
        }

        return new TestResult(fileName, passedTestcase, failureMessage, total_time);
    }
}
