package com.DsaDude.Code_Execution_Service.Feign;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "Question-service", url="http://localhost:8081")
@Component
public interface QuestionServiceClient {
    @GetMapping("/{slug}")
    public ApiResponse<QuestionDTO>  getQuestionBySlug(@PathVariable String slug);

    @Data
    class ApiResponse<T> {
        private String message;
        private T data;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public class QuestionDTO {
        private String title;
        private boolean StaticSolution;
        private ValidatorDTO checker;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Data
    public class ValidatorDTO {
        private String code;
        private String language;
    }
}
