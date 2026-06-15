import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  Medal,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";

const stats = [
  {
    label: "Problems Solved",
    value: "128",
    meta: "+14 this month",
    icon: Target,
    tone: "saas-card--blue",
  },
  {
    label: "Current Streak",
    value: "12",
    meta: "days active",
    icon: Flame,
    tone: "saas-card--amber",
  },
];

const tracks = [
  { name: "Dynamic Programming", progress: 72, color: "var(--accent-primary)" },
  { name: "Graphs", progress: 54, color: "var(--accent-secondary)" },
  { name: "Trees", progress: 46, color: "var(--success)" },
];

const Home = () => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <div className="page-inner animate-fadeInUp">
      <section className="page-header">
        <div>
          <div className="page-eyebrow">Saturday, June 13</div>
          <h1>Good morning, developer.</h1>
          <p className="page-subtitle">
            Keep your DSA practice focused with curated problems, fast execution,
            and a calm workspace built for consistent improvement.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/problems" className="btn-primary">
            <Plus size={16} />
            Solve problem
          </Link>
          <Link to={isLoggedIn ? "/profile" : "/login"} className="btn-secondary">
            View progress
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="soft-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className={`saas-card stat-card ${stat.tone}`}>
              <div className="stat-card__top">
                <span className="stat-card__icon">
                  <Icon size={20} />
                </span>
                <span className="pill" style={{ background: "var(--surface-elevated)", color: "var(--accent-primary)" }}>
                  Live
                </span>
              </div>
              <div>
                <div className="stat-card__label">{stat.label}</div>
                <div className="stat-card__value">{stat.value}</div>
                <div className="stat-card__meta">{stat.meta}</div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="profile-grid">
        <article className="saas-card" style={{ padding: 32 }}>
          <div className="page-eyebrow">Focus plan</div>
          <h2>Today&apos;s practice queue</h2>
          <p className="page-subtitle" style={{ marginBottom: 24 }}>
            A balanced set of problems selected to strengthen patterns without
            turning the dashboard into noise.
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            {["Binary Search on Answer", "Shortest Path Review", "Two Pointer Warmup"].map((item, index) => (
              <Link
                key={item}
                to="/problems"
                className="saas-card"
                style={{
                  padding: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "none",
                  background: index === 0 ? "var(--surface-indigo)" : "var(--surface-soft)",
                }}
              >
                <span>
                  <strong style={{ display: "block", color: "var(--text-primary)" }}>
                    {item}
                  </strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    {index + 2} problems queued
                  </span>
                </span>
                <ArrowRight size={18} color="var(--accent-primary)" />
              </Link>
            ))}
          </div>
        </article>

        <aside className="saas-card" style={{ padding: 32 }}>
          <span className="stat-card__icon" style={{ marginBottom: 18 }}>
            <Sparkles size={20} />
          </span>
          <h2>Skill coverage</h2>
          <p className="page-subtitle" style={{ fontSize: 14 }}>
            Topic progress stays visible without taking over the workspace.
          </p>

          <div style={{ display: "grid", gap: 18, marginTop: 24 }}>
            {tracks.map((track) => (
              <div key={track.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 750 }}>
                  <span>{track.name}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{track.progress}%</span>
                </div>
                <div style={{ height: 10, background: "var(--surface-soft)", borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: `${track.progress}%`, height: "100%", background: track.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="saas-card saas-card--indigo" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="stat-card__icon">
            <Medal size={20} />
          </span>
          <div>
            <h3>Next milestone: 150 solved</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
              22 more accepted submissions to unlock the advanced graph set.
            </p>
          </div>
        </div>
        <Link to="/problems" className="btn-primary">
          Continue
        </Link>
      </section>
    </div>
  );
};

export default Home;
