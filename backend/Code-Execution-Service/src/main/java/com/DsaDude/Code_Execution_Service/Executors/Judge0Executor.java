package com.DsaDude.Code_Execution_Service.Executors;

import com.DsaDude.Code_Execution_Service.DTO.CodeResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class Judge0Executor {

    // ✅ RapidAPI Judge0 CE Endpoint (wait=true → get result immediately)
    private static final String JUDGE0_API_URL =
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";

    // ⚠️ Better to load this from env variable in production
//            "8b311765e2msh558d9b673066d78p19149bjsn70708b89ac28";
    //693f1dd979msh6ef05ca9cd42b2ap1c4d87jsnaf0fee853e6f
      private static final String RAPID_API_KEY = "693f1dd979msh6ef05ca9cd42b2ap1c4d87jsnaf0fee853e6f";
    /**
     * Executes given source code via Judge0 (RapidAPI)
     */
    public static CodeResponse executeCode(String code, String input, int languageId) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            // 1️⃣ Prepare request payload
            ObjectNode requestJson = mapper.createObjectNode();
            requestJson.put("language_id", languageId);
            requestJson.put("source_code", code);
            requestJson.put("stdin", input != null ? input : "");

            // 2️⃣ Send request and get response
            JsonNode responseJson = sendJudge0Request(requestJson);

            // 3️⃣ Extract fields from Judge0 response
            String stdout = responseJson.path("stdout").asText("");
            String stderr = responseJson.path("stderr").asText("");
            String compileOutput = responseJson.path("compile_output").asText("");
            String statusDesc = responseJson.path("status").path("description").asText("Unknown");
            String execTime = responseJson.path("time").asText("0");

            if (compileOutput != null && !compileOutput.isEmpty()) {
                stderr = (stderr.isEmpty() ? "" : stderr + "\n") + compileOutput;
            }

            int exitCode = "Accepted".equalsIgnoreCase(statusDesc) ? 0 : -1;

            // 🧾 Return clean standardized response
            return new CodeResponse(stdout, stderr, exitCode, parseTime(execTime));

        } catch (Exception e) {
            return new CodeResponse("", e.getMessage(), -1, 0);
        }
    }

    /**
     * Send POST request to Judge0 API
     */
    private static JsonNode sendJudge0Request(ObjectNode requestJson) throws IOException {
        ObjectMapper mapper = new ObjectMapper();

        URL url = new URL(JUDGE0_API_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");

        // Required RapidAPI headers
        conn.setRequestProperty("X-RapidAPI-Host", "judge0-ce.p.rapidapi.com");
        conn.setRequestProperty("X-RapidAPI-Key", RAPID_API_KEY);
        conn.setDoOutput(true);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(mapper.writeValueAsBytes(requestJson));
        }

        InputStream inputStream = (conn.getResponseCode() >= 200 && conn.getResponseCode() < 300)
                ? conn.getInputStream()
                : conn.getErrorStream();

        StringBuilder response = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null)
                response.append(line);
        } finally {
            conn.disconnect();
        }

        return mapper.readTree(response.toString());
    }

    private static long parseTime(String timeStr) {
        try {
            double sec = Double.parseDouble(timeStr);
            return (long) (sec * 1000); // convert seconds → ms
        } catch (Exception e) {
            return 0;
        }
    }
}
