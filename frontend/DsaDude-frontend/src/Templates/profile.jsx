import React, { useContext } from "react";
import { UserContext } from "../Context/userContext";

function Profile() {
  const { user, loading } = useContext(UserContext);

  if (loading) return <p>Loading...</p>;

  console.log(user);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}

export default Profile;
