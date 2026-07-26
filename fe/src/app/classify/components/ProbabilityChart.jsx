"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3 shadow-xl backdrop-blur-md">
        <p className={`text-xs font-bold ${data.textColor}`}>{data.name}</p>
        <p className="text-base font-extrabold text-(--color-text-primary)">
          {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

export default function ProbabilityChart({ chartData }) {
  if (!chartData) return null;

  return (
    <div className="space-y-4">
      <div className="h-64 w-full pt-2 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 10,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              opacity={1}
            />
            <XAxis
              dataKey="name"
              tick={{
                fill: "var(--color-text-secondary)",
                fontSize: 12,
                fontWeight: 600,
              }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              unit="%"
              domain={[0, 100]}
              tick={{
                fill: "var(--color-text-muted)",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "var(--color-surface-hover)",
                opacity: 0.4,
              }}
            />
            <Bar
              dataKey="percentage"
              radius={[8, 8, 0, 0]}
              barSize={100}
              animationDuration={50}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
