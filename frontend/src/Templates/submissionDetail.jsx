import { Editor } from '@monaco-editor/react';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../Context/userContext';
import { useTheme } from '../Context/themeContext';
import { getSubmissionById } from '../Helpers/getSubmissions';
import './submissionDetail.css';

const SubmissionDetail = () => {
  const { submissionId } = useParams();
  const { user } = useContext(UserContext);
  const { currentMode } = useTheme();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullCode, setShowFullCode] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!user?.id || !submissionId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getSubmissionById(user.id, submissionId);
        if (data) {
          setSubmission(data);
        } else {
          setError('Submission not found');
        }
      } catch (err) {
        setError('Failed to load submission');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [user, submissionId]);

  const getStatusBadgeClass = (submission) => {
    if (submission.verdict === 'ACCEPTED') return 'sd-badge-accepted';
    if (submission.verdict === 'WRONG_ANSWER') return 'sd-badge-wrong';
    if (submission.verdict === 'TIME_LIMIT_EXCEEDED') return 'sd-badge-error';
    if (submission.verdict === 'RUNTIME_ERROR') return 'sd-badge-error';
    if (submission.errorMessage) return 'sd-badge-error';
    return 'sd-badge-pending';
  };

  const getStatusText = (submission) => {
    if (submission.verdict === 'ACCEPTED') return 'Accepted';
    if (submission.verdict === 'WRONG_ANSWER') return 'Wrong Answer';
    if (submission.verdict === 'TIME_LIMIT_EXCEEDED') return 'Time Limit Exceeded';
    if (submission.verdict === 'RUNTIME_ERROR') return 'Runtime Error';
    if (submission.errorMessage) return 'Compilation Error';
    return submission.verdict || 'Unknown';
  };

  const getShortFailureText = (submission) => {
    if (submission.verdict === 'WRONG_ANSWER') return 'Wrong Answer';
    if (submission.verdict === 'TIME_LIMIT_EXCEEDED') return 'Time Limit Exceeded';
    if (submission.verdict === 'RUNTIME_ERROR') return 'Runtime Error';
    if (submission.errorMessage) return 'Compilation Error';
    return 'Submission failed';
  };

  const getTestcaseCounts = (submission) => {
    const total = Number(submission.totalTestcases ?? 0);
    const passed = Number(submission.passedTestcases ?? 0);
    const failed = total > 0 ? Math.max(total - passed, 0) : Number(submission.failedTestcases ?? 0);

    return { passed, failed, total };
  };

  const getVerdictColor = (verdict) => {
    const colors = {
      'ACCEPTED': 'var(--success)',
      'WRONG_ANSWER': 'var(--error)',
      'TIME_LIMIT_EXCEEDED': 'var(--warning)',
      'RUNTIME_ERROR': 'var(--error)',
    };
    return colors[verdict] || 'var(--text-muted)';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMemory = (memory) => {
    if (!memory || memory === 0) return 'N/A';
    if (memory > 1024) return `${(memory / 1024).toFixed(2)} GB`;
    if (memory > 1) return `${memory.toFixed(2)} MB`;
    return `${memory} KB`;
  };

  const formatExecutionTime = (time) => {
    if (!time && time !== 0) return 'N/A';
    if (time > 1000) return `${(time / 1000).toFixed(2)}s`;
    return `${time}ms`;
  };

  const getLanguageMonaco = (language) => {
    switch (language?.toLowerCase()) {
      case 'python':
      case 'python3':
        return 'python';
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'java':
        return 'java';
      case 'c++':
      case 'cpp':
        return 'cpp';
      case 'c':
        return 'c';
      case 'c#':
      case 'csharp':
        return 'csharp';
      case 'go':
        return 'go';
      case 'rust':
        return 'rust';
      case 'typescript':
      case 'ts':
        return 'typescript';
      default:
        return 'plaintext';
    }
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <div className="sd-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-state-center">
        <p className="sd-state-text" style={{ color: 'var(--error)' }}>{error}</p>
        <button onClick={() => navigate('/submissions')} className="sd-btn-primary">
          Back to Submissions
        </button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="sd-state-center">
        <p className="sd-state-text">Submission not found</p>
        <button onClick={() => navigate('/submissions')} className="sd-btn-primary">
          Back to Submissions
        </button>
      </div>
    );
  }

  const codeLines = submission.sourceCode ? submission.sourceCode.split('\n') : [];
  const displayLines = showFullCode ? codeLines : codeLines.slice(0, 50);
  const testcaseCounts = getTestcaseCounts(submission);

  return (
    <div className="sd-page">
      <div className="sd-container">

        {/* Header */}
        <div className="sd-header">
          <div>
            <Link to="/submissions" className="sd-back-link">← Back to Submissions</Link>
            <h1 className="sd-title">
              {submission.problemSlug ? submission.problemSlug.replace(/-/g, ' ') : 'Unknown Problem'}
            </h1>
          </div>
          <span className={`sd-status-badge ${getStatusBadgeClass(submission)}`}>
            {getStatusText(submission)}
          </span>
        </div>

        {/* Submission Details */}
        <div className="sd-card">
          <h2 className="sd-card-title">Submission Details</h2>
          <div className="sd-stats-grid">
            <div className="sd-stat-box">
              <div className="sd-stat-label">Language</div>
              <div className="sd-stat-value">{submission.language ? submission.language.toUpperCase() : 'Unknown'}</div>
            </div>
            <div className="sd-stat-box">
              <div className="sd-stat-label">Runtime</div>
              <div className="sd-stat-value">{formatExecutionTime(submission.executionTime)}</div>
            </div>
            <div className="sd-stat-box">
              <div className="sd-stat-label">Memory Used</div>
              <div className="sd-stat-value">{formatMemory(submission.memoryUsed)}</div>
            </div>
            <div className="sd-stat-box">
              <div className="sd-stat-label">Code Length</div>
              <div className="sd-stat-value">{submission.codeLength ? `${submission.codeLength} chars` : `${submission.sourceCode?.length || 0} chars`}</div>
            </div>
          </div>

          {submission.totalTestcases !== undefined && (
            <>
              <h3 className="sd-section-title">Test Results</h3>
              <div className="sd-results-grid">
                <div className="sd-result-box passed">
                  <div className="sd-result-label">✓ PASSED</div>
                  <div className="sd-result-value">{testcaseCounts.passed}</div>
                </div>
                <div className="sd-result-box failed">
                  <div className="sd-result-label">✗ FAILED</div>
                  <div className="sd-result-value">{testcaseCounts.failed}</div>
                </div>
                <div className="sd-result-box total">
                  <div className="sd-result-label">TOTAL</div>
                  <div className="sd-result-value">{testcaseCounts.total}</div>
                </div>
              </div>
              {testcaseCounts.passed > 0 && testcaseCounts.total > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Success Rate</div>
                  <div style={{ height: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(testcaseCounts.passed / testcaseCounts.total) * 100}%`,
                      height: '100%',
                      backgroundColor: getVerdictColor(submission.verdict),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {((testcaseCounts.passed / testcaseCounts.total) * 100).toFixed(1)}% passed
                  </div>
                </div>
              )}
            </>
          )}

          {(submission.verdict === 'WRONG_ANSWER' || submission.errorMessage) && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
              <strong>Result:</strong> <span>{getShortFailureText(submission)}</span>
            </div>
          )}

          {submission.status && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
              <strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{submission.status.toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Solution Code */}
        <div className="sd-code-card">
          <div className="sd-code-header">
            <div>
              <h2 className="sd-code-title">Solution Code</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {codeLines.length} {codeLines.length === 1 ? 'line' : 'lines'} • {submission.language?.toUpperCase() || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="sd-code-body">
            <Editor
              height="400px"
              language={getLanguageMonaco(submission.language)}
              value={submission.sourceCode || ''}
              theme={currentMode === 'dark' ? 'vs-dark' : 'light'}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                renderLineHighlight: 'none',
                scrollbar: { vertical: 'visible', horizontal: 'visible' },
                wordWrap: 'on',
              }}
            />
          </div>
          {codeLines.length > 50 && (
            <div className="sd-code-footer">
              <button className="sd-toggle-btn" onClick={() => setShowFullCode(!showFullCode)}>
                {showFullCode ? 'View less' : `View all ${codeLines.length} lines`}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sd-actions">
          <Link to={`/problems/${submission.problemSlug}`} className="sd-btn-primary">
            Solve Again
          </Link>
          <Link to="/submissions" className="sd-btn-secondary">
            Back to Submissions
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SubmissionDetail;
