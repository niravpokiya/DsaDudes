import Editor from "@monaco-editor/react";

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
  return (
    <div
      className="flex flex-col h-full animate-fadeInRight"
      style={{
        flex: "1 1 auto",
        minWidth: 0,
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border-primary)",
          background: "var(--bg-tertiary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <label
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Language:
          </label>
          <select
            value={language}
            onChange={() => setLanguage("cpp")}
            disabled
            style={{
              background: "var(--bg-accent)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "var(--radius)",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: "var(--font-weight-medium)",
              cursor: "not-allowed",
              opacity: 0.88,
            }}
          >
            <option value="cpp">C++</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn-primary"
            onClick={runCodeForSamples}
            disabled={running}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: running ? 0.7 : 1,
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            {running ? (
              <>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "2px solid currentColor",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Running...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Run
              </>
            )}
          </button>
          <button
            className="btn-secondary"
            onClick={handleSubmitClick}
            disabled={submitting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? (
              <>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "2px solid currentColor",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Submitting...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                Submit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor with resizable height */}
      <div className="overflow-hidden" style={{ height: `${editorHeight}px` }}>
        <Editor height="100%" width="100%" language={language} value={code} onChange={(value) => setCode(value)} theme="vs-dark" />
      </div>

      {/* Enhanced Resizer bar */}
      <div
        style={{
          height: "4px",
          background: "var(--border-primary)",
          cursor: "row-resize",
          transition: "background var(--transition-fast)",
          position: "relative",
        }}
        onMouseDown={() => (isResizing.current = true)}
        onMouseEnter={(e) => (e.target.style.background = "var(--text-accent)")}
        onMouseLeave={(e) => (e.target.style.background = "var(--border-primary)")}
      >
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "20px", height: "2px", background: "var(--text-accent)", borderRadius: "1px" }} />
      </div>

      {/* Enhanced Test Case Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-primary)", background: "var(--bg-tertiary)" }}>
        {problem.examples.map((_, idx) => {
          const status = gotCorrectOutput[idx];
          const dotClass = status === 1 ? "status-pass" : status === 0 ? "status-fail" : "status-unknown";
          const isActive = selectedTest === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedTest(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius)",
                border: "1px solid transparent",
                background: isActive ? "var(--bg-accent)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: "var(--font-weight-medium)",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                borderColor: isActive ? "var(--text-accent)" : "var(--border-primary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.background = "var(--bg-accent)";
                  e.target.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.background = "transparent";
                  e.target.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span>Test {idx + 1}</span>
              <span className={`status-dot ${dotClass}`} />
            </button>
          );
        })}
      </div>

      {/* Enhanced Input / Output Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", padding: "1.5rem", background: "var(--bg-primary)" }}>
        {/* Input Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)" }}>Input</label>
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--text-accent)" }} />
          </div>
          <textarea value={problem.examples[selectedTest]?.input || ""} readOnly style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", padding: "1rem", borderRadius: "var(--radius)", border: "1px solid var(--border-primary)", resize: "none", height: "80px", overflow: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.875rem", lineHeight: 1.5 }} />
        </div>

        {/* Expected Output Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)" }}>Expected Output</label>
            {(() => {
              const s = gotCorrectOutput[selectedTest];
              if (s === 1) return <span className="output-badge output-pass">PASS</span>;
              if (s === 0) return <span className="output-badge output-fail">FAIL</span>;
              return <span className="output-badge output-unknown">NOT RUN</span>;
            })()}
          </div>
          <pre style={{ background: "var(--bg-tertiary)", color: "var(--success)", padding: "1rem", borderRadius: "var(--radius)", border: "1px solid var(--success)", height: "max-content", overflow: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.875rem", lineHeight: 1.5 }}>{problem.examples[selectedTest]?.output || ""}</pre>
        </div>

        {/* Your Output Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)" }}>Your Output</label>
            {(() => {
              const s = gotCorrectOutput[selectedTest];
              if (s === 1) return <span className="output-badge output-pass">PASS</span>;
              if (s === 0) return <span className="output-badge output-fail">FAIL</span>;
              return <span className="output-badge output-unknown">NOT RUN</span>;
            })()}
          </div>

          {sampleOutputs[selectedTest] ? (
            (() => {
              const MAX_OUTPUT_LENGTH = 128;
              const currentOutput = sampleOutputs[selectedTest].output || "(no output)";
              const isOutputTruncated = currentOutput.length > MAX_OUTPUT_LENGTH;
              const displayedOutput = isOutputTruncated ? currentOutput.slice(0, MAX_OUTPUT_LENGTH) + "..." : currentOutput;

              const currentError = sampleOutputs[selectedTest].error || "";
              const ERROR_PREVIEW_LENGTH = 300;
              const isErrorLong = currentError.length > ERROR_PREVIEW_LENGTH;
              const displayedError = !isErrorLong || showFullError ? currentError : currentError.slice(0, ERROR_PREVIEW_LENGTH) + "...";

              return (
                <div style={{ background: "var(--bg-tertiary)", padding: "1rem", borderRadius: "var(--radius)", border: "1px solid var(--border-primary)", overflow: "auto" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: "var(--font-weight-medium)", display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span>Exit Code: {sampleOutputs[selectedTest].exitCode}</span>
                    {(() => {
                      const so = sampleOutputs[selectedTest];
                      const timeVal = so?.time ?? so?.timeMs ?? so?.duration ?? so?.executionTime;
                      if (typeof timeVal === "number" || (typeof timeVal === "string" && timeVal)) {
                        const display = typeof timeVal === "number" ? `${timeVal} ms` : timeVal;
                        return <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Time: {display}</span>;
                      }
                      return null;
                    })()}
                  </div>

                  <div style={{ marginBottom: "0.75rem", color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: "var(--font-weight-medium)" }}>Output:</div>
                  <pre style={{ background: "var(--bg-primary)", color: "var(--success)", padding: "0.75rem", borderRadius: "var(--radius)", whiteSpace: "pre-wrap", breakWords: "break-word", fontFamily: "monospace", fontSize: "0.875rem", lineHeight: 1.5, border: "1px solid var(--success)", marginBottom: "0.75rem" }}>{displayedOutput}</pre>
                  {isOutputTruncated && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Output truncated</div>}

                  {currentError && (
                    <>
                      <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem", color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: "var(--font-weight-medium)" }}>Error:</div>
                      <pre style={{ background: "var(--bg-primary)", color: "var(--error)", padding: "0.75rem", borderRadius: "var(--radius)", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.875rem", lineHeight: 1.5, border: "1px solid var(--error)" }}>{displayedError}</pre>
                      {isErrorLong && (
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
                          <button onClick={() => setShowFullError(!showFullError)} style={{ background: "transparent", border: "none", color: "var(--text-accent)", cursor: "pointer", padding: 0, fontSize: "0.85rem" }}>{showFullError ? "Show less" : "Show more"}</button>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{showFullError ? "Showing full error" : "Preview"}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div style={{ background: "var(--bg-tertiary)", padding: "2rem", borderRadius: "var(--radius)", border: "1px solid var(--border-primary)", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <div style={{ width: "40px", height: "40px", border: "2px solid var(--border-primary)", borderTop: "2px solid var(--text-accent)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
              Run code to see output
            </div>
          )}

        {/* Explanation for the selected test (right panel) */}
        {problem.examples[selectedTest]?.explanation && (
          <div style={{ marginTop: "1rem", background: "var(--bg-tertiary)", padding: "1rem", borderRadius: "var(--radius)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "0.5rem" }}>Explanation</strong>
            <div>{problem.examples[selectedTest].explanation}</div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
