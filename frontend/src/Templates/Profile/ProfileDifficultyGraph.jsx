import { useEffect, useState } from "react";
import { user_submissions_stats } from "../../utils/submission-apis";

const formatCompactCount = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const ProfileDifficultyGraph = () => {
  const [userStats, setUserStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await user_submissions_stats();
        setUserStats(res.data || {});
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };

    fetchStats();
  }, []);

  const segments = [
    { label: "Easy", value: userStats.easySolved || 0, color: "var(--success)", bg: "var(--success-bg)" },
    { label: "Medium", value: userStats.mediumSolved || 0, color: "var(--warning)", bg: "var(--warning-bg)" },
    { label: "Hard", value: userStats.hardSolved || 0, color: "var(--error)", bg: "var(--error-bg)" },
  ];

  const totalSolved = segments.reduce((sum, segment) => sum + segment.value, 0);
  const totalSubmissions = userStats.totalSubmissions || 0;
  const acceptanceRate = totalSubmissions > 0 ? (totalSolved / totalSubmissions) * 100 : 0;

  return (
    <div className="difficulty-summary">
      <div style={{ position: "relative", width: 210, height: 210, margin: "0 auto" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `conic-gradient(var(--accent-primary) 0 ${Math.max(acceptanceRate, 8)}%, var(--surface-soft) ${Math.max(acceptanceRate, 8)}% 100%)`,
          }}
        />
        <div style={{ position: "absolute", inset: 18, borderRadius: "50%", background: "var(--surface-card)", display: "grid", placeItems: "center", textAlign: "center", boxShadow: "inset 0 0 0 1px var(--border-primary)" }}>
          <div>
            <div className="stat-card__label">Acceptance</div>
            <div className="stat-card__value" style={{ fontSize: 42 }}>{acceptanceRate.toFixed(1)}%</div>
            <div className="stat-card__meta">{formatCompactCount(totalSolved)} solved</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {segments.map((segment) => {
          const pct = totalSolved > 0 ? Math.round((segment.value / totalSolved) * 100) : 0;
          return (
            <div key={segment.label} className="metadata-item">
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                <span style={{ color: segment.color }}>{segment.label}</span>
                <span>{formatCompactCount(segment.value)}</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: segment.bg, marginTop: 10, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: segment.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileDifficultyGraph;
