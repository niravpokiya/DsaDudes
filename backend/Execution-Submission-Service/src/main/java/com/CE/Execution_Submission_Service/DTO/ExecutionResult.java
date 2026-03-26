package com.CE.Execution_Submission_Service.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ExecutionResult {
    private String output;
    private long executionTimeMs;
    private String error;
    private String status;
    public ExecutionResult(String output, long executionTimeMs) {
        this.output = output;
        this.executionTimeMs = executionTimeMs;
    }
}