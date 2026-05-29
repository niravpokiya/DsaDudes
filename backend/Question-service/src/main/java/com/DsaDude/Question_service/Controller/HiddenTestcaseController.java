package com.DsaDude.Question_service.Controller;

import java.io.IOException;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.DsaDude.Question_service.Services.TestcaseService;

@RestController
@RequestMapping("/api/question/tests")
public class HiddenTestcaseController {
    @Autowired
    private TestcaseService testcaseService;

    @GetMapping("/{problemId}/status")
    public ResponseEntity<?> getTestcaseStatus(
            @PathVariable("problemId") String problemId,
            @RequestParam("problemSlug") String problemSlug
    ) {
        try {
            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "data", testcaseService.getTestcaseStatus(problemId, problemSlug)
                    )
            );
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage()
                    )
            );
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage()
                    )
            );
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage() == null ? "Failed to check testcase status" : ex.getMessage()
                    )
            );
        }
    }

    @GetMapping("/{problemId}/download")
    public ResponseEntity<?> downloadTestcases(
            @PathVariable("problemId") String problemId,
            @RequestParam("problemSlug") String problemSlug
    ) {
        try {
            byte[] zipBytes = testcaseService.downloadTestcasesZip(problemId, problemSlug);
            String fileName = problemSlug + "-testcases.zip";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/zip"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(new ByteArrayResource(zipBytes));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage()
                    )
            );
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage()
                    )
            );
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage() == null ? "Failed to download testcases" : ex.getMessage()
                    )
            );
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage() == null ? "Failed to download testcases" : ex.getMessage()
                    )
            );
        }
    }

    @PostMapping(value = "/{problemId}/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadTestCases(
            @RequestHeader("X-USER-ID") String userId,
            @PathVariable("problemId") String problemId,
            @RequestParam("file") MultipartFile zipFile,
            @RequestParam("problemSlug") String problemSlug
    ) {
        try {
            testcaseService.uploadTestcases(problemId, problemSlug, zipFile);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Testcases uploaded successfully"
                    )
            );
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage()
                    )
            );
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage()
                    )
            );
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "message", ex.getMessage() == null ? "Failed to upload testcases" : ex.getMessage()
                    )
            );
        }
    }

}
