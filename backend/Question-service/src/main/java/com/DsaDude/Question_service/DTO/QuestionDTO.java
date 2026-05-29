package com.DsaDude.Question_service.DTO;

import com.DsaDude.Question_service.Enums.Difficulty;
import com.DsaDude.Question_service.Enums.Topic;
import com.DsaDude.Question_service.Model.Example;
import com.DsaDude.Question_service.Model.Validator;
import lombok.Data;

import java.util.List;
@Data
public class QuestionDTO {
    private String title;
    private String description;
    private Difficulty difficulty;
    private List<Topic> topic;
    private List<Example> examples;
    private int createdBy; // user who created the problem
    private boolean staticSolution;
    private Validator checker;
}
