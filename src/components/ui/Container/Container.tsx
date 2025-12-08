import { ReactNode } from "react";
import s from "./Container.module.css";

export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${s.container} ${className}`}>{children}</div>;
}
