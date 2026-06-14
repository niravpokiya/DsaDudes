import { useContext, useEffect, useState } from "react";
import { Award, Clock3, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import logout from "../security/logout";
import ProfileAbout from "./Profile/ProfileAbout";
import ProfileDifficultyGraph from "./Profile/ProfileDifficultyGraph";
import ProfileHeatmap from "./Profile/ProfileHeatmap";
import ProfileStats from "./Profile/ProfileStats";
import { user_submissions } from "../utils/submission-apis";

const formatProblemTitle = (slug) =>
  String(slug || "Unknown problem")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getSubmissionId = (submission) => submission?.id || submission?._id || submission?.submissionId;

const getSubmissionTime = (submission) => {
  const time = submission?.submissionTime || submission?.timestamp || submission?.createdAt;
  const date = time ? new Date(time) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
};

const formatSubmissionMeta = (submission) => {
  const verdict = submission?.verdict || "UNKNOWN";
  const language = submission?.language || "Unknown";
  const date = getSubmissionTime(submission);
  const dateText = date ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recent";

  return `${verdict} - ${language} - ${dateText}`;
};

function Profile() {
  const { user, loading, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const displayName = user?.firstName || user?.username || "Anonymous Coder";
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loadingRecentSubmissions, setLoadingRecentSubmissions] = useState(false);

  useEffect(() => {
    const fetchRecentSubmissions = async () => {
      if (!user?.id) {
        setRecentSubmissions([]);
        return;
      }

      setLoadingRecentSubmissions(true);

      try {
        const res = await user_submissions(user.id);
        const submissions = Array.isArray(res.data) ? res.data : [];

        setRecentSubmissions(
          submissions
            .slice()
            .sort((a, b) => {
              const bTime = getSubmissionTime(b)?.getTime() || 0;
              const aTime = getSubmissionTime(a)?.getTime() || 0;
              return bTime - aTime;
            })
            .slice(0, 3),
        );
      } catch (error) {
        console.error("Error fetching recent submissions:", error);
        setRecentSubmissions([]);
      } finally {
        setLoadingRecentSubmissions(false);
      }
    };

    fetchRecentSubmissions();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="page-inner" style={{ minHeight: "60vh", justifyContent: "center", alignItems: "center" }}>
        <div className="saas-card">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="page-inner">
      <section className="saas-card profile-hero">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="page-eyebrow">Developer profile</div>
            <h1>{displayName}</h1>
            <p className="page-subtitle" style={{ marginTop: 8 }}>
              @{user?.username || "username"} - {user?.role || "USER"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-secondary" onClick={() => alert("Edit Profile coming soon")}>
            <Settings size={16} />
            Edit
          </button>
          <button className="btn-ghost" onClick={() => logout(navigate, setUser)}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </section>

      <section>
        <ProfileStats user={user} />
      </section>

      <section className="profile-grid">
        <div style={{ display: "grid", gap: 24 }}>
          <article className="saas-card">
            <div className="page-eyebrow">Activity graph</div>
            <h2>Submissions in the past year</h2>
            <div style={{ marginTop: 22 }}>
              <ProfileHeatmap userId={user?.id} />
            </div>
          </article>

          <article className="saas-card">
            <div className="page-eyebrow">Difficulty mix</div>
            <h2>Problem solving breakdown</h2>
            <div style={{ marginTop: 22 }}>
              <ProfileDifficultyGraph />
            </div>
          </article>
        </div>

        <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
          <article className="saas-card">
            <div className="page-eyebrow">Achievements</div>
            <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
              {["Consistent Coder", "Graph Explorer", "Fast Submitter"].map((badge) => (
                <div key={badge} className="metadata-item" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="stat-card__icon">
                    <Award size={18} />
                  </span>
                  <div>
                    <strong>{badge}</strong>
                    <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Unlocked through regular practice</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="saas-card">
            <div className="page-eyebrow">Recent submissions</div>
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              {loadingRecentSubmissions ? (
                <div className="metadata-item">Loading recent submissions...</div>
              ) : recentSubmissions.length ? (
                recentSubmissions.map((submission) => {
                  const submissionId = getSubmissionId(submission);

                  return (
                    <button
                      key={submissionId}
                      className="metadata-item"
                      type="button"
                      onClick={() => submissionId && navigate(`/submissions/${submissionId}`)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <strong>{formatProblemTitle(submission.problemSlug)}</strong>
                        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                          {formatSubmissionMeta(submission)}
                        </p>
                      </div>
                      <Clock3 size={16} color="var(--text-muted)" />
                    </button>
                  );
                })
              ) : (
                <div className="metadata-item">No submissions yet.</div>
              )}
            </div>
          </article>

          <article className="saas-card">
            <ProfileAbout user={user} />
          </article>
        </aside>
      </section>
    </div>
  );
}

export default Profile;
