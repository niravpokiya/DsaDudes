
async function ValidateOutput(checker, input, userOutput) {
  if (!checker || !checker.code || !checker.language) {
    console.error("No validator provided for this problem.");
    return 0;
  }

  try {
    const validatorInput = `${input}\n${userOutput}`;

    const res = await fetch("http://localhost:8083/api/code/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: checker.code,
        language: checker.language,
        input: validatorInput,
      }),
    });

    if (!res.ok) {
      console.error("Validator API error:", res.status);
      return 0;
    }

    const data = await res.json();
    const validatorOutput = (data.output || "").trim().toLowerCase();
    console.log(validatorOutput);
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