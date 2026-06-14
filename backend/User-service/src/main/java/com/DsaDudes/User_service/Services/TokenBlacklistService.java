package com.DsaDudes.User_service.Services;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/* blacklisting  token after early logout by user */

@Service
public class TokenBlacklistService {
    private final RedisTemplate<String, Object> template;
    public TokenBlacklistService(RedisTemplate<String, Object> template) {
        this.template = template;
    }
    public void blacklist(String jwt, Duration ttl) {
        template.opsForValue().set("blacklist: " + jwt, "1", ttl);
    }
    public boolean isBlacklisted(String jwtToken) {
        return Boolean.TRUE.equals(template.hasKey("blacklist: " + jwtToken));
    }
}
