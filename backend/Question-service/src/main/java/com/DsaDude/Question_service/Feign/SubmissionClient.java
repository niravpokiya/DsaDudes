package com.DsaDude.Question_service.Feign;

import com.DsaDude.Question_service.DTO.Submission;
import com.DsaDude.Question_service.DTO.SubmissionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@FeignClient(name = "submission-service", path = "api/submission")
@Component
public interface SubmissionClient {
    @PostMapping("/add")
    public ResponseEntity<String> addSubmission(@RequestBody SubmissionDTO submission);
    @GetMapping("/get/all")
    public ResponseEntity<List<Submission>> getAllSubmissions(@RequestParam String userId, @RequestParam String problemId);
    @GetMapping("/get")
    public ResponseEntity<Submission> getSubmission(@RequestParam String submissionId);
    @GetMapping("/problem/{slug}")
    public ResponseEntity<List<Submission>> getSubmissionsByProblemSlug(@PathVariable String slug);
}
