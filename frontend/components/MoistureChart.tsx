"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MoistureHistoryPoint } from "@/lib/types";

type Props = {
  history: MoistureHistoryPoint[];
};

export function MoistureChart({ history }: Props) {
  const data = history.map((h) => ({
    ...h,
    moisturePct: Math.round(h.moisture * 1000) / 10,
    label: h.date.slice(5),
  }));

  return (
    <div className="chart">
      <div className="chart__head">
        <h2>Moisture history</h2>
        <p>Simulated water balance over the last {history.length} days</p>
      </div>
      <div className="chart__body">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="moistureFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              domain={[0, 50]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 0,
                fontFamily: "var(--font-body)",
                fontSize: 13,
              }}
              formatter={(value) => [`${value}%`, "Moisture"]}
              labelFormatter={(label) => `Date · ${label}`}
            />
            <Area
              type="monotone"
              dataKey="moisturePct"
              stroke="var(--leaf-deep)"
              strokeWidth={2}
              fill="url(#moistureFill)"
              isAnimationActive
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
