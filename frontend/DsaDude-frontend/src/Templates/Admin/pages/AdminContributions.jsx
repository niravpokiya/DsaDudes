import ContributionsSection from "../components/ContributionsSection";

const AdminContributions = () => {
  return (
    <div className="admin-grid" style={{ gap: "1rem" }}>
      <section className="admin-card" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <h2 className="admin-sectionTitle">Contributions</h2>
            <p className="admin-sectionText">All authored problems, drafts, and edits live here inside the admin workspace.</p>
          </div>
          <div className="admin-badge admin-badge--admin">managed content</div>
        </div>
      </section>

      <ContributionsSection />
    </div>
  );
};

export default AdminContributions;