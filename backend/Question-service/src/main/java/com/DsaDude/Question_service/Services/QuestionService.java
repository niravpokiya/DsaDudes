package com.DsaDude.Question_service.Services;

import com.DsaDude.Question_service.DTO.QuestionDTO;
import com.DsaDude.Question_service.Model.Example;
import com.DsaDude.Question_service.Model.Question;
import com.DsaDude.Question_service.Repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

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
                .tags(dto.getTags())
                .constraints(dto.getConstraints())
                .examples(exampleList)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .StaticSolution(dto.isStaticSolution())
                .checker(dto.getChecker())
                .build();

        Question saved = questionRepository.save(question);
        return ResponseEntity.status(201).body(new ApiResponse("Question saved successfully", saved));
    }

    public ResponseEntity<ApiResponse> getAllQuestions() {
        List<Question> questions = questionRepository.findAll();
        return ResponseEntity.ok(
                new ApiResponse("All questions retrieved", questions));
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
        q.setTags(dto.getTags());
        q.setConstraints(dto.getConstraints());
        q.setExamples(dto.getExamples());
        q.setUpdatedAt(LocalDateTime.now());

        questionRepository.save(q);
        return ResponseEntity.ok(new ApiResponse("Question updated", q));
    }

}
