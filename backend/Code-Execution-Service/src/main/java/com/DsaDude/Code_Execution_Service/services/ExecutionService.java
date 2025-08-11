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


    private static final String PISTON_URL = "https://emkc.org/api/v2/piston/execute";
    private static final String PISTON_RUNTIMES = "https://emkc.org/api/v2/piston/runtimes";
    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CodeExecutionRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<CodeExecutionResponse> response =
                restTemplate.exchange(PISTON_URL, HttpMethod.POST, entity, CodeExecutionResponse.class);

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
