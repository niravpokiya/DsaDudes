package com.DsaDude.Execution_Submission_Service.Controller;

import com.DsaDude.Execution_Submission_Service.DTO.ExecutionJob;
import com.DsaDude.Execution_Submission_Service.DTO.ExecutionResult;
import com.DsaDude.Execution_Submission_Service.DTO.JobResponse;
import com.DsaDude.Execution_Submission_Service.Service.JobProducer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("api/code")
public class JobController {
    private final JobProducer jobProducer;

    public JobController(JobProducer jobProducer) {
        this.jobProducer = jobProducer;
    }
    // sample testcases running
    @PostMapping("/run")
    public ResponseEntity<JobResponse> submitSamples(@RequestBody ExecutionJob request) throws Exception {
        String jobId = UUID.randomUUID().toString();
        request.setJobId(jobId);
        request.setStatus("QUEUED");
        System.out.println(jobId);

        jobProducer.sendJob(request); // sending job...

        return ResponseEntity.ok(
                new JobResponse(jobId, "QUEUED")
        );
    }
    // user submitss the code here...
    @PostMapping("/submit")
    public ResponseEntity<JobResponse> submitCode(@RequestBody ExecutionJob request) throws Exception {
        return jobProducer.submitCode(request);
    }
    // poll or get submission result from here...
    @GetMapping("/{id}")
    public ResponseEntity<ExecutionResult> getJob(@PathVariable String id) throws Exception {
        return jobProducer.getResult(id);
    }
    @GetMapping("/submit/{submissionId}")
    public ResponseEntity<?> getSubmissionStatus(@PathVariable String submissionId) {
        // returning cache status.
        return jobProducer.getSubmissionJob(submissionId);
    }
}
