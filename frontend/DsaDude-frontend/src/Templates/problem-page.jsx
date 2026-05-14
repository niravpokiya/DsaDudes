import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import ValidateOutput from "../Helpers/OutputValidator";
import SubmitCode, { RunSampleTest } from "../Helpers/SubmitCode";
import languageSnippets from "../snippets/snippet";
import EditorArea from "./editor-area";
import ProblemSidebar from "./problem-sidebar";

// Helper function to normalize output for comparison
function normalizeOutput(output) {
  if (!output) return "";

  return output
    .trim() // Remove leading/trailing whitespace
    .replace(/\n+$/, "") // Remove trailing newlines
    .replace(/\r/g, "") // Remove carriage returns
    .replace(/\t/g, " ") // Replace tabs with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Final trim
}

export default function ProblemsPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(languageSnippets["cpp"].code);
  const [running, setRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState(0);
  const [sampleOutputs, setSampleOutputs] = useState([]);
  const [_outputMatch, _setOutputMatch] = useState(2);
  const [editorHeight, setEditorHeight] = useState(400); // for resizable dragger...
  const isResizing = useRef(false);
  const [gotCorrectOutput, setGotCorrectOutput] = useState([]);
  const [showFullError, setShowFullError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeTab, setActiveTab] = useState("description"); // "description" or "submissions"
  const MAX_OUTPUT_LENGTH = 128; // adjust as needed
  const { user, loading } = useContext(UserContext);
  const token = localStorage.getItem("token");

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "difficulty-easy";
      case "MEDIUM":
        return "difficulty-medium";
      case "HARD":
        return "difficulty-hard";
      default:
        return "difficulty-easy";
    }
  };

  useEffect(() => {
    if (user && user.current_selected_language) {
      setLanguage(user.current_selected_language);
    }
  }, [user]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/question/${slug}`)
      .then((res) => res.json())
      .then((data) => setProblem(data.data))
      .catch((err) => console.error(err));
  }, [slug]);

  useEffect(() => {
    setCode(languageSnippets[language].code);
  }, [language]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      setEditorHeight(() => Math.max(100, e.clientY - 100)); // prevent too small
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // reset error expand state when switching tests
  useEffect(() => {
    setShowFullError(false);
  }, [selectedTest]);

  async function runCodeForSamples() {
    if (!problem) return;
    setRunning(true);
    const outputs = [];
    const results = []; // 1 = pass, 0 = fail

    for (let i = 0; i < problem.examples.length; i++) {
      const input = problem.examples[i].input;

      try {
        // Use the new RunSampleTest function

        const data = await RunSampleTest(
          code,
          language,
          input,
          slug,
          user ? user.id : null,
        );

        outputs.push(data);

        // Compare output with flexible normalization
        const expected = problem.examples[i].output;
        const actual = data.output || "";

        if (expected === actual) {
          results.push(1);
        } else if (problem.staticSolution) {
          results.push(0);
        } else {
          const verdict = await ValidateOutput(
            problem.checker,
            input,
            actual,
            slug,
            user ? user.id : null,
          );

          results.push(verdict ? 1 : 0);
        }
      } catch (err) {
        console.error("Error running code:", err);
        outputs.push({
          output: "",
          error: "Error running code",
          exitCode: -1,
          time: 0,
        });
        results.push(0);
      }
    }

    console.log("🔴 Final results:");
    console.log("Outputs:", outputs);
    console.log("Results:", results);
    console.log("Setting sample outputs and results...");

    setSampleOutputs(outputs);
    setGotCorrectOutput(results);
    setRunning(false);

    console.log("✅ runCodeForSamples completed");
  }

  // Enhanced submit handler with better result handling
  async function handleSubmitClick() {
    if (!problem || !user) {
      alert("Please login to submit code");
      return;
    }

    setSubmitting(true);
    setSubmissionResult(null); // Clear previous results

    try {
      // Submit with real-time status updates
      const res = await SubmitCode(code, language, slug, user.id);

      if (res && res.completed) {
        // Create comprehensive submission object
        const submission = {
          ...res,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          code: code,
          language: language,
          problemSlug: slug,
          problemTitle: problem.title,
          userId: user.id,
          username: user.username,
          // Enhanced result information
          verdict: res.verdict || "UNKNOWN",
          status: res.status || "UNKNOWN",
          executionTime: res.time || 0,
          output: res.output || "",
          error: res.error || "",
          // UI state
          expanded: false,
          showDetails: false,
        };

        setSubmissionResult(submission);

        // Auto-switch to submissions tab to show results
        setActiveTab("submissions");

        // Show user-friendly notification
        showSubmissionNotification(submission);
      } else {
        // Handle failed submission
        const failedSubmission = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          code: code,
          language: language,
          problemSlug: slug,
          problemTitle: problem.title,
          userId: user.id,
          username: user.username,
          verdict: "SYSTEM_ERROR",
          status: "FAILED",
          executionTime: 0,
          output: "",
          error: res.error || "Submission failed",
          expanded: false,
          showDetails: false,
        };

        setSubmissionResult(failedSubmission);
        setActiveTab("submissions");
      }
    } catch (err) {
      console.error("Submit error", err);

      // Create error submission object
      const errorSubmission = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        code: code,
        language: language,
        problemSlug: slug,
        problemTitle: problem.title,
        userId: user.id,
        username: user.username,
        verdict: "SYSTEM_ERROR",
        status: "FAILED",
        executionTime: 0,
        output: "",
        error: err.message || "Network error occurred",
        expanded: false,
        showDetails: false,
      };

      setSubmissionResult(errorSubmission);
      setActiveTab("submissions");
    } finally {
      setSubmitting(false);
    }
  }

  // Helper function to show submission notifications
  function showSubmissionNotification(submission) {
    const verdictColors = {
      ACCEPTED: "#10b981",
      WRONG_ANSWER: "#ef4444",
      TIME_LIMIT_EXCEEDED: "#f59e0b",
      RUNTIME_ERROR: "#ef4444",
      COMPILE_ERROR: "#ef4444",
      SYSTEM_ERROR: "#ef4444",
    };

    const verdictMessages = {
      ACCEPTED: "🎉 Accepted! Your solution passed all test cases!",
      WRONG_ANSWER: "❌ Wrong Answer. Some test cases failed.",
      TIME_LIMIT_EXCEEDED: "⏱️ Time Limit Exceeded. Your code was too slow.",
      RUNTIME_ERROR: "💥 Runtime Error. Your code crashed.",
      COMPILE_ERROR: "🔥 Compilation Error. Code doesn't compile.",
      SYSTEM_ERROR: "🚨 System Error. Please try again.",
    };

    // You could integrate this with a toast notification system
    console.log(
      `Submission ${submission.verdict}: ${verdictMessages[submission.verdict]}`,
    );
  }

  if (!problem)
    return (
      <div
        className="page-inner"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div
          className="loading"
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--border-primary)",
              borderTop: "3px solid var(--text-accent)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          Loading problem...
        </div>
      </div>
    );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="page-inner" style={{ width: "100%", height: "100%" }}>
        <div className="flex gap-4 h-full">
          <ProblemSidebar
            problem={problem}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            submitting={submitting}
            submissionResult={submissionResult}
            setCode={setCode}
            setLanguage={setLanguage}
            getDifficultyColor={getDifficultyColor}
            setSubmissionResult={setSubmissionResult}
          />

          <EditorArea
            problem={problem}
            language={language}
            setLanguage={setLanguage}
            code={code}
            setCode={setCode}
            editorHeight={editorHeight}
            setEditorHeight={setEditorHeight}
            isResizing={isResizing}
            running={running}
            runCodeForSamples={runCodeForSamples}
            submitting={submitting}
            handleSubmitClick={handleSubmitClick}
            selectedTest={selectedTest}
            setSelectedTest={setSelectedTest}
            sampleOutputs={sampleOutputs}
            gotCorrectOutput={gotCorrectOutput}
            showFullError={showFullError}
            setShowFullError={setShowFullError}
            setSubmissionResult={setSubmissionResult}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}
