const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border-secondary)" }}>
    <span style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 650 }}>{label}</span>
    <span style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 750, textAlign: "right" }}>{value || "-"}</span>
  </div>
);

const ProfileAbout = ({ user }) => {
  return (
    <div>
      <div className="page-eyebrow">About</div>
      <h3>Account details</h3>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
        <Row label="Email" value={user?.email || "Unavailable"} />
        <Row label="First name" value={user?.firstName || "Not set"} />
        <Row label="Last name" value={user?.lastName || "Not set"} />
        <Row label="Bio" value={user?.bio || "Tell the world about yourself"} />
        <Row label="Provider" value={user?.provider || "Local"} />
        <Row label="Joined" value={user?.createdAt ? new Date(user.createdAt).toDateString() : "Recently"} />
        <Row label="Role" value={user?.role || "USER"} />
      </div>
    </div>
  );
};

export default ProfileAbout;
