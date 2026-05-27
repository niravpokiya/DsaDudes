import { useContext } from "react";
import { UserContext } from "../Context/userContext";
import ProfileAbout from "./Profile/ProfileAbout";
import ProfileDifficultyGraph from "./Profile/ProfileDifficultyGraph";
import ProfileHeader from "./Profile/ProfileHeader";
import ProfileHeatmap from "./Profile/ProfileHeatmap";
import ProfileStats from "./Profile/ProfileStats";

function Profile() {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-medium">
        <span className="animate-pulse">Loading your profile...</span>
      </div>
    );
  }

  // Injecting inline structural CSS variables/styles to match modern design specs
  const containerStyle = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
    color: "#e4e4e7",
  };

  const dashboardGridStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2.3fr) minmax(0, 1fr)",
    gap: "2rem",
  };

  const cardStyle = {
    backgroundColor: "#1e1e2e",
    borderRadius: "14px",
    padding: "1.75rem",
    border: "1px solid #2d2d3d",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  };

  return (
    <div style={containerStyle}>
      <div style={dashboardGridStyle} className="responsive-profile-grid">
        {/* Left Column: Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          
          {/* Header Area */}
          <div style={{ paddingBottom: "0.5rem" }}>
            <ProfileHeader user={user} />
          </div>

          {/* Progress Section */}
          <div style={cardStyle}>
            <h3 
              style={{ 
                fontSize: "1.15rem", 
                fontWeight: "600", 
                letterSpacing: "-0.01em",
                color: "#f4f4f5",
                marginBottom: "1.25rem" 
              }}
            >
              Progress Overview
            </h3>
            <ProfileStats user={user} />
          </div>

          <div style={cardStyle}>
            <h3 
              style={{ 
                fontSize: "1.15rem", 
                fontWeight: "600", 
                letterSpacing: "-0.01em",
                color: "#f4f4f5",
                marginBottom: "1.25rem" 
              }}
            >
              Difficulty Breakdown
            </h3>
            <ProfileDifficultyGraph />
          </div>

          {/* Heatmap Section */}
          <div style={cardStyle}>
            <h3 
              style={{ 
                fontSize: "1.15rem", 
                fontWeight: "600", 
                letterSpacing: "-0.01em",
                color: "#f4f4f5",
                marginBottom: "1.25rem" 
              }}
            >
              Submissions in the past year
            </h3>
            <ProfileHeatmap userId={user?.id} />
          </div>
        </div>

        {/* Right Column: Sidebar Meta Information */}
        <div>
          <div style={cardStyle}>
            <ProfileAbout user={user} />
          </div>
        </div>
      </div>

      {/* Basic Responsive Utility Rule */}
      <style>{`
        @media (max-width: 968px) {
          .responsive-profile-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;