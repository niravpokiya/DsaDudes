package com.DsaDude.Execution_Submission_Service.DTO;

import lombok.Data;

import java.util.List;

@Data
public class SubmissionUpdateDTO {
    String verdict; // ACCEPTED / WRONG_ANSWER / TLE / RUNTIME_ERROR

    Long executionTime; // total or max time
    Long memoryUsed;

    Integer totalTestCases;
    Integer passedTestCases;

    String errorMessage; // if runtime error

    List<TestcaseResultDTO> testcaseResults;
}
