import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Flame, Trophy } from "lucide-react";
import { user_submissions_stats } from "../../utils/submission-apis";

const Stat = ({ label, value, meta, icon: Icon, tone }) => (
  <article className={`saas-card stat-card ${tone}`}>
    <div className="stat-card__top">
      <span className="stat-card__icon">
        <Icon size={20} />
      </span>
    </div>
    <div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__meta">{meta}</div>
    </div>
  </article>
);

const ProfileStats = () => {
  const [submissionTotal, setSubmissionTotal] = useState(0);
  const [solvedTotal, setSolvedTotal] = useState(0);

  useEffect(() => {
    const fetchSubmissionStats = async () => {
      try {
        const res = await user_submissions_stats();
        setSubmissionTotal(res.data.totalSubmissions || 0);
        setSolvedTotal(res.data.totalSolved || 0);
      } catch (err) {
        console.error("Error fetching submission stats:", err);
        setSubmissionTotal(0);
        setSolvedTotal(0);
      }
    };

    fetchSubmissionStats();
  }, []);

  return (
    <div className="soft-grid">
      <Stat label="Problems solved" value={solvedTotal} meta="All time accepted" icon={CheckCircle2} tone="saas-card--green" />
      <Stat label="Submissions" value={submissionTotal} meta="Last 12 months" icon={Activity} tone="saas-card--blue" />
      <Stat label="Current streak" value="12" meta="Practice days" icon={Flame} tone="saas-card--amber" />
      <Stat label="Contest rating" value="1,842" meta="Estimated rank" icon={Trophy} tone="saas-card--violet" />
    </div>
  );
};

export default ProfileStats;
