package com.DsaDude.Question_service.Model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solution {
    private String language;   // e.g., "Java", "Python"
    private String code;       // Actual code
    private String explanation;
}
