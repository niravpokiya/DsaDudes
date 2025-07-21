package com.DsaDude.Question_service.DTO;

import com.DsaDude.Question_service.Enums.Difficulty;
import com.DsaDude.Question_service.Enums.Topic;
import com.DsaDude.Question_service.Model.Example;
import lombok.Data;

import java.util.List;
@Data
public class QuestionDTO {
    private String title;
    private String description;
    private Difficulty difficulty;
    private List<Topic> topic;
    private List<String> tags;
    private List<String> constraints;
    private List<Example> examples;
}
