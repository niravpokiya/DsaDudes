package com.DsaDude.Code_Execution_Service.Repository;

import com.DsaDude.Code_Execution_Service.Entities.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, Integer> {

}
