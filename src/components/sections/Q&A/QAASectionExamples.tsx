"use client";
import React from "react";
import QAASection from "./QAASection";

// Приклади використання QAASection з різними категоріями
const QAASectionExamples: React.FC = () => {
  return (
    <div>
      <h1>Приклади використання QAASection</h1>

      {/* Поточні категорії */}
      <QAASection categoryType="main" />
      <QAASection categoryType="boards" />

      {/* Майбутні категорії */}
      <QAASection categoryType="course" />
      <QAASection categoryType="training" />
      <QAASection categoryType="coach" />

      {/* Без фільтрації - всі FAQ */}
      <QAASection />
    </div>
  );
};

export default QAASectionExamples;
