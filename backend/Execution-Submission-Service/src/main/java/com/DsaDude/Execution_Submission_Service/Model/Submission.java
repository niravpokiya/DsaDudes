package com.DsaDude.Execution_Submission_Service.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Submission {
    @Id
    private String id;              // MongoDB _id
    private int userId;
    // who submitted
    private String questionId;     // reference to problem
    private String problemSlug;    // faster lookup (no join needed)
    private String sourceCode;
    // code user submitted
    private String language;       // cpp / java / python

    private int codeLength;        // optionl
    private String verdict;        // ACCEPTED / WRONG_ANSWER / TLE / RE / CE
    private String status;         // SUCCESS / FAILED / SYSTEM_ERROR

    private long executionTime;  // total time (sum of all testcases)
    private long memoryUsed;     // optional (if you track in container)

    private int totalTestcases;
    private int passedTestcases;
    private int failedTestcases;

    private String errorMessage;   // compilation error / runtime error
    private Date submissionTime;   // epoch millis
}
