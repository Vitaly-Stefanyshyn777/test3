"use client";
import React from "react";
import TrainerMap from "@/components/sections/ContactsSection/TrainerMap/TrainerMap";
import ContactsSection from "@/components/sections/ContactsSection/ContactsSection";
import s from "./ContactsPageSection.module.css";

const ContactsPageSection: React.FC = () => {
  return (
    <section className={s.section}>
      <div className={s.inner}>
        <ContactsSection />
        <TrainerMap />
      </div>
    </section>
  );
};

export default ContactsPageSection;
