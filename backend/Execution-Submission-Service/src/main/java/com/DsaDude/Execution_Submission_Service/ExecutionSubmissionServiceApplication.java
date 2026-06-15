package com.DsaDude.Execution_Submission_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ExecutionSubmissionServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExecutionSubmissionServiceApplication.class, args);
	}

}