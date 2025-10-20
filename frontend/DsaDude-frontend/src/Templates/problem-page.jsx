import Editor from "@monaco-editor/react";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import languageSnippets from "../snippets/snippet";
import ValidateOutput from "../Helpers/OutputValidator";
import { UserContext } from "../Context/userContext";

export default function ProblemsPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(languageSnippets["cpp"].code);
  const [running, setRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState(0);
  const [sampleOutputs, setSampleOutputs] = useState([]);
  const [_outputMatch, _setOutputMatch] = useState(2);
  const [editorHeight, setEditorHeight] = useState(400); // for resizable dragger...
  const isResizing = useRef(false);
  const [gotCorrectOutput, setGotCorrectOutput] = useState([]);
  const [showFullError, setShowFullError] = useState(false);
  const MAX_OUTPUT_LENGTH = 128; // adjust as needed
  const {user, loading} = useContext(UserContext)
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "difficulty-easy";
      case "MEDIUM":
        return "difficulty-medium";
      case "HARD":
        return "difficulty-hard";
      default:
        return "difficulty-easy";f
    }
  };
  useEffect(() => {
    if (user && user.current_selected_language) {
      setLanguage(user.current_selected_language);
    }
  }, [user]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/question/${slug}`)
      .then((res) => res.json())
      .then((data) => setProblem(data.data))
      .catch((err) => console.error(err));
    }, [slug]);
     
  useEffect(() => {
    setCode(languageSnippets[language].code);
  }, [language]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      setEditorHeight(() => Math.max(100, e.clientY - 100)); // prevent too small
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // reset error expand state when switching tests
  useEffect(() => {
    setShowFullError(false);
  }, [selectedTest]);

  async function runCodeForSamples() {
    if (!problem) return;
    setRunning(true);

    const outputs = [];
    const results = []; // store 1 = pass, 0 = fail

    for (let i = 0; i < problem.examples.length; i++) {
      const input = problem.examples[i].input;

      try {
        const res = await fetch("http://localhost:8083/api/code/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            input,
          }),
        });

        let data;
        if (res.ok) {
          data = await res.json();
        } else {
          data = { output: "", error: `Error: ${res.status}`, exitCode: -1, time :0 };
        }

        outputs.push(data);

        // Compare output ignoring trailing whitespaces / newlines
        const expected = problem.examples[i].output.trim();
        const actual = (data.output || "").trim();
        if (problem.staticSolution) {
          results.push(expected === actual ? 1 : 0);
        } else {
          const verdict = await ValidateOutput(problem.checker, input, actual);
          results.push(verdict ? 1 : 0);
        }

      } catch (err) {
        outputs.push({ output: "", error: "Error running code", exitCode: -1, time: 0});
        results.push(0);
        console.error(err);
      }
    }

    setSampleOutputs(outputs);
    setGotCorrectOutput(results); // update status for green/red dots
    setRunning(false);
  }



  if (!problem) return (
    <div className="page-inner" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh' 
    }}>
      <div className="loading" style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-primary)',
          borderTop: '3px solid var(--text-accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        Loading problem...
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="page-inner" style={{ width: '100%', height: '100%' }}>
        <div className="flex gap-6 h-full">
          <div className="w-2/5 overflow-y-auto modern-scrollbar" style={{ padding: '0 0' }}>
            <div className="card animate-fadeInLeft" style={{ height: 'fit-content' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.3
                }}>
                  {problem.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`output-badge ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  Problem Statement
                </h3>
                <div style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}>
                  {problem.description}
                </div>
              </div>

              {problem.constraints && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}>
                    Constraints
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {problem.constraints.map((c, i) => (
                      <div key={i} style={{
                        background: 'var(--bg-accent)',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                      }}>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {problem.examples && problem.examples.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}>
                    Sample Test Cases
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {problem.examples.map((ex, idx) => (
                      <div key={idx} style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.5rem',
                        borderLeft: '4px solid var(--text-accent)'
                      }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>Input:</strong>
                          <pre style={{
                            background: 'var(--bg-tertiary)',
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            marginTop: '0.5rem',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                            border: '1px solid var(--border-primary)'
                          }}>
                            {ex.input}
                          </pre>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>Output:</strong>
                          <pre style={{
                            background: 'var(--bg-tertiary)',
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            marginTop: '0.5rem',
                            color: 'var(--success)',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                            border: '1px solid var(--success)'
                          }}>
                            {ex.output}
                          </pre>
                        </div>
                        {ex.explanation && (
                          <div>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>Explanation:</strong>
                            <p style={{
                              color: 'var(--text-secondary)',
                              marginTop: '0.5rem',
                              fontSize: '0.875rem',
                              lineHeight: 1.5
                            }}>
                              {ex.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-3/5 flex flex-col h-full animate-fadeInRight" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {/* Enhanced Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-primary)',
              background: 'var(--bg-tertiary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  Language:
                </label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    background: 'var(--bg-accent)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={runCodeForSamples}
                  disabled={running}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: running ? 0.7 : 1,
                    cursor: running ? 'not-allowed' : 'pointer'
                  }}
                >
                  {running ? (
                    <>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid currentColor',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Running...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5,3 19,12 5,21"/>
                      </svg>
                      Run
                    </>
                  )}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => console.log('Submit clicked')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                  Submit
                </button>
              </div>
            </div>

            {/* Code Editor with resizable height */}
            <div className="overflow-hidden" style={{ height: `${editorHeight}px` }}>
              <Editor height="100%" width="100%" language={language} value={code} onChange={(value) => setCode(value)} theme="vs-dark" />
            </div>

            {/* Enhanced Resizer bar */}
            <div 
              style={{
                height: '4px',
                background: 'var(--border-primary)',
                cursor: 'row-resize',
                transition: 'background var(--transition-fast)',
                position: 'relative'
              }}
              onMouseDown={() => (isResizing.current = true)}
              onMouseEnter={(e) => e.target.style.background = 'var(--text-accent)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--border-primary)'}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '2px',
                background: 'var(--text-accent)',
                borderRadius: '1px'
              }} />
            </div>

            {/* Enhanced Test Case Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-primary)',
              background: 'var(--bg-tertiary)'
            }}>
              {problem.examples.map((_, idx) => {
                const status = gotCorrectOutput[idx]; // 1 pass, 0 fail, undefined = not run
                const dotClass = status === 1 ? 'status-pass' : status === 0 ? 'status-fail' : 'status-unknown';
                const isActive = selectedTest === idx;
                return (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedTest(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid transparent',
                      background: isActive ? 'var(--bg-accent)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      borderColor: isActive ? 'var(--text-accent)' : 'var(--border-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.background = 'var(--bg-accent)';
                        e.target.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.background = 'transparent';
                        e.target.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <span>Test {idx + 1}</span>
                    <span className={`status-dot ${dotClass}`} />
                  </button>
                );
              })}
            </div>

            {/* Enhanced Input / Output Section */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              overflowY: 'auto',
              padding: '1.5rem',
              background: 'var(--bg-primary)'
            }}>
              {/* Input Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)'
                  }}>
                    Input
                  </label>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-accent)'
                  }} />
                </div>
                <textarea 
                  value={problem.examples[selectedTest]?.input || ''} 
                  readOnly 
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-primary)',
                    resize: 'none',
                    height: '80px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* Expected Output Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)'
                  }}>
                    Expected Output
                  </label>
                  {(() => {
                    const s = gotCorrectOutput[selectedTest];
                    if (s === 1) return <span className="output-badge output-pass">PASS</span>;
                    if (s === 0) return <span className="output-badge output-fail">FAIL</span>;
                    return <span className="output-badge output-unknown">NOT RUN</span>;
                  })()}
                </div>
                <pre style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--success)',
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--success)',
                  height: 'max-content',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.5
                }}>
                  {problem.examples[selectedTest]?.output || ''}
                </pre>
              </div>

              {/* Your Output Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)'
                  }}>
                    Your Output
                  </label>
                  {(() => {
                    const s = gotCorrectOutput[selectedTest];
                    if (s === 1) return <span className="output-badge output-pass">PASS</span>;
                    if (s === 0) return <span className="output-badge output-fail">FAIL</span>;
                    return <span className="output-badge output-unknown">NOT RUN</span>;
                  })()}
                </div>

                {sampleOutputs[selectedTest] ? (
                  (() => {
                    // Truncate output and error
                    const MAX_OUTPUT_LENGTH = 128;
                    const currentOutput = sampleOutputs[selectedTest].output || '(no output)';
                    const isOutputTruncated = currentOutput.length > MAX_OUTPUT_LENGTH;
                    const displayedOutput = isOutputTruncated
                      ? currentOutput.slice(0, MAX_OUTPUT_LENGTH) + '...'
                      : currentOutput;

                    const currentError = sampleOutputs[selectedTest].error || '';
                    // Do not truncate error by default — show preview with an option to expand
                    const ERROR_PREVIEW_LENGTH = 300;
                    const isErrorLong = currentError.length > ERROR_PREVIEW_LENGTH;
                    const displayedError = (!isErrorLong || showFullError)
                      ? currentError
                      : currentError.slice(0, ERROR_PREVIEW_LENGTH) + '...';

                    return (
                      <div style={{
                        background: 'var(--bg-tertiary)',
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border-primary)',
                        overflow: 'auto'
                      }}>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          marginBottom: '0.75rem',
                          fontWeight: 'var(--font-weight-medium)',
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center'
                        }}>
                          <span>Exit Code: {sampleOutputs[selectedTest].exitCode}</span>
                          {(() => {
                            const so = sampleOutputs[selectedTest];
                            const timeVal = so?.time ?? so?.timeMs ?? so?.duration ?? so?.executionTime;
                            if (typeof timeVal === 'number' || (typeof timeVal === 'string' && timeVal)) {
                              // show as milliseconds; if string includes units, just display it
                              const display = typeof timeVal === 'number' ? `${timeVal} ms` : timeVal;
                              return <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Time: {display}</span>;
                            }
                            return null;
                          })()}
                        </div>

                        <div style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 'var(--font-weight-medium)' }}>
                          Output:
                        </div>
                        <pre style={{
                          background: 'var(--bg-primary)',
                          color: 'var(--success)',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius)',
                          whiteSpace: 'pre-wrap',
                          breakWords: 'break-word',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          border: '1px solid var(--success)',
                          marginBottom: '0.75rem'
                        }}>
                          {displayedOutput}
                        </pre>
                        {isOutputTruncated && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.75rem'
                          }}>
                            Output truncated
                          </div>
                        )}

                        {currentError && (
                          <>
                            <div style={{
                              marginTop: '0.75rem',
                              marginBottom: '0.75rem',
                              color: 'var(--text-primary)',
                              fontSize: '0.875rem',
                              fontWeight: 'var(--font-weight-medium)'
                            }}>
                              Error:
                            </div>
                            <pre style={{
                              background: 'var(--bg-primary)',
                              color: 'var(--error)',
                              padding: '0.75rem',
                              borderRadius: 'var(--radius)',
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              lineHeight: 1.5,
                              border: '1px solid var(--error)'
                            }}>
                              {displayedError}
                            </pre>
                            {isErrorLong && (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                <button onClick={() => setShowFullError(!showFullError)} style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-accent)',
                                  cursor: 'pointer',
                                  padding: 0,
                                  fontSize: '0.85rem'
                                }}>{showFullError ? 'Show less' : 'Show more'}</button>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{showFullError ? 'Showing full error' : 'Preview'}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '2rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-primary)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid var(--border-primary)',
                      borderTop: '2px solid var(--text-accent)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1rem'
                    }} />
                    Run code to see output
                  </div>
                )}
                {/* Explanation for the selected test (right panel) */}
                {problem.examples[selectedTest]?.explanation && (
                  <div style={{
                    marginTop: '1rem',
                    background: 'var(--bg-tertiary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Explanation</strong>
                    <div>{problem.examples[selectedTest].explanation}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
