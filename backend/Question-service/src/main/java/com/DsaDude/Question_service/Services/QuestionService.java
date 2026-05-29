package com.DsaDude.Question_service.Services;

import com.DsaDude.Question_service.DTO.QuestionDTO;
import com.DsaDude.Question_service.DTO.Submission;
import com.DsaDude.Question_service.Enums.Difficulty;
import com.DsaDude.Question_service.Feign.SubmissionClient;
import com.DsaDude.Question_service.Model.Example;
import com.DsaDude.Question_service.Model.Question;
import com.DsaDude.Question_service.Repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private SubmissionClient submissionClient;

    // response wrapper.
    public static record ApiResponse(String message, Object data) {

    }

    public ResponseEntity<ApiResponse> addQuestion(QuestionDTO dto) {
        if (dto == null) {
            return ResponseEntity.badRequest().body(new ApiResponse("Invalid payload", null));
        }

        List<Example> exampleList = dto.getExamples();

        Question question = Question.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .difficulty(dto.getDifficulty())
                .topic(dto.getTopic())
                .examples(exampleList)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .StaticSolution(dto.isStaticSolution())
                .checker(dto.getChecker())
                .build();

        Question saved = questionRepository.save(question);
        return ResponseEntity.status(201).body(new ApiResponse("Question saved successfully", saved));
    }

    // create draft problem
    public ResponseEntity<ApiResponse> createDraft(String userId) {
        int userID = Integer.parseInt(userId);
        // creating draft and adding placeholder in description and title...
        Question draft = Question.builder()
                .title("Target Sum")
                .description("""
                        Given an integer array `nums` and an integer `target`, return indices of the two numbers such that they add up to target.
                        
                        ## Example 1
                        
                        **Input:**
                        
                        ```txt
                        nums = [2,7,11,15]
                        target = 9
                        ```
                        
                        **Output:**
                        
                        ```txt
                        [0,1]
                        ```
                        
                        ## input format
                        
                        - The first line contains an integer `n`, the number of elements in the array.
                        - The second line contains `n` space-separated integers representing the elements of `nums`.
                        - The third line contains an integer `target`.
                        
                        ## output format
                        
                        - Print two space-separated integers representing the indices of the two numbers whose sum equals `target`.
                        
                        - If output should be in array format, print:
                        ```txt
                        [index1,index2]
                        ```""")
                .difficulty(Difficulty.MEDIUM)
                .topic(new ArrayList<>())
                .examples(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(userID)
                .build();

        Question saved = questionRepository.save(draft);

        return ResponseEntity.status(201)
                .body(new QuestionService.ApiResponse("Draft created", saved));
    }


    public ResponseEntity<ApiResponse> getAllQuestions(boolean publishedOnly) {
        if(publishedOnly) {
            List<Question> questions = questionRepository.findByIsPublic(publishedOnly);
            return ResponseEntity.ok(
                    new ApiResponse("All questions retrieved", questions));
        }
        List<Question> questions = questionRepository.findAll();
        return ResponseEntity.ok(
                new ApiResponse("All questions retrieved", questions));
    }

    public ResponseEntity<ApiResponse> getAllQuestionsAuthoredByUser(String userId) {
        int userID = Integer.parseInt(userId);
        List<Question> questions = questionRepository.findByCreatedBy(userID);
        return ResponseEntity.ok(
                new ApiResponse("All questions retrieved", questions)
        );
    }

    public ResponseEntity<ApiResponse> getQuestionById(String id) {
        Optional<Question> question = questionRepository.findById(id);
        if (question.isEmpty()) {
            return ResponseEntity.status(404).body(
                    new ApiResponse("Question not found", null));
        }

        return ResponseEntity.ok(
                new ApiResponse("Question found", question.get()));
    }

    public ResponseEntity<ApiResponse> deleteQuestionById(String id) {
        if (!questionRepository.existsById(id)) {
            return ResponseEntity.status(404).body(
                    new ApiResponse("Question not found", null));
        }

        questionRepository.deleteById(id);
        return ResponseEntity.ok(
                new ApiResponse("Question deleted successfully", null));
    }

    public ResponseEntity<ApiResponse> getQuestionBySlug(String slug) {
        String title = slug.replace("-", " ").toLowerCase();

        Optional<Question> question = questionRepository.findByTitleIgnoreCase(title);

        if (question.isEmpty()) {
            return ResponseEntity.status(404).body(
                    new ApiResponse("Question not found with title: " + title, null));
        }

        return ResponseEntity.ok(new ApiResponse("Question found", question.get()));
    }

    public ResponseEntity<ApiResponse> updateQuestion(String id, QuestionDTO dto) {
        Optional<Question> existing = questionRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(404).body(new ApiResponse("Question not found", null));
        }

        Question q = existing.get();
        q.setTitle(dto.getTitle());
        q.setDescription(dto.getDescription());
        q.setDifficulty(dto.getDifficulty());
        q.setTopic(dto.getTopic());
        q.setExamples(dto.getExamples());
        q.setUpdatedAt(LocalDateTime.now());
        q.setCreatedBy(dto.getCreatedBy());

        questionRepository.save(q);
        return ResponseEntity.ok(new ApiResponse("Question updated", q));
    }

    public ResponseEntity<String> getProblemIdFromSlug(String slug)
    {
        String title = slug.replace("-", " ").toLowerCase();

        return questionRepository.findByTitleIgnoreCase(title)
                .map(q -> ResponseEntity.ok(q.getId()))
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<ApiResponse> GetSubmissionsByProblemSlug(String slug) {
        System.out.println(slug);
        ResponseEntity<List<Submission>> response = submissionClient.getSubmissionsByProblemSlug(slug);

        if (response == null || !response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            return ResponseEntity.status(404).body(new ApiResponse("No submissions found", null));
        }
        return ResponseEntity.ok(new ApiResponse("Submissions fetched successfully", response.getBody()));
    }

}
