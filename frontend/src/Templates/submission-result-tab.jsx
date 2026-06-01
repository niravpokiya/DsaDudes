import "./submission-result-tab.css";

function normalize(value) {
  return (value || "").toString().toUpperCase();
}

function runtimeLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  if (typeof value === "number") {
    return `${value} ms`;
  }

  return value.toString();
}

function getSnapshot(submissionState, submissionResult, submitting) {
  const source = submissionState || submissionResult || null;

  if (!source) {
    return {
      phase: submitting ? "submitting" : "submitting",
      status: "PENDING",
      verdict: "PENDING",
      passed: 0,
      total: 0,
      executionTimeMs: 0,
      language: "",
      error: "",
      message: "",
      timestamp: "",
      sourceCode: "",
    };
  }

  const status = normalize(source.status);
  const verdict = normalize(source.verdict || source.status);
  const phase = source.phase || (status === "RUNNING" || status === "PENDING" || status === "QUEUED" ? "running" : "final");

  return {
    phase,
    status,
    verdict,
    passed: Number(source.passed || 0),
    total: Number(source.total || 0),
    executionTimeMs: Number(source.executionTimeMs ?? source.executionTime ?? source.time ?? 0),
    language: source.language || "",
    error: source.error || "",
    message: source.message || "",
    timestamp: source.timestamp || "",
    sourceCode: source.sourceCode || source.code || "",
  };
}

function verdictMeta(snapshot) {
  if (snapshot.phase !== "final") {
    return {
      tone: snapshot.phase === "submitting" ? "pending" : (snapshot.status === "PENDING" || snapshot.status === "QUEUED" ? "pending" : "running"),
      title: snapshot.phase === "submitting" ? "Submitting Solution..." : "Running hidden test cases...",
      icon: "⟳",
    };
  }

  const verdict = snapshot.verdict;

  if (verdict === "ACCEPTED") {
     return { tone: "accepted", title: "Accepted", icon: "✓" };
  }

  if (verdict === "WRONG_ANSWER") {
     return { tone: "error", title: "Wrong Answer", icon: "✗" };
  }

  if (verdict === "TIME_LIMIT_EXCEEDED") {
     return { tone: "warning", title: "Time Limit Exceeded", icon: "⏳" };
  }

  if (verdict === "COMPILE_ERROR") {
     return { tone: "error", title: "Compile Error", icon: "⚠" };
  }

  if (verdict === "RUNTIME_ERROR") {
     return { tone: "error", title: "Runtime Error", icon: "⚠" };
  }

  return { tone: "error", title: "System Error", icon: "!" };
}

export function getResultTabTitle(submissionState, submissionResult, submitting) {
  const snapshot = getSnapshot(submissionState, submissionResult, submitting);

  if (snapshot.phase !== "final") {
    return {
      short: "Judging...",
        icon: "⟳",
      tone: snapshot.phase === "submitting" ? "pending" : "running",
    };
  }

  const meta = verdictMeta(snapshot);
  return {
    short: meta.title,
    icon: meta.icon,
    tone: meta.tone,
  };
}

export default function SubmissionResultTab({
  submissionState,
  submissionResult,
  submitting,
  onViewCode,
}) {
  const snapshot = getSnapshot(submissionState, submissionResult, submitting);
  const meta = verdictMeta(snapshot);
  const progressTotal = snapshot.total > 0 ? snapshot.total : 1;
  const progressValue = snapshot.phase === "submitting" ? 0 : Math.max(snapshot.passed, snapshot.phase === "running" ? 1 : 0);
  const progressPct = Math.min(100, Math.round((progressValue / progressTotal) * 100));

  return (
    <div className={`result-tab result-tab--${meta.tone}`}>
      <div className="result-tab__header">
        <div className="result-tab__title-wrap">
          <span className="result-tab__icon">{meta.icon}</span>
          <h3 className="result-tab__title">{meta.title}</h3>
        </div>
        <span className="result-tab__status">{snapshot.phase === "final" ? snapshot.verdict : (snapshot.status || "RUNNING")}</span>
      </div>

      {snapshot.phase !== "final" && (
        <p className="result-tab__subtitle">{snapshot.phase === "submitting" ? "Sending your code to the judge..." : "Running hidden test cases..."}</p>
      )}

      <div className="result-tab__progress-head">
        <span>{snapshot.phase === "final" ? "Completed" : "Progress"}</span>
        <span>{snapshot.passed} / {snapshot.total || "?"}</span>
      </div>
      <div className="result-tab__progress-track">
        <div className="result-tab__progress-fill" style={{ width: `${Math.max(progressPct, snapshot.phase === "submitting" ? 8 : 0)}%` }} />
      </div>

      <div className="result-tab__metrics">
        <div className="result-tab__metric">
          <span className="result-tab__metric-label">Runtime</span>
          <span className="result-tab__metric-value">{runtimeLabel(snapshot.executionTimeMs)}</span>
        </div>
        <div className="result-tab__metric">
          <span className="result-tab__metric-label">Passed / Total</span>
          <span className="result-tab__metric-value">{snapshot.passed} / {snapshot.total}</span>
        </div>
        <div className="result-tab__metric">
          <span className="result-tab__metric-label">Language</span>
          <span className="result-tab__metric-value">{snapshot.language || "N/A"}</span>
        </div>
        <div className="result-tab__metric">
          <span className="result-tab__metric-label">Timestamp</span>
          <span className="result-tab__metric-value">{snapshot.timestamp ? new Date(snapshot.timestamp).toLocaleTimeString() : "Now"}</span>
        </div>
      </div>

      {snapshot.message && (
        <div className="result-tab__message">{snapshot.message}</div>
      )}

      {snapshot.phase === "final" && snapshot.sourceCode && (
        <div className="result-tab__code-block">
          <div className="result-tab__code-label">Submitted code</div>
          <pre>{snapshot.sourceCode}</pre>
        </div>
      )}

      {snapshot.error && (
        <details className="result-tab__details" open>
          <summary>Error details</summary>
          <pre>{snapshot.error}</pre>
        </details>
      )}

      {snapshot.phase === "final" && snapshot.sourceCode && onViewCode && (
        <button className="result-tab__action" onClick={() => onViewCode(snapshot)}>
          Put code in editor
        </button>
      )}
    </div>
  );
}
