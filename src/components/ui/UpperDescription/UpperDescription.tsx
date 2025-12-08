import s from "./UpperDescription.module.css";

export default function UpperDescription({
  children,
  style,
}: {
  children: string;
  style?: string;
}) {
  return <p className={`${s.upperDescr} ${style && s[style]}`}>{children}</p>;
}
