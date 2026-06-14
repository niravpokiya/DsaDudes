package com.DsaDude.Execution_Submission_Service.Service;

import com.DsaDude.Execution_Submission_Service.DTO.SubmissionUpdateDTO;
import com.DsaDude.Execution_Submission_Service.Model.Submission;
import com.DsaDude.Execution_Submission_Service.Model.TestcaseResult;
import com.DsaDude.Execution_Submission_Service.Repository.SubmissionRepository;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final MongoTemplate mongoTemplate;
    private final SolvedProblemService solvedProblemService;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            MongoTemplate mongoTemplate,
            SolvedProblemService solvedProblemService
    ) {
        this.submissionRepository = submissionRepository;
        this.mongoTemplate = mongoTemplate;
        this.solvedProblemService = solvedProblemService;
    }

    // ✅ Get all submissions of a user
    public List<Submission> getUserSubmissions(int userId) {
        return submissionRepository.findByUserId(userId);
    }

    public List<Submission> getSubmissionsByProblemSlug(String problemSlug) {
        return submissionRepository.findByProblemSlug(problemSlug);
    }

    // ✅ Safe fetch
    public Submission getSubmissionById(String submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));
    }

    // heatmap
    public Map<String, Integer> getHeatMap(int userId) {

        MatchOperation match = Aggregation.match(
                Criteria.where("userId").is(userId)
        );

        ProjectionOperation project =
                Aggregation.project()
                        .and(DateOperators.DateToString
                                .dateOf("submissionTime")
                                .toString("%Y-%m-%d"))
                        .as("date");

        GroupOperation group =
                Aggregation.group("date")
                        .count()
                        .as("count");

        Aggregation aggregation =
                Aggregation.newAggregation(
                        match,
                        project,
                        group
                );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(
                        aggregation,
                        "submission",
                        Document.class
                );

        Map<String, Integer> map = new HashMap<>();

        for (Document doc : results.getMappedResults()) {
            map.put(
                    doc.getString("_id"),
                    doc.getInteger("count")
            );
        }

        return map;
    }
    public Submission updateSubmission(String submissionId, SubmissionUpdateDTO dto) {

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if ("COMPLETED".equals(submission.getStatus())) {
            throw new RuntimeException("Submission already completed");
        }
        if (!"RUNNING".equals(submission.getStatus())) {
            throw new RuntimeException("Submission is not in RUNNING state");
        }

        // 🔥 Update fields
        submission.setVerdict(dto.getVerdict());
        submission.setExecutionTime(dto.getExecutionTime());
        submission.setMemoryUsed(dto.getMemoryUsed());
        int totalTestCases = dto.getTotalTestCases() == null ? 0 : dto.getTotalTestCases();
        int passedTestCases = dto.getPassedTestCases() == null ? 0 : dto.getPassedTestCases();
        submission.setTotalTestcases(totalTestCases);
        submission.setPassedTestcases(passedTestCases);
        submission.setFailedTestcases(Math.max(0, totalTestCases - passedTestCases));
        submission.setErrorMessage(dto.getErrorMessage());
        if (dto.getTestcaseResults() != null) {
            submission.setTestcaseResults(dto.getTestcaseResults().stream().map(result -> {
                TestcaseResult testcaseResult = new TestcaseResult();
                testcaseResult.setTestcaseNumber(result.getTestcaseNumber());
                testcaseResult.setTestcaseName(result.getTestcaseName());
                testcaseResult.setStatus(result.getStatus());
                testcaseResult.setExecutionTimeMs(result.getExecutionTimeMs());
                testcaseResult.setInputPreview(result.getInputPreview());
                testcaseResult.setExpectedPreview(result.getExpectedPreview());
                testcaseResult.setActualPreview(result.getActualPreview());
                testcaseResult.setError(result.getError());
                return testcaseResult;
            }).collect(Collectors.toList()));
        }
        submission.setStatus("COMPLETED");

        Submission savedSubmission = submissionRepository.save(submission);

        if ("ACCEPTED".equalsIgnoreCase(savedSubmission.getVerdict())) {
            solvedProblemService.trackAcceptedSubmission(savedSubmission);
        }

        return savedSubmission;
    }

    // Heatmap data

}
