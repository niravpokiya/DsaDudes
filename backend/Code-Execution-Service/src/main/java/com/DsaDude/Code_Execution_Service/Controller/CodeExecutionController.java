package com.DsaDude.Code_Execution_Service.Controller;

import com.DsaDude.Code_Execution_Service.DTO.CodeExecutionRequest;
import com.DsaDude.Code_Execution_Service.DTO.CodeExecutionResponse;
import com.DsaDude.Code_Execution_Service.DTO.RuntimeObject;
import com.DsaDude.Code_Execution_Service.services.ExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/")
public class CodeExecutionController {
    @Autowired
    private ExecutionService service;

    @PostMapping("/execute")
    public CodeExecutionResponse execute(@RequestBody CodeExecutionRequest request) {
        return service.executeCode(request);
    }

    @GetMapping("/runtimes")
    public List<RuntimeObject> getRuntimes() {
        return service.getRuntimes();
    }

}
