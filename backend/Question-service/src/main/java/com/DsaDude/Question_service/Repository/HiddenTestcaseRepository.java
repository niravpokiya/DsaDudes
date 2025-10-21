package com.DsaDude.Question_service.Repository;

import com.DsaDude.Question_service.Model.HiddenTestcase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HiddenTestcaseRepository extends MongoRepository<HiddenTestcase, String> {
    List<HiddenTestcase> findByQuestionSlug(String questionSlug);
}
