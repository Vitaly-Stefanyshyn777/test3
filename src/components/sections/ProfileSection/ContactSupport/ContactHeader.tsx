"use client";

import React from "react";
import styles from "./ContactSupport.module.css";

export default function ContactHeader({ title }: { title: string }) {
  return <h2 className={styles.title}>{title}</h2>;
}
