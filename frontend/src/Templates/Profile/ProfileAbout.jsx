import React from 'react';

const Row = ({ label, value }) => (
  <div className="flex justify-between py-3 border-b border-zinc-800/60 last:border-0">
    <span className="text-zinc-400 text-sm font-medium">{label}</span>
    <span className="text-zinc-200 text-sm font-semibold">{value || '—'}</span>
  </div>
);

const ProfileAbout = ({ user }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-zinc-100 tracking-tight">About</h3>
      <div className="flex flex-col">
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