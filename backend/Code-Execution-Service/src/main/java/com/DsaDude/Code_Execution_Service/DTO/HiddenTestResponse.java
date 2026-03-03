package com.DsaDude.Code_Execution_Service.DTO;

import lombok.Data;

@Data
public class HiddenTestResponse {
    private long passed;
    private long failed;
    private long total;
    private String message;
    long time;
}
