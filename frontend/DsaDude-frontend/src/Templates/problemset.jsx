import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ProblemsList = () => {
  const [problems, setProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 30;

  useEffect(() => {
    fetch("http://localhost:8080/api/question/all")
      .then((res) => res.json())
      .then((data) => {
        // Assuming API returns { data: [ {id, title, difficulty, tags} ] }
        if (data.data) {
          setProblems(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Pagination logic
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = problems.slice(indexOfFirstProblem, indexOfLastProblem);

  const totalPages = Math.ceil(problems.length / problemsPerPage);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "difficulty-easy";
      case "MEDIUM":
        return "difficulty-medium";
      case "HARD":
        return "difficulty-hard";
      default:
        return "difficulty-easy";
    }
  };
  
  const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with -
        .replace(/^-+|-+$/g, ""); // trim leading/trailing -
    };
  return (
  <div className="page-inner">
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'var(--font-weight-bold)',
        background: 'linear-gradient(135deg, var(--text-primary), var(--text-accent))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem'
      }}>
        Problem List
      </h1>
      <p className="text-secondary" style={{ fontSize: '1.125rem' }}>
        Practice with curated problems and improve your coding skills
      </p>
    </div>

    {/* Enhanced Table Container */}
    <div className="problems-card animate-fadeInUp">
      <div className="problem-list modern-scrollbar">
        <table className="problems-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {currentProblems.map((problem, idx) => (
              <tr key={problem.id}>
                <td style={{ 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  {indexOfFirstProblem + idx + 1}
                </td>
                <td>
                  <Link 
                    to={`/problems/${generateSlug(problem.title)}`}
                    style={{
                      color: 'var(--text-accent)',
                      textDecoration: 'none',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: '1rem'
                    }}
                  >
                    {problem.title}
                  </Link>
                </td>
                <td>
                  <span className={`output-badge ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {problem.tags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        style={{
                          background: 'var(--bg-accent)',
                          color: 'var(--text-secondary)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.75rem',
                          fontWeight: 'var(--font-weight-medium)',
                          border: '1px solid var(--border-primary)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Enhanced Pagination */}
    <div className="pagination">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Prev
      </button>
      
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let pageNum;
        if (totalPages <= 7) {
          pageNum = i + 1;
        } else if (currentPage <= 4) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 3) {
          pageNum = totalPages - 6 + i;
        } else {
          pageNum = currentPage - 3 + i;
        }
        
        return (
          <button
            key={pageNum}
            className={currentPage === pageNum ? 'active' : ''}
            onClick={() => setCurrentPage(pageNum)}
            style={{
              background: currentPage === pageNum ? 'var(--text-accent)' : 'var(--bg-tertiary)',
              color: currentPage === pageNum ? 'var(--bg-primary)' : 'var(--text-primary)',
              borderColor: currentPage === pageNum ? 'var(--text-accent)' : 'var(--border-primary)'
            }}
          >
            {pageNum}
          </button>
        );
      })}
      
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>

  );
};

export default ProblemsList;
