package com.DsaDude.Execution_Submission_Service.Service;

import com.DsaDude.Execution_Submission_Service.DTO.SolvedProblemRequest;
import com.DsaDude.Execution_Submission_Service.DTO.SolvedStatsResponse;
import com.DsaDude.Execution_Submission_Service.Model.SolvedProblem;
import com.DsaDude.Execution_Submission_Service.Model.Submission;
import com.DsaDude.Execution_Submission_Service.Repository.SolvedProblemRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolvedProblemService {
    private final SolvedProblemRepository repository;

    public SolvedProblemService(SolvedProblemRepository repository) {
        this.repository = repository;
    }

    public SolvedProblem addSolvedByUser(SolvedProblemRequest request, int userId) {
        return createIfAbsent(
                userId,
                request.getProblemId(),
                request.getProblemSlug(),
                request.getDiff()
        );
    }

    public SolvedProblem trackAcceptedSubmission(Submission submission) {
        return createIfAbsent(
                submission.getUserId(),
                submission.getQuestionId(),
                submission.getProblemSlug(),
                submission.getDifficulty()
        );
    }

    public SolvedStatsResponse getStats(int userId) {
        return new SolvedStatsResponse(
                repository.countByUserId(userId),
                repository.countByUserIdAndDifficulty(userId, "EASY"),
                repository.countByUserIdAndDifficulty(userId, "MEDIUM"),
                repository.countByUserIdAndDifficulty(userId, "HARD")
        );
    }

    public List<SolvedProblem> getSolvedProblems(int userId) {
        return repository.findByUserId(userId);
    }

    private SolvedProblem createIfAbsent(int userId, String questionId, String questionSlug, String difficulty) {
        if (questionId == null || questionId.isBlank()) {
            throw new IllegalArgumentException("questionId is required to track solved problems");
        }

        if (repository.existsByUserIdAndQuestionId(userId, questionId)) {
            return null;
        }

        SolvedProblem solvedProblem = SolvedProblem.builder()
                .userId(userId)
                .questionId(questionId)
                .questionSlug(questionSlug)
                .difficulty(normalizeDifficulty(difficulty))
                .solvedAt(LocalDateTime.now())
                .build();

        try {
            return repository.save(solvedProblem);
        } catch (DuplicateKeyException ignored) {
            return null;
        }
    }

    private String normalizeDifficulty(String difficulty) {
        return difficulty == null ? null : difficulty.trim().toUpperCase();
    }
}
