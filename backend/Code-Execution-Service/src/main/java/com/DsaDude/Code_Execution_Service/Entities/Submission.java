package com.DsaDude.Code_Execution_Service.Entities;

import com.DsaDude.Code_Execution_Service.DTO.HiddenTestResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Submission {
    @Id
    private int submissionID;
    private int userID;
    private String QuestionSlug;
    private String language;
    private String code;
    private HiddenTestResponse output;
    private String error;
    private int exitCode;
    private long timeTaken;
    private long memoryUsed;
}
