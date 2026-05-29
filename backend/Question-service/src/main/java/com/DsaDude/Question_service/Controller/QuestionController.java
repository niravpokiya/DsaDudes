package com.DsaDude.Question_service.Controller;

import com.DsaDude.Question_service.DTO.QuestionDTO;
import com.DsaDude.Question_service.Feign.SubmissionClient;
import com.DsaDude.Question_service.Helpers.AdminOnly;
import com.DsaDude.Question_service.Model.Question;
import com.DsaDude.Question_service.Services.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Role;
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

    //    =============================== PUBLIC ENDPOINTS =======================================

    @GetMapping("/all-published")
    public ResponseEntity<QuestionService.ApiResponse> getAllPublishedQuestions() {
        return questionService.getAllQuestions(true);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<QuestionService.ApiResponse> getQuestionById(@PathVariable String id) {
        return questionService.getQuestionById(id);
    }
    @GetMapping("/{slug}")
    public ResponseEntity<QuestionService.ApiResponse> getQuestionBySlug(@PathVariable String slug) {
        return questionService.getQuestionBySlug(slug);
    }

    @GetMapping("/{slug}/submissions")
    public ResponseEntity<QuestionService.ApiResponse> getSubmissions(@PathVariable String slug) {
        return questionService.GetSubmissionsByProblemSlug(slug);
    }


    //    =============================== ADMIN ONLY =======================================

    // create problem
    @PostMapping("/create")
    @AdminOnly
    public ResponseEntity<QuestionService.ApiResponse> addQuestion(@RequestBody QuestionDTO question) {
        return questionService.addQuestion(question);
    }

    // create draft problem
    @PostMapping("/draft/create")
    @AdminOnly
    public ResponseEntity<QuestionService.ApiResponse> createDraft(@RequestHeader("X-USER-ID") String userId) {
        return questionService.createDraft(userId);
    }

    // update problem
    @PutMapping("/update/{id}")
    @AdminOnly
    public ResponseEntity<QuestionService.ApiResponse> updateQuestion(
            @PathVariable String id,
            @RequestBody QuestionDTO questionDTO
    ) {
        return questionService.updateQuestion(id, questionDTO);
    }

    // get all problems
    @GetMapping("/all")
    @AdminOnly
    public ResponseEntity<QuestionService.ApiResponse> getAllQuestions() {
        return questionService.getAllQuestions(false);
    }

    // all problems that are authored by perticular user
    @GetMapping("/all-authored")
    @AdminOnly
    public ResponseEntity<QuestionService.ApiResponse> getAllAuthoredProblemsByUser(@RequestHeader("X-USER-ID") String userId) {
        return questionService.getAllQuestionsAuthoredByUser(userId);
    }

    @PostMapping("/add-multiple")
    @AdminOnly
    public ResponseEntity<QuestionService.ApiResponse> addMultipleQuestions(@RequestBody List<QuestionDTO> questions) {
        for(QuestionDTO question : questions) {
            questionService.addQuestion(question);
        }
        return questionService.getAllQuestions(false);
    }

    @GetMapping("/{slug}/get-id")
    @AdminOnly
    public ResponseEntity<String> getQuestionId(@PathVariable String slug) {
        return questionService.getProblemIdFromSlug(slug);
    }

}
