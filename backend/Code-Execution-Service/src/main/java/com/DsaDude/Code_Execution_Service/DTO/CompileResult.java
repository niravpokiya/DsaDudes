package com.DsaDude.Code_Execution_Service.DTO;

import lombok.Data;

@Data
public class CompileResult {
    private String stdout;
    private String stderr;
    private String output;
    private int code;
    private Double time;
 }