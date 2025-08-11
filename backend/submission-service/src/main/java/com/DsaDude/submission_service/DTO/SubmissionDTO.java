package com.DsaDude.submission_service.DTO;

import java.time.LocalDateTime;

public class SubmissionDTO {
    public String problemId;
    public String userId;
    public String verdict;               // e.g., "Accepted", "Wrong Answer", "TLE", "MLe"
    public Integer testOnWhichFailed;    // Optional: Test case index that was failed
    public String language;
    public String code;                  // Actual code submitted
    public LocalDateTime submissionTime;
}
