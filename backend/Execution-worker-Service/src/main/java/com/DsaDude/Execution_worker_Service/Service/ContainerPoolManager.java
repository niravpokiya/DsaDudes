package com.DsaDude.Execution_worker_Service.Service;

import com.DsaDude.Execution_worker_Service.DTO.ExecutionJob;
import com.DsaDude.Execution_worker_Service.DTO.ExecutionResult;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

@Component
public class ContainerPoolManager {

    private static final int POOL_SIZE = 8;
    private static final int DOCKER_EXEC_TIMEOUT_SECONDS = 20;
    private static final List<String> SUPPORTED_LANGUAGES = List.of("cpp", "java", "python");
    private static final Map<String, String> RUNNER_IMAGES = Map.of(
            "cpp", "cpp-runner",
            "java", "java-runner",
            "python", "python-runner"
    );

    private final Map<String, BlockingQueue<String>> availableContainersByLanguage = new HashMap<>();
    private final ExecutorService executor = Executors.newFixedThreadPool(POOL_SIZE * SUPPORTED_LANGUAGES.size());

    @PostConstruct
    public void init() throws Exception {
        for (String language : SUPPORTED_LANGUAGES) {
            String imageName = RUNNER_IMAGES.get(language);
            BlockingQueue<String> availableContainers = new LinkedBlockingQueue<>();
            availableContainersByLanguage.put(language, availableContainers);

            for (int i = 1; i <= POOL_SIZE; i++) {
                new ProcessBuilder("docker", "rm", "-f", imageName + "-" + i)
                        .start()
                        .waitFor();
            }

            for (int i = 1; i <= POOL_SIZE; i++) {
                String containerName = imageName + "-" + i;
                startContainer(containerName, imageName);
                availableContainers.add(containerName);
            }
        }
    }

    private void startContainer(String containerName, String imageName) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
                "docker", "run", "-dit",
                "--name", containerName,
                "--network", "none",
                "--memory", "256m",
                "--cpus", "1",
                "--pids-limit", "128",
                "--security-opt", "no-new-privileges",
                "--cap-drop", "ALL",
                imageName, "/bin/bash"
        );

        pb.redirectErrorStream(true);
        Process p = pb.start();

        try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
            String line;
            while ((line = r.readLine()) != null) {
                System.out.println("Docker Output: " + line);
            }
        }

        int exit = p.waitFor();
        if (exit != 0) {
            throw new RuntimeException("Failed to start container: " + containerName + " (Exit code " + exit + ")");
        }
    }

    public CompletableFuture<ExecutionResult> execute(ExecutionJob job) {
        return CompletableFuture.supplyAsync(() -> {
            String language = normalizeLanguage(job.getLanguage());
            if (!isSupported(language)) {
                return unsupportedLanguage(job.getLanguage());
            }

            String containerName = null;

            try {
                containerName = availableContainersByLanguage.get(language).take();
                return runInsideContainer(containerName, job);
            } catch (Exception e) {
                return new ExecutionResult("", 0, e.getMessage(), "SYSTEM_ERROR");
            } finally {
                releaseContainer(language, containerName);
            }
        }, executor);
    }

    public CompletableFuture<ExecutionResult> executeCpp(ExecutionJob job) {
        return execute(job);
    }

    public CompletableFuture<List<ExecutionResult>> executeSubmissionTestcases(ExecutionJob job, List<String> inputs) {
        return CompletableFuture.supplyAsync(() -> {
            String language = normalizeLanguage(job.getLanguage());
            if (!isSupported(language)) {
                return repeatedResult(inputs.size(), unsupportedLanguage(job.getLanguage()));
            }

            String containerName = null;

            try {
                containerName = availableContainersByLanguage.get(language).take();
                return runSubmissionInsideContainer(containerName, job, inputs);
            } catch (Exception e) {
                List<ExecutionResult> results = new ArrayList<>();
                for (int i = 0; i < inputs.size(); i++) {
                    results.add(new ExecutionResult("", 0, e.getMessage(), "SYSTEM_ERROR"));
                }
                return results;
            } finally {
                releaseContainer(language, containerName);
            }
        }, executor);
    }

    private void releaseContainer(String language, String containerName) {
        if (language != null && containerName != null) {
            availableContainersByLanguage.get(language).add(containerName);
        }
    }

    private boolean isSupported(String language) {
        return language != null && RUNNER_IMAGES.containsKey(language);
    }

    private ExecutionResult unsupportedLanguage(String language) {
        return new ExecutionResult("", 0, "Unsupported language: " + language, "UNSUPPORTED_LANGUAGE");
    }

    private List<ExecutionResult> runSubmissionInsideContainer(
            String containerName,
            ExecutionJob job,
            List<String> inputs) throws Exception {

        String language = normalizeLanguage(job.getLanguage());
        Path tempDir = Files.createTempDirectory("exec-submit-");
        String sourceFileName = getSourceFileName(language);
        Path sourceFile = tempDir.resolve(sourceFileName);
        Path inputFile = tempDir.resolve("input.txt");

        try {
            Files.writeString(sourceFile, job.getSourceCode());

            runDockerCommand(new ProcessBuilder("docker", "cp",
                    sourceFile.toString(),
                    containerName + ":/workspace/" + sourceFileName));

            String compileCommand = buildCompileCommand(language, sourceFileName);
            if (compileCommand != null) {
                ExecutionResult compileResult = runDockerExecCommand(containerName, compileCommand);
                if (!"SUCCESS".equals(compileResult.getStatus())) {
                    return repeatedResult(inputs.size(), compileResult);
                }
            }

            List<ExecutionResult> results = new ArrayList<>();
            String runCommand = buildRunCommand(language, sourceFileName);

            for (String input : inputs) {
                Files.writeString(inputFile, input == null ? "" : input);
                runDockerCommand(new ProcessBuilder("docker", "cp",
                        inputFile.toString(),
                        containerName + ":/workspace/input.txt"));
                results.add(runDockerExecCommand(containerName, runCommand));
            }

            return results;
        } finally {
            cleanupWorkspace(containerName);

            try {
                Files.deleteIfExists(sourceFile);
                Files.deleteIfExists(inputFile);
                Files.deleteIfExists(tempDir);
            } catch (Exception ignored) {
            }
        }
    }

    private List<ExecutionResult> repeatedResult(int count, ExecutionResult result) {
        List<ExecutionResult> results = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            results.add(new ExecutionResult(
                    result.getOutput(),
                    i == 0 ? result.getExecutionTimeMs() : 0,
                    result.getError(),
                    result.getStatus()));
        }
        return results;
    }

    private ExecutionResult runInsideContainer(String containerName, ExecutionJob job) throws Exception {
        String language = normalizeLanguage(job.getLanguage());
        Path tempDir = Files.createTempDirectory("exec-");
        String sourceFileName = getSourceFileName(language);
        Path sourceFile = tempDir.resolve(sourceFileName);
        Path inputFile = tempDir.resolve("input.txt");

        try {
            Files.writeString(sourceFile, job.getSourceCode());
            Files.writeString(inputFile, job.getInput() == null ? "" : job.getInput());

            long start = System.currentTimeMillis();

            runDockerCommand(new ProcessBuilder("docker", "cp",
                    sourceFile.toString(),
                    containerName + ":/workspace/" + sourceFileName));

            runDockerCommand(new ProcessBuilder("docker", "cp",
                    inputFile.toString(),
                    containerName + ":/workspace/input.txt"));

            String execCommand = buildExecutionCommand(language, sourceFileName);
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
            long duration = System.currentTimeMillis() - start;

            if (!finished) {
                process.destroyForcibly();
                return new ExecutionResult("", duration, "Execution worker timed out", "SYSTEM_ERROR");
            }

            int exitCode = process.exitValue();
            String output = outputFuture.get(2, TimeUnit.SECONDS);

            return mapResult(exitCode, output, duration);
        } finally {
            cleanupWorkspace(containerName);

            try {
                Files.deleteIfExists(sourceFile);
                Files.deleteIfExists(inputFile);
                Files.deleteIfExists(tempDir);
            } catch (Exception ignored) {
            }
        }
    }

    private String getSourceFileName(String language) {
        return switch (language) {
            case "cpp" -> "main.cpp";
            case "java" -> "Main.java";
            case "python" -> "solution.py";
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String buildExecutionCommand(String language, String sourceFileName) {
        return switch (language) {
            case "cpp", "java" -> buildCompileCommand(language, sourceFileName) + " && " + buildRunCommand(language, sourceFileName);
            case "python" -> buildRunCommand(language, sourceFileName);
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String buildCompileCommand(String language, String sourceFileName) {
        return switch (language) {
            case "cpp" -> "cd /workspace && " +
                    "timeout 10s g++ " + sourceFileName + " -o main 2> compile_error.txt; " +
                    "COMPILE_EXIT=$?; " +
                    "if [ $COMPILE_EXIT -eq 124 ]; then echo 'Compilation timed out'; exit 1; fi; " +
                    "if [ $COMPILE_EXIT -ne 0 ] || [ -s compile_error.txt ]; then cat compile_error.txt; exit 1; fi";
            case "java" -> "cd /workspace && " +
                    "timeout 10s javac " + sourceFileName + " 2> compile_error.txt; " +
                    "COMPILE_EXIT=$?; " +
                    "if [ $COMPILE_EXIT -eq 124 ]; then echo 'Compilation timed out'; exit 1; fi; " +
                    "if [ $COMPILE_EXIT -ne 0 ] || [ -s compile_error.txt ]; then cat compile_error.txt; exit 1; fi";
            case "python" -> null;
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String buildRunCommand(String language, String sourceFileName) {
        String interpreterCommand = switch (language) {
            case "cpp" -> "./main";
            case "java" -> "java Main";
            case "python" -> "python3 " + sourceFileName;
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };

        return "cd /workspace && " +
                "timeout 2s " + interpreterCommand + " < input.txt > output.txt 2> runtime_error.txt; " +
                "EXIT_CODE=$?; " +
                "if [ $EXIT_CODE -eq 124 ]; then exit 124; fi; " +
                "if [ -s runtime_error.txt ]; then cat runtime_error.txt; rm -f runtime_error.txt output.txt; exit 2; fi; " +
                "cat output.txt; rm -f runtime_error.txt output.txt";
    }

    private ExecutionResult runDockerExecCommand(String containerName, String command) throws Exception {
        long start = System.currentTimeMillis();
        ProcessBuilder pb = new ProcessBuilder(
                "docker", "exec",
                containerName,
                "bash", "-c",
                command
        );
        pb.redirectErrorStream(true);

        Process process = pb.start();
        CompletableFuture<String> outputFuture =
                CompletableFuture.supplyAsync(() -> readLimitedOutputQuietly(process));

        boolean finished = process.waitFor(DOCKER_EXEC_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        long duration = System.currentTimeMillis() - start;

        if (!finished) {
            process.destroyForcibly();
            return new ExecutionResult("", duration, "Execution worker timed out", "SYSTEM_ERROR");
        }

        int exitCode = process.exitValue();
        String output = outputFuture.get(2, TimeUnit.SECONDS);
        return mapResult(exitCode, output, duration);
    }

    private ExecutionResult mapResult(int exitCode, String output, long duration) {
        return switch (exitCode) {
            case 0 -> new ExecutionResult(output, duration, "", "SUCCESS");
            case 1 -> new ExecutionResult("", duration, output, "COMPILE_ERROR");
            case 2 -> new ExecutionResult("", duration, output, "RUNTIME_ERROR");
            case 124 -> new ExecutionResult("", duration, "Time Limit Exceeded", "TIME_LIMIT_EXCEEDED");
            default -> new ExecutionResult("", duration, "Unknown Error: " + output, "ERROR");
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

    private void cleanupWorkspace(String containerName) {
        try {
            new ProcessBuilder("docker", "exec",
                    containerName,
                    "bash", "-c",
                    "cd /workspace && rm -f main.cpp Main.java solution.py main Main.class input.txt output.txt compile_error.txt runtime_error.txt")
                    .start()
                    .waitFor();
        } catch (Exception ignored) {
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
