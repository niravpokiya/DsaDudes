import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../Context/userContext";
import { create_draft_problem } from "../../../utils/problem-apis";

const ContributeProblemSection = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(UserContext);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  const handleCreateProblem = async () => {
    if (isCreatingDraft) {
      return;
    }

    setIsCreatingDraft(true);

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
      setIsCreatingDraft(false);
    }
  };

  return (
    <section className="problems-card animate-fadeInUp" style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.75rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <p className="problem-editor-card__eyebrow">Problem authoring</p>
          <h2 style={{ margin: 0, fontSize: "1.75rem", color: "var(--text-primary)" }}>Contribute Problems</h2>
          <p className="text-secondary" style={{ marginTop: "0.5rem", maxWidth: "720px" }}>
            Start a fresh draft here. The editor opens after the draft is created so you can add the title, statement, topics, and testcases.
          </p>
        </div>
        <span className="problem-editor-card__pill">Admin only</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.9rem" }}>
        <button
          type="button"
          onClick={handleCreateProblem}
          disabled={isCreatingDraft}
          className="problem-editor-save-button"
        >
          {isCreatingDraft ? "Creating..." : "Create Problem Draft"}
        </button>

        <div className="text-secondary" style={{ fontSize: "0.95rem" }}>
          Reuses the existing draft creation API and problem editor workflow.
        </div>
      </div>
    </section>
  );
};

export default ContributeProblemSection;