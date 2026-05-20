package com.DsaDude.Execution_Submission_Service.Repository;

import com.DsaDude.Execution_Submission_Service.Model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    public List<Submission> findByUserId(String userId);
}
