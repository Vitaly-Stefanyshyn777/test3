"use client";
import React from "react";
import { useUserProfile } from "./useUserProfile";
import UserProfileHeader from "./UserProfileHeader";
import UserProfileSkeleton from "./UserProfileSkeleton";

interface UserProfileProps {
  name?: string;
  email?: string;
  avatar?: string;
  notificationsCount?: number;
}

const UserProfile: React.FC<UserProfileProps> = () => {
  const { isHydrated, isReady, displayName, email, avatar } = useUserProfile();
  if (!isHydrated || !isReady) return <UserProfileSkeleton />;
  return (
    <UserProfileHeader
      displayName={displayName}
      email={email}
      avatar={avatar}
    />
  );
};

export default UserProfile;
