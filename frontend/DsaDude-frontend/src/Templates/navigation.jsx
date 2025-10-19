import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/problems", label: "Problems" },
    { path: "/submissions", label: "Submissions" },
    { path: "/profile", label: "Profile" }
  ];

  return (
    <nav className="top-nav">
      <div className="container">
        <div className="flex justify-between items-center h-12">
          <Link 
            to="/" 
            className="text-xl font-bold text-accent hover:text-primary transition-colors"
            style={{
              background: 'linear-gradient(135deg, var(--text-accent), #ff8c00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            DSADude
          </Link>
          <div className="flex space-x-2">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
