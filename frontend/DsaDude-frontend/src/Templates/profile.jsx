import React, { useContext } from "react";
import { UserContext } from "../Context/userContext";
import ProfileAbout from "./Profile/ProfileAbout";
import ProfileHeader from "./Profile/ProfileHeader";
import ProfileHeatmap from "./Profile/ProfileHeatmap";
import ProfileStats from "./Profile/ProfileStats";

function Profile() {
  const { user, loading } = useContext(UserContext);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="space-y-4">
          <ProfileHeader user={user} />
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Progress Overview</h3>
            <ProfileStats user={user} />
          </div>
          <ProfileHeatmap activityByDate={{}} />
        </div>
        <div className="space-y-4">
          <ProfileAbout user={user} />
        </div>
      </div>
    </div>
  );
}

export default Profile;
