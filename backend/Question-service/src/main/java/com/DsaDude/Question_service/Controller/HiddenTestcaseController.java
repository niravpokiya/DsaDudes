package com.DsaDude.Question_service.Controller;

import com.DsaDude.Question_service.Services.TestcaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/question/hidden-tests")
public class HiddenTestcaseController {
    @Autowired
    private TestcaseService testcaseService;

    @PostMapping("/upload/{problemSlug}")
    public ResponseEntity<String> uploadHiddenTestcases(
            @PathVariable String problemSlug,
            @RequestParam("file") MultipartFile zipFile) {
        try {
            testcaseService.saveHiddenTestcases(problemSlug, zipFile);
            return ResponseEntity.ok("Hidden testcases uploaded successfully for: " + problemSlug);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
