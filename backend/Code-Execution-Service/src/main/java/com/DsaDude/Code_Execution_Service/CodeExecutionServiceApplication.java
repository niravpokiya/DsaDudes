package com.DsaDude.Code_Execution_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.DsaDude.Code_Execution_Service.Feign")
@EnableMongoRepositories(
		basePackages = "com.DsaDude.Code_Execution_Service.Repository"
)
public class CodeExecutionServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(CodeExecutionServiceApplication.class, args);
	}
}
