import React from 'react';

const Stat = ({ label, value }) => (
  <div className="p-4 rounded border" style={{ borderColor: 'var(--border-secondary)', background: 'var(--bg-tertiary)' }}>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-secondary text-sm">{label}</div>
  </div>
);

const ProfileStats = ({ user }) => {
  // Placeholders where no data yet
  const solved = user?.solvedCount ?? 0;
  const submissionsPastYear = user?.submissionsPastYear ?? 0;
  const badges = user?.badges?.length ?? 0;

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
      <Stat label="Solved" value={solved} />
      <Stat label="Submissions (1y)" value={submissionsPastYear} />
      <Stat label="Badges" value={badges} />
    </div>
  );
};

export default ProfileStats;



