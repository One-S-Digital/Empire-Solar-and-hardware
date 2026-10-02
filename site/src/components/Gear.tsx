import styles from "./Gear.module.css";

const TEETH = 12; // 12 teeth x 30 degrees = one full turn, so "one tooth" is the 30 degree notch
const OUTER = 11;
const ROOT = 8.4;

/** Gear outline built from geometry: one tooth every 30 degrees. */
function gearPath() {
  const step = (Math.PI * 2) / TEETH;
  const pt = (r: number, a: number) =>
    `${(12 + r * Math.sin(a)).toFixed(2)} ${(12 - r * Math.cos(a)).toFixed(2)}`;
  const parts: string[] = [];
  for (let i = 0; i < TEETH; i++) {
    const a = i * step;
    const cmd = i === 0 ? "M" : "L";
    parts.push(
      `${cmd}${pt(ROOT, a - step * 0.42)}`,
      `L${pt(OUTER, a - step * 0.22)}`,
      `L${pt(OUTER, a + step * 0.22)}`,
      `L${pt(ROOT, a + step * 0.42)}`,
    );
  }
  parts.push("Z");
  // Hub hole, drawn with even-odd fill
  parts.push(`M12 8.6a3.4 3.4 0 1 0 0 6.8a3.4 3.4 0 1 0 0-6.8Z`);
  return parts.join("");
}

const PATH = gearPath();

type GearProps = {
  size?: number;
  /** Rotation in 30 degree notches (enquiry list icon turns one tooth on Add) */
  notches?: number;
  /** Continuous spin: the loading indicator */
  spinning?: boolean;
  className?: string;
};

/** The gear from the logo: the one custom mark (list icon, loading indicator). */
export function Gear({ size = 20, notches = 0, spinning = false, className }: GearProps) {
  return (
    <svg
      className={[styles.gear, spinning ? styles.spin : "", className ?? ""].join(" ").trim()}
      style={spinning ? undefined : { transform: `rotate(${notches * 30}deg)` }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATH} />
    </svg>
  );
}
