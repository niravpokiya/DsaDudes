package com.DsaDude.Execution_Submission_Service.Model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "solved_problems")
@CompoundIndex(name = "uniq_user_question", def = "{'userId': 1, 'questionId': 1}", unique = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolvedProblem {
    @Id
    private String id;

    private int userId;
    private String questionId;
    private String questionSlug;
    private String difficulty;
    private LocalDateTime solvedAt;
}
