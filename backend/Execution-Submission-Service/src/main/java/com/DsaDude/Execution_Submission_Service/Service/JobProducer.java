package com.CE.Execution_Submission_Service.Service;

import com.CE.Execution_Submission_Service.DTO.ExecutionJob;
import com.CE.Execution_Submission_Service.DTO.ExecutionResult;
import com.CE.Execution_Submission_Service.DTO.JobResponse;
import com.CE.Execution_Submission_Service.Model.Submission;
import com.CE.Execution_Submission_Service.Repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;

@Service
public class JobProducer {
    private final KafkaTemplate<String, ExecutionJob> kafkaTemplate;
    private final SubmissionRepository submissionRepository;
    private final RedisService redisService;
    private final SubmissionService submissionService;

    public JobProducer(KafkaTemplate<String, ExecutionJob> kafkaTemplate,
                       SubmissionRepository submissionRepository, RedisService redisService,
                       SubmissionService submissionService) {
        this.kafkaTemplate = kafkaTemplate;
        this.submissionRepository = submissionRepository;
        this.redisService = redisService;
        this.submissionService = submissionService;
    }

    public void sendJob(ExecutionJob job) throws Exception {
        redisService.markPending(job.getJobId());
        kafkaTemplate.send("execution-jobs", job.getJobId(), job);
    }

    public ResponseEntity<JobResponse> submitCode(ExecutionJob request) throws Exception {
        // 1. Create Submission
        Submission submission = new Submission();
        submission.setUserId(request.getUserId()); // must come from frontend
        submission.setQuestionId(request.getQuestionId());
        submission.setProblemSlug(request.getProblemSlug());

        submission.setSourceCode(request.getSourceCode());
        submission.setLanguage(request.getLanguage());

        submission.setStatus("PENDING");
        submission.setSubmissionTime(new Date());

        // Save to MongoDB
        submission = submissionRepository.save(submission);

        // 2. Use submissionId as jobId 🔥
        String submissionId = submission.getId();

        request.setJobId(submissionId);
        request.setStatus("QUEUED");

        // 3. Send to Kafka
        sendJob(request);

        // 4. Return response
        return ResponseEntity.ok(
                new JobResponse(submissionId, "PENDING")
        );
    }

    public ResponseEntity<ExecutionResult> getResult(String id) {

        Map<Object, Object> data = redisService.getExecution(id);

        ExecutionResult res = new ExecutionResult();

        // FAST PATH (Redis)
        if (data != null && !data.isEmpty()) {

            res.setStatus((String) data.get("status"));
            res.setVerdict((String) data.getOrDefault("verdict", ""));
            res.setError((String) data.getOrDefault("error", ""));

            Object time = data.get("executionTimeMs");
            if (time != null) {
                res.setExecutionTimeMs(Long.parseLong(time.toString()));
            }
            return ResponseEntity.ok(res);
        }

        // FALLBACK (MongoDB)
        Submission sub = submissionService.getSubmissionById(id);

        res.setStatus(sub.getStatus());
        res.setVerdict(sub.getVerdict());
        res.setExecutionTimeMs(sub.getExecutionTime());
        res.setError(sub.getErrorMessage());

        return ResponseEntity.ok(res);
    }
}
