import "./problem-submissions-tab.css";

const VERDICT_MAP = {
  ACCEPTED: { label: "Accepted", tone: "accepted", icon: "✓" },
  WRONG_ANSWER: { label: "Wrong Answer", tone: "wrong", icon: "✗" },
  RUNTIME_ERROR: { label: "Runtime Error", tone: "runtime", icon: "⚠" },
  COMPILE_ERROR: { label: "Compile Error", tone: "compile", icon: "⚠" },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit Exceeded", tone: "tle", icon: "⏳" },
  SYSTEM_ERROR: { label: "System Error", tone: "system", icon: "!" },
  PENDING: { label: "Pending", tone: "pending", icon: "…" },
  RUNNING: { label: "Running", tone: "running", icon: "⟳" },
};

function formatRelativeTime(value) {
  if (!value) {
    return "";
  }

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return "";
  }

  const diffMs = Date.now() - time;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) {
    return `${sec}s ago`;
  }

  const min = Math.floor(sec / 60);
  if (min < 60) {
    return `${min}m ago`;
  }

  const hour = Math.floor(min / 60);
  if (hour < 24) {
    return `${hour}h ago`;
  }

  const day = Math.floor(hour / 24);
  return `${day}d ago`;
}

function formatRuntime(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return typeof value === "number" ? `${value} ms` : value.toString();
}

function formatMemory(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return typeof value === "number" ? `${value} KB` : value.toString();
}

function truthyField(value) {
  return !(value === null || value === undefined || value === "");
}

function VerdictBadge({ verdict, status }) {
  const key = (verdict || status || "").toString().toUpperCase();
  const meta = VERDICT_MAP[key] || { label: key || "Unknown", tone: "system", icon: "!" };

  return (
    <span className={`psub-verdict psub-verdict--${meta.tone}`}>
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}

function SubmissionsList({ submissions, loadingSubmissions, onSelectSubmission }) {
  if (loadingSubmissions) {
    return (
      <div className="psub-loading">
        <span className="psub-spinner" />
        <span>Loading submissions...</span>
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div className="psub-empty">
        <h4>No submissions yet</h4>
        <p>Submit a solution to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="psub-list" role="list">
      {submissions.map((submission) => {
        const runtime = formatRuntime(submission.executionTime);
        const relativeTime = formatRelativeTime(submission.submissionTime);

        return (
          <button
            key={submission.id}
            className="psub-row"
            onClick={() => onSelectSubmission(submission)}
          >
            <div className="psub-row__verdict">
              <VerdictBadge verdict={submission.verdict} status={submission.status} />
            </div>
            <div className="psub-row__meta">
              {runtime && <span>{runtime}</span>}
              {relativeTime && <span>{relativeTime}</span>}
              <span className="psub-row__arrow">›</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SubmissionDetails({ submission, onBack }) {
  const runtime = formatRuntime(submission.executionTime);
  const memory = formatMemory(submission.memoryUsed);
  const submittedAt = submission.submissionTime ? new Date(submission.submissionTime).toLocaleString() : "";
  const codeLength = truthyField(submission.codeLength) ? `${submission.codeLength}` : "";
  const passedTotal = truthyField(submission.passedTestcases) || truthyField(submission.totalTestcases)
    ? `${submission.passedTestcases || 0} / ${submission.totalTestcases || 0}`
    : "";

  const stats = [
    { label: "Runtime", value: runtime },
    { label: "Memory", value: memory },
    { label: "Passed / Total", value: passedTotal },
    { label: "Language", value: submission.language },
    { label: "Code Length", value: codeLength },
  ].filter((item) => truthyField(item.value));

  return (
    <div className="psub-details">
      <button className="psub-back" onClick={onBack}>← Back to submissions</button>

      <div className="psub-details__header">
        <VerdictBadge verdict={submission.verdict} status={submission.status} />
      </div>

      {!!stats.length && (
        <div className="psub-stats">
          {stats.map((item) => (
            <div key={item.label} className="psub-stat-card">
              <span className="psub-stat-card__label">{item.label}</span>
              <span className="psub-stat-card__value">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="psub-meta">
        {submittedAt && <span>Submitted: {submittedAt}</span>}
        {truthyField(submission.id) && <span>ID: {submission.id}</span>}
      </div>

      {truthyField(submission.errorMessage) && (
        <div className="psub-error">
          <h5>Error details</h5>
          <pre>{submission.errorMessage}</pre>
        </div>
      )}

      {truthyField(submission.sourceCode) && (
        <div className="psub-code">
          <h5>Submitted code</h5>
          <pre>{submission.sourceCode}</pre>
        </div>
      )}
    </div>
  );
}

export default function ProblemSubmissionsTab({
  submissions,
  selectedSubmission,
  setSelectedSubmission,
  loadingSubmissions,
}) {
  if (selectedSubmission) {
    return (
      <SubmissionDetails
        submission={selectedSubmission}
        onBack={() => setSelectedSubmission(null)}
      />
    );
  }

  return (
    <SubmissionsList
      submissions={submissions}
      loadingSubmissions={loadingSubmissions}
      onSelectSubmission={setSelectedSubmission}
    />
  );
}
