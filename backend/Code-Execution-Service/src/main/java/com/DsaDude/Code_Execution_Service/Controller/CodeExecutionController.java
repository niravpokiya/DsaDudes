package com.DsaDude.Code_Execution_Service.Controller;
import com.DsaDude.Code_Execution_Service.DTO.CodeRequest;
import com.DsaDude.Code_Execution_Service.DTO.CodeResponse;
import com.DsaDude.Code_Execution_Service.DTO.HiddenTestResponse;
import com.DsaDude.Code_Execution_Service.Entities.Submission;
import com.DsaDude.Code_Execution_Service.Repository.SubmissionRepository;
import com.DsaDude.Code_Execution_Service.services.CodeExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
public class CodeExecutionController {

    @Autowired
    private CodeExecutionService codeExecutionService;
    @Autowired
    private SubmissionRepository submissionRepository;
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
    public HiddenTestResponse runOnHiddenTestcases(@PathVariable String problemslug, @RequestBody CodeRequest request) {
            // ehre nee dto add tje mongo submisson

        System.out.println("USERID : " + request.getUserId());
        HiddenTestResponse response = codeExecutionService.runHiddenTestcases(problemslug, request.getCode(), request.getLanguage());
        Submission submission = new Submission();
        submission.setCode(request.getCode());
        submission.setLanguage(request.getLanguage());
        submission.setUserID(request.getUserId());
        submission.setQuestionSlug(problemslug);
        submission.setOutput(response);
        submissionRepository.save(submission);
        return response;
    }
}
