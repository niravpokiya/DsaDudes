package com.DsaDude.Code_Execution_Service.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CodeExecutionResponse {
    private String language;
    private String version;
    private CompileResult compile;
    private RunResult run;
    @JsonProperty("cpu_time")
    private Double cpuTime;
    // Getters, Setters
}