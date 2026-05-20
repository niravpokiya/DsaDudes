package com.DsaDude.Execution_Submission_Service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;
@Service
public class RedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final long TTL = 5;

    private String key(String id) {
        return "exec:" + id;
    }

    private void writeExecutionState(
            String id,
            String status,
            String verdict,
            String error,
            long executionTime,
            String sourceCode,
            String language,
            int passed,
            int total,
            String output
    ) {

        String key = key(id);

        redisTemplate.opsForHash().put(key, "status", status);
        redisTemplate.opsForHash().put(key, "verdict", verdict);
        redisTemplate.opsForHash().put(key, "error", error);

        redisTemplate.opsForHash().put(
                key,
                "executionTimeMs",
                executionTime
        );

        redisTemplate.opsForHash().put(
                key,
                "sourceCode",
                sourceCode
        );

        redisTemplate.opsForHash().put(
                key,
                "language",
                language
        );

        redisTemplate.opsForHash().put(
                key,
                "passed",
                passed
        );

        redisTemplate.opsForHash().put(
                key,
                "total",
                total
        );
        redisTemplate.opsForHash().put(
                key,
                "output",
                output
        );

        redisTemplate.expire(
                key,
                TTL,
                TimeUnit.MINUTES
        );
    }

    public void markPending(
            String id,
            String sourceCode,
            String language,
            int passed,
            int total
    ) {

        writeExecutionState(
                id,
                "PENDING",
                "PENDING",
                "",
                0,
                sourceCode,
                language,
                passed,
                total,
                ""
        );
    }

    public void markRunning(
            String id,
            String sourceCode,
            String language,
            int passed,
            int total
    ) {

        writeExecutionState(
                id,
                "RUNNING",
                "RUNNING",
                "",
                0,
                sourceCode,
                language,
                passed,
                total,
                ""
        );
    }

    public void markCompleted(
            String id,
            String verdict,
            long executionTime,
            String sourceCode,
            String language,
            int passed,
            int total,
            String output
    ) {

        writeExecutionState(
                id,
                "COMPLETED",
                verdict,
                "",
                executionTime,
                sourceCode,
                language,
                passed,
                total,
                output
        );
    }

    public void markError(
            String id,
            String verdict,
            String errorMessage,
            long executionTime,
            String sourceCode,
            String language,
            int passed,
            int total
    ) {

        writeExecutionState(
                id,
                "COMPLETED",
                verdict,
                errorMessage,
                executionTime,
                sourceCode,
                language,
                passed,
                total,
                ""
        );
    }

    public Map<Object, Object> getExecution(
            String id
    ) {
        return redisTemplate
                .opsForHash()
                .entries(key(id));
    }
}