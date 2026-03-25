package com.DsaDude.Code_Execution_Service.Controller;

import com.DsaDude.Code_Execution_Service.Entities.Submission;
import com.DsaDude.Code_Execution_Service.Repository.SubmissionRepository;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/heatmap")
    public Map<String, Integer> getHeatmap(@RequestParam int userId) {
        MatchOperation match = Aggregation.match(
                Criteria.where("userID").is(userId)
        );
        ProjectionOperation project = Aggregation.project()
                .andExpression("dateToString('%Y-%m-%d', created)")
                .as("date");
        GroupOperation group = Aggregation.group("date")
                .count().as("count");
        Aggregation aggregation = Aggregation.newAggregation(
                match,
                project,
                group
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(aggregation, "submission", Document.class);

        Map<String, Integer> map = new HashMap<>();

        for (Document doc : results.getMappedResults()) {
            map.put(doc.getString("_id"), doc.getInteger("count"));
        }

        return map;
    }

    @GetMapping("/count")
    public int count(@RequestParam int userId, @RequestParam String date) {

        LocalDate localDate = LocalDate.parse(date);

        Date start = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date end = Date.from(localDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());

        return submissionRepository.countByUserIDAndCreatedBetween(userId, start, end);
    }

    @GetMapping("/")
    public List<Submission> getSubmissions(@RequestParam int userId) {
        return submissionRepository.getSubmissionsByUserID(userId);
    }
    @GetMapping("/get")
    public Submission getSubmission(@RequestParam String submissionId) {
        return submissionRepository.getSubmissionById(submissionId);
    }
}