import MDEditor from "@uiw/react-md-editor";
import ProblemSubmissionsTab from "./problem-submissions-tab";
import SubmissionResultTab, { getResultTabTitle } from "./submission-result-tab";

import "github-markdown-css/github-markdown-dark.css";
import "highlight.js/styles/github-dark.css";

export default function ProblemSidebar({
  problem,
  activeTab,
  setActiveTab,
  showResultTab,
  onCloseResultTab,
  submitting,
  submissionState,
  submissionResult,
  submissions,
  selectedSubmission,
  setSelectedSubmission,
  loadingSubmissions,
  setCode,
  setLanguage,
  getDifficultyColor,
  setSubmissionResult,
  sidebarWidth = 350,
}) {
  const resultTabMeta = getResultTabTitle(submissionState, submissionResult, submitting);

  return (
    <div className="modern-scrollbar" style={{ flex: `0 0 ${sidebarWidth}px`, minWidth: "280px", maxWidth: "600px", height: "100%", overflowY: "auto", padding: "0 0", minHeight: 0 }}>
      <div className="card animate-fadeInLeft" style={{ height: "fit-content", padding: "1rem", minHeight: "100%" }}>
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
          {showResultTab && (
            <button
              onClick={() => setActiveTab("result")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.7rem",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "result" ? "2px solid var(--text-accent)" : "2px solid transparent",
                color: activeTab === "result" ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: activeTab === "result" ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
                cursor: "pointer",
                fontSize: "0.84rem",
                transition: "all var(--transition-fast)",
                position: "relative",
                bottom: "-1px",
                whiteSpace: "nowrap",
              }}
            >
              <span>{resultTabMeta.short}</span>
              <span>{resultTabMeta.icon}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseResultTab();
                  setSubmissionResult(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "1px solid var(--border-primary)",
                  fontSize: "0.7rem",
                  lineHeight: 1,
                }}
              >
                x
              </span>
            </button>
          )}
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
              <div className="markdown-body" data-color-mode="dark">
                <MDEditor.Markdown
                  source={problem.description || ""}
                  className="problem-description-markdown"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "submissions" && (
          <ProblemSubmissionsTab
            submissions={submissions}
            selectedSubmission={selectedSubmission}
            setSelectedSubmission={setSelectedSubmission}
            loadingSubmissions={loadingSubmissions}
          />
        )}

        {showResultTab && activeTab === "result" && (
          <SubmissionResultTab
            submissionState={submissionState}
            submissionResult={submissionResult}
            submitting={submitting}
            onViewCode={(snapshot) => {
              if (snapshot?.sourceCode) {
                setCode(snapshot.sourceCode);
                setLanguage("cpp");
                setActiveTab("description");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
