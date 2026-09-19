import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { compactNumber } from "../../utils/chartData";

export const CHART_COLORS = [
  "#10b981",
  "#34d399",
  "#2dd4bf",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f43f5e",
];

const tooltipStyle = {
  backgroundColor: "#12151c",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#e2e8f0",
};

const ChartRenderer = ({
  type,
  data,
  xKey,
  yKey,
  height = 380,
  compact = false,
}) => {
  const common = {
    margin: { top: 10, right: 10, left: 0, bottom: 0 },
  };

  const axisProps = {
    stroke: "#475569",
    tick: { fill: "#94a3b8", fontSize: compact ? 9 : 11 },
    tickFormatter: compactNumber,
  };
  {
    !compact && <YAxis {...axisProps} width={54} />;
  }
  if (!data.length) return null;

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={380}>
        <PieChart>
          <Pie
            data={data}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={135}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                stroke="#0b0d12"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => compactNumber(v)}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} {...common}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={54} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => compactNumber(v)}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={data} {...common}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={54} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(16,185,129,0.06)" }}
          formatter={(v) => compactNumber(v)}
        />
        <Bar
          dataKey={yKey}
          radius={[6, 6, 0, 0]}
          fill="#10b981"
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartRenderer;
