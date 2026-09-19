import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FiUsers,
  FiFolder,
  FiPieChart,
  FiDatabase,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";
import api from "../../api/axios";
import Spinner from "../../components/ui/Spinner";
import { formatFileSize } from "../../utils/formatters";
import { CHART_COLORS } from "../../components/charts/ChartRenderer";

const statCard = (label, value, Icon, accent = false) => (
  <div
    key={label}
    className={`card p-6 ${accent ? "border-emerald-500/20" : ""}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p
          className={`font-display text-3xl font-bold mt-1.5 ${accent ? "text-emerald-400" : ""}`}
        >
          {value}
        </p>
      </div>
      <span
        className={`flex items-center justify-center w-11 h-11 rounded-xl ${
          accent
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            : "bg-white/[0.04] border border-white/[0.06] text-slate-400"
        }`}
      >
        <Icon size={19} />
      </span>
    </div>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, uploadsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/uploads", { params: { page: 1, limit: 8 } }), // sirf 8 chahiye!
        ]);
        setStats(statsRes.data);

        // ✅ Shape-safe
        const list = Array.isArray(uploadsRes.data)
          ? uploadsRes.data
          : uploadsRes.data.uploads || [];
        setUploads(list.slice(0, 8));
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
        Overview
      </h1>
      <p className="text-sm text-slate-400 mt-1">
        Platform activity at a glance.
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {statCard("Total Users", stats?.totalUsers ?? "—", FiUsers, true)}
        {statCard("Files Uploaded", stats?.totalFiles ?? "—", FiFolder)}
        {statCard("Charts Created", stats?.chartsCreated ?? "—", FiPieChart)}
        {statCard(
          "Storage Used",
          formatFileSize(stats?.storageUsed || 0),
          FiDatabase,
        )}
      </div>

      {/* Growth charts — 2 column grid */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        {/* Users */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.userGrowth || []}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#12151c",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#userGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Uploads — same structure, dataKey="uploads", gradient id alag */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4">Upload Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.uploadGrowth || []}>
              <defs>
                <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#12151c",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="uploads"
                stroke="#2dd4bf"
                strokeWidth={2.5}
                fill="url(#uploadGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== Row: Top Users + Chart Usage ===== */}
      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        {/* Top Users — 60% width */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <FiAward size={15} className="text-emerald-400" />
            <h3 className="text-sm font-semibold">Top Users</h3>
          </div>

          {!(stats?.topUsers?.length === 0) ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No uploads yet.
            </p>
          ) : (
            <div className="space-y-3">
              {(stats?.topUsers || []).map((u, i) => {
                const max = stats.topUsers[0].fileCount; // #1 for percentage bar
                return (
                  <div key={u._id} className="flex items-center gap-3">
                    {/* Rank */}
                    <span
                      className={`w-6 text-center font-display text-sm font-bold ${
                        i === 0
                          ? "text-amber-400"
                          : i === 1
                            ? "text-slate-300"
                            : i === 2
                              ? "text-orange-400"
                              : "text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </span>

                    {/* User + progress bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300 truncate">
                          {u.username}
                        </span>
                        <span className="text-slate-500 text-xs shrink-0 ml-2">
                          {u.fileCount} files • {formatFileSize(u.storage)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700/40 mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${(u.fileCount / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart Usage Pie — 40% width */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Chart Type Usage</h3>

          {!(stats?.chartUsage?.length === 0 )? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No charts created yet.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={stats?.chartUsage || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(stats?.chartUsage || []).map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        stroke="#0b0d12"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#12151c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend with counts */}
              <div className="flex justify-center gap-4 mt-2">
                {(stats?.chartUsage || []).map((c, i) => (
                  <span
                    key={c.name}
                    className="flex items-center gap-1.5 text-xs text-slate-400 capitalize"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    {c.name} ({c.value})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Recent activity */}
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
          <FiTrendingUp size={15} className="text-emerald-400" />
          <h3 className="text-sm font-semibold">Recent Uploads</h3>
        </div>

        {uploads.length === 0 ? (
          <p className="text-sm text-slate-500 px-5 py-8 text-center">
            No uploads yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                  <th className="text-left px-5 py-3 font-medium">File</th>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Size</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 text-slate-300">{u.fileName}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {u.user?.username || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {formatFileSize(u.fileSize)}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(u.uploadDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
