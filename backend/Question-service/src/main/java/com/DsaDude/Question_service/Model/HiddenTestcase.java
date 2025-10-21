package com.DsaDude.Question_service.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "hidden_testcases")
@Data
public class HiddenTestcase {
    @Id
    private String id;
    private String questionSlug;   // to link it with a Question
    private String inputPath;    // path to input file
    private String outputPath;   // path to output file
    private int index;           // input1/output1 → index=1
    private boolean isActive = true;
}
