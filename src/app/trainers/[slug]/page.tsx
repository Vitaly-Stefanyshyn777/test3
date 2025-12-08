import React from "react";
import TrainerProfile from "../../../components/sections/InstructingSection/TrainerProfile/TrainerProfile";

interface TrainersCatalogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TrainersCatalogPage({
  params,
}: TrainersCatalogPageProps) {
  const { slug } = await params;
  return <TrainerProfile trainerId={slug} />;
}
