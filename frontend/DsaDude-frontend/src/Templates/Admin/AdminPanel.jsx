import { useContext } from "react";
import { UserContext } from "../../Context/userContext";
import ContributeProblemSection from "./components/ContributeProblemSection";
import ContributionsSection from "./components/ContributionsSection";

const AdminPanel = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="page-inner">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.75rem",
            fontWeight: "var(--font-weight-bold)",
            background: "linear-gradient(135deg, var(--text-primary), var(--text-accent))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          Admin Panel
        </h1>
        <p className="text-secondary" style={{ fontSize: "1.1rem" }}>
          {user?.firstName || user?.username ? `Signed in as ${user.firstName || user.username}` : "Dedicated workspace for problem contribution and review"}
        </p>
      </div>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        <ContributeProblemSection />
        <ContributionsSection />
      </div>
    </div>
  );
};

export default AdminPanel;