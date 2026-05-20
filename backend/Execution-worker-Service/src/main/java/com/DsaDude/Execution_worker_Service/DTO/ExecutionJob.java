package com.DsaDude.Execution_worker_Service.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionJob {
    private String jobId;
    private String language;
    private String sourceCode;
    private String input;
    private String status;
    private String typeOfJob;
    private String problemSlug;
}