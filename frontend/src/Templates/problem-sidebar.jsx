import MDEditor from "@uiw/react-md-editor";
import rehypeHighlight from "rehype-highlight";
import { useTheme } from "../Context/themeContext";
import ProblemSubmissionsTab from "./problem-submissions-tab";
import SubmissionResultTab, { getResultTabTitle } from "./submission-result-tab";

import "github-markdown-css/github-markdown-light.css";
import "highlight.js/styles/github.css";

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
  const { currentMode } = useTheme();
  const resultTabMeta = getResultTabTitle(submissionState, submissionResult, submitting);
  const panelBasis = typeof sidebarWidth === "number" ? `${sidebarWidth}px` : sidebarWidth;
  const topics = problem.topic ?? problem.tags ?? [];

  return (
    <div className="problem-reader modern-scrollbar" style={{ flexBasis: panelBasis }}>
      <div className="saas-card problem-reader__card animate-fadeInLeft">
        <div>
          <div className="page-eyebrow">Problem</div>
          <h2>
            {problem.title}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <span className={`output-badge ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="pill" style={{ background: "var(--surface-soft)", color: "var(--text-secondary)" }}>
              {problem.examples?.length || 0} samples
            </span>
          </div>
        </div>

        <div className="problem-meta-strip">
          {topics.length ? topics.slice(0, 6).map((tag) => (
            <span className="tag" key={tag}>{String(tag).replace(/_/g, " ")}</span>
          )) : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>No tags added</span>}
        </div>

        <div className="tab-list">
          <button
            onClick={() => setActiveTab("description")}
            className={`tab-button ${activeTab === "description" ? "tab-button--active" : ""}`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`tab-button ${activeTab === "submissions" ? "tab-button--active" : ""}`}
          >
            Submissions
          </button>
          {showResultTab && (
            <button
              onClick={() => setActiveTab("result")}
              className={`tab-button ${activeTab === "result" ? "tab-button--active" : ""}`}
            >
              <span>{resultTabMeta.short}</span>
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
                  background: "linear-gradient(90deg, var(--warning-bg), transparent)",
                  border: "1px solid var(--warning)",
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

            <div className="problem-description-section">
              <div className="section-label">Description</div>
              <div className="markdown-body" data-color-mode={currentMode}>
                <MDEditor.Markdown
                  source={problem.description || ""}
                  rehypePlugins={[rehypeHighlight]}
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
                const language = snapshot.language?.toLowerCase?.() || "cpp";
                setCode(snapshot.sourceCode);
                setLanguage(language);
                setActiveTab("description");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
