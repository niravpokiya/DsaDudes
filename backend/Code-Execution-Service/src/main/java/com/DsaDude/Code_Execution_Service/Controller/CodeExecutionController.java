package com.DsaDude.Code_Execution_Service.Controller;
import com.DsaDude.Code_Execution_Service.DTO.CodeRequest;
import com.DsaDude.Code_Execution_Service.DTO.CodeResponse;
import com.DsaDude.Code_Execution_Service.services.CodeExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
public class CodeExecutionController {

    @Autowired
    private CodeExecutionService codeExecutionService;

    @PostMapping("/run")
    public CodeResponse runCode(@RequestBody CodeRequest request) {
        try {
            return codeExecutionService.executeCode(
                    request.getCode(),
                    request.getLanguage(),
                    request.getInput()
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new CodeResponse("", "Execution failed: " + e.getMessage(), -1, 0);
        }
    }
    @PostMapping("/run-hidden/{problemslug}")
    public CodeResponse runCodeHidden(@PathVariable String problemslug, @RequestBody CodeRequest request) {

    }
}
