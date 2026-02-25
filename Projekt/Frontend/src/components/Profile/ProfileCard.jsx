import React from "react";
import { User } from "lucide-react";

export default function ProfileCard({ username, email, AvatarIcon }) {
  const Icon = AvatarIcon || User;
  return (
    <div className="profile-card-div">
      <div className="profile-avatar">
        <Icon size={48} />
      </div>
      <div className="profile-info">
        <h2 className="username">@{(username || "").toLowerCase()}</h2>
        <p className="email">{email}</p>
      </div>
    </div>
  );
}
