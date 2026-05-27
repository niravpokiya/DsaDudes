import React, { useEffect, useState } from 'react';
import { user_submissions_stats } from '../../utils/submission-apis';

const Stat = ({ label, value }) => (
  <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 flex flex-col justify-center">
    <div className="text-2xl font-extrabold text-zinc-100 tracking-tight">
      {value}
    </div>
    <div className="text-zinc-400 text-xs font-medium mt-1 uppercase tracking-wider">
      {label}
    </div>
  </div>
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
    <div className="grid grid-cols-2 gap-4">
      <Stat label="Solved" value={solvedTotal} />
      <Stat label="Submissions (1y)" value={submissionTotal} />
    </div>
  );
};

export default ProfileStats;