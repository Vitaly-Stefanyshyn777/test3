import React from "react";
import ProfileSection from "@/components/sections/ProfileSection/ProfileSection";
import TrainerProfile from "@/components/sections/ProfileSection/TrainerProfile/TrainerProfile";

const TrainerProfilePage: React.FC = () => {
  return (
    <ProfileSection>
      <TrainerProfile />
    </ProfileSection>
  );
};

export default TrainerProfilePage;
