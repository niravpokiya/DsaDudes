package com.CE.Execution_Submission_Service.DTO;


import lombok.Data;

@Data
public class ExecutionJob {
    public String jobId;
    public String language;
    public String sourceCode;
    public String input;
    public String status;
    public String typeOfJob;
    public String userId;
    public String problemSlug;
    public String questionId;
}
