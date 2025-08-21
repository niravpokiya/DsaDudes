package com.DsaDude.Code_Execution_Service.services;

import com.DsaDude.Code_Execution_Service.DTO.CodeExecutionRequest;
import com.DsaDude.Code_Execution_Service.DTO.CodeExecutionResponse;
import com.DsaDude.Code_Execution_Service.DTO.RuntimeObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
public class ExecutionService {

    private static final String PISTON_URL = "http://localhost:2000/api/v2/execute";
    private static final String PISTON_RUNTIMES = "http://localhost:2000/api/v2/runtimes";
    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        request.setRun_timeout(3000);
        request.setCompile_timeout(3000);
        request.setRun_memory_limit(1073741824L);
        request.setCompile_memory_limit(1073741824L);

        HttpEntity<CodeExecutionRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<CodeExecutionResponse> response =
                restTemplate.exchange(PISTON_URL, HttpMethod.POST, entity, CodeExecutionResponse.class);
        String rawResponse = restTemplate.postForObject(PISTON_URL, entity, String.class);
        System.out.println("Raw Piston Response: " + rawResponse);

// Extract cpu_time without touching your classes


        return response.getBody();
    }

    public List<RuntimeObject> getRuntimes() {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<RuntimeObject[]> response = restTemplate.exchange(
                PISTON_RUNTIMES,
                HttpMethod.GET,
                entity,
                RuntimeObject[].class
        );

        return Arrays.asList(response.getBody());
    }

}
