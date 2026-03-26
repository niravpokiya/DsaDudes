package com.CE.Execution_Submission_Service.Service;

import com.CE.Execution_Submission_Service.DTO.ExecutionJob;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class JobProducer {
    @Autowired
    private KafkaTemplate<String, ExecutionJob> kafkaTemplate;
    @Autowired
    RedisService redisService;
    public void sendJob(ExecutionJob job) throws Exception {
        redisService.markPending(job.getJobId());
        kafkaTemplate.send("execution-jobs", job.getJobId(), job);
    }
}
