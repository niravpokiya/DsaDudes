package com.DsaDude.Code_Execution_Service.services;

import com.DsaDude.Code_Execution_Service.DTO.CodeResponse;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class CodeExecutionService {
    public CodeResponse executeCode(String code, String language, String input) throws IOException, InterruptedException {
        String tempDir = System.getProperty("java.io.tmpdir");
        Path filePath;
        String compileCmd = null;
        String runCmd = null;

        switch (language.toLowerCase()) {
            case "cpp":
                String uniqueId = String.valueOf(System.currentTimeMillis());
                filePath = Path.of(tempDir, "Main_" + uniqueId + ".cpp");
                Files.writeString(filePath, code);

                String exeFile = tempDir + File.separator + "Main_" + uniqueId + ".exe";
                compileCmd = "g++ " + filePath + " -o " + exeFile;
                runCmd = exeFile;
                break;

            case "java":
                filePath = Path.of(tempDir, "Main.java");
                Files.writeString(filePath, code);
                compileCmd = "javac " + filePath;
                runCmd = "java -cp " + tempDir + " Main";
                break;

            case "python":
                filePath = Path.of(tempDir, "main.py");
                Files.writeString(filePath, code);
                runCmd = "python3 " + filePath;
                break;

            case "javascript":
                filePath = Path.of(tempDir, "main.js");
                Files.writeString(filePath, code);
                runCmd = "node " + filePath;
                break;

            default:
                return new CodeResponse("", "Unsupported language: " + language, -1, 0);
        }

        long startTime = System.nanoTime();
        // 1️⃣ Compile if needed
        if (compileCmd != null) {
            Process compileProcess = Runtime.getRuntime().exec(compileCmd);
            compileProcess.waitFor();
            String compileErr = new String(compileProcess.getErrorStream().readAllBytes());
            if (!compileErr.isEmpty()) {
                return new CodeResponse("", "Compile Error:\n" + compileErr, compileProcess.exitValue(), 0);
            }
        }

        // 2️⃣ Run program
        ProcessBuilder pb = new ProcessBuilder(runCmd.split(" "));
        Process runProcess = pb.start();

        // Feed input if any
        if (input != null && !input.isEmpty()) {
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                writer.write(input);
                writer.flush();
            }
        }

        int exitCode = runProcess.waitFor();
        long endTime = System.nanoTime();
        long executionTimeMillis = (endTime - startTime) / 1_000_000; // convert ns to ms
        String stdout = new String(runProcess.getInputStream().readAllBytes());
        String stderr = new String(runProcess.getErrorStream().readAllBytes());

        return new CodeResponse(stdout, stderr, exitCode, executionTimeMillis);
    }
}
