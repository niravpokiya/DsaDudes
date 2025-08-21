import { useState, useEffect } from "react";
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
        return "text-green-500";
      case "MEDIUM":
        return "text-yellow-500";
      case "HARD":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };
  
  const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with -
        .replace(/^-+|-+$/g, ""); // trim leading/trailing -
    };
  return (
  <div className="space-y-6">
  <h1 className="text-3xl font-bold text-center">Problem List</h1>

  {/* SCROLLABLE TABLE CONTAINER */}
  <div className="shadow-lg rounded-lg border border-gray-200 dark:border-gray-700   overflow-y-auto">
    <table className="w-full table-auto text-left">
      <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
        <tr>
          <th className="p-3">#</th>
          <th className="p-3">Title</th>
          <th className="p-3">Difficulty</th>
          <th className="p-3">Tags</th>
        </tr>
      </thead>
      <tbody>
        {currentProblems.map((problem, idx) => (
          <tr
            key={problem.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <td className="p-3">
              {indexOfFirstProblem + idx + 1}
            </td>
            <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">
                <Link to={`/problems/${generateSlug(problem.title)}`}>
                    {problem.title}
                </Link>
            </td>
            <td className={`p-3 font-medium ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </td>
            <td className="p-3 text-sm text-gray-500 dark:text-gray-400 space-x-1">
              {problem.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gray-700 text-white text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* PAGE CONTROL */}
  <div className="flex justify-center items-center space-x-2">
    <button
      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Prev
    </button>
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        className={`px-3 py-1 rounded ${
          currentPage === i + 1
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
        }`}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </button>
    ))}
    <button
      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
</div>

  );
};

export default ProblemsList;
