import React from "react";
import ProfileSection from "@/components/sections/ProfileSection/ProfileSection";
import PersonalData from "@/components/sections/ProfileSection/PersonalData/PersonalData";

const PersonalDataPage: React.FC = () => {
  return (
    <ProfileSection>
      <PersonalData />
    </ProfileSection>
  );
};

export default PersonalDataPage;
