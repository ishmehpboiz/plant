"use client";

import { useReducedMotion } from "motion/react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PlantHistory, PlantListItem } from "@/lib/types";

type Props = {
  plants: PlantListItem[];
  histories: Record<number, PlantHistory>;
};

const PALETTE = ["#1f6f72", "#9c4221", "#2f4f3a", "#c99a3a", "#7a5a9e"];

function TrendTooltip({ active, payload, label, plants }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="trend-strip__tooltip">
      <p className="trend-strip__tooltip-date">{label}</p>
      {payload
        .slice()
        .sort((a: any, b: any) => b.value - a.value)
        .map((entry: any) => {
          const plant = plants.find((p: PlantListItem) => `p${p.id}` === entry.dataKey);
          return (
            <p key={entry.dataKey}>
              <i style={{ background: entry.stroke }} />
              {plant?.name ?? entry.dataKey}
              <b>{entry.value}%</b>
            </p>
          );
        })}
    </div>
  );
}

export function TrendStrip({ plants, histories }: Props) {
  const reduceMotion = useReducedMotion();
  const dates = Array.from(
    new Set(plants.flatMap((p) => (histories[p.id]?.history ?? []).map((h) => h.date))),
  ).sort();

  const data = dates.map((date) => {
    const row: Record<string, number | string> = { date, label: date.slice(5) };
    for (const plant of plants) {
      const point = histories[plant.id]?.history.find((h) => h.date === date);
      if (point) row[`p${plant.id}`] = Math.round(point.moisture * 1000) / 10;
    }
    return row;
  });

  return (
    <div className="insight-card">
      <p className="insight-card__heading">Garden-wide moisture, last 30 days</p>
      <div className="trend-strip__legend">
        {plants.map((plant, i) => (
          <span key={plant.id}>
            <i style={{ background: PALETTE[i % PALETTE.length] }} />
            {plant.name}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <pattern id="trendDots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.2" fill="var(--line)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#trendDots)" opacity={0.6} />
          <CartesianGrid stroke="var(--line)" strokeDasharray="2 5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            domain={[0, 50]}
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<TrendTooltip plants={plants} />} />
          {plants.map((plant, i) => {
            const color = PALETTE[i % PALETTE.length];
            return (
              <Line
                key={plant.id}
                type="natural"
                dataKey={`p${plant.id}`}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "var(--surface)",
                  style: { filter: `drop-shadow(0 0 5px ${color})` },
                }}
                connectNulls
                isAnimationActive={!reduceMotion}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
