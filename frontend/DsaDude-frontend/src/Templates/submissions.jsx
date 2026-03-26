import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/userContext';
import { getSubmissions } from '../Helpers/getSubmissions';
import './submissions.css';

const SubmissionsList = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getSubmissions(user.id);
        if (data) {
          setSubmissions(Array.isArray(data) ? data : []);
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        setError('Failed to load submissions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const sortedSubmissions = useMemo(() => {
    setPage(1);
    return [...submissions].sort((a, b) => {
      const aTime = new Date(a?.created || a?.timestamp || 0).getTime();
      const bTime = new Date(b?.created || b?.timestamp || 0).getTime();
      return bTime - aTime;
    });
  }, [submissions]);

  const getStatusMeta = (submission) => {
    if (submission.error || submission.exitCode !== 0) {
      return { label: 'Compilation Error', variant: 'status-error' };
    }

    if (submission.output?.failed > 0) {
      return { label: 'Wrong Answer', variant: 'status-wrong' };
    }

    if (submission.output?.passed === submission.output?.total && submission.output?.total > 0) {
      return { label: 'Accepted', variant: 'status-accepted' };
    }

    return { label: 'Pending', variant: 'status-pending' };
  };

  const formatProblemTitle = (slug) => {
    if (!slug) return 'Unknown Problem';
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatPerformance = (submission) => {
    const time = submission?.timeTaken ? `${submission.timeTaken}ms` : null;
    const memory = submission?.memoryUsed ? `${submission.memoryUsed}KB` : null;

    if (time && memory) return `${time} • ${memory}`;
    if (time) return time;
    if (memory) return memory;
    return 'N/A';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="submissions-page">
        <div className="submissions-state-card">
          <div className="submissions-spinner" />
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submissions-page">
        <div className="submissions-state-card">
          <h2>{error}</h2>
          <button onClick={() => window.location.reload()} className="submissions-action-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="submissions-page">
        <div className="submissions-state-card">
          <h2>Please login to view your submissions</h2>
          <button onClick={() => navigate('/')} className="submissions-action-btn">
            Login
          </button>
        </div>
      </div>
    );
  }

  if (sortedSubmissions.length === 0) {
    return (
      <div className="submissions-page">
        <div className="submissions-state-card">
          <h2>No submissions yet</h2>
          <Link to="/problems" className="submissions-action-btn submissions-link-btn">
            Start Solving Problems
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(sortedSubmissions.length / PAGE_SIZE);
  const pageItems = sortedSubmissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleGoToPage = (e) => {
    e.preventDefault();
    const val = parseInt(e.target.elements.gotopage.value, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      setPage(val);
    }
    e.target.elements.gotopage.value = '';
  };

  return (
    <div className="submissions-page">
      <section className="submissions-shell">
        <div className="submissions-header">
          <h1>Submissions</h1>
          <p>View all your problem submissions and their results</p>
          <span className="submissions-count">{sortedSubmissions.length} total</span>
        </div>

        <div className="submissions-table-wrap">
          <div className="submissions-table-scroll">
            <table className="submissions-table">
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

                  return (
                  <tr
                    key={submission.id}
                    className="submissions-row"
                    onClick={() => navigate(`/submissions/${submission.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        navigate(`/submissions/${submission.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <td>
                      <span className={`submission-status-badge ${status.variant}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="submission-problem-title">
                        {formatProblemTitle(submission.questionSlug)}
                      </div>
                      <div className="submission-problem-meta">
                        {submission.output ? `${submission.output.passed}/${submission.output.total} tests passed` : 'No test results'}
                      </div>
                    </td>
                    <td>
                      <div className="submission-lang">
                        {submission.language || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <div className="submission-performance">
                        {formatPerformance(submission)}
                      </div>
                    </td>
                    <td>
                      <div className="submission-date">
                        {formatDate(submission.created)}
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="submissions-pagination">
            <button
              className="sub-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹ Prev
            </button>

            <div className="sub-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, idx) =>
                  n === '...' ? (
                    <span key={`ellipsis-${idx}`} className="sub-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={n}
                      className={`sub-page-num${page === n ? ' active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  )
                )}
            </div>

            <button
              className="sub-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next ›
            </button>

            <form className="sub-goto-form" onSubmit={handleGoToPage}>
              <span className="sub-goto-label">Go to</span>
              <input
                className="sub-goto-input"
                name="gotopage"
                type="number"
                min={1}
                max={totalPages}
                placeholder={page}
              />
              <button className="sub-page-btn" type="submit">Go</button>
            </form>
          </div>
        )}

      </section>
    </div>
  );
};

export default SubmissionsList;
