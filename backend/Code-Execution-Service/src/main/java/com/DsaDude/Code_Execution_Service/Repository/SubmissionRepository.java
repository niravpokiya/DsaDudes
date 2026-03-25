package com.DsaDude.Code_Execution_Service.Repository;

import com.DsaDude.Code_Execution_Service.Entities.Submission;
import org.springframework.data.domain.Example;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, Integer> {
    int countByUserIDAndCreatedBetween(int userId, Date start, Date end);

    List<Submission> getSubmissionsByUserID(int userID);
    Submission getSubmissionById(String id);
}
