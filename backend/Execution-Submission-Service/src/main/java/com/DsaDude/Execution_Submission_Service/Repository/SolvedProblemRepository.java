package com.DsaDude.Execution_Submission_Service.Repository;

import com.DsaDude.Execution_Submission_Service.Model.SolvedProblem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolvedProblemRepository extends MongoRepository<SolvedProblem, String> {
    boolean existsByUserIdAndQuestionId(int userId, String questionId);
    long countByUserId(int userId);
    long countByUserIdAndDifficulty(int userId, String difficulty);
    List<SolvedProblem> findByUserId(int userId);
}
