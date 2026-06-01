import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../Context/userContext";
import { get_user_authored_problems } from "../../../utils/problem-apis";

const normalizeDifficulty = (difficulty) => {
  if (!difficulty) {
    return "Draft";
  }

  return String(difficulty).toUpperCase();
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "EASY":
      return "difficulty-easy";
    case "MEDIUM":
      return "difficulty-medium";
    case "HARD":
      return "difficulty-hard";
    default:
      return "";
  }
};

const ContributionsSection = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await get_user_authored_problems();
        const data = response?.data?.data;
        setProblems(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || fetchError?.message || "Failed to load your contributions.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [user?.id]);

  const sortedProblems = [...problems].sort((a, b) => {
    const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
    const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
    return bTime - aTime;
  });

  const topicsFor = (problem) => problem?.topic ?? problem?.tags ?? [];

  return (
    <section className="problems-card animate-fadeInUp" style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.75rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "var(--font-weight-bold)",
            background: "linear-gradient(135deg, var(--text-primary), var(--text-accent))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          My Contributions
        </h2>
        <p className="text-secondary" style={{ fontSize: "1.05rem" }}>
          Problems you have authored and can continue editing
        </p>
      </div>

      {!user ? (
        <div className="problems-card animate-fadeInUp" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Please login to view your contributions</h3>
          <p className="text-secondary">Your authored problems will appear here once you sign in.</p>
        </div>
      ) : loading ? (
        <div className="problems-card animate-fadeInUp" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <p className="text-secondary">Loading your authored problems...</p>
        </div>
      ) : error ? (
        <div className="problems-card animate-fadeInUp" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>{error}</h3>
          <button className="problem-editor-save-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : sortedProblems.length === 0 ? (
        <div className="problems-card animate-fadeInUp" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>No contributions yet</h3>
          <p className="text-secondary" style={{ marginBottom: "1rem" }}>
            Start a draft from the admin panel to see your authored problems here.
          </p>
        </div>
      ) : (
        <div className="problems-card animate-fadeInUp" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div className="problem-list modern-scrollbar" style={{ width: "100%" }}>
            <table className="problems-table" style={{ width: "100%", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {sortedProblems.map((problem, idx) => {
                  const topics = topicsFor(problem);
                  const difficulty = normalizeDifficulty(problem?.difficulty);
                  const isDraft = !problem?.title;

                  return (
                    <tr
                      key={problem.id}
                      onClick={() => navigate(`/admin/problems/${problem.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ fontWeight: "var(--font-weight-medium)", color: "var(--text-secondary)", textAlign: "center" }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ color: "var(--text-accent)", fontWeight: "var(--font-weight-medium)", fontSize: "1rem" }}>
                          {isDraft ? `Untitled Problem (${problem.id})` : problem.title}
                        </div>
                        <div style={{ marginTop: "0.3rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          Click to open the editor
                        </div>
                      </td>
                      <td>
                        <span
                          className={`output-badge ${getDifficultyColor(difficulty)}`}
                          style={!getDifficultyColor(difficulty) ? {
                            background: "var(--bg-accent)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-primary)"
                          } : undefined}
                        >
                          {difficulty}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {topics.length > 0 ? topics.map((tag, tagIdx) => (
                            <span
                              key={tagIdx}
                              style={{
                                background: "var(--bg-accent)",
                                color: "var(--text-secondary)",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "var(--radius)",
                                fontSize: "0.75rem",
                                fontWeight: "var(--font-weight-medium)",
                                border: "1px solid var(--border-primary)",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {String(tag).replace(/_/g, " ")}
                            </span>
                          )) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No tags</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContributionsSection;