package com.DsaDude.submission_service.Feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name="question-service", path="api/question")
@Component
public interface QuestionClient {
    @GetMapping("/{slug}/get-id")
    public ResponseEntity<String> getQuestionId(@PathVariable String slug);
}
