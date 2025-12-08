import React from "react";
import ProfileSection from "@/components/sections/ProfileSection/ProfileSection";
import VideoInstruction from "@/components/sections/ProfileSection/VideoInstruction/VideoInstruction";
import ContactSupport from "@/components/sections/ProfileSection/ContactSupport/ContactSupport";
import SectionDivider from "@/components/sections/ProfileSection/SectionDivider/SectionDivider";

const ProfileGuidePage: React.FC = () => {
  return (
    <ProfileSection>
      <VideoInstruction />
      <SectionDivider />
      <ContactSupport />
    </ProfileSection>
  );
};

export default ProfileGuidePage;
