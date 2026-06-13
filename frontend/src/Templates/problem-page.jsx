import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import ValidateOutput from "../Helpers/OutputValidator";
import SubmitCode, { RunSampleTest } from "../Helpers/SubmitCode";
import languageSnippets from "../snippets/snippet";
import EditorArea from "./editor-area";
import ProblemSidebar from "./problem-sidebar";
import { api } from "../utils/api";
import { increment_submission_count, increment_solved_count } from "../utils/submission-apis";

export default function ProblemsPage() {
  const { slug } = useParams();
  const workspaceRef = useRef(null);
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(languageSnippets["cpp"].code);
  const [running, setRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState(0);
  const [sampleOutputs, setSampleOutputs] = useState([]);
  const [_outputMatch, _setOutputMatch] = useState(2);
  const [editorHeight, setEditorHeight] = useState(400); // for resizable dragger...
  const [splitPercent, setSplitPercent] = useState(() => {
    const saved = Number(localStorage.getItem("dsaChampProblemSplit"));
    return Number.isFinite(saved) ? Math.min(60, Math.max(30, saved)) : 42;
  });
  const isResizing = useRef(false);
  const isVerticalResizing = useRef(false);
  const [gotCorrectOutput, setGotCorrectOutput] = useState([]);
  const [showFullError, setShowFullError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [showResultTab, setShowResultTab] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [hasLoadedSubmissions, setHasLoadedSubmissions] = useState(false);
  const MAX_OUTPUT_LENGTH = 128; // adjust as needed
  const { user } = useContext(UserContext);

  const normalizeJudgeOutput = (value) =>
    String(value ?? "")
      .replace(/\r\n/g, "\n")
      .trim()
      .replace(/[ \t]+/g, " ");

  const mapSubmissionRecord = (submission) => {
    if (!submission || typeof submission !== "object") {
      return null;
    }

    return {
      id:
        submission.id ||
        submission.submissionId ||
        `${Date.now()}-${Math.random()}`,
      userId: submission.userId,
      questionId: submission.questionId,
      problemSlug: submission.problemSlug,
      sourceCode: submission.sourceCode || submission.code || "",
      language: submission.language || "",
      codeLength: submission.codeLength,
      verdict: submission.verdict || "UNKNOWN",
      status: submission.status || "UNKNOWN",
      executionTime:
        submission.executionTime ??
        submission.executionTimeMs ??
        submission.time,
      memoryUsed: submission.memoryUsed,
      totalTestcases: submission.totalTestcases ?? submission.total ?? 0,
      passedTestcases: submission.passedTestcases ?? submission.passed ?? 0,
      failedTestcases: submission.failedTestcases,
      errorMessage: submission.errorMessage || submission.error || "",
      submissionTime:
        submission.submissionTime ||
        submission.timestamp ||
        new Date().toISOString(),
    };
  };

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
    setLanguage("cpp");
  }, [setLanguage]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/question/${slug}`);

        setProblem(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProblem();
  }, [slug]);

  useEffect(() => {
    setSubmissions([]);
    setSelectedSubmission(null);
    setLoadingSubmissions(false);
    setHasLoadedSubmissions(false);
  }, [slug]);

  useEffect(() => {
    const loadSubmissions = async () => {
      if (
        activeTab !== "submissions" ||
        !user?.id ||
        hasLoadedSubmissions ||
        loadingSubmissions
      ) {
        return;
      }

      setLoadingSubmissions(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setSubmissions([]);
          setHasLoadedSubmissions(true);
          return;
        }

        const response = await api.get(
          `/submissions/all-submissions/${user.id}`,
        );

        const payload = response.data;

        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        const filtered = list
          .map(mapSubmissionRecord)
          .filter((entry) => entry && entry.problemSlug === slug)
          .sort(
            (a, b) =>
              new Date(b.submissionTime).getTime() -
              new Date(a.submissionTime).getTime(),
          );

        setSubmissions(filtered);
        setHasLoadedSubmissions(true);
      } catch (error) {
        console.error("Error loading submissions", error);
        setSubmissions([]);
        setHasLoadedSubmissions(true);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    loadSubmissions();
  }, [activeTab, user?.id, slug, hasLoadedSubmissions, loadingSubmissions]);

  useEffect(() => {
    setCode(languageSnippets[language].code);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("dsaChampProblemSplit", String(splitPercent));
  }, [splitPercent]);

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

  // Vertical split resizing for problem statement and editor panels.
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isVerticalResizing.current) return;
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (!rect?.width) return;

      const nextPercent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(60, Math.max(30, nextPercent)));
    };

    const handleMouseUp = () => {
      isVerticalResizing.current = false;
      document.body.classList.remove("is-resizing-split");
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
        const expected = normalizeJudgeOutput(problem.examples[i].output);
        const actual = normalizeJudgeOutput(data.output);
        console.log(
          `Test case ${i + 1} - Expected: "${expected}", Actual: "${actual}"`,
        );
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

    console.log("Results:", results);

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
    setShowResultTab(true);
    setActiveTab("result");
    setSubmissionState({
      phase: "submitting",
      status: "PENDING",
      verdict: "PENDING",
      passed: 0,
      total: problem?.examples?.length || 0,
      executionTimeMs: 0,
      language,
      error: "",
      message: "Submitting Solution...",
      timestamp: new Date().toISOString(),
      sourceCode: code,
      code,
      problemTitle: problem.title,
      problemSlug: slug,
    });
    setSubmissionResult(null); // Clear previous results

    try {
      // Submit with real-time status updates
      const res = await SubmitCode(code, language, slug, user.id, (update) => {
        const nextStatus = (update?.status || update?.verdict || "")
          .toString()
          .toUpperCase();
        const phase =
          nextStatus === "RUNNING" ||
          nextStatus === "PENDING" ||
          nextStatus === "QUEUED"
            ? "running"
            : nextStatus === "COMPLETED" ||
                nextStatus === "SUCCESS" ||
                update?.completed
              ? "final"
              : "running";

        setSubmissionState((current) => ({
          ...(current || {}),
          ...update,
          phase,
          status: update?.status || current?.status || "RUNNING",
          verdict: update?.verdict || current?.verdict || "RUNNING",
          passed: Number(update?.passed ?? current?.passed ?? 0),
          total: Number(
            update?.total ?? current?.total ?? (problem?.examples?.length || 0),
          ),
          executionTimeMs: Number(
            update?.executionTimeMs ??
              update?.executionTime ??
              current?.executionTimeMs ??
              0,
          ),
          language: update?.language || current?.language || language,
          error: update?.error ?? current?.error ?? "",
          message: update?.message || current?.message || "",
          timestamp: current?.timestamp || new Date().toISOString(),
          sourceCode: update?.sourceCode || current?.sourceCode || code,
          code: update?.sourceCode || current?.code || code,
          problemTitle: problem.title,
          problemSlug: slug,
        }));
      });

      if (res && res.completed) {
        // Create comprehensive submission object
        await increment_submission_count(user.id);

        // increment solved only if accepted
        if (res.verdict === "ACCEPTED") {
          await increment_solved_count(
            user.id,
            problem.difficulty
          );
        }
        
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
        setSubmissionState({
          phase: "final",
          ...submission,
          executionTimeMs: res.executionTimeMs ?? res.time ?? 0,
          sourceCode: code,
          code,
        });
        setHasLoadedSubmissions(false);

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
        setSubmissionState({
          phase: "final",
          ...failedSubmission,
          executionTimeMs: 0,
          sourceCode: code,
          code,
        });
        setHasLoadedSubmissions(false);
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
      setSubmissionState({
        phase: "final",
        ...errorSubmission,
        executionTimeMs: 0,
        sourceCode: code,
        code,
      });
      setHasLoadedSubmissions(false);
    } finally {
      setSubmitting(false);
    }
  }

  // Helper function to show submission notifications
  function showSubmissionNotification(submission) {
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
      <div className="page-inner" style={{ minHeight: "60vh", justifyContent: "center", alignItems: "center" }}>
        <div className="saas-card" style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
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
    <div className="problem-workspace animate-fadeInUp" ref={workspaceRef}>
          <ProblemSidebar
            problem={problem}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showResultTab={showResultTab}
            onCloseResultTab={() => {
              setShowResultTab(false);
              if (activeTab === "result") {
                setActiveTab("description");
              }
            }}
            submitting={submitting}
            submissionState={submissionState}
            submissionResult={submissionResult}
            submissions={submissions}
            selectedSubmission={selectedSubmission}
            setSelectedSubmission={setSelectedSubmission}
            loadingSubmissions={loadingSubmissions}
            setCode={setCode}
            setLanguage={setLanguage}
            getDifficultyColor={getDifficultyColor}
            setSubmissionResult={setSubmissionResult}
            sidebarWidth={`${splitPercent}%`}
          />

          <div
            className="split-divider"
            onMouseDown={() => {
              isVerticalResizing.current = true;
              document.body.classList.add("is-resizing-split");
            }}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize problem and editor panels"
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
  );
}
