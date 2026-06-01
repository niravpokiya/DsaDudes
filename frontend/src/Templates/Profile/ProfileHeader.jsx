import { useNavigate } from 'react-router-dom';
import logout from '../../security/logout';
import { useContext } from 'react';
import { UserContext } from '../../Context/userContext';

const ProfileHeader = ({ user }) => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const displayName = user?.firstName || user?.username || 'Anonymous Coder';
  const handleEdit = () => {
    alert('Edit Profile coming soon');
  };

  const handleLogout = () => {
    logout(navigate, setUser);
  };

  return (
    <div className="flex items-center gap-5 p-2">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border border-zinc-700/50 shadow-inner"
           style={{ background: 'linear-gradient(135deg, #2b2b3c, #1e1e2e)', color: '#ffb020' }}>
        {displayName?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">{displayName}</h2>
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md border bg-zinc-800/40 border-zinc-700 text-zinc-400">
            {user?.role || 'USER'}
          </span>
        </div>
        <p className="text-zinc-400 text-sm mt-0.5">@{user?.username || 'username'}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition duration-150" 
          onClick={handleEdit}
        >
          Edit Profile
        </button>
        <button 
          className="px-4 py-2 text-sm font-medium rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 transition duration-150" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;