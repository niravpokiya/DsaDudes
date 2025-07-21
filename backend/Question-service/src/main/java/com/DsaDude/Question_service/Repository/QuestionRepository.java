package com.DsaDude.Question_service.Repository;

import com.DsaDude.Question_service.Enums.Topic;
import com.DsaDude.Question_service.Model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByTopic(Topic topic);
    Optional<Question> findByTitleIgnoreCase(String title);
}
