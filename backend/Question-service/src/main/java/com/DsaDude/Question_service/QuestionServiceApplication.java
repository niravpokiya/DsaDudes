package com.DsaDude.Question_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

//db in pokiyanirav2@gmail.com -> mongodb atlas.
@SpringBootApplication
@EnableFeignClients
public class QuestionServiceApplication {

	public static void main(String[] args)	 {
		SpringApplication.run(QuestionServiceApplication.class, args);
	}

}
