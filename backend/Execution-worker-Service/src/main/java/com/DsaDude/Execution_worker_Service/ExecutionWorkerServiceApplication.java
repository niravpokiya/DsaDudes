package com.DsaDude.Execution_worker_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
@EnableFeignClients
public class ExecutionWorkerServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExecutionWorkerServiceApplication.class, args);
	}

}
