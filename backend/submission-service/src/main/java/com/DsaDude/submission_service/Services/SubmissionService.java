package com.DsaDude.submission_service.Services;

import com.DsaDude.submission_service.DTO.SubmissionDTO;
import com.DsaDude.submission_service.Feign.QuestionClient;
import com.DsaDude.submission_service.Model.Submission;
import com.DsaDude.submission_service.Repository.SubmissionRepository;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class SubmissionService {
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private QuestionClient questionClient;

    public ResponseEntity<String> addSubmission(SubmissionDTO dto) {
        Submission submission = Submission.builder()
                .questionId(dto.problemId.toString())
                .userId(dto.userId.toString())
                .verdict(dto.verdict)
                .submissionTime(Instant.now()) // override DTO time with server time
                .language(dto.language)
                .code(dto.code)
                .time(null)         // fill later if needed
                .memory(null)       // fill later if needed
                .status("Queued")   // default status
                .build();
        
        submissionRepository.save(submission);
        
        return ResponseEntity.ok("success");
    }

    public ResponseEntity<List<Submission>> getByUserAndProblem(String userId, String problemId) {
        String userIdStr = String.valueOf(userId);
        String problemIdStr = String.valueOf(problemId);

        List<Submission> submissions = submissionRepository
                .findByUserIdAndQuestionIdOrderBySubmissionTimeDesc(userIdStr, problemIdStr);

        return submissions.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(submissions);
    }


    public ResponseEntity<Submission> getSubmission(String submissionId) {
        Submission submission = submissionRepository.getSubmissionById(submissionId);
        return ResponseEntity.ok(submission);
    }

    public ResponseEntity<List<Submission>> getByProblemSlug(String slug) {
        ResponseEntity<String> response = questionClient.getQuestionId(slug);
        System.out.println(response.getBody());
        if (response == null || !response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            return ResponseEntity.notFound().build();
        }
        String problemId = response.getBody();
        List<Submission> submissions = submissionRepository.findByQuestionId(problemId);
        System.out.println(submissions.size());
        return ResponseEntity.ok(submissions);
    }
}
