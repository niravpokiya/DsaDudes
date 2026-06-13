import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../../Context/userContext";
import { get_admin_users } from "../../../utils/admin-apis";

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [userCount, setUserCount] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await get_admin_users();
        const data = response?.data?.data;
        setUserCount(Array.isArray(data) ? data.length : 0);
      } catch {
        setUserCount(0);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const stats = [
    { label: "System users", value: loadingUsers ? "..." : String(userCount), meta: "Loaded from admin API" },
    { label: "Problem authoring", value: "Live", meta: "Draft creation + editor" },
    { label: "Access model", value: "Strict", meta: "ADMIN only" },
    { label: "Surface", value: "Unified", meta: "Same DSAChamp system" },
  ];

  const actions = [
    { to: "/admin/create", title: "Create draft problem", description: "Open a fresh problem draft in the admin editor." },
    { to: "/admin/contributions", title: "Review contributions", description: "Browse authored problems in one place." },
    { to: "/admin/users", title: "Manage users", description: "Inspect registered users and roles." },
  ];

  return (
    <div className="admin-grid" style={{ gap: "1.25rem" }}>
      <section className="admin-card admin-card--hero">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <div className="page-eyebrow">Admin workspace</div>
            <h2 className="admin-sectionTitle" style={{ fontSize: "2rem", marginTop: "0.35rem" }}>
              Welcome back, {user?.firstName || user?.username || "Admin"}
            </h2>
            <p className="admin-sectionText" style={{ maxWidth: "720px" }}>
              This panel uses the same DSAChamp design system while keeping administrative routes and permissions isolated.
            </p>
          </div>

          <div className="admin-badge admin-badge--admin" style={{ alignSelf: "flex-start" }}>ROLE_ADMIN</div>
        </div>

        <div className="admin-grid admin-grid--stats" style={{ marginTop: "1.2rem" }}>
          {stats.map((stat) => (
            <div key={stat.label} className="admin-stat">
              <div className="admin-stat__label">{stat.label}</div>
              <div className="admin-stat__value">{stat.value}</div>
              <div className="admin-stat__meta">{stat.meta}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card" style={{ padding: "1.25rem" }}>
        <h3 className="admin-sectionTitle">Quick actions</h3>
        <p className="admin-sectionText" style={{ marginBottom: "1rem" }}>
          The panel is organized around the tasks an admin actually performs.
        </p>

        <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {actions.map((action) => (
            <Link key={action.to} to={action.to} className="admin-card" style={{ padding: "1rem", textDecoration: "none", color: "inherit" }}>
              <div style={{ fontWeight: 800, marginBottom: "0.4rem" }}>{action.title}</div>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>{action.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
