package com.DsaDude.Execution_worker_Service.Service;

import com.DsaDude.Execution_worker_Service.DTO.ExecutionJob;
import com.DsaDude.Execution_worker_Service.DTO.ExecutionResult;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.*;

@Component
public class ContainerPoolManager {

    private final int POOL_SIZE = 8;
    private final BlockingQueue<String> availableContainers =
            new LinkedBlockingQueue<>();
    private final ExecutorService executor =
            Executors.newFixedThreadPool(POOL_SIZE);

    @PostConstruct
    public void init() throws Exception {
        // Remove any leftover containers first (important)
        for (int i = 1; i <= POOL_SIZE; i++) {
            new ProcessBuilder("docker", "rm", "-f",
                    "cpp-runner-" + i)
                    .start()
                    .waitFor();
        }

        for (int i = 1; i <= POOL_SIZE; i++) {
            String name = "cpp-runner-" + i;
            startContainer(name);
            availableContainers.add(name);
        }
    }

    private void startContainer(String name) throws Exception {

        ProcessBuilder pb = new ProcessBuilder(
                "docker", "run", "-dit",
                "--name", name,
                "cpp-runner", "/bin/bash"
        );

        pb.redirectErrorStream(true);
        Process p = pb.start();

        try (BufferedReader r = new BufferedReader(
                new InputStreamReader(p.getInputStream()))) {

            String line;
            while ((line = r.readLine()) != null) {
                System.out.println("Docker Output: " + line);
            }
        }

        int exit = p.waitFor();
        if (exit != 0) {
            throw new RuntimeException(
                    "Failed to start container: "
                            + name + " (Exit code " + exit + ")");
        }
    }

    public CompletableFuture<ExecutionResult> executeCpp(ExecutionJob job) {

        return CompletableFuture.supplyAsync(() -> {

            String containerName = null;

            try {
                containerName = availableContainers.take();
                return runInsideContainer(containerName, job);
            } catch (Exception e) {
                return new ExecutionResult(
                        "", 0, e.getMessage(), "SYSTEM_ERROR");
            } finally {
                if (containerName != null) {
                    availableContainers.add(containerName);
                }
            }

        }, executor);
    }

    private ExecutionResult runInsideContainer(
            String containerName,
            ExecutionJob job) throws Exception {


        Path tempDir = Files.createTempDirectory("exec-");
        String sourceFileName = getSourceFileName(job.getLanguage());
        Path sourceFile = tempDir.resolve(sourceFileName);
        Path inputFile = tempDir.resolve("input.txt");

        Files.writeString(sourceFile, job.getSourceCode());
        Files.writeString(inputFile,
                job.getInput() == null ? "" : job.getInput());

        long start = System.currentTimeMillis();

        // Copy files to /workspace inside container
        new ProcessBuilder("docker", "cp",
                sourceFile.toString(),
                containerName + ":/workspace/" + sourceFileName)
                .start().waitFor();

        new ProcessBuilder("docker", "cp",
                inputFile.toString(),
                containerName + ":/workspace/input.txt")
                .start().waitFor();

        String execCommand = buildExecutionCommand(job.getLanguage(), sourceFileName);

        // Execute inside container
        ProcessBuilder pb = new ProcessBuilder(
                "docker", "exec",
                containerName,
                "bash", "-c",
                execCommand
        );

        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader =
                     new BufferedReader(
                             new InputStreamReader(
                                     process.getInputStream()))) {

            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        long duration =
                System.currentTimeMillis() - start;

        // Cleanup inside container
        new ProcessBuilder("docker", "exec",
                containerName,
                "bash", "-c",
                "cd /workspace && rm -f main.cpp main input.txt output.txt compile_error.txt runtime_error.txt execution_time.txt execution_status.txt")
                .start().waitFor();

        // Cleanup host temp files
        Files.deleteIfExists(sourceFile);
        Files.deleteIfExists(inputFile);
        Files.deleteIfExists(tempDir);
        
        return mapResult(exitCode, output.toString(), duration);
    }

    private String getSourceFileName(String language) {
        switch (language.toLowerCase()) {
            case "cpp":
            case "c++":
                return "main.cpp";
            case "java":
                return "Main.java";
            case "python":
            case "py":
                return "solution.py";
            case "javascript":
            case "js":
                return "solution.js";
            default:
                return "main.cpp"; // default to C++
        }
    }

    private String buildExecutionCommand(String language, String sourceFileName) {
        switch (language.toLowerCase()) {
            case "cpp":
            case "c++":
                return "cd /workspace && " +
                        "g++ " + sourceFileName + " -o main 2> compile_error.txt; " +
                        "if [ -s compile_error.txt ]; then cat compile_error.txt; exit 1; fi; " +
                        "timeout 2s ./main < input.txt > output.txt 2> runtime_error.txt; " +
                        "EXIT_CODE=$?; " +
                        "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                        "if [ -s runtime_error.txt ]; then cat runtime_error.txt; exit 2; fi; " +
                        "cat output.txt";
            case "java":
                return "cd /workspace && " +
                        "javac " + sourceFileName + " 2> compile_error.txt; " +
                        "if [ -s compile_error.txt ]; then cat compile_error.txt; exit 1; fi; " +
                        "timeout 2s java Main < input.txt > output.txt 2> runtime_error.txt; " +
                        "EXIT_CODE=$?; " +
                        "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                        "if [ -s runtime_error.txt ]; then cat runtime_error.txt; exit 2; fi; " +
                        "cat output.txt";
            case "python":
            case "py":
                return "cd /workspace && " +
                        "timeout 2s python3 " + sourceFileName + " < input.txt > output.txt 2> runtime_error.txt; " +
                        "EXIT_CODE=$?; " +
                        "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                        "if [ -s runtime_error.txt ]; then cat runtime_error.txt; exit 2; fi; " +
                        "cat output.txt";
            case "javascript":
            case "js":
                return "cd /workspace && " +
                        "timeout 2s node " + sourceFileName + " < input.txt > output.txt 2> runtime_error.txt; " +
                        "EXIT_CODE=$?; " +
                        "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                        "if [ -s runtime_error.txt ]; then cat runtime_error.txt; exit 2; fi; " +
                        "cat output.txt";
            default:
                return "cd /workspace && " +
                        "echo 'Unsupported language: " + language + "'; exit 1";
        }
    }

    private ExecutionResult mapResult(
            int exitCode,
            String output,
            long duration) {

        return switch (exitCode) {
            case 0 ->
                    new ExecutionResult(output, duration, "", "SUCCESS");
            case 1 ->
                    new ExecutionResult("", duration, output, "COMPILE_ERROR");
            case 2 ->
                    new ExecutionResult("", duration, output, "RUNTIME_ERROR");
            case 124 ->
                    new ExecutionResult("", duration,
                            "Time Limit Exceeded",
                            "TIME_LIMIT_EXCEEDED");
            default ->
                    new ExecutionResult("", duration,
                            "Unknown Error: " + output,
                            "ERROR");
        };
    }
}