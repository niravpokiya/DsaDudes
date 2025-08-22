package com.DsaDude.submission_service.Controller;

import com.DsaDude.submission_service.DTO.SubmissionDTO;
import com.DsaDude.submission_service.Model.Submission;
import com.DsaDude.submission_service.Services.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/submission")
public class SubmissionController {
    @Autowired
    private SubmissionService submissionService;

    @PostMapping("/add")
    public ResponseEntity<String> addSubmission(@RequestBody SubmissionDTO submission) {
        return submissionService.addSubmission(submission);
    }
    @GetMapping("/get/all")
    public ResponseEntity<List<Submission>> getAllSubmissions(@RequestParam String userId, @RequestParam String problemId) {
        return submissionService.getByUserAndProblem(userId, problemId);
    }
    @GetMapping("/get")
    public ResponseEntity<Submission> getSubmission(@RequestParam String submissionId) {
        return submissionService.getSubmission(submissionId);
    }
    @GetMapping("/problem/{slug}")
    public ResponseEntity<List<Submission>> getSubmissionsByProblemSlug(@PathVariable String slug) {
        return submissionService.getByProblemSlug(slug);
    }
}
    