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

    // Constructors, Getters, Setters
}
