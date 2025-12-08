"use client";
import React from "react";
import TrainerMap from "@/components/sections/ContactsSection/TrainerMap/TrainerMap";
import { TrainerUser } from "@/components/sections/types";
import ContactsSection from "@/components/sections/ContactsSection/ContactsSection";
import s from "./ContactsPageSection.module.css";

const ContactsPageSection: React.FC = () => {
  const mockTrainer: TrainerUser = {
    id: 0,
    my_wlocation: [
      {
        hl_input_text_title: "Gym Fit Dance FLY",
        hl_input_text_email: "bfb.board.ukraine@gmail.com",
        hl_input_text_phone: "+38 (99) 999 99 99",
        hl_input_text_schedule_five: "09:00 - 22:00",
        hl_input_text_schedule_two: "10:00 - 20:00",
        hl_input_text_address: "м. Київ, Хрещатик, будинок 23/A",
      },
    ],
    hl_data_gallery: [
      {
        hl_img_link_photo: [
          "https://via.placeholder.com/160x160/f0f0f0/666?text=Зал",
        ],
      },
      {
        hl_img_link_photo: [
          "https://via.placeholder.com/160x160/f0f0f0/666?text=Зал",
        ],
      },
    ],
  };

  return (
    <section className={s.section}>
      <div className={s.inner}>
        <ContactsSection />
        <TrainerMap trainer={mockTrainer} />
      </div>
    </section>
  );
};

export default ContactsPageSection;
