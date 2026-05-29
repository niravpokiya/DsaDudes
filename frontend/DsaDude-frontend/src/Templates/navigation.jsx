import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import { create_draft_problem } from "../utils/problem-apis";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, showToast } = useContext(UserContext);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const isLoggedIn = Boolean(user);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/problems", label: "Problems" },
    { path: "/submissions", label: "Submissions" },
    { path: "/contributions", label: "My Contributions" },
    { path: "/profile", label: "Profile" }
  ];

  const handleCreateProblem = async () => {
    if (isCreatingDraft) {
      return;
    }

    setIsCreatingDraft(true);

    try {
      const response = await create_draft_problem();
      const draftId = response?.data?.data?.id;

      if (!draftId) {
        throw new Error("Draft problem id was not returned.");
      }

      navigate(`/problem/edit/${draftId}`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to create a draft problem.";
      if (showToast) {
        showToast(message);
      } else {
        alert(message);
      }
    } finally {
      setIsCreatingDraft(false);
    }
  };

  return (
    <nav className="top-nav">
      <div className="container">
        <div className="flex justify-between items-center h-12">
          <Link
            to="/"
            className="brand-link flex items-center gap-3 rounded-xl px-2 py-1.5 text-primary hover:bg-[var(--bg-accent)] transition-all duration-200"
            style={{ textDecoration: "none" }}
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] shadow-sm">
              <img
                src="/DsaChamp-logo.png"
                alt="DsaChamp logo"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-wide text-[var(--text-primary)]">
                DsaChamp
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Code. Submit. Level up.
              </span>
            </span>
          </Link>
          <div className="flex space-x-2 items-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent text-primary' 
                      : 'text-secondary hover:text-primary hover:bg-accent'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--text-accent)' : 'transparent',
                    color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            {isLoggedIn && (
              <button
                onClick={handleCreateProblem}
                disabled={isCreatingDraft}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-[var(--text-accent)] text-[var(--text-accent)] hover:bg-[var(--text-accent)] hover:text-[var(--bg-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: "transparent" }}
              >
                {isCreatingDraft ? "Creating..." : "+ Contribute Problem"}
              </button>
            )}
            {!isLoggedIn && (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-secondary hover:text-primary hover:bg-accent"
                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)' }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
