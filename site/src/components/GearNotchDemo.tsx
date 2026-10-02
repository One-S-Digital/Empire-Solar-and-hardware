"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Gear } from "./Gear";

/** Styleguide only: shows the one-tooth turn that the Add to list button will use. */
export function GearNotchDemo() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <Button variant="secondary" onClick={() => setCount((c) => c + 1)}>
        <Gear size={18} notches={count} /> Add to list
      </Button>
      <span className="mono" aria-live="polite">
        {count} {count === 1 ? "item" : "items"} on the list
      </span>
    </div>
  );
}
