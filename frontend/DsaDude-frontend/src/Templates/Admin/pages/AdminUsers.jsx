import { useEffect, useState } from "react";
import { get_admin_users } from "../../../utils/admin-apis";

const roleClass = (role) => {
  if (String(role).toUpperCase() === "ADMIN") {
    return "admin-badge admin-badge--admin";
  }

  return "admin-badge admin-badge--user";
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await get_admin_users();
        setUsers(Array.isArray(response?.data?.data) ? response.data.data : []);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || fetchError?.message || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const adminCount = users.filter((user) => String(user?.role).toUpperCase() === "ADMIN").length;

  return (
    <section className="admin-card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <div style={{ color: "#ffc457", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.72rem" }}>Users</div>
          <h2 className="admin-sectionTitle">System users</h2>
          <p className="admin-sectionText">Registered accounts visible to the admin console. Passwords are never exposed.</p>
        </div>
        <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", minWidth: "240px" }}>
          <div className="admin-stat">
            <div className="admin-stat__label">Total users</div>
            <div className="admin-stat__value" style={{ fontSize: "1.6rem" }}>{loading ? "..." : users.length}</div>
          </div>
          <div className="admin-stat">
            <div className="admin-stat__label">Admins</div>
            <div className="admin-stat__value" style={{ fontSize: "1.6rem" }}>{loading ? "..." : adminCount}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-card" style={{ padding: "1rem", textAlign: "center" }}>Loading users...</div>
      ) : error ? (
        <div className="admin-card" style={{ padding: "1rem", textAlign: "center", color: "#ff9f8c" }}>{error}</div>
      ) : (
        <div className="admin-tableWrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Stats</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{user.firstName || user.username}</div>
                    <div style={{ color: "rgba(232,237,247,0.58)", fontSize: "0.84rem" }}>@{user.username}</div>
                  </td>
                  <td><span className={roleClass(user.role)}>{String(user.role).toUpperCase()}</span></td>
                  <td>
                    <div>{user.email || "-"}</div>
                    <div style={{ color: "rgba(232,237,247,0.58)", fontSize: "0.84rem" }}>{user.phoneVerified ? "Phone verified" : "Phone unverified"}</div>
                  </td>
                  <td>
                    <div>{user.totalSubmissions || 0} submissions</div>
                    <div style={{ color: "rgba(232,237,247,0.58)", fontSize: "0.84rem" }}>{user.solvedCount || 0} solved</div>
                  </td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminUsers;