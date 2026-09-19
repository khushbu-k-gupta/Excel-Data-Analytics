import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiTrendingUp, FiPieChart, FiArrowRight, FiSave } from 'react-icons/fi';
import { excelApi } from '../../api/excel.api';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ChartRenderer from '../../components/charts/ChartRenderer';
import { formatDate } from '../../utils/formatters';

const typeIcon = { bar: FiBarChart2, line: FiTrendingUp, pie: FiPieChart };

const Charts = () => {
  const navigate = useNavigate();
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await excelApi.getChartGallery();
        setCharts(data.charts);
      } catch {
        setCharts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Type breakdown badges
  const counts = charts.reduce((acc, c) => ({ ...acc, [c.chartType]: (acc[c.chartType] || 0) + 1 }), {});

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d12] pt-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Your Charts
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-slate-400">
                {charts.length} saved chart{charts.length !== 1 && 's'}
              </span>
              {Object.entries(counts).map(([type, count]) => {
                const Icon = typeIcon[type];
                return (
                  <span key={type} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-400">
                    <Icon size={11} className="text-emerald-400" /> {count}
                  </span>
                );
              })}
            </div>
          </div>
          <Link to="/dashboard" className="btn-ghost flex items-center gap-2 w-fit">
            Upload more files <FiArrowRight size={15} />
          </Link>
        </div>

        {/* Grid ya Empty */}
        {charts.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={FiSave}
              title="No saved charts yet"
              desc="Create a chart in Analytics and hit Save — it will show up here as your personal gallery."
              action={
                <Link to="/dashboard" className="btn-accent mx-auto flex items-center gap-2">
                  Go to Dashboard <FiArrowRight size={16} />
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {charts.map((chart) => {
              const Icon = typeIcon[chart.chartType] || FiBarChart2;
              return (
                <div
                  key={chart.id}
                  onClick={() => navigate(`/analytics/${chart.id}`)}
                  className="card p-5 cursor-pointer group hover:border-emerald-500/30 transition-all duration-300"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate group-hover:text-emerald-400 transition-colors" title={chart.fileName}>
                        {chart.fileName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {chart.axes.y} by {chart.axes.x}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium capitalize">
                      <Icon size={11} /> {chart.chartType}
                    </span>
                  </div>

                  {/* Mini chart — compact mode */}
                  <div className="mt-3 -mx-2">
                    <ChartRenderer
                      type={chart.chartType}
                      data={chart.data}
                      xKey="name"
                      yKey="value"
                      height={200}
                      compact
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2">
                    Saved {formatDate(chart.savedAt)} — click to edit
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;