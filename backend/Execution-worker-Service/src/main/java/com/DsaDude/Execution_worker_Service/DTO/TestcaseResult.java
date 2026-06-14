package com.DsaDude.Execution_worker_Service.DTO;

import lombok.Data;

@Data
public class TestcaseResult {
    private int testcaseNumber;
    private String testcaseName;
    private String status;
    private long executionTimeMs;
    private String inputPreview;
    private String expectedPreview;
    private String actualPreview;
    private String error;
}
