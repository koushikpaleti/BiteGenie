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

export function MacroChart({
  data,
}: {
  data: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    budget: number;
  }>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f172a" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 20px 50px -30px rgba(15,23,42,0.5)",
            }}
          />
          <Area
            type="monotone"
            dataKey="calories"
            stroke="#0f172a"
            strokeWidth={2.4}
            fill="url(#caloriesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
