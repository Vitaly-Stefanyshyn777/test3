import React from "react";
import ProfileSection from "../../../components/sections/ProfileSection/ProfileSection";
import PurchasedCourses from "../../../components/sections/ProfileSection/PurchasedCourses/PurchasedCourses";

const CoursesPage: React.FC = () => {
  return (
    <ProfileSection>
      <PurchasedCourses />
    </ProfileSection>
  );
};

export default CoursesPage;
