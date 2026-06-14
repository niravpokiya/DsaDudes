package com.DsaDude.Execution_Submission_Service.Controller;

import com.DsaDude.Execution_Submission_Service.DTO.SubmissionUpdateDTO;
import com.DsaDude.Execution_Submission_Service.Model.Submission;
import com.DsaDude.Execution_Submission_Service.Service.RedisService;
import com.DsaDude.Execution_Submission_Service.Service.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;
    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // getting all submissions done by perticular user...
    @GetMapping("/all-submissions/{userId}")
    public List<Submission> getAllSubmissionsDoneByUser(@PathVariable int userId) {
        return submissionService.getUserSubmissions(userId);
    }

    @GetMapping("/problem/{slug}")
    public List<Submission> getSubmissionsByProblemSlug(@PathVariable String slug) {
        return submissionService.getSubmissionsByProblemSlug(slug);
    }

    @GetMapping("/{userId}/count")
    public int getSubmissionsCountByUser(@PathVariable int userId) {
        List<Submission> submissions = submissionService.getUserSubmissions(userId);
        return submissions.size();
    }

    @GetMapping("/heatmap")
    public Map<String, Integer> getHeatmap(@RequestParam int userId) {
        return submissionService.getHeatMap(userId);
    }

    @GetMapping("/{submissionId}")
    public Submission getSubmissionById(@PathVariable String submissionId) {
        return submissionService.getSubmissionById(submissionId);
    }

    @PutMapping("/update/{submissionId}")
    public ResponseEntity<?> updateSubmission(
            @PathVariable String submissionId,
            @RequestBody SubmissionUpdateDTO dto
    ) {
        Submission updated = submissionService.updateSubmission(submissionId, dto);
        return ResponseEntity.ok(updated);
    }

}
