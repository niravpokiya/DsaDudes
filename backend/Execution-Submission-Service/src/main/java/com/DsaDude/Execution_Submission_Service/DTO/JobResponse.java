package com.CE.Execution_Submission_Service.DTO;

public class JobResponse {
    private String jobId;
    private String status;
    public JobResponse(String jobId, String status) {
        this.jobId = jobId;
        this.status = status;
    }

    // getters
    public String getJobId() {
        return jobId;
    }
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
}
