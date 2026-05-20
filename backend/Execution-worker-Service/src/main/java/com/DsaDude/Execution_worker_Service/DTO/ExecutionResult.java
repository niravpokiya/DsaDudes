package com.DsaDude.Execution_worker_Service.DTO;

import lombok.Data;

@Data
public class ExecutionResult {

    private String output;
    private long executionTimeMs;
    private String error;   // NEW
    private String status;

    public ExecutionResult(String output, long executionTimeMs, String error, String status) {
        this.output = output;
        this.executionTimeMs = executionTimeMs;
        this.error = error;
        this.status = status;
    }
    public ExecutionResult() {}
}