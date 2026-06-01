const shellStyles = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "var(--bg-primary)",
};

const cardStyles = {
  width: "100%",
  maxWidth: "420px",
  border: "1px solid var(--border-primary)",
  borderRadius: "16px",
  background: "var(--bg-secondary)",
  padding: "28px",
  boxShadow: "var(--shadow-lg)",
};

const titleStyles = {
  margin: "0 0 8px",
  fontSize: "28px",
  lineHeight: 1.2,
  fontWeight: 700,
};

const subtitleStyles = {
  margin: 0,
  color: "var(--text-secondary)",
  fontSize: "14px",
  lineHeight: 1.5,
};

const AuthPageShell = ({ title, subtitle, children }) => {
  return (
    <main style={shellStyles}>
      <section style={cardStyles}>
        <header style={{ marginBottom: "24px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-accent)", fontWeight: 700 }}>
            DsaChamp Platform
          </p>
          <h1 style={titleStyles}>{title}</h1>
          <p style={subtitleStyles}>{subtitle}</p>
        </header>
        {children}
      </section>
    </main>
  );
};

export default AuthPageShell;