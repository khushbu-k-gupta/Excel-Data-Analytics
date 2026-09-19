import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiDownload, FiSave, FiCheck, FiAlertTriangle,
  FiBarChart2, FiTrendingUp, FiPieChart, FiTable,
} from 'react-icons/fi';
import { excelApi } from '../../api/excel.api';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ChartRenderer from '../../components/charts/ChartRenderer';
import { aggregateData, topN } from '../../utils/chartData';

const CHART_TYPES = [
  { id: 'bar', icon: FiBarChart2, label: 'Bar' },
  { id: 'line', icon: FiTrendingUp, label: 'Line' },
  { id: 'pie', icon: FiPieChart, label: 'Pie' },
];

const Analytics = () => {
  const { fileId } = useParams();

  const [data, setData] = useState(null);      // { headers, columns, rows, totalRows, truncated }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [xKey, setXKey] = useState('');
  const [yKey, setYKey] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [mode, setMode] = useState('sum');     // sum | avg

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const chartRef = useRef(null);

  // ---------- FETCH ----------
  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await excelApi.getAnalytics(fileId);
        setData(res);
        setError('');

        // Smart defaults — pehli string/date column → X, pehli number → Y
        const cat = res.columns.find((c) => c.type !== 'number');
        const num = res.columns.find((c) => c.type === 'number');
        if (cat) setXKey(cat.name);
        if (num) setYKey(num.name);
      } catch {
        setError('Could not load this file. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fileId]);

  // ---------- ROWS[] → OBJECTS ----------
  // Backend arrays bhejta hai — { "Category": "A", "Sales": 500 } banao (ek baar)
  const rowObjects = useMemo(() => {
    if (!data) return [];
    return data.rows.map((row) =>
      Object.fromEntries(data.headers.map((h, i) => [h, row[i]]))
    );
  }, [data]);

  // ---------- AGGREGATED CHART DATA ----------
  const chartData = useMemo(() => {
    if (!xKey || !yKey || !rowObjects.length) return [];
    const agg = aggregateData(rowObjects, xKey, yKey, mode);
    return chartType === 'pie' ? topN(agg, xKey, yKey) : agg;
  }, [rowObjects, xKey, yKey, mode, chartType]);

  const hasNumeric = data?.columns.some((c) => c.type === 'number');
  const xOptions = data?.columns.filter((c) => c.type !== 'number') || [];
  const yOptions = data?.columns.filter((c) => c.type === 'number') || [];

  // ---------- SAVE CONFIG ----------
  const handleSave = async () => {
    try {
      setSaving(true);
      await excelApi.updateChart(fileId, { xAxis: xKey, yAxis: yKey, chartType });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- DOWNLOAD PNG ----------
  const handleDownload = () => {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;

    const { width, height } = svg.getBoundingClientRect();

    // Clone karo — original ko chhedo mat, explicit px size set karo
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);

    const svgData = new XMLSerializer().serializeToString(clone);
    const canvas = document.createElement('canvas');
    const scale = 2; // retina quality
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b0d12'; // dark bg — warna transparent PNG
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `${data.fileName?.replace(/\.[^.]+$/, '') || 'chart'}-${chartType}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // ---------- RENDER STATES ----------
  if (loading) return <div className="min-h-screen bg-[#0b0d12] pt-24"><Spinner size="lg" /></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0d12] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2 -ml-5">
            <FiArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="mt-8">
            <EmptyState
              icon={FiAlertTriangle}
              title="File not found"
              desc="This file may have been deleted or you don't have access to it."
              action={<Link to="/dashboard" className="btn-accent mx-auto">Go to Dashboard</Link>}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition w-fit">
          <FiArrowLeft size={15} /> Back to files
        </Link>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight truncate">
              {data.fileName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                {data.totalRows.toLocaleString()} rows
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                {data.headers.length} columns
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                {data.sheetName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !yKey}
              className="btn-ghost flex items-center gap-2 disabled:opacity-50"
            >
              {saved ? <><FiCheck size={16} className="text-emerald-400" /> Saved!</> : <><FiSave size={16} /> Save Chart</>}
            </button>
            <button onClick={handleDownload} disabled={!yKey} className="btn-accent flex items-center gap-2 disabled:opacity-50">
              <FiDownload size={16} /> Download PNG
            </button>
          </div>
        </div>

        {/* Truncated warning */}
        {data.truncated && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-400">
            <FiAlertTriangle size={16} className="shrink-0" />
            Showing first 500 of {data.totalRows.toLocaleString()} rows — charts use this sample.
          </div>
        )}

        {/* Controls + Chart */}
        {hasNumeric ? (
          <>
            <div className="card mt-6 p-5">
              <div className="grid md:grid-cols-4 gap-4">

                {/* X axis */}
                <div>
                  <label className="text-xs font-medium text-slate-400">X axis (category)</label>
                  <select value={xKey} onChange={(e) => setXKey(e.target.value)} className="input-dark mt-1.5">
                    {xOptions.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Y axis */}
                <div>
                  <label className="text-xs font-medium text-slate-400">Y axis (value)</label>
                  <select value={yKey} onChange={(e) => setYKey(e.target.value)} className="input-dark mt-1.5">
                    {yOptions.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Aggregate mode */}
                <div>
                  <label className="text-xs font-medium text-slate-400">Aggregate</label>
                  <div className="flex mt-1.5 rounded-xl border border-white/10 overflow-hidden">
                    {['sum', 'avg'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-2 text-xs font-medium capitalize transition ${
                          mode === m ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-white/[0.04]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart type tabs */}
                <div>
                  <label className="text-xs font-medium text-slate-400">Chart type</label>
                  <div className="flex mt-1.5 gap-1 rounded-xl border border-white/10 p-1">
                    {CHART_TYPES.map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setChartType(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          chartType === id
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-400 hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="card mt-4 p-6" ref={chartRef}>
              {chartData.length ? (
                <ChartRenderer type={chartType} data={chartData} xKey={xKey} yKey={yKey} />
              ) : (
                <div className="py-16 text-center text-sm text-slate-400">
                  No valid data points for this selection. Try different columns.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={FiBarChart2}
              title="No numeric columns"
              desc="Charts need at least one numeric column. This file only has text data."
            />
          </div>
        )}

        {/* Data preview */}
        <div className="card mt-4 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
            <FiTable size={15} className="text-emerald-400" />
            <h3 className="text-sm font-semibold">Data preview</h3>
            <span className="text-xs text-slate-500">(first 8 rows)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {data.headers.map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowObjects.slice(0, 8).map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    {data.headers.map((h) => (
                      <td key={h} className="px-5 py-2.5 text-slate-300 whitespace-nowrap">
                        {row[h] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;