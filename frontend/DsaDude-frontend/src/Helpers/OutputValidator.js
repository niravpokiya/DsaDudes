import { RunSampleTest } from "./SubmitCode";

async function ValidateOutput(checker, input, userOutput, problemSlug, userId) {
  if (!checker || !checker.code || !checker.language) {
    console.error("No validator provided for this problem.");
    return 0;
  }
  try {
    const validatorInput = `${input}${userOutput}`;  
    
    console.log("Validator input : "  + validatorInput)
    const token = localStorage.getItem("token");
    const res = await RunSampleTest(checker.code, checker.language, validatorInput, problemSlug, userId)
    // const res = await fetch("http://localhost:8080/api/code/run", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json",
    //               "Authorization": `Bearer ${token}`,
    //             },
    //   body: JSON.stringify({
    //     sourceCode: checker.code,
    //     language: checker.language,
    //     input: validatorInput,
    //     problemSlug,
    //     userId: userId || null,
    //     typeOfJob: "RUN"
    //   }),
    // });

    const data = res;
    const validatorOutput = (data.output || "").trim().toLowerCase(); 
    // If validator prints "PASS" or "SUCCESS" anywhere → test passed
    if (validatorOutput.includes("pass") || validatorOutput.includes("success")) {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Validator execution failed:", error);
    return 0;
  }
}
export default ValidateOutput