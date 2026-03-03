package com.DsaDude.Code_Execution_Service.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int submissionID;
    private int userID;
    private int questionID;
    private String language;
    private String code;
    private String output;
    private String error;
    private int exitCode;
    private long timeTaken;
    private long memoryUsed;
}
