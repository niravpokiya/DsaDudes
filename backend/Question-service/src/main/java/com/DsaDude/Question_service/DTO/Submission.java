package com.DsaDude.Question_service.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Submission {

    @Id
    private String id;

    private String questionId;
    private String userId;

    private String verdict; // e.g., Accepted, TLE, WA
    private Instant submissionTime;

    private String language;
    private String code;

    private Double time;    // optional execution time in seconds
    private Integer memory; // optional memory usage in MB

    private String status;  // e.g., Queued, Running, Done
}
