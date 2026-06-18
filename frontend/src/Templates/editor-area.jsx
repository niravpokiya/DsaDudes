import Editor from "@monaco-editor/react";
import { Code2, Play, Send } from "lucide-react";
import { useTheme } from "../Context/themeContext";
import languageSnippets from "../snippets/snippet";

const languageOptions = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
];

export default function EditorArea({
  problem,
  language,
  setLanguage,
  code,
  setCode,
  editorHeight,
  isResizing,
  running,
  runCodeForSamples,
  submitting,
  handleSubmitClick,
  selectedTest,
  setSelectedTest,
  sampleOutputs,
  gotCorrectOutput,
  showFullError,
  setShowFullError,
}) {
  const { currentMode } = useTheme();
  const statusBadge = (status, label) => {
    if (status === 1) return <span className="verdict-badge verdict-badge--accepted">{label || "Accepted"}</span>;
    if (status === 0) return <span className="verdict-badge verdict-badge--wrong">{label || "Wrong Answer"}</span>;
    return <span className="verdict-badge verdict-badge--pending">{label || "Pending"}</span>;
  };

  const selectedOutput = sampleOutputs[selectedTest];
  const currentOutput = selectedOutput?.output || "(no output)";
  const currentError = selectedOutput?.error || "";
  const selectedLanguageLabel =
    languageOptions.find((option) => option.value === language)?.label || "Code";

  return (
    <div className="editor-shell animate-fadeInRight">
      <div className="editor-toolbar">
        <div className="editor-toolbar__left">
          <Code2 size={18} />
          <div>
            <strong>Editor</strong>
            <span>{selectedLanguageLabel} solution workspace</span>
          </div>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="editor-select"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="editor-toolbar__actions">
          <button className="btn-secondary" onClick={runCodeForSamples} disabled={running}>
            <Play size={16} />
            {running ? "Running" : "Run"}
          </button>
          <button className="btn-primary" onClick={handleSubmitClick} disabled={submitting}>
            <Send size={16} />
            {submitting ? "Submitting" : "Submit"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden" style={{ height: `${editorHeight}px` }}>
        <Editor
          height="100%"
          width="100%"
          language={languageSnippets[language]?.monacoLanguage || language}
          value={code}
          onChange={(value) => setCode(value)}
          theme={currentMode === "dark" ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            padding: { top: 18, bottom: 18 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <div className="resizer" onMouseDown={() => (isResizing.current = true)} />

      <div className="testcase-tabs" role="tablist" aria-label="Sample test cases">
        {problem.examples.map((_, idx) => {
          const status = gotCorrectOutput[idx];
          const dotClass = status === 1 ? "status-pass" : status === 0 ? "status-fail" : "status-unknown";
          const isActive = selectedTest === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedTest(idx)}
              className={`testcase-tab ${isActive ? "testcase-tab--active" : ""}`}
              role="tab"
              aria-selected={isActive}
            >
              Test Case {idx + 1}
              <span className={`status-dot ${dotClass}`} />
            </button>
          );
        })}
      </div>

      <div className="testcase-panel modern-scrollbar">
        <div className="io-card">
          <div className="io-card__header">
            <span>Input</span>
          </div>
          <pre>{problem.examples[selectedTest]?.input || ""}</pre>
        </div>

        <div className="io-card">
          <div className="io-card__header">
            <span>Expected Output</span>
          </div>
          <pre>{problem.examples[selectedTest]?.output || ""}</pre>
        </div>

        <div className="io-card">
          <div className="io-card__header">
            <span>Your Output</span>
            {statusBadge(gotCorrectOutput[selectedTest], gotCorrectOutput[selectedTest] === undefined ? "Not Run Yet" : undefined)}
          </div>

          {selectedOutput ? (
            <>
              <div className="io-card__meta">
                <span>Exit code: {selectedOutput.exitCode}</span>
                {(() => {
                  const timeVal = selectedOutput?.time ?? selectedOutput?.timeMs ?? selectedOutput?.duration ?? selectedOutput?.executionTime;
                  if (typeof timeVal === "number" || (typeof timeVal === "string" && timeVal)) {
                    return <span>Time: {typeof timeVal === "number" ? `${timeVal} ms` : timeVal}</span>;
                  }
                  return null;
                })()}
              </div>
              <pre>{currentOutput}</pre>

              {currentError && (
                <div className="io-error">
                  <div className="io-card__header">Error</div>
                  <pre style={{ color: "var(--error)" }}>{currentError}</pre>
                </div>
              )}
            </>
          ) : (
            <pre className="io-card__empty">Not Run Yet</pre>
          )}
        </div>

        {problem.examples[selectedTest]?.explanation && (
          <div className="io-card">
            <div className="io-card__header">Explanation</div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {problem.examples[selectedTest].explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
