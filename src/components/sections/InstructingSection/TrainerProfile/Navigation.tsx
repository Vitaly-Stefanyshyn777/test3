import React from "react";
import styles from "./TrainerProfile.module.css";
import {
  ReviewIcon,
  GalleryIcon,
  DumbbellsIcon,
} from "@/components/Icons/Icons";

interface NavigationProps {
  activeSection: "overview" | "gallery" | "locations" | "favorite-exercise";
  onSectionClick: (
    section: "overview" | "gallery" | "locations" | "favorite-exercise"
  ) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onSectionClick,
}) => {
  const handleClick = (section: "overview" | "gallery" | "locations") => {
    onSectionClick(section);
  };

  return (
    <nav className={styles.navigation}>
      <a
        href="#overview"
        className={`${styles.navItem} ${
          activeSection === "overview" ? styles.active : ""
        }`}
        onClick={() => handleClick("overview")}
      >
        <span className={styles.navIcon}>
          <ReviewIcon />
        </span>
        <span
          className={`${styles.navText} ${
            activeSection === "overview" ? styles.active : ""
          }`}
        >
          Огляд
        </span>
      </a>
      <a
        href="#favorite-exercise"
        className={`${styles.navItem} ${
          activeSection === "gallery" ? styles.active : ""
        }`}
        onClick={() => handleClick("gallery")}
      >
        <span className={styles.navIcon}>
          <GalleryIcon />
        </span>
        <span
          className={`${styles.navText} ${
            activeSection === "gallery" ? styles.active : ""
          }`}
        >
          Галерея
        </span>
      </a>
      <a
        href="#locations"
        className={`${styles.navItem} ${
          activeSection === "locations" ? styles.active : ""
        }`}
        onClick={() => handleClick("locations")}
      >
        <span className={styles.navIcon}>
          <DumbbellsIcon />
        </span>
        <span
          className={`${styles.navText} ${
            activeSection === "locations" ? styles.active : ""
          }`}
        >
          Місця проведення тренувань
        </span>
      </a>
    </nav>
  );
};

export default Navigation;
