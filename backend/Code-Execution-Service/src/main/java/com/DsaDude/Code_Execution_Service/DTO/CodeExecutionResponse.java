package com.DsaDude.Code_Execution_Service.DTO;

import lombok.Data;

@Data
public class CodeExecutionResponse {
    private String language;
    private String version;
    private CompileResult compile;
    private RunResult run;

    // Getters, Setters
}