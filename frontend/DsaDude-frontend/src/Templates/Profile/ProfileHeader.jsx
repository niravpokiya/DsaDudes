import React from 'react';

const ProfileHeader = ({ user }) => {
  const displayName = user?.firstName || user?.username || 'Anonymous Coder';
  const handleEdit = () => {
    // Placeholder click handler
    alert('Edit Profile coming soon');
  };

  return (
    <div className="card flex items-center gap-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
           style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}>
        {displayName?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">{displayName}</h2>
          <span className="px-2 py-0.5 text-xs rounded border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
            {user?.role || 'USER'}
          </span>
        </div>
        <p className="text-secondary">@{user?.username || 'username'}</p>
      </div>
      <button className="btn-secondary" onClick={handleEdit}>Edit Profile</button>
    </div>
  );
};

export default ProfileHeader;



