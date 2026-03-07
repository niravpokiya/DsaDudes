import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import ValidateOutput from "../Helpers/OutputValidator";
import SubmitCode from "../Helpers/SubmitCode";
import languageSnippets from "../snippets/snippet";
import ProblemSidebar from "./problem-sidebar";
import EditorArea from "./editor-area";

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
        const res = await fetch("http://localhost:8080/api/code/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code,
            language,
            input,
          }),
        });

        let data;
        if (res.ok) {
          data = await res.json();
        } else {
          data = {
            output: "",
            error: `Backend Error: ${res.status}`,
            exitCode: -1,
            time: 0,
          };
        }
        outputs.push(data);

        // 🔹 Compare output (trim whitespace/newlines)
        const expected = problem.examples[i].output.trim();
        const actual = (data.output || "").trim();

        if (problem.staticSolution) {
          results.push(expected === actual ? 1 : 0);
        } else {
          const verdict = await ValidateOutput(problem.checker, input, actual);
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

    setSampleOutputs(outputs);
    setGotCorrectOutput(results);
    setRunning(false);
  }

  // Submit handler - calls the helper and stores the result to show in UI
  async function handleSubmitClick() {
    if (!problem) return;
    setSubmitting(true);
    try {
      const res = await SubmitCode(code, language, slug, user ? user.id : null);
      if (res) {
        // Create submission object with timestamp
        const submission = {
          ...res,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          code: code,
          language: language,
          problemSlug: slug,
        };
        setSubmissionResult(submission);
        // Auto-switch to submissions tab with attention-grabbing effect
        setActiveTab("submissions");
      }
    } catch (err) {
      console.error("Submit error", err);
    } finally {
      setSubmitting(false);
    }
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
