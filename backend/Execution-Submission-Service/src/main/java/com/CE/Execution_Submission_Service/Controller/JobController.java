package com.CE.Execution_Submission_Service.Controller;

import com.CE.Execution_Submission_Service.DTO.ExecutionJob;
import com.CE.Execution_Submission_Service.DTO.ExecutionResult;
import com.CE.Execution_Submission_Service.DTO.JobResponse;
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
    private final RedisService redisService;

    public JobController(JobProducer jobProducer, RedisService redisService) {
        this.jobProducer = jobProducer;
        this.redisService = redisService;
    }

    @PostMapping("/run")
    public ResponseEntity<JobResponse> submit(@RequestBody ExecutionJob request) throws Exception {
        String jobId = UUID.randomUUID().toString();
        request.setJobId(jobId);
        request.setStatus("QUEUED");
        System.out.println(jobId);
        jobProducer.sendJob(request); // sending job...

        return ResponseEntity.ok(
                new JobResponse(jobId, "QUEUED")
        );
    }
    @GetMapping("/{id}")
    public ResponseEntity<ExecutionResult> getJob(@PathVariable String id) {

        Map<Object, Object> data = redisService.getExecution(id);

        if (data == null || data.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ExecutionResult response = new ExecutionResult();

        response.setStatus((String) data.get("status"));
        response.setOutput((String) data.getOrDefault("output", ""));
        response.setError((String) data.getOrDefault("error", ""));

        Object timeObj = data.get("executionTimeMs");
        long executionTime = 0;

        if (timeObj != null) {
            executionTime = Long.parseLong(timeObj.toString());
        }

        response.setExecutionTimeMs(executionTime);

        return ResponseEntity.ok(response);
    }
}
