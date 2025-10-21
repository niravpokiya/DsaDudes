import React from 'react';

const Row = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
    <span className="text-secondary">{label}</span>
    <span>{value || '—'}</span>
  </div>
);

const ProfileAbout = ({ user }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">About</h3>
      <div>
        <Row label="Email" value={user?.email || 'unavailable'} />
        <Row label="First name" value={user?.firstName || 'Not set'} />
        <Row label="Last name" value={user?.lastName || 'Not set'} />
        <Row label="Bio" value={user?.bio || 'Tell the world about yourself'} />
        <Row label="Provider" value={user?.provider || 'Local'} />
        <Row label="Joined" value={user?.createdAt ? new Date(user.createdAt).toDateString() : 'Recently'} />
        <Row label="Role" value={user?.role || 'USER'} />
      </div>
    </div>
  );
};

export default ProfileAbout;



