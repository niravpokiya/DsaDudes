package com.DsaDude.submission_service.Model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "submissions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
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
