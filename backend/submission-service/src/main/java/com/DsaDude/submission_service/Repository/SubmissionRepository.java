package com.DsaDude.submission_service.Repository;

import com.DsaDude.submission_service.Model.Submission;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByUserIdAndQuestionIdOrderBySubmissionTimeDesc(String userId, String questionId);
    Submission getSubmissionById(String submissionId);
}
