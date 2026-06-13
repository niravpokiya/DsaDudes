import MDEditor from "@uiw/react-md-editor";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import rehypeHighlight from "rehype-highlight";

import "github-markdown-css/github-markdown-light.css";
import "highlight.js/styles/github.css";
import { useTheme } from "../../Context/themeContext";
import { UserContext } from "../../Context/userContext";
import { download_testcases_zip, get_problem_by_id, get_testcase_status, update_problem, upload_testcases } from "../../utils/problem-apis";
import "./problem-editor.css";

const TOPIC_OPTIONS = [
  "ARRAY",
  "STRING",
  "HASHMAP",
  "LINKED_LIST",
  "TREE",
  "GRAPH",
  "DP",
  "GREEDY",
  "BACKTRACKING",
  "BIT_MANIPULATION",
  "STACK",
  "QUEUE",
  "HEAP",
  "RECURSION",
  "SLIDING_WINDOW",
  "DFS",
  "BFS",
  "BINARY_SEARCH",
];

const normalizeDifficulty = (value) => {
  if (!value) {
    return "Easy";
  }

  const normalized = String(value).toUpperCase();

  if (normalized === "EASY") {
    return "Easy";
  }

  if (normalized === "MEDIUM") {
    return "Medium";
  }

  if (normalized === "HARD") {
    return "Hard";
  }

  return value;
};

const normalizeTopics = (value) => {
  if (!value) {
    return [];
  }

  const topics = Array.isArray(value) ? value : [value];

  return topics
    .map((topic) => String(topic ?? "").trim().toUpperCase())
    .filter(Boolean);
};

const generateSlug = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const AddProblem = () => {
  const { id } = useParams();
  const { user, showToast } = useContext(UserContext);
  const { currentMode } = useTheme();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [topics, setTopics] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [topicSearch, setTopicSearch] = useState("");
  const [storedSlug, setStoredSlug] = useState("");
  const [testcaseZipFile, setTestcaseZipFile] = useState(null);
  const [testcaseStatus, setTestcaseStatus] = useState(null);
  const [loadingTestcaseStatus, setLoadingTestcaseStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingTestcases, setDownloadingTestcases] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [problemStatement, setProblemStatement] = useState(`

Given an integer array \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

## Example 1

**Input:**

\`\`\`
nums = [2,7,11,15]
target = 9
\`\`\`

**Output:**

\`\`\`
[0,1]
\`\`\`

## input format
- The first line contains an integer \`n\`, the number of elements in the array.
- The second line contains \`n\` space-separated integers representing the elements of \`nums\`.
- The third line contains an integer \`target\`.

## output format
- Output a list of two integers representing the indices of the numbers that add up to \`target\`.

## Constraints

- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
`);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await get_problem_by_id(id);
        const data = response?.data?.data;

        if (!data) {
          throw new Error("Problem not found.");
        }

        setProblemData(data);
        setTitle(data.title || "");
        setDifficulty(normalizeDifficulty(data.difficulty));
        setTopics(normalizeTopics(data.topic ?? data.tags));
        setStoredSlug(generateSlug(data.title || ""));
        setProblemStatement(data.description || "");
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || fetchError?.message || "Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const toggleTopic = (topicToToggle) => {
    const normalizedTopic = String(topicToToggle || "").trim().toUpperCase();

    if (!normalizedTopic) {
      return;
    }

    setTopics((previousTopics) =>
      previousTopics.includes(normalizedTopic)
        ? previousTopics.filter((topic) => topic !== normalizedTopic)
        : [...previousTopics, normalizedTopic],
    );
  };

  const clearTopics = () => {
    setTopics([]);
  };

  const filteredTopicOptions = TOPIC_OPTIONS.filter((topic) =>
    topic.replace(/_/g, " ").toLowerCase().includes(topicSearch.trim().toLowerCase()),
  );

  const currentSlug = generateSlug(title || problemData?.title || "");
  const testcaseSlug = storedSlug || currentSlug;

  useEffect(() => {
    const fetchTestcaseStatus = async () => {
      if (activeTab !== "testcases" || !id || !testcaseSlug) {
        return;
      }

      setLoadingTestcaseStatus(true);
      setUploadError("");

      try {
        const response = await get_testcase_status(id, testcaseSlug);
        setTestcaseStatus(response?.data?.data || null);
      } catch (statusError) {
        const message = statusError?.response?.data?.message || statusError?.message || "Failed to check testcase status.";
        setTestcaseStatus({ uploaded: false, downloadAvailable: false, fileCount: 0, downloadFileName: null });
        setUploadError(message);
      } finally {
        setLoadingTestcaseStatus(false);
      }
    };

    fetchTestcaseStatus();
  }, [activeTab, id, testcaseSlug]);

  const refreshTestcaseStatus = async () => {
    if (!id || !testcaseSlug) {
      return;
    }

    try {
      const response = await get_testcase_status(id, testcaseSlug);
      setTestcaseStatus(response?.data?.data || null);
    } catch (statusError) {
      const message = statusError?.response?.data?.message || statusError?.message || "Failed to check testcase status.";
      setUploadError(message);
    }
  };

  const handleUploadFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setUploadMessage("");
    setUploadError("");

    if (!file) {
      setTestcaseZipFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setTestcaseZipFile(null);
      setUploadError("Please select a .zip file.");
      return;
    }

    setTestcaseZipFile(file);
  };

  const handleTestcaseUpload = async () => {
    if (!id) {
      setUploadError("Missing problem id.");
      return;
    }

    if (!user?.id) {
      setUploadError("You must be signed in to upload testcases.");
      return;
    }

    if (!testcaseSlug) {
      setUploadError("Problem title is required before uploading testcases.");
      return;
    }

    if (!testcaseZipFile) {
      setUploadError("Choose a .zip file before uploading.");
      return;
    }

    setUploading(true);
    setUploadMessage("");
    setUploadError("");

    try {
      const response = await upload_testcases(id, testcaseSlug, testcaseZipFile, user.id);
      const message = response?.data?.message || "Testcases uploaded successfully.";

      setUploadMessage(message);
      setTestcaseZipFile(null);
      setStoredSlug(testcaseSlug);
      await refreshTestcaseStatus();
      if (showToast) {
        showToast(message);
      }
    } catch (uploadError) {
      const message = uploadError?.response?.data?.message || uploadError?.message || "Failed to upload testcase zip.";
      setUploadError(message);
      if (showToast) {
        showToast(message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTestcases = async () => {
    if (!id || !testcaseSlug) {
      setUploadError("No testcase archive is available yet.");
      return;
    }

    setDownloadingTestcases(true);
    setUploadError("");

    try {
      const response = await download_testcases_zip(id, testcaseSlug);
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = testcaseStatus?.downloadFileName || `${testcaseSlug}-testcases.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      const message = downloadError?.response?.data?.message || downloadError?.message || "Failed to download testcase zip.";
      setUploadError(message);
      if (showToast) {
        showToast(message);
      }
    } finally {
      setDownloadingTestcases(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) {
      setError("Missing problem id.");
      return;
    }
    console.log("createdBy", problemData?.createdBy);
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...(problemData || {}),
        title: title.trim(),
        description: problemStatement,
        difficulty: String(difficulty || "Easy").toUpperCase(),
        topic: topics,
        createdBy: problemData?.createdBy || 0,
      };

      await update_problem(id, payload);
      setStoredSlug(currentSlug);
      setProblemData((previous) => ({ ...(previous || {}), ...payload }));
      if (showToast) {
        showToast("Problem saved");
      }
    } catch (saveError) {
      const message = saveError?.response?.data?.message || saveError?.message || "Failed to save problem.";
      setError(message);
      if (showToast) {
        showToast(message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="problem-editor-page">
      <div className="problem-editor-shell">
        <div className="problem-editor-hero">
          <div>
            <p className="problem-editor-kicker">Problem authoring</p>
            <h1>{id ? "Edit Problem" : "Add Problem"}</h1>
            <p className="problem-editor-subtitle">
              {id ? "Update the saved problem and keep the preview in sync." : "Create a new coding problem with live markdown preview."}
            </p>
          </div>
          <div className="problem-editor-hero-badge">Markdown + preview</div>
        </div>

        <div className="problem-editor-tabs" role="tablist" aria-label="Problem editor sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "details"}
            className={`problem-editor-tab ${activeTab === "details" ? "problem-editor-tab--active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Problem details
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "topics"}
            className={`problem-editor-tab ${activeTab === "topics" ? "problem-editor-tab--active" : ""}`}
            onClick={() => setActiveTab("topics")}
          >
            Topics
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "testcases"}
            className={`problem-editor-tab ${activeTab === "testcases" ? "problem-editor-tab--active" : ""}`}
            onClick={() => setActiveTab("testcases")}
          >
            Testcase upload
          </button>
        </div>

        {activeTab === "details" ? (
          <>
            {error ? (
              <div style={{ marginBottom: "1rem", padding: "0.9rem 1rem", borderRadius: "12px", border: "1px solid var(--error)", background: "var(--error-bg)", color: "var(--error)" }}>
                {error}
              </div>
            ) : null}

            <div className="problem-editor-form-row">
              <div className="problem-editor-form-group">
                <div className="problem-editor-field problem-editor-field--title">
                  <label>
                    Problem title
                  </label>

                  <input
                    type="text"
                    placeholder="Enter title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="problem-editor-input"
                  />
                </div>

                <div className="problem-editor-field problem-editor-field--difficulty">
                  <label>
                    Difficulty
                  </label>

                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="problem-editor-input"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="problem-editor-field problem-editor-field--action">
                <label aria-hidden="true">&nbsp;</label>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || saving}
                  className="problem-editor-save-button problem-editor-save-button--top"
                >
                  {saving ? "Saving..." : "Save Problem"}
                </button>
              </div>
            </div>

            <div className="problem-editor-grid">
              <div className="problem-editor-card">
                <div className="problem-editor-card__header">
                  <div>
                    <p className="problem-editor-card__eyebrow">Write</p>
                    <h2>Markdown Editor</h2>
                  </div>
                  <span className="problem-editor-card__pill">Live</span>
                </div>

                <div data-color-mode={currentMode} className="problem-editor-pane problem-editor-pane--editor">
                  <MDEditor
                    value={problemStatement}
                    onChange={(value) => setProblemStatement(value || "")}
                    preview="edit"
                    height={520}
                    className="problem-editor-md-editor"
                    visibleDragbar={false}
                    textareaProps={{
                      placeholder: "Write problem markdown...",
                      style: {
                        width: "100%",
                        height: "100%",
                        minHeight: "100%",
                      },
                    }}
                    style={{ width: "100%", height: "100%", minHeight: "100%" }}
                  />
                </div>
              </div>

              <div className="problem-editor-card">
                <div className="problem-editor-card__header">
                  <div>
                    <p className="problem-editor-card__eyebrow">Render</p>
                    <h2>Live Preview</h2>
                  </div>
                  <span className="problem-editor-card__pill problem-editor-card__pill--alt">Updated as you type</span>
                </div>

                <div className="problem-editor-pane problem-editor-pane--preview markdown-body" data-color-mode={currentMode}>
                  <MDEditor.Markdown
                    source={problemStatement}
                    rehypePlugins={[rehypeHighlight]}
                    className="problem-editor-markdown"
                  />
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === "topics" ? (
          <div className="problem-editor-card problem-editor-card--topics">
            <div className="problem-editor-card__header">
              <div>
                <p className="problem-editor-card__eyebrow">Classify</p>
                <h2>Topics</h2>
              </div>
              <span className="problem-editor-card__pill">{topics.length} selected</span>
            </div>

            <div className="problem-editor-topic-panel">
              <div className="problem-editor-topic-panel__header">
                <div>
                  <label>Search topics</label>
                  <p className="problem-editor-topic-panel__hint">
                    Select only the tags that help users discover this problem.
                  </p>
                </div>

                {topics.length > 0 ? (
                  <button type="button" onClick={clearTopics} className="problem-editor-topic-clear">
                    Clear all
                  </button>
                ) : null}
              </div>

              <input
                type="search"
                value={topicSearch}
                onChange={(event) => setTopicSearch(event.target.value)}
                placeholder="Search topics like graph, DP, binary search"
                className="problem-editor-input"
              />

              <div className="problem-editor-topic-summary" aria-label="Selected topics">
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <button key={topic} type="button" onClick={() => toggleTopic(topic)} className="problem-editor-topic-chip">
                      <span>{topic.replace(/_/g, " ")}</span>
                      <span className="problem-editor-topic-chip__remove">x</span>
                    </button>
                  ))
                ) : (
                  <span className="problem-editor-topic-empty">No topics selected yet.</span>
                )}
              </div>

              <div className="problem-editor-topic-grid" aria-label="Available topics">
                {filteredTopicOptions.map((topic) => {
                  const isSelected = topics.includes(topic);

                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`problem-editor-topic-tile ${isSelected ? "problem-editor-topic-tile--active" : ""}`}
                      aria-pressed={isSelected}
                    >
                      <span>{topic.replace(/_/g, " ")}</span>
                      <span className="problem-editor-topic-tile__action">{isSelected ? "Selected" : "Add"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "testcases" ? (
          <div className="problem-editor-card problem-editor-card--upload">
            <div className="problem-editor-card__header">
              <div>
                <p className="problem-editor-card__eyebrow">Upload</p>
                <h2>Testcase Zip</h2>
              </div>
              <span className="problem-editor-card__pill problem-editor-card__pill--alt">{testcaseSlug || "No slug yet"}</span>
            </div>

            <div className="problem-editor-upload-body">
              <div className="problem-editor-upload-instructions">
                <p>Upload a zip file containing testcase pairs in the root of the archive.</p>
                <p>Use filename.in and filename.out for each testcase pair.</p>
                <p>Sample files must be named sample1.in / sample1.out, sample2.in / sample2.out, or sample3.in / sample3.out.</p>
                <p>Keep the zip flat with no folders inside it.</p>
              </div>

              <div className={`problem-editor-upload-alert ${testcaseStatus?.uploaded ? "problem-editor-upload-alert--info" : "problem-editor-upload-alert--empty"}`}>
                {loadingTestcaseStatus ? (
                  "Checking existing testcases..."
                ) : testcaseStatus?.uploaded ? (
                  `Existing testcase zip found. ${testcaseStatus.fileCount || 0} file(s) are stored for this problem. You can download it or upload a new zip to replace it.`
                ) : (
                  "No testcase zip uploaded yet. Upload one to attach problem testcases."
                )}
              </div>

              {uploadError ? (
                <div className="problem-editor-upload-alert problem-editor-upload-alert--error">
                  {uploadError}
                </div>
              ) : null}

              {uploadMessage ? (
                <div className="problem-editor-upload-alert problem-editor-upload-alert--success">
                  {uploadMessage}
                </div>
              ) : null}

              <div className="problem-editor-upload-form">
                <label className="problem-editor-upload-dropzone">
                  <input
                    type="file"
                    accept=".zip,application/zip"
                    onChange={handleUploadFileChange}
                    className="problem-editor-upload-input"
                  />
                  <span className="problem-editor-upload-dropzone__title">Choose testcase zip</span>
                  <span className="problem-editor-upload-dropzone__hint">Drop in a .zip file or click to browse</span>
                  <span className="problem-editor-upload-dropzone__file">
                    {testcaseZipFile ? testcaseZipFile.name : "No file selected"}
                  </span>
                </label>

                <div className="problem-editor-upload-actions">
                  <button
                    type="button"
                    onClick={handleDownloadTestcases}
                    disabled={!testcaseStatus?.uploaded || downloadingTestcases || loadingTestcaseStatus}
                    className="problem-editor-topic-add-button"
                  >
                    {downloadingTestcases ? "Downloading..." : "Download Existing"}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestcaseUpload}
                    disabled={uploading || loading}
                    className="problem-editor-save-button"
                  >
                    {uploading ? "Uploading..." : "Upload Testcases"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default AddProblem;
