package com.DsaDude.Execution_worker_Service.Client;

import com.DsaDude.Execution_worker_Service.DTO.SubmissionUpdate;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(url = "localhost:8092", name = "Execution-Submission-Service")
@Component
public interface ExecutionSubmissionClient {
    @PutMapping("api/submissions/update/{submissionId}")
    public ResponseEntity<?> updateSubmission(
            @PathVariable String submissionId,
            @RequestBody SubmissionUpdate dto
    );
}
