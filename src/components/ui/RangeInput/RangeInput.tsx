import { useState } from "react";
import styles from "./RangeInput.module.css";
import { MinuswIcon, PlusIcon } from "@/components/Icons/Icons";

interface RangeInputProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (values: { min: number; max: number }) => void;
}

export const RangeInput: React.FC<RangeInputProps> = ({
  min,
  max,
  value,
  onChange,
}) => {
  const getPercent = (val: number) => ((val - min) / (max - min)) * 100;
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeThumb, setActiveThumb] = useState<"left" | "right" | null>(null);
  const leftPercent = getPercent(value.min);
  const rightPercent = getPercent(value.max);

  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.filterSection} ${
          !isExpanded ? styles.collapsedSection : ""
        }`}
      >
        <div className={styles.sectionTitleContainer} onClick={toggleSection}>
          <h3 className={styles.sectionTitle}>Фільтрувати за ціною</h3>
          {isExpanded ? <MinuswIcon /> : <PlusIcon />}
        </div>
        <div
          className={`${styles.sectionContent} ${
            isExpanded ? styles.expanded : styles.collapsed
          }`}
        >
          <div className={styles.slider}>
            <div className={styles.valuesContainer}>
              <div className={styles.slider__leftValue}>
                <div className={styles.fromLabel}>Від</div>
                <span> {value.min} ₴</span>
              </div>
              <div className={styles.lineBetween} />
              <div className={styles.slider__rightValue}>
                <div className={styles.fromLabel}>До</div>
                <span>{value.max} ₴ </span>
              </div>
            </div>
            <div className={styles.slider__track} />
            <div
              className={styles.slider__range}
              style={{
                left: `${leftPercent}%`,
                width: `${rightPercent - leftPercent}%`,
              }}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={value.min}
              onChange={(e) => {
                const newMin = Math.min(+e.target.value, value.max - 1);
                onChange({ ...value, min: newMin });
              }}
              onMouseDown={() => setActiveThumb("left")}
              onTouchStart={() => setActiveThumb("left")}
              onMouseUp={() => setActiveThumb(null)}
              onTouchEnd={() => setActiveThumb(null)}
              className={`${styles.thumb} ${styles["thumb--left"]}`}
              style={{ zIndex: activeThumb === "left" ? 7 : 6 }}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={value.max}
              onChange={(e) => {
                const newMax = Math.max(+e.target.value, value.min + 1);
                onChange({ ...value, max: newMax });
              }}
              onMouseDown={() => setActiveThumb("right")}
              onTouchStart={() => setActiveThumb("right")}
              onMouseUp={() => setActiveThumb(null)}
              onTouchEnd={() => setActiveThumb(null)}
              className={`${styles.thumb} ${styles["thumb--right"]}`}
              style={{ zIndex: activeThumb === "right" ? 8 : 5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
