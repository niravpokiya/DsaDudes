package com.DsaDude.Code_Execution_Service.DTO;

import jakarta.annotation.sql.DataSourceDefinitions;
import lombok.Data;

@Data
public class CodeResponse {
    private String output;
    private String error;
    private int exitCode;
    private long time;

    public CodeResponse(String stdout, String stderr, int exitCode, long time) {
        this.output = stdout;
        this.error = stderr;
        this.exitCode = exitCode;
        this.time = time;
    }
}
