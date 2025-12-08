import CoursePage from "@/components/sections/CoursesSection/CoursePage/CoursePage";
import React from "react";

// Узгоджуємося з типами у твоєму проєкті: params як Promise
interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoursePageRoute({ params }: CoursePageProps) {
  const { slug } = await params;
  // Передаємо slug як є (як у продуктів) - логіка пошуку за ID або slug буде в courseQuery
  return <CoursePage courseIdOrSlug={slug} />;
}
