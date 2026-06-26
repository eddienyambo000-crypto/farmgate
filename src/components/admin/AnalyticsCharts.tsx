"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FOREST = "#2d6a4f";
const GOLD = "#c9a84c";

export function LeadsTrend({
  data,
}: {
  data: { day: string; leads: number }[];
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
      <h2 className="mb-4 font-display text-lg font-bold text-ink">
        Leads — last 14 days
      </h2>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={FOREST} stopOpacity={0.35} />
                <stop offset="100%" stopColor={FOREST} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2dccf" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b766f" }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b766f" }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2dccf", fontSize: 13 }}
              labelStyle={{ color: "#14241c", fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="leads" stroke={FOREST} strokeWidth={2.5} fill="url(#leadFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ListingsByType({
  data,
}: {
  data: { type: string; count: number }[];
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
      <h2 className="mb-4 font-display text-lg font-bold text-ink">
        Listings by animal
      </h2>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2dccf" vertical={false} />
            <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#6b766f" }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b766f" }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              cursor={{ fill: "rgba(45,106,79,0.06)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2dccf", fontSize: 13 }}
              labelStyle={{ color: "#14241c", fontWeight: 600, textTransform: "capitalize" }}
            />
            <Bar dataKey="count" fill={GOLD} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
