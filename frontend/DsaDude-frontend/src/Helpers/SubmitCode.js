import { api } from "../utils/api";
import { increment_submission_count } from "../utils/submission-apis";
 
async function SubmitCode(code, language, problemSlug, userId = null, onStatusUpdate = null) {
  // increment submission count 
  await increment_submission_count(userId).catch(err => console.error("Error incrementing submission count:", err));

  // moving forward 
  try {
    const response = await api.post(
      "/code/submit",
      {
        sourceCode: code,
        language,
        userId,
        problemSlug,
        typeOfJob: "SUBMIT",
      },
    );

    const result = response.data;
    const jobId = result.jobId;
    return PollForSubmission(jobId, 60, 1000, onStatusUpdate); // you can handle this result in UI

  } catch (error) {
    console.error("Error submitting code:", error);
    alert("Something went wrong while submitting your code!");
  }
}

// New function for running sample test cases
async function RunSampleTest(code, language, input, problemSlug, userId = null, onStatusUpdate = null) {

  try {
    // Submit the job first
    const response = await api.post("/code/run", {
      sourceCode: code,
      language,
      input,
      problemSlug,
      userId,
      typeOfJob: "RUN",
    });

    const submitResult = response.data;
    
    if (onStatusUpdate) {
      onStatusUpdate({
        status: "SUBMITTED",
        message: `Job submitted with ID: ${submitResult.jobId}`,
        jobId: submitResult.jobId
      });
    }
    
    // Poll for results
    return await pollForResult(submitResult.jobId, 15, 500, onStatusUpdate); 
  } catch (error) {
    console.error("Error running code:", error);
    if (onStatusUpdate) {
      onStatusUpdate({
        status: "ERROR",
        message: `Error: ${error.message}`
      });
    }
    return {
      output: "",
      error: "Error running code",
      exitCode: -1,
      time: 0,
    };
  }
}

// Enhanced polling function to get execution results
async function pollForResult(jobId, maxAttempts = 30, intervalMs = 1000, onStatusUpdate = null) {
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;

  for (let attempt = 0; attempt
     < maxAttempts; attempt++) {
    try {
      const response = await api.get(`/code/${jobId}`);

      // Reset error counter on successful request
      consecutiveErrors = 0;

      const result = response.data;
      // console.log(`Poll attempt ${attempt + 1}: Status=${result.status}, Verdict=${result.verdict}`);

      // Enhanced status mapping and notification
      const mappedStatus = mapExecutionStatus(result.status, result.verdict);
      
      if (onStatusUpdate) {
        onStatusUpdate({
          status: mappedStatus.status,
          verdict: mappedStatus.verdict,
          message: getStatusMessage(mappedStatus, attempt + 1),
          attempt: attempt + 1,
          result: result,
          jobId: jobId,
          executionTime: result.executionTimeMs || 0
        });
      } 

      // Check if execution is complete (various completion states)
      if (isExecutionComplete(result.status, result.verdict)) { 
        return createSuccessResult(result, mappedStatus);
      }

      // Check for terminal states (errors, timeouts, etc.)
      if (isTerminalState(result.status, result.verdict)) {
        return createErrorResult(result.error || result.verdict, attempt + 1, result);
      }

      // If not complete, wait and poll again
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }

    } catch (error) {
      consecutiveErrors++;
      console.error(`Poll attempt ${attempt + 1} error:`, error);
      
      if (onStatusUpdate) {
        onStatusUpdate({
          status: "NETWORK_ERROR",
          message: `Network error: ${error.message}`,
          attempt: attempt + 1,
          jobId: jobId,
          consecutiveErrors: consecutiveErrors
        });
      }

      // If too many consecutive errors, give up
      if (consecutiveErrors >= maxConsecutiveErrors || attempt === maxAttempts - 1) {
        return createErrorResult(`Network error: ${error.message}`, attempt + 1);
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  // Timeout after max attempts
  return createErrorResult("Execution timeout after " + maxAttempts + " attempts", maxAttempts);
}

async function PollForSubmission(
  jobId, 
  maxAttempts = 60,
  intervalMs = 1000,
  onStatusUpdate = null
) {

  for (let attempt = 0; attempt < maxAttempts; attempt++) {

    try {

       const response = await api.get(
        `/code/submit/${jobId}`,
      );

      const result = response.data;
      console.log("Polling Result:", result);

      const status =
        result.status?.toUpperCase();

      // realtime UI updates
      if (onStatusUpdate) {
        onStatusUpdate(result);
      }

      // still executing
      if (
        status === "RUNNING" ||
        status === "PENDING" ||
        status === "QUEUED"
      ) {

        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }

      // execution finished
      return {
        completed: true,
        status: result.status,
        verdict: result.verdict,
        passed: Number(result.passed || 0),
        total: Number(result.total || 0),
        executionTimeMs: Number(
          result.executionTimeMs || 0
        ),
        sourceCode: result.sourceCode || "",
        language: result.language || "",
        error: result.error || "",
        raw: result
      };

    } catch (error) {

      console.error(
        `Polling error attempt ${attempt + 1}`,
        error
      );

      if (attempt === maxAttempts - 1) {
        return {
          completed: false,
          status: "ERROR",
          verdict: "SYSTEM_ERROR",
          error: error.message
        };
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  return {
    completed: false,
    status: "TIMEOUT",
    verdict: "TIMEOUT",
    error: "Polling timeout exceeded"
  };
}

// Helper functions for enhanced polling
function mapExecutionStatus(status, verdict) {
  // Map backend status to frontend-friendly status
  switch (status) {
    case "COMPLETED":
    case "SUCCESS":
      return { status: "COMPLETED", verdict: verdict || "SUCCESS" };
    case "FAILED":
    case "ERROR":
      return { status: "FAILED", verdict: verdict || "ERROR" };
    case "QUEUED":
      return { status: "QUEUED", verdict: "PENDING" };
    case "RUNNING":
      return { status: "RUNNING", verdict: "EXECUTING" };
    case "NOT_FOUND":
      return { status: "NOT_FOUND", verdict: "PENDING" };
    default:
      return { status: status || "UNKNOWN", verdict: verdict || "UNKNOWN" };
  }
}

function isExecutionComplete(status, verdict) {
  return status === "COMPLETED" || 
         status === "SUCCESS" || 
         verdict === "ACCEPTED" || 
         verdict === "WRONG_ANSWER" ||
         verdict === "TIME_LIMIT_EXCEEDED" ||
         verdict === "RUNTIME_ERROR" ||
         verdict === "COMPILE_ERROR" ||
         (status === "COMPLETED" && verdict && verdict !== "PENDING");
}

function isTerminalState(status, verdict) {
  return status === "FAILED" || 
         status === "ERROR" || 
         verdict === "TIME_LIMIT_EXCEEDED" ||
         verdict === "RUNTIME_ERROR" ||
         verdict === "COMPILE_ERROR" ||
         verdict === "SYSTEM_ERROR";
}

function getStatusMessage(mappedStatus) {
  const messages = {
    "QUEUED": "Job queued, waiting to start...",
    "RUNNING": "Executing code...",
    "COMPLETED": "Execution completed!",
    "FAILED": "Execution failed",
    "ERROR": "Error occurred",
    "NOT_FOUND": "Waiting for results...",
    "NETWORK_ERROR": "Network issue, retrying...",
    "POLLING_ERROR": "Server error, retrying..."
  };
  
  return messages[mappedStatus.status] || `Status: ${mappedStatus.status}`;
}

function createSuccessResult(result, mappedStatus) {
  // Handle case where verdict contains the actual output (RUN jobs)
  let finalVerdict = mappedStatus.verdict;
  let finalOutput = result.output || "";
  
  // For RUN jobs, the verdict might contain the actual output
  if (mappedStatus.status === "COMPLETED" && !finalVerdict && finalOutput) {
    finalVerdict = "SUCCESS"; // Default verdict for successful RUN
  }
    
  return {
    output: finalOutput,
    error: result.error || "",
    exitCode: result.error ? -1 : 0,
    time: result.executionTimeMs || 0,
    verdict: finalVerdict,
    status: mappedStatus.status,
    completed: true
  };
}

function createErrorResult(errorMessage, _attempts, result = null) {
  return {
    output: result?.output || "",
    error: errorMessage,
    exitCode: -1,
    time: result?.executionTimeMs || 0,
    verdict: result?.verdict || "ERROR",
    status: "FAILED",
    completed: false,
    attempts: _attempts
  };
}

export { RunSampleTest, SubmitCode };
export default SubmitCode;