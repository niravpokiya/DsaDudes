import MDEditor from "@uiw/react-md-editor";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import rehypeHighlight from "rehype-highlight";

import "github-markdown-css/github-markdown-dark.css";
import "highlight.js/styles/github-dark.css";
import { UserContext } from "../../Context/userContext";
import { get_problem_by_id, update_problem } from "../../utils/problem-apis";
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

const AddProblem = () => {
  const { id } = useParams();
  const { showToast } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [selectedTopic, setSelectedTopic] = useState(TOPIC_OPTIONS[0]);
  const [topics, setTopics] = useState([]);
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
        setSelectedTopic(TOPIC_OPTIONS[0]);
        setProblemStatement(data.description || "");
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || fetchError?.message || "Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const addTopic = () => {
    const topicToAdd = String(selectedTopic || "").trim().toUpperCase();

    if (!topicToAdd) {
      return;
    }

    setTopics((previousTopics) => (previousTopics.includes(topicToAdd) ? previousTopics : [...previousTopics, topicToAdd]));
  };

  const removeTopic = (topicToRemove) => {
    setTopics((previousTopics) => previousTopics.filter((topic) => topic !== topicToRemove));
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

            <div className="problem-editor-field problem-editor-field--topics">
              <label>
                Topic
              </label>

              <div className="problem-editor-topic-picker">
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="problem-editor-input"
                >
                  {TOPIC_OPTIONS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={addTopic}
                  className="problem-editor-topic-add-button"
                >
                  Add
                </button>
              </div>

              <div className="problem-editor-topic-list" aria-label="Selected topics">
                {topics.length > 0 ? topics.map((topic) => (
                  <span key={topic} className="problem-editor-topic-chip">
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="problem-editor-topic-remove"
                      aria-label={`Remove ${topic}`}
                    >
                      ×
                    </button>
                  </span>
                )) : (
                  <span className="problem-editor-topic-empty">No topics added yet.</span>
                )}
              </div>
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

            <div data-color-mode="dark" className="problem-editor-pane problem-editor-pane--editor">
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

            <div className="problem-editor-pane problem-editor-pane--preview markdown-body" data-color-mode="dark">
              <MDEditor.Markdown
                source={problemStatement}
                rehypePlugins={[rehypeHighlight]}
                className="problem-editor-markdown"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddProblem;