import React from "react";
const Footer = () => {
  return (
    <footer className="bg-[#1E293B] text-sm text-gray-400 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        © {new Date().getFullYear()} DSADude. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
