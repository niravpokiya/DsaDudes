import React from "react";

export default function ProblemSidebar({
  problem,
  activeTab,
  setActiveTab,
  submitting,
  submissionResult,
  setCode,
  setLanguage,
  getDifficultyColor,
  setSubmissionResult,
}) {
  return (
    <div className="w-2/5 overflow-y-auto modern-scrollbar" style={{ padding: "0 0" }}>
      <div className="card animate-fadeInLeft" style={{ height: "fit-content", padding: "1rem" }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--text-primary)",
              marginBottom: "0.375rem",
              lineHeight: 1.3,
            }}
          >
            {problem.title}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className={`output-badge ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            borderBottom: "1px solid var(--border-primary)",
            paddingBottom: "0",
          }}
        >
          <button
            onClick={() => setActiveTab("description")}
            style={{
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "description" ? "2px solid var(--text-accent)" : "2px solid transparent",
              color: activeTab === "description" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === "description" ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all var(--transition-fast)",
              position: "relative",
              bottom: "-1px",
            }}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            style={{
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "submissions" ? "2px solid var(--text-accent)" : "2px solid transparent",
              color: activeTab === "submissions" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === "submissions" ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all var(--transition-fast)",
              position: "relative",
              bottom: "-1px",
            }}
          >
            Submissions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "description" && (
          <>
            {submitting && (
              <div
                style={{
                  marginBottom: "0.75rem",
                  padding: "0.5rem 0.75rem",
                  background: "linear-gradient(90deg, rgba(255,161,22,0.1), transparent)",
                  border: "1px solid var(--text-accent)",
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  animation: "pulse 2s infinite",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "2px solid var(--text-accent)",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div
                  style={{
                    color: "var(--text-accent)",
                    fontWeight: "var(--font-weight-medium)",
                    fontSize: "0.875rem",
                  }}
                >
                  Submitting to judge...
                </div>
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Problem Statement
              </h3>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "1rem" }}>{problem.description}</div>
            </div>

            {problem.constraints && (
              <div style={{ marginBottom: "1rem" }}>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Constraints
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {problem.constraints.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--bg-accent)",
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {problem.examples && problem.examples.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--text-primary)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Sample Test Cases
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {problem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-secondary)",
                        borderRadius: "var(--radius-lg)",
                        padding: "1rem",
                        borderLeft: "4px solid var(--text-accent)",
                      }}
                    >
                      <div style={{ marginBottom: "0.75rem" }}>
                        <strong style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}>Input:</strong>
                        <pre
                          style={{
                            background: "var(--bg-tertiary)",
                            padding: "0.75rem",
                            borderRadius: "var(--radius)",
                            marginTop: "0.375rem",
                            color: "var(--text-primary)",
                            fontSize: "0.875rem",
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                            border: "1px solid var(--border-primary)",
                          }}
                        >
                          {ex.input}
                        </pre>
                      </div>
                      <div style={{ marginBottom: "0.75rem" }}>
                        <strong style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}>Output:</strong>
                        <pre
                          style={{
                            background: "var(--bg-tertiary)",
                            padding: "0.75rem",
                            borderRadius: "var(--radius)",
                            marginTop: "0.375rem",
                            color: "var(--success)",
                            fontSize: "0.875rem",
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                            border: "1px solid var(--success)",
                          }}
                        >
                          {ex.output}
                        </pre>
                      </div>
                      {ex.explanation && (
                        <div>
                          <strong style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}>Explanation:</strong>
                          <p style={{ color: "var(--text-secondary)", marginTop: "0.375rem", fontSize: "0.875rem", lineHeight: 1.5 }}>{ex.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "submissions" && (
          <div>
            {submitting && (
              <div
                style={{
                  marginBottom: "0.75rem",
                  padding: "1rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "3px solid var(--text-accent)",
                    borderTop: "3px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div style={{ color: "var(--text-accent)", fontWeight: "var(--font-weight-semibold)", fontSize: "0.875rem" }}>
                  Submitting your solution...
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>Please wait while we judge your code</div>
              </div>
            )}

            {!submitting && !submissionResult && (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📝</div>
                <div style={{ fontSize: "1rem", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)", marginBottom: "0.375rem" }}>No submissions yet</div>
                <div style={{ fontSize: "0.875rem" }}>Submit your code to see your submission result here</div>
              </div>
            )}

            {submissionResult && (
              <div
                style={{
                  padding: "1rem",
                  background: "var(--bg-secondary)",
                  border: `2px solid ${(() => {
                    const isAccepted = submissionResult.message && (submissionResult.message.toLowerCase().includes("accepted") || submissionResult.passed === submissionResult.total);
                    return isAccepted ? "var(--success)" : "var(--error)";
                  })()}`,
                  borderRadius: "var(--radius-lg)",
                  animation: "slideInUp 0.5s ease-out",
                  boxShadow: (() => {
                    const isAccepted = submissionResult.message && (submissionResult.message.toLowerCase().includes("accepted") || submissionResult.passed === submissionResult.total);
                    return isAccepted ? "0 0 20px var(--success-bg)" : "0 0 20px var(--error-bg)";
                  })(),
                }}
              >
                {(() => {
                  const isAccepted = submissionResult.message && (submissionResult.message.toLowerCase().includes("accepted") || submissionResult.passed === submissionResult.total);
                  const statusColor = isAccepted ? "var(--success)" : "var(--error)";
                  const statusBg = isAccepted ? "var(--success-bg)" : "var(--error-bg)";
                  const displayTime = submissionResult.time || submissionResult.timeMs || submissionResult.executionTime || "N/A";
                  const timeValue = typeof displayTime === "number" ? `${displayTime} ms` : displayTime;

                  return (
                    <>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ fontSize: "1.25rem", fontWeight: "var(--font-weight-bold)", color: statusColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>{isAccepted ? "Accepted" : "Not Accepted"}</div>
                          <span style={{ padding: "0.2rem 0.5rem", background: statusBg, color: statusColor, borderRadius: "var(--radius)", fontSize: "0.7rem", fontWeight: "var(--font-weight-semibold)", border: `1px solid ${statusColor}`, animation: "pulse 2s infinite" }}>Latest</span>
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{submissionResult.timestamp ? new Date(submissionResult.timestamp).toLocaleString() : "Just now"}</div>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        <div style={{ padding: "0.625rem 0.75rem", background: "var(--bg-accent)", borderRadius: "var(--radius)", border: "1px solid var(--border-primary)", flex: "1", minWidth: "100px" }}>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>Test Cases</div>
                          <div style={{ fontSize: "1rem", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)" }}>{submissionResult.passed || 0} / {submissionResult.total || 0}</div>
                        </div>
                        <div style={{ padding: "0.625rem 0.75rem", background: "var(--bg-accent)", borderRadius: "var(--radius)", border: "1px solid var(--border-primary)", flex: "1", minWidth: "100px" }}>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>Runtime</div>
                          <div style={{ fontSize: "1rem", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)" }}>{timeValue}</div>
                        </div>
                        <div style={{ padding: "0.625rem 0.75rem", background: "var(--bg-accent)", borderRadius: "var(--radius)", border: "1px solid var(--border-primary)", flex: "1", minWidth: "100px" }}>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>Language</div>
                          <div style={{ fontSize: "1rem", fontWeight: "var(--font-weight-semibold)", color: "var(--text-primary)", textTransform: "uppercase" }}>{submissionResult.language || "N/A"}</div>
                        </div>
                      </div>

                      {submissionResult.message && (
                        <div style={{ padding: "0.625rem 0.75rem", background: statusBg, border: `1px solid ${statusColor}`, borderRadius: "var(--radius)", color: statusColor, fontSize: "0.8125rem", fontWeight: "var(--font-weight-medium)", marginBottom: "0.75rem" }}>{submissionResult.message}</div>
                      )}

                      <button
                        onClick={() => {
                          if (submissionResult.code) {
                            setCode(submissionResult.code);
                            setLanguage(submissionResult.language);
                            setActiveTab("description");
                          }
                        }}
                        style={{
                          padding: "0.5rem 0.75rem",
                          background: "transparent",
                          border: "1px solid var(--border-primary)",
                          color: "var(--text-primary)",
                          borderRadius: "var(--radius)",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: "var(--font-weight-medium)",
                          transition: "all var(--transition-fast)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "var(--bg-accent)";
                          e.target.style.borderColor = "var(--text-accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.borderColor = "var(--border-primary)";
                        }}
                      >
                        View Code →
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
