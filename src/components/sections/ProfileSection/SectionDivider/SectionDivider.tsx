import React from "react";
import styles from "./SectionDivider.module.css";

interface SectionDividerProps {
  className?: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ className = "" }) => {
  return (
    <div className={`${styles.divider} ${className}`}>
      <div className={styles.line} />
    </div>
  );
};

export default SectionDivider;

