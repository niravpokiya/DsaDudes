// getUser.js
const getUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
  
      const res = await fetch("http://localhost:8080/api/user/me", {
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
        console.error("❌ Failed to fetch user:", res.status);
        return null;
      }
  
      // Safely handle empty response body
      const text = await res.text();
      if (!text) return null; // empty body → return null instead of crashing
  
      const data = JSON.parse(text);
      return data;
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      return null;
    }
  };
  
  export default getUser;
  