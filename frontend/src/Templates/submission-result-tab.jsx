import "./submission-result-tab.css";

function normalize(value) {
  return (value || "").toString().toUpperCase();
}

function runtimeLabel(value) {
  if (value === null || value === undefined || value === "") return "--";
  if (typeof value === "number") return `${value} ms`;
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
      memoryUsed: "",
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
    passed: Number(source.passed || source.passedTestcases || 0),
    total: Number(source.total || source.totalTestcases || 0),
    executionTimeMs: Number(source.executionTimeMs ?? source.executionTime ?? source.time ?? 0),
    memoryUsed: source.memoryUsed ?? source.memory ?? "",
    language: source.language || "",
    error: source.error || source.errorMessage || "",
    message: source.message || "",
    timestamp: source.timestamp || source.submissionTime || "",
    sourceCode: source.sourceCode || source.code || "",
  };
}

function verdictMeta(snapshot) {
  if (snapshot.phase !== "final") {
    return {
      tone: snapshot.phase === "submitting" ? "pending" : "running",
      title: snapshot.phase === "submitting" ? "Pending" : "Running",
      detail: snapshot.phase === "submitting" ? "Sending your code to the judge" : "Running hidden test cases",
    };
  }

  if (snapshot.verdict === "ACCEPTED") return { tone: "accepted", title: "Accepted" };
  if (snapshot.verdict === "WRONG_ANSWER") return { tone: "wrong", title: "Wrong Answer" };
  if (snapshot.verdict === "TIME_LIMIT_EXCEEDED") return { tone: "warning", title: "Time Limit Exceeded" };
  if (snapshot.verdict === "COMPILE_ERROR") return { tone: "error", title: "Compilation Error" };
  if (snapshot.verdict === "RUNTIME_ERROR") return { tone: "error", title: "Runtime Error" };
  return { tone: "error", title: "System Error" };
}

export function getResultTabTitle(submissionState, submissionResult, submitting) {
  const snapshot = getSnapshot(submissionState, submissionResult, submitting);
  if (snapshot.phase !== "final") {
    return {
      short: "Judging...",
      tone: snapshot.phase === "submitting" ? "pending" : "running",
    };
  }

  const meta = verdictMeta(snapshot);
  return {
    short: meta.title,
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

  const metrics = [
    { label: "Status", value: snapshot.phase === "final" ? meta.title : snapshot.status || "Running" },
    { label: "Language", value: snapshot.language || "N/A" },
    { label: "Runtime", value: runtimeLabel(snapshot.executionTimeMs) },
    { label: "Memory", value: snapshot.memoryUsed || "--" },
    { label: "Passed Tests", value: `${snapshot.passed} / ${snapshot.total || "?"}` },
    { label: "Timestamp", value: snapshot.timestamp ? new Date(snapshot.timestamp).toLocaleTimeString() : "Now" },
  ];

  return (
    <div className="result-tab">
      <div className="result-tab__header">
        <div>
          <span className="section-label">Execution Status</span>
          <h3 className="result-tab__title">{meta.title}</h3>
          {meta.detail && <p className="result-tab__subtitle">{meta.detail}</p>}
        </div>
        <span className={`verdict-badge verdict-badge--${meta.tone}`}>{meta.title}</span>
      </div>

      {snapshot.phase !== "final" && (
        <div className="result-tab__progress-track">
          <div className="result-tab__progress-fill" style={{ width: `${Math.max(progressPct, 8)}%` }} />
        </div>
      )}

      <div className="result-tab__metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="result-tab__metric">
            <span className="result-tab__metric-value">{metric.value}</span>
            <span className="result-tab__metric-label">{metric.label}</span>
          </div>
        ))}
      </div>

      {snapshot.message && <div className="result-tab__message">{snapshot.message}</div>}

      {snapshot.error && (
        <details className="result-tab__details" open>
          <summary>Error details</summary>
          <pre>{snapshot.error}</pre>
        </details>
      )}

      {snapshot.phase === "final" && snapshot.sourceCode && (
        <div className="result-tab__code-block">
          <div className="result-tab__code-label">Submitted code</div>
          <pre>{snapshot.sourceCode}</pre>
        </div>
      )}

      {snapshot.phase === "final" && snapshot.sourceCode && onViewCode && (
        <button className="result-tab__action" onClick={() => onViewCode(snapshot)}>
          Put code in editor
        </button>
      )}
    </div>
  );
}
