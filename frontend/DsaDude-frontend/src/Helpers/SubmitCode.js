async function SubmitCode(code, language, problemSlug, userId = null) {
  const token = localStorage.getItem("token");
  if(userId == null) {
    console.alert("User ID is required to submit code. but not found. ");
  }

  if (!token) {
    alert("You must be logged in to submit code.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/code/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: code,
        language: language,
        userId: userId,
        problemSlug: problemSlug,
        typeOfJob: "SUBMIT"
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Submission failed:", error);
      alert(`Error: ${response.status} ${error}`);
      return;
    }

    const result = await response.json();

    console.log("Execution result:", result);
    return result; // you can handle this result in UI

  } catch (error) {
    console.error("Error submitting code:", error);
    alert("Something went wrong while submitting your code!");
  }
}

export default SubmitCode