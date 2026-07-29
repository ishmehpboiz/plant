"use client";

import { useEffect, useState } from "react";
import { getRecentWaterings } from "@/lib/api";
import { InsightCard } from "./InsightCard";
import type { WateringLogEntry } from "@/lib/types";

type Props = {
  refreshKey: number;
};

function formatWhen(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00Z` : iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function WateringLog({ refreshKey }: Props) {
  const [entries, setEntries] = useState<WateringLogEntry[] | null>(null);

  useEffect(() => {
    getRecentWaterings(8).then(setEntries).catch(() => setEntries([]));
  }, [refreshKey]);

  return (
    <InsightCard>
      <p className="insight-card__heading">Recent watering</p>
      {!entries && <p className="insight-card__empty">Loading…</p>}
      {entries && entries.length === 0 && (
        <p className="insight-card__empty">No watering events logged yet.</p>
      )}
      {entries && entries.length > 0 && (
        <ul className="watering-log watering-log--timeline">
          {entries.map((e, i) => (
            <li key={`${e.plant_id}-${e.watered_at}-${i}`}>
              <span className="watering-log__node" aria-hidden />
              <span className="watering-log__plant">{e.plant_name}</span>
              <span className="watering-log__amount">
                {Number.isNaN(e.amount_liters) ? "—" : `${e.amount_liters}L`}
              </span>
              <span className="watering-log__when">{formatWhen(e.watered_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </InsightCard>
  );
}
