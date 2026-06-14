package com.DsaDudes.User_service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolvedStatsResponse {
    private long solvedCount;
    private long easySolvedCount;
    private long mediumSolvedCount;
    private long hardSolvedCount;
}
