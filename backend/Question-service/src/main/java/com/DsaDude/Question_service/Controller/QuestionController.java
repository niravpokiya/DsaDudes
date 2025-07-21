package com.DsaDude.Question_service.Controller;

import com.DsaDude.Question_service.DTO.QuestionDTO;
import com.DsaDude.Question_service.Model.Question;
import com.DsaDude.Question_service.Services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/question")
public class QuestionController {
    @Autowired
    private QuestionService questionService;
    @PostMapping("/add")
    public ResponseEntity<QuestionService.ApiResponse> addQuestion(@RequestBody QuestionDTO question) {
        return questionService.addQuestion(question);
    }
    @GetMapping("/all")
    public ResponseEntity<QuestionService.ApiResponse> getAllQuestions() {
        return questionService.getAllQuestions();
    }
    @GetMapping("/id/{id}")
    public ResponseEntity<QuestionService.ApiResponse> getQuestionById(@PathVariable String id) {
        return questionService.getQuestionById(id);
    }
    @GetMapping("/{slug}")
    public ResponseEntity<QuestionService.ApiResponse> getQuestionBySlug(@PathVariable String slug) {
        return questionService.getQuestionBySlug(slug);
    }
}
