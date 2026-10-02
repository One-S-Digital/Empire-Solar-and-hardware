import { Droplets, Drill, Hammer, Lightbulb, Nut, PaintBucket, Sun, Wind, Zap, Package, type LucideProps } from "lucide-react";

const ICONS = {
  plumbing: Droplets,
  electrical: Zap,
  lighting: Lightbulb,
  "solar-backup-power": Sun,
  "power-tools": Drill,
  "hand-tools": Hammer,
  "fixings-adhesives": Nut,
  "air-tools-compressors": Wind,
  "paint-waterproofing": PaintBucket,
} as const;

/** One Lucide icon per department: used for photo fallbacks and tiles. */
export function DepartmentIcon({ dept, ...props }: { dept: string } & LucideProps) {
  const Icon = ICONS[dept as keyof typeof ICONS] ?? Package;
  return <Icon aria-hidden="true" {...props} />;
}
