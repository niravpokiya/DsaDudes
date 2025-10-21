package com.DsaDude.Question_service.Model;

import com.DsaDude.Question_service.Enums.Difficulty;
import com.DsaDude.Question_service.Enums.Topic;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    private String id;
    private String title;
    private String description;
    private Difficulty difficulty;
    private List<Topic> topic;
    private List<String> tags;
    private List<Example> examples;
    private List<HiddenTestcase> testcases;
    private List<String> constraints;
    private List<String> hints;
    private int total_submissions;
    private int accepted_submissions;
    private Solution solution;
    private boolean isPremium;
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;
    private List<Example> hiddenExamples;
    private List<String> outputs;
    private Validator checker;
    private boolean StaticSolution;
}
