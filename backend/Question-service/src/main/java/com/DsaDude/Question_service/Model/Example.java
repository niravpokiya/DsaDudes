package com.DsaDude.Question_service.Model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Example {
    private String input;
    private String output;
    private String explanation; // Optional
}
