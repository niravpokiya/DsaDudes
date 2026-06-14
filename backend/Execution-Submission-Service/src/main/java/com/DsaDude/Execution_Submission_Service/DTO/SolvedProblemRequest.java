package com.DsaDude.Execution_Submission_Service.DTO;

import lombok.Data;

@Data
public class SolvedProblemRequest {
    public String problemSlug;
    public String problemId;
    public String diff;
}
