package com.DsaDude.Code_Execution_Service.DTO;

import lombok.Data;

@Data
public class CodeRequest {
    private String code;
    private String language;
    private String input;

    // Getters & setters
}
