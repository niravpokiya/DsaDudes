import { Link, NavLink } from "react-router-dom";

const NavBar = () => {
  return (
        <nav className="bg-[#111111] shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4">
        <div className="flex justify-between h-12 items-center">
          <Link to="/" className="text-lg font-bold text-gray-200">
            DSADude
          </Link>
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link to="/problems" className="text-gray-300 hover:text-white">Problems</Link>
            <Link to="/submissions" className="text-gray-300 hover:text-white">Submissions</Link>
            <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
          </div>
        </div>
      </div>
    </nav>

  );
};

export default NavBar;
