package com.CE.Execution_Submission_Service.Controller;

import com.CE.Execution_Submission_Service.DTO.ExecutionJob;
import com.CE.Execution_Submission_Service.DTO.ExecutionResult;
import com.CE.Execution_Submission_Service.DTO.JobResponse;
import com.CE.Execution_Submission_Service.Model.Submission;
import com.CE.Execution_Submission_Service.Repository.SubmissionRepository;
import com.CE.Execution_Submission_Service.Service.JobProducer;
import com.CE.Execution_Submission_Service.Service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
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
    // submit the code here...
    @PostMapping("/submit")
    public ResponseEntity<JobResponse> submitCode(@RequestBody ExecutionJob request) throws Exception {
        return jobProducer.submitCode(request);
    }
    // poll or get submission result from here...
    @GetMapping("/{id}")
    public ResponseEntity<ExecutionResult> getJob(@PathVariable String id) throws Exception {
        return jobProducer.getResult(id);
    }
}
