import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { get_published_problems } from "../utils/problem-apis";

const ProblemsList = () => {
  const [problems, setProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [topic, setTopic] = useState("ALL");
  const problemsPerPage = 20;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await get_published_problems();
        setProblems(response.data.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch problems.");
      }
    };

    fetchProblems();
  }, []);

  const generateSlug = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const getDifficultyColor = (value) => {
    switch (value) {
      case "EASY":
        return "difficulty-easy";
      case "MEDIUM":
        return "difficulty-medium";
      case "HARD":
        return "difficulty-hard";
      default:
        return "pill";
    }
  };

  const topicOptions = useMemo(() => {
    const allTopics = new Set();
    problems.forEach((problem) => {
      const topics = problem.topic ?? problem.tags ?? [];
      topics.forEach((entry) => allTopics.add(String(entry)));
    });
    return Array.from(allTopics).sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return problems.filter((problem) => {
      const topics = problem.topic ?? problem.tags ?? [];
      const titleMatch = !lowerQuery || problem.title?.toLowerCase().includes(lowerQuery);
      const difficultyMatch = difficulty === "ALL" || problem.difficulty === difficulty;
      const topicMatch = topic === "ALL" || topics.map(String).includes(topic);
      return titleMatch && difficultyMatch && topicMatch;
    });
  }, [problems, query, difficulty, topic]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, difficulty, topic]);

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / problemsPerPage));

  return (
    <div className="page-inner">
      <section className="page-header">
        <div>
          <div className="page-eyebrow">Problem library</div>
          <h1>Practice without the clutter.</h1>
          <p className="page-subtitle">
            Search curated DSA problems, narrow by difficulty or topic, and jump
            into a clean editor experience.
          </p>
        </div>
        <div className="saas-card saas-card--blue" style={{ minWidth: 220, padding: 20 }}>
          <div className="stat-card__label">Published problems</div>
          <div className="stat-card__value" style={{ fontSize: 34 }}>{filteredProblems.length}</div>
        </div>
      </section>

      <section className="problems-toolbar">
        <label style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 13, color: "var(--text-muted)" }} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search problems"
            style={{ paddingLeft: 42 }}
          />
        </label>

        <label style={{ position: "relative" }}>
          <Filter size={18} style={{ position: "absolute", left: 14, top: 13, color: "var(--text-muted)" }} />
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} style={{ paddingLeft: 42 }}>
            <option value="ALL">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </label>

        <select value={topic} onChange={(event) => setTopic(event.target.value)}>
          <option value="ALL">All topics</option>
          {topicOptions.map((entry) => (
            <option key={entry} value={entry}>
              {entry.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </section>

      <section className="problems-card animate-fadeInUp">
        <div className="problem-list modern-scrollbar">
          <table className="problems-table">
            <thead>
              <tr>
                <th style={{ width: 72 }}>#</th>
                <th>Problem</th>
                <th style={{ width: 150 }}>Difficulty</th>
                <th>Topics</th>
              </tr>
            </thead>
            <tbody>
              {currentProblems.map((problem, idx) => {
                const topics = problem.topic ?? problem.tags ?? [];
                return (
                  <tr key={problem.id || problem.title}>
                    <td>{indexOfFirstProblem + idx + 1}</td>
                    <td>
                      <Link to={`/problems/${generateSlug(problem.title)}`} className="problem-title-link">
                        {problem.title}
                      </Link>
                      <div style={{ marginTop: 5, color: "var(--text-muted)", fontSize: 13 }}>
                        Solve, run samples, and submit to judge
                      </div>
                    </td>
                    <td>
                      <span className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {topics.length > 0 ? (
                          topics.slice(0, 4).map((tag, tagIdx) => (
                            <span key={`${tag}-${tagIdx}`} className="tag">
                              {String(tag).replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                            No tags
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="pagination">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Prev
        </button>

        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pageNum;
          if (totalPages <= 7) pageNum = i + 1;
          else if (currentPage <= 4) pageNum = i + 1;
          else if (currentPage >= totalPages - 3) pageNum = totalPages - 6 + i;
          else pageNum = currentPage - 3 + i;

          return (
            <button key={pageNum} className={currentPage === pageNum ? "active" : ""} onClick={() => setCurrentPage(pageNum)}>
              {pageNum}
            </button>
          );
        })}

        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ProblemsList;
