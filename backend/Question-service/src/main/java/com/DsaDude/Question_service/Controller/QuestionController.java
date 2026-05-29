package com.DsaDude.Question_service.Controller;

import com.DsaDude.Question_service.DTO.QuestionDTO;
import com.DsaDude.Question_service.Feign.SubmissionClient;
import com.DsaDude.Question_service.Model.Question;
import com.DsaDude.Question_service.Services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/question")
public class QuestionController {
    @Autowired
    private QuestionService questionService;

    // create problem
    @PostMapping("/create")
    public ResponseEntity<QuestionService.ApiResponse> addQuestion(@RequestBody QuestionDTO question) {
        return questionService.addQuestion(question);
    }

    // create draft problem
    @PostMapping("/draft/create")
    public ResponseEntity<QuestionService.ApiResponse> createDraft(@RequestHeader("X-USER-ID") String userId) {
        return questionService.createDraft(userId);
    }

    // update problem
    @PutMapping("/update/{id}")
    public ResponseEntity<QuestionService.ApiResponse> updateQuestion(
            @PathVariable String id,
            @RequestBody QuestionDTO questionDTO
    ) {
        return questionService.updateQuestion(id, questionDTO);
    }

    // get all problems
    @GetMapping("/all")
    public ResponseEntity<QuestionService.ApiResponse> getAllQuestions() {
        return questionService.getAllQuestions(false);
    }

    @GetMapping("/all-published")
    public ResponseEntity<QuestionService.ApiResponse> getAllPublishedQuestions() {
        return questionService.getAllQuestions(true);
    }

    // all problems that are authored by perticular user
    @GetMapping("/all-authored")
    public ResponseEntity<QuestionService.ApiResponse> getAllAuthoredProblemsByUser(@RequestHeader("X-USER-ID") String userId) {
        return questionService.getAllQuestionsAuthoredByUser(userId);
    }


    @GetMapping("/id/{id}")
    public ResponseEntity<QuestionService.ApiResponse> getQuestionById(@PathVariable String id) {
        return questionService.getQuestionById(id);
    }
    @GetMapping("/{slug}")
    public ResponseEntity<QuestionService.ApiResponse> getQuestionBySlug(@PathVariable String slug) {
        return questionService.getQuestionBySlug(slug);
    }
    @PostMapping("/add-multiple")
    public ResponseEntity<QuestionService.ApiResponse> addMultipleQuestions(@RequestBody List<QuestionDTO> questions) {
        for(QuestionDTO question : questions) {
            questionService.addQuestion(question);
        }
        return questionService.getAllQuestions(false);
    }

    @GetMapping("/{slug}/submissions")
    public ResponseEntity<QuestionService.ApiResponse> getSubmissions(@PathVariable String slug) {
        return questionService.GetSubmissionsByProblemSlug(slug);
    }
    @GetMapping("/{slug}/get-id")
    public ResponseEntity<String> getQuestionId(@PathVariable String slug) {
        return questionService.getProblemIdFromSlug(slug);
    }

}
