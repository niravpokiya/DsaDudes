package com.CE.Execution_Submission_Service.Service;

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

    public void markPending(String id) {
        redisTemplate.opsForHash().put(key(id), "status", "PENDING");
        redisTemplate.expire(key(id), TTL, TimeUnit.MINUTES);
    }

    public void markRunning(String id) {
        redisTemplate.opsForHash().put(key(id), "status", "RUNNING");
        redisTemplate.expire(key(id), TTL, TimeUnit.MINUTES);
    }

    public void markCompleted(String id, String output, long executionTime) {

        String key = key(id);

        redisTemplate.opsForHash().put(key, "status", "SUCCESS");
        redisTemplate.opsForHash().put(key, "output", output);
        redisTemplate.opsForHash().put(key, "executionTimeMs", String.valueOf(executionTime));

        redisTemplate.expire(key, TTL, TimeUnit.MINUTES);
    }

    public void markError(String id, String status,String errorMessage, long executionTime) {
        String key = key(id);

        redisTemplate.opsForHash().put(key, "status", status);
        redisTemplate.opsForHash().put(key, "error", errorMessage);
        redisTemplate.opsForHash().put(key, "executionTimeMs", String.valueOf(executionTime));

        redisTemplate.expire(key, TTL, TimeUnit.MINUTES);
    }

    public Map<Object, Object> getExecution(String id) {
        return redisTemplate.opsForHash().entries(key(id));
    }
}