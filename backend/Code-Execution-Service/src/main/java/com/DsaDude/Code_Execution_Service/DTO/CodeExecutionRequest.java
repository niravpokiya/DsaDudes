package com.DsaDude.Code_Execution_Service.DTO;


import lombok.Data;

import java.util.List;

@Data
public class CodeExecutionRequest {
    private String language;
    private String version;
    private List<CodeFile> files;
    private String stdin;
    private List<String> args;

    private Integer run_timeout;       // in milliseconds
    private Integer compile_timeout;   // in milliseconds
    private Long run_memory_limit;     // in bytes
    private Long compile_memory_limit; // in bytes

    // Constructors, Getters, Setters
}
