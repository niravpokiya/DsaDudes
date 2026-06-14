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
    private static final int DOCKER_EXEC_TIMEOUT_SECONDS = 20;
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
                "--network", "none",
                "--memory", "256m",
                "--cpus", "1",
                "--pids-limit", "128",
                "--security-opt", "no-new-privileges",
                "--cap-drop", "ALL",
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


        String language = normalizeLanguage(job.getLanguage());
        if (language == null) {
            return new ExecutionResult("", 0, "Unsupported language: " + job.getLanguage(), "UNSUPPORTED_LANGUAGE");
        }

        Path tempDir = Files.createTempDirectory("exec-");
        String sourceFileName = getSourceFileName(language);
        Path sourceFile = tempDir.resolve(sourceFileName);
        Path inputFile = tempDir.resolve("input.txt");

        try {
            Files.writeString(sourceFile, job.getSourceCode());
            Files.writeString(inputFile,
                    job.getInput() == null ? "" : job.getInput());

            long start = System.currentTimeMillis();

            // Copy files to /workspace inside container
            runDockerCommand(new ProcessBuilder("docker", "cp",
                    sourceFile.toString(),
                    containerName + ":/workspace/" + sourceFileName));

            runDockerCommand(new ProcessBuilder("docker", "cp",
                    inputFile.toString(),
                    containerName + ":/workspace/input.txt"));

            String execCommand = buildExecutionCommand(language, sourceFileName);

            // Execute inside container
            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "exec",
                    containerName,
                    "bash", "-c",
                    execCommand
            );
            pb.redirectErrorStream(true);

            Process process = pb.start();
            CompletableFuture<String> outputFuture =
                    CompletableFuture.supplyAsync(() -> readLimitedOutputQuietly(process));

            boolean finished = process.waitFor(DOCKER_EXEC_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            long duration =
                    System.currentTimeMillis() - start;

            if (!finished) {
                process.destroyForcibly();
                return new ExecutionResult("", duration, "Execution worker timed out", "SYSTEM_ERROR");
            }

            int exitCode = process.exitValue();
            String output = outputFuture.get(2, TimeUnit.SECONDS);

            return mapResult(exitCode, output, duration);
        } finally {
            try {
                // Cleanup inside container
                new ProcessBuilder("docker", "exec",
                        containerName,
                        "bash", "-c",
                        "cd /workspace && rm -f main.cpp Main.java solution.py solution.js main Main.class input.txt output.txt compile_error.txt runtime_error.txt")
                        .start().waitFor();
            } catch (Exception ignored) {
            }

            try {
                // Cleanup host temp files
                Files.deleteIfExists(sourceFile);
                Files.deleteIfExists(inputFile);
                Files.deleteIfExists(tempDir);
            } catch (Exception ignored) {
            }
        }
    }

    private String getSourceFileName(String language) {
        switch (language) {
            case "cpp":
                return "main.cpp";
            case "java":
                return "Main.java";
            case "python":
            case "py":
                return "solution.py";
            case "javascript":
                return "solution.js";
            default:
                throw new IllegalArgumentException("Unsupported language: " + language);
        }
    }

    private String buildExecutionCommand(String language, String sourceFileName) {
        switch (language) {
            case "cpp":
                return "cd /workspace && " +
                        "timeout 10s g++ " + sourceFileName + " -o main 2> compile_error.txt; " +
                        "COMPILE_EXIT=$?; " +
                        "if [ $COMPILE_EXIT -eq 124 ]; then echo 'Compilation timed out'; exit 1; fi; " +
                        "if [ -s compile_error.txt ]; then cat compile_error.txt; exit 1; fi; " +
                        "timeout 2s ./main < input.txt > output.txt 2> runtime_error.txt; " +
                        "EXIT_CODE=$?; " +
                        "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                        "if [ -s runtime_error.txt ]; then cat runtime_error.txt; exit 2; fi; " +
                        "cat output.txt";
            case "java":
                return "cd /workspace && " +
                        "timeout 10s javac " + sourceFileName + " 2> compile_error.txt; " +
                        "COMPILE_EXIT=$?; " +
                        "if [ $COMPILE_EXIT -eq 124 ]; then echo 'Compilation timed out'; exit 1; fi; " +
                        "if [ -s compile_error.txt ]; then cat compile_error.txt; exit 1; fi; " +
                        "timeout 2s java Main < input.txt > output.txt 2> runtime_error.txt; " +
                        "EXIT_CODE=$?; " +
                        "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                        "if [ -s runtime_error.txt ]; then cat runtime_error.txt; exit 2; fi; " +
                        "cat output.txt";
            case "python":
                return "cd /workspace && " +
                        "timeout 2s python3 " + sourceFileName + " < input.txt > output.txt 2> runtime_error.txt; " +
                        "EXIT_CODE=$?; " +
                        "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                        "if [ -s runtime_error.txt ]; then cat runtime_error.txt; exit 2; fi; " +
                        "cat output.txt";
            case "javascript":
                return "cd /workspace && " +
                        "timeout 2s node " + sourceFileName + " < input.txt > output.txt 2> runtime_error.txt; " +
                        "EXIT_CODE=$?; " +
                        "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                        "if [ -s runtime_error.txt ]; then cat runtime_error.txt; exit 2; fi; " +
                        "cat output.txt";
            default:
                throw new IllegalArgumentException("Unsupported language: " + language);
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

    private String normalizeLanguage(String language) {
        if (language == null) {
            return null;
        }

        return switch (language.toLowerCase()) {
            case "cpp", "c++" -> "cpp";
            case "java" -> "java";
            case "python", "py" -> "python";
            case "javascript", "js" -> "javascript";
            default -> null;
        };
    }

    private void runDockerCommand(ProcessBuilder processBuilder) throws Exception {
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();
        CompletableFuture<String> outputFuture =
                CompletableFuture.supplyAsync(() -> readLimitedOutputQuietly(process));
        boolean finished = process.waitFor(DOCKER_EXEC_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Docker command timed out");
        }
        String output = outputFuture.get(2, TimeUnit.SECONDS);
        if (process.exitValue() != 0) {
            throw new RuntimeException("Docker command failed: " + output);
        }
    }

    private String readLimitedOutputQuietly(Process process) {
        try {
            return readLimitedOutput(process);
        } catch (IOException e) {
            return e.getMessage();
        }
    }

    private String readLimitedOutput(Process process) throws IOException {
        StringBuilder output = new StringBuilder();
        try (Reader reader = new InputStreamReader(process.getInputStream())) {
            char[] buffer = new char[4096];
            int read;
            while ((read = reader.read(buffer)) != -1) {
                    output.append(buffer, 0, read);
            }
        }
        return output.toString();
    }
}
