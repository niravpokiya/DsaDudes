package com.DsaDude.Execution_Submission_Service.Model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document
@Data
@Builder
public class SolvedProblem {
    @Id
    private String id;

    private int userId;

    private String questionId;

    private String questionSlug;

    private String difficulty;

    private LocalDateTime solvedAt;
}
