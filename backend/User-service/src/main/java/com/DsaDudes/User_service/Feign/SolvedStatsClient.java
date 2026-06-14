package com.DsaDudes.User_service.Feign;

import com.DsaDudes.User_service.DTO.SolvedStatsResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "Execution-Submission-Service")
public interface SolvedStatsClient {
    @GetMapping("/api/solved/stats/{userId}")
    SolvedStatsResponse getSolvedStats(@PathVariable int userId);
}
