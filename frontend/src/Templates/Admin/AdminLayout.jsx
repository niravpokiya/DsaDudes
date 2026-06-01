import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Context/userContext";
import "./admin.css";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/contributions", label: "Contributions" },
  { to: "/admin/create", label: "Create Draft" },
  { to: "/admin/users", label: "Users" },
];

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);

  const currentSection =
    links.find((link) => link.to === location.pathname) ||
    links.find((link) => link.end && location.pathname === link.to) ||
    links.find((link) => location.pathname.startsWith(link.to + "/"));

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brandMark">AD</div>
          <div className="admin-sidebar__brandTitle">
            <strong>Admin Console</strong>
            <span>Separate system</span>
          </div>
        </div>

        <div className="admin-sidebar__sectionLabel">Navigation</div>
        <nav className="admin-sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin-navLink ${isActive ? "admin-navLink--active" : ""}`}
            >
              <span>{link.label}</span>
              <span aria-hidden="true">→</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__sectionLabel">Session</div>
        <div className="admin-card" style={{ padding: "1rem" }}>
          <div style={{ fontSize: "0.85rem", color: "rgba(232,237,247,0.7)", marginBottom: "0.35rem" }}>Signed in as</div>
          <div style={{ fontWeight: 800, color: "#fff" }}>{user?.firstName || user?.username || "Admin"}</div>
          <div style={{ marginTop: "0.35rem", color: "rgba(232,237,247,0.56)", fontSize: "0.85rem" }}>
            {user?.email || "admin access"}
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__title">
            <h1>{currentSection?.label || "Admin"}</h1>
            <p>Dedicated admin workspace with isolated navigation and routes.</p>
          </div>
          <div className="admin-topbar__badge">ROLE_ADMIN</div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;