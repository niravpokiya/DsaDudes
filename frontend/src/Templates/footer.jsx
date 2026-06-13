const Footer = () => {
  return (
    <footer className="text-sm py-4 mt-8" style={{ color: "var(--text-secondary)", background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-4 text-center">
        &copy; {new Date().getFullYear()} DSAChamp. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
