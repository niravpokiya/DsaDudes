import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, Clock3, Search, SlidersHorizontal, XCircle } from "lucide-react";
import { UserContext } from "../Context/userContext";
import { getSubmissions } from "../Helpers/getSubmissions";
import "./submissions.css";

const PAGE_SIZE = 20;

const SubmissionsList = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("ALL");

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getSubmissions(user.id);
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load submissions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const getStatusMeta = (submission) => {
    if (submission.verdict === "ACCEPTED") return { label: "Accepted", variant: "status-accepted", icon: CheckCircle2 };
    if (submission.verdict === "WRONG_ANSWER") return { label: "Wrong Answer", variant: "status-wrong", icon: XCircle };
    if (submission.verdict === "TIME_LIMIT_EXCEEDED") return { label: "Time Limit", variant: "status-warning", icon: Clock3 };
    if (submission.verdict === "RUNTIME_ERROR" || submission.errorMessage) return { label: "Runtime Error", variant: "status-error", icon: XCircle };
    return { label: "Pending", variant: "status-pending", icon: Clock3 };
  };

  const formatProblemTitle = (slug) => {
    if (!slug) return "Unknown Problem";
    return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatPerformance = (submission) => {
    const time = submission?.executionTime;
    const memory = submission?.memoryUsed;
    const timeStr = time !== null && time !== undefined && time >= 0 ? (time > 1000 ? `${(time / 1000).toFixed(2)}s` : `${time}ms`) : null;
    const memoryStr = memory !== null && memory !== undefined && memory > 0 ? (memory > 1024 ? `${(memory / 1024).toFixed(2)}GB` : memory >= 1 ? `${memory.toFixed(2)}MB` : `${memory}KB`) : null;
    if (timeStr && memoryStr) return `${timeStr} / ${memoryStr}`;
    return timeStr || memoryStr || "N/A";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filteredSubmissions = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return [...submissions]
      .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
      .filter((submission) => {
        const title = formatProblemTitle(submission.problemSlug).toLowerCase();
        const verdict = submission.verdict || "PENDING";
        const queryMatch = !lowerQuery || title.includes(lowerQuery) || String(submission.language || "").toLowerCase().includes(lowerQuery);
        const verdictMatch = verdictFilter === "ALL" || verdict === verdictFilter;
        return queryMatch && verdictMatch;
      });
  }, [submissions, query, verdictFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, verdictFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
  const pageItems = filteredSubmissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const acceptedCount = submissions.filter((submission) => submission.verdict === "ACCEPTED").length;
  const failedCount = submissions.filter((submission) => submission.verdict && submission.verdict !== "ACCEPTED").length;
  const acceptanceRate = submissions.length ? Math.round((acceptedCount / submissions.length) * 100) : 0;

  if (loading || error || !user || submissions.length === 0) {
    const message = loading
      ? "Loading submissions..."
      : error || (!user ? "Please login to view your submissions" : "No submissions yet");

    return (
      <div className="page-inner">
        <div className="submissions-state-card saas-card">
          <h2>{message}</h2>
          {!loading && (
            error ? (
              <button onClick={() => window.location.reload()} className="btn-primary">Try again</button>
            ) : (
              <Link to={user ? "/problems" : "/login"} className="btn-primary">
                {user ? "Start solving problems" : "Sign in"}
              </Link>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-inner">
      <section className="page-header">
        <div>
          <div className="page-eyebrow">Submission history</div>
          <h1>Track every judge run.</h1>
          <p className="page-subtitle">
            Review verdicts, performance, languages, and recent attempts in one
            focused issue-list style workspace.
          </p>
        </div>
      </section>

      <section className="soft-grid submissions-stats">
        <article className="saas-card stat-card saas-card--green">
          <span className="stat-card__icon"><CheckCircle2 size={20} /></span>
          <div><div className="stat-card__label">Accepted</div><div className="stat-card__value">{acceptedCount}</div><div className="stat-card__meta">successful submissions</div></div>
        </article>
        <article className="saas-card stat-card saas-card--rose">
          <span className="stat-card__icon"><XCircle size={20} /></span>
          <div><div className="stat-card__label">Needs review</div><div className="stat-card__value">{failedCount}</div><div className="stat-card__meta">failed or errored runs</div></div>
        </article>
        <article className="saas-card stat-card saas-card--blue">
          <span className="stat-card__icon"><Activity size={20} /></span>
          <div><div className="stat-card__label">Acceptance</div><div className="stat-card__value">{acceptanceRate}%</div><div className="stat-card__meta">all-time rate</div></div>
        </article>
        <article className="saas-card stat-card saas-card--indigo">
          <span className="stat-card__icon"><Clock3 size={20} /></span>
          <div><div className="stat-card__label">Total</div><div className="stat-card__value">{submissions.length}</div><div className="stat-card__meta">recorded attempts</div></div>
        </article>
      </section>

      <section className="problems-toolbar">
        <label style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 13, color: "var(--text-muted)" }} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by problem or language" style={{ paddingLeft: 42 }} />
        </label>
        <label style={{ position: "relative" }}>
          <SlidersHorizontal size={18} style={{ position: "absolute", left: 14, top: 13, color: "var(--text-muted)" }} />
          <select value={verdictFilter} onChange={(event) => setVerdictFilter(event.target.value)} style={{ paddingLeft: 42 }}>
            <option value="ALL">All verdicts</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="WRONG_ANSWER">Wrong Answer</option>
            <option value="TIME_LIMIT_EXCEEDED">Time Limit</option>
            <option value="RUNTIME_ERROR">Runtime Error</option>
          </select>
        </label>
      </section>

      <section className="problems-card">
        <div className="submissions-table-scroll">
          <table className="problems-table submissions-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Problem</th>
                <th>Language</th>
                <th>Performance</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((submission) => {
                const status = getStatusMeta(submission);
                const Icon = status.icon;
                return (
                  <tr key={submission.id || submission._id} className="submissions-row" onClick={() => navigate(`/submissions/${submission.id || submission._id}`)} tabIndex={0} role="button">
                    <td>
                      <span className={`submission-status-badge ${status.variant}`}>
                        <Icon size={14} />
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="submission-problem-title">{formatProblemTitle(submission.problemSlug)}</div>
                      <div className="submission-problem-meta">
                        {submission.totalTestcases ? `${submission.passedTestcases}/${submission.totalTestcases} tests passed` : "No test results"}
                      </div>
                    </td>
                    <td><span className="tag">{submission.language ? submission.language.toUpperCase() : "Unknown"}</span></td>
                    <td><div className="submission-performance">{formatPerformance(submission)}</div></td>
                    <td><div className="submission-date">{formatDate(submission.createdAt)}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Prev</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter((number) => number === 1 || number === totalPages || Math.abs(number - page) <= 2)
            .map((number) => (
              <button key={number} className={page === number ? "active" : ""} onClick={() => setPage(number)}>{number}</button>
            ))}
          <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
