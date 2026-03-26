import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/userContext';
import { getSubmissionById } from '../Helpers/getSubmissions';
import { Editor } from '@monaco-editor/react';
import './submissionDetail.css';

const SubmissionDetail = () => {
  const { submissionId } = useParams();
  const { user } = useContext(UserContext);
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
    if (submission.error || submission.exitCode !== 0) return 'sd-badge-error';
    if (submission.output?.failed > 0) return 'sd-badge-wrong';
    if (submission.output?.passed === submission.output?.total && submission.output?.total > 0)
      return 'sd-badge-accepted';
    return 'sd-badge-pending';
  };

  const getStatusText = (submission) => {
    // Check for compilation errors
    if (submission.error || submission.exitCode !== 0) {
      return 'Compilation Error';
    }
    // Check if there are any failed test cases
    if (submission.output?.failed > 0) {
      return 'Wrong Answer';
    }
    // Check if all test cases passed
    if (submission.output?.passed === submission.output?.total && submission.output?.total > 0) {
      return 'Accepted';
    }
    // Default status
    return 'Unknown';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const codeLines = submission.code ? submission.code.split('\n') : [];
  const displayLines = showFullCode ? codeLines : codeLines.slice(0, 50);

  return (
    <div className="sd-page">
      <div className="sd-container">

        {/* Header */}
        <div className="sd-header">
          <div>
            <Link to="/submissions" className="sd-back-link">← Back to Submissions</Link>
            <h1 className="sd-title">
              {submission.questionSlug ? submission.questionSlug.replace(/-/g, ' ') : 'Unknown Problem'}
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
              <div className="sd-stat-value">{submission.language || 'Unknown'}</div>
            </div>
            <div className="sd-stat-box">
              <div className="sd-stat-label">Runtime</div>
              <div className="sd-stat-value">{submission.timeTaken ? `${submission.timeTaken}ms` : 'N/A'}</div>
            </div>
            <div className="sd-stat-box">
              <div className="sd-stat-label">Memory</div>
              <div className="sd-stat-value">{submission.memoryUsed ? `${submission.memoryUsed}KB` : 'N/A'}</div>
            </div>
            <div className="sd-stat-box">
              <div className="sd-stat-label">Submitted</div>
              <div className="sd-stat-value" style={{ textTransform: 'none', fontSize: '0.82rem' }}>
                {formatDate(submission.created)}
              </div>
            </div>
          </div>

          {submission.output && (
            <>
              <h3 className="sd-section-title">Test Results</h3>
              <div className="sd-results-grid">
                <div className="sd-result-box passed">
                  <div className="sd-result-label">PASSED</div>
                  <div className="sd-result-value">{submission.output.passed}</div>
                </div>
                <div className="sd-result-box failed">
                  <div className="sd-result-label">FAILED</div>
                  <div className="sd-result-value">{submission.output.failed}</div>
                </div>
                <div className="sd-result-box total">
                  <div className="sd-result-label">TOTAL</div>
                  <div className="sd-result-value">{submission.output.total}</div>
                </div>
              </div>
              {submission.output.message && (
                <div className="sd-message-box">{submission.output.message}</div>
              )}
            </>
          )}

          {submission.error && (
            <>
              <h3 className="sd-section-title">Error Details</h3>
              <div className="sd-error-box">
                <div>{submission.error}</div>
                <div style={{ marginTop: '0.35rem', fontWeight: 600 }}>Exit Code: {submission.exitCode}</div>
              </div>
            </>
          )}
        </div>

        {/* Solution Code */}
        <div className="sd-code-card">
          <div className="sd-code-header">
            <h2 className="sd-code-title">Solution Code</h2>
          </div>
          <div className="sd-code-body">
            <Editor
              height="400px"
              language={getLanguageMonaco(submission.language)}
              value={submission.code || ''}
              theme="vs-dark"
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
          <Link to={`/problems/${submission.questionSlug}`} className="sd-btn-primary">
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
