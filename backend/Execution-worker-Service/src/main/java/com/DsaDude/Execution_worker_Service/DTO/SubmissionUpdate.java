package com.DsaDude.Execution_worker_Service.DTO;

import lombok.Data;


@Data
public class SubmissionUpdate {
    String verdict; // ACCEPTED / WRONG_ANSWER / TLE / RUNTIME_ERROR

    Long executionTime; // total or max time
    Long memoryUsed;

    Integer totalTestCases;
    Integer passedTestCases;

    String errorMessage; // if runtime error
}

