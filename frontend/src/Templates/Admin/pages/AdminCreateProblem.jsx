import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../Context/userContext";
import { create_draft_problem } from "../../../utils/problem-apis";

const AdminCreateProblem = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleCreateDraft = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await create_draft_problem();
      const draftId = response?.data?.data?.id;

      if (!draftId) {
        throw new Error("Draft problem id was not returned.");
      }

      navigate(`/admin/problems/${draftId}`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to create a draft problem.";
      if (showToast) {
        showToast(message);
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-card" style={{ padding: "1.4rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        <div>
          <div className="page-eyebrow">Create draft problem</div>
          <h2 className="admin-sectionTitle" style={{ fontSize: "1.8rem", marginTop: "0.35rem" }}>Launch a new problem draft</h2>
          <p className="admin-sectionText" style={{ maxWidth: "760px" }}>
            This is a dedicated admin flow. It creates a blank draft, then opens the editor in the admin workspace so the public app never exposes this path.
          </p>

          <div className="admin-actions" style={{ marginTop: "1rem" }}>
            <button type="button" className="admin-actionButton" onClick={handleCreateDraft} disabled={loading}>
              {loading ? "Creating draft..." : "Create draft problem"}
            </button>
            <button type="button" className="admin-actionButton admin-actionButton--ghost" onClick={() => navigate("/admin/contributions")}>
              View contributions
            </button>
          </div>
        </div>

        <div className="admin-card" style={{ padding: "1rem", background: "var(--surface-soft)" }}>
          <div className="admin-sectionTitle">Draft flow</div>
          <ol style={{ margin: "0.8rem 0 0", paddingLeft: "1.2rem", lineHeight: 1.8, color: "var(--text-secondary)" }}>
            <li>Create a draft record.</li>
            <li>Open the admin editor.</li>
            <li>Write statement, topics, and testcase upload.</li>
            <li>Save without leaking into the public UI.</li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default AdminCreateProblem;
