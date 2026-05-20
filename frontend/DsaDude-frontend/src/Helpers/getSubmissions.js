// getSubmissions.js
const getSubmissions = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await fetch(`http://localhost:8080/api/submissions/all-submissions/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      console.warn("⚠️ JWT expired or invalid. Logging out user.");
      localStorage.removeItem("token");
      return null;
    }
    if (!res.ok) {
      console.error("❌ Failed to fetch submissions:", res.status);
      return null;
    }

    // Safely handle empty response body
    const text = await res.text();
    if (!text) return []; // empty body → return empty array

    const data = JSON.parse(text);
    console.log("✅ Submissions fetched:", data);
    return data;
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
    return [];
  }
};

const getSubmissionById = async (userId, submissionId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await fetch(`http://localhost:8080/api/submissions/${submissionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      console.warn("⚠️ JWT expired or invalid. Logging out user.");
      localStorage.removeItem("token");
      return null;
    }
    if (!res.ok) {
      console.error("❌ Failed to fetch submission:", res.status);
      return null;
    }

    // Safely handle empty response body
    const text = await res.text();
    if (!text) return null;

    const data = JSON.parse(text);
    console.log("✅ Submission fetched:", data);
    return data;
  } catch (err) {
    console.error("❌ Error fetching submission:", err);
    return null;
  }
};

export { getSubmissionById, getSubmissions };

