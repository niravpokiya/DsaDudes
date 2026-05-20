package com.DsaDude.Execution_worker_Service.DTO;

import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class Submission {
    @Id
    private String id;              // MongoDB _id
    private String userId;
    // who submitted
    private String questionId;     // reference to problem
    private String problemSlug;    // faster lookup (no join needed)
    private String sourceCode;
    // code user submitted
    private String language;       // cpp / java / python

    private int codeLength;        // optionl
    private String verdict;        // ACCEPTED / WRONG_ANSWER / TLE / RE / CE
    private String status;         // SUCCESS / FAILED / SYSTEM_ERROR

    private long executionTimeMs;  // total time (sum of all testcases)
    private long memoryUsedKb;     // optional (if you track in container)

    private int totalTestcases;
    private int passedTestcases;
    private int failedTestcases;

    private String errorMessage;   // compilation error / runtime error
    private long submissionTime;   // epoch millis
}
