import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  PanelLeftClose,
  PanelLeftOpen,
  FileClock,
  LogIn,
  UserRound,
} from "lucide-react";
import { UserContext } from "../Context/userContext";
import ThemeSwitcher from "../Components/ThemeSwitcher";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const isLoggedIn = Boolean(user);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("dsaChampSidebarCollapsed") === "true");

  useEffect(() => {
    localStorage.setItem("dsaChampSidebarCollapsed", String(collapsed));
  }, [collapsed]);

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/problems", label: "Problems", icon: BookOpenCheck },
    { path: "/submissions", label: "Submissions", icon: FileClock, private: true },
    { path: "/profile", label: "Profile", icon: UserRound, private: true },
  ];

  const visibleNavItems = navItems.filter((item) => !item.private || isLoggedIn);
  const displayName = user?.firstName || user?.username || "Guest";

  return (
    <aside className={`app-sidebar ${collapsed ? "app-sidebar--collapsed" : ""}`}>
      <div className="app-sidebar__top">
      <Link to="/" className="app-brand" aria-label="DSAChamp dashboard">
        <span className="app-brand__mark">
          <img src="/DsaChamp-logo.png" alt="DSAChamp logo" />
        </span>
        <span>
          <span className="app-brand__name">DSAChamp</span>
          <span className="app-brand__tagline">Developer practice lab</span>
        </span>
      </Link>
      <button
        type="button"
        className="sidebar-collapse"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
      </button>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav__item ${isActive ? "sidebar-nav__item--active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <ThemeSwitcher />
        {isLoggedIn ? (
          <Link to="/profile" className="sidebar-user">
            <span className="sidebar-user__avatar">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span>
              <strong style={{ display: "block", color: "var(--text-primary)" }}>
                {displayName}
              </strong>
              <span>@{user?.username || "coder"}</span>
            </span>
          </Link>
        ) : (
          <button className="btn-primary" onClick={() => navigate("/login")}>
            <LogIn size={16} />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default NavBar;
