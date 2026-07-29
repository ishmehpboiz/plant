"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { waterPlant } from "@/lib/api";
import type { Plant } from "@/lib/types";

type Props = {
  plantId: number;
  onWatered: (plant: Plant) => void;
};

export function WaterButton({ plantId, onWatered }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleWater() {
    setBusy(true);
    setError(null);
    try {
      const updated = await waterPlant(plantId, { amount_liters: 0.5 });
      onWatered(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log watering");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="water-action">
      <motion.button
        type="button"
        className="btn btn--primary"
        onClick={handleWater}
        disabled={busy}
        whileTap={{ scale: 0.98 }}
      >
        {busy ? "Logging…" : "I watered it"}
      </motion.button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
