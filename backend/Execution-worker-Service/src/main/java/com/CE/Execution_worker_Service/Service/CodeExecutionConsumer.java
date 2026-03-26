package com.CE.Execution_worker_Service.Service;

import com.CE.Execution_worker_Service.DTO.ExecutionJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.concurrent.Future;

@Component
@Slf4j
@Service
public class CodeExecutionConsumer {
    @Autowired
    ContainerPoolManager containerPoolManager;
    @Autowired
    RedisService redisService;
    @KafkaListener(
            topics = "execution-jobs",
            groupId = "executor-group"
    )
    public void consume(ExecutionJob job) {
        if("RUN".equals(job.getTypeOfJob())) {
            RunCode(job);
        } else {
            // extract each hidden testcase...
            String jobId = job.getJobId();
            redisService.markRunning(jobId);



        }
    }
    public void RunCode(ExecutionJob job) {
        String jobId = job.getJobId();
        try {
            // 🔹 Mark RUNNING
            redisService.markRunning(jobId);

            containerPoolManager.executeCpp(job)
                    .thenAccept(result -> {
                        String status = result.getStatus();

                        if ("SUCCESS".equals(status)) {
                            System.out.println("here... completed");
                            redisService.markCompleted(
                                    job.getJobId(),
                                    result.getOutput(),
                                    result.getExecutionTimeMs()
                            );

                        } else {
                            System.out.println("here... failed" + status + result.getOutput() + result.getError() + result.getExecutionTimeMs());
                            redisService.markError(
                                    job.getJobId(),
                                    status,                        // e.g. COMPILE_ERROR
                                    result.getError(),
                                    result.getExecutionTimeMs()
                            );
                        }
                    })
                    .exceptionally(ex -> {

                        redisService.markError(
                                job.getJobId(),
                                "SYSTEM_ERROR",
                                ex.toString(),
                                0
                        );

                        return null;
                    });

        } catch (Exception e) {
            redisService.markError(
                    jobId,
                    "{\"status\":\"ERROR\",\"output\":\"\",\"error\":\""
                            + e.getMessage()
                            + "\"}", "", 0
            );
        }
    }
}