import React from 'react';

const Stat = ({ label, value }) => (
  <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 flex flex-col justify-center">
    <div className="text-2xl font-extrabold text-zinc-100 tracking-tight">{value}</div>
    <div className="text-zinc-400 text-xs font-medium mt-1 uppercase tracking-wider">{label}</div>
  </div>
);

const ProfileStats = ({ user }) => {
  const solved = user?.solvedCount ?? 0;
  const submissionsPastYear = user?.submissionsPastYear ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat label="Solved" value={solved} />
      <Stat label="Submissions (1y)" value={submissionsPastYear} /> 
    </div>
  );
};

export default ProfileStats;