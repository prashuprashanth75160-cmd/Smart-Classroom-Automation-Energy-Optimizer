import React, { useState } from 'react';
import { ClassroomState, WeeklyReport } from '../types';
import { 
  BarChart3, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download, 
  Table, 
  CheckCircle2, 
  Zap, 
  Leaf,
  Layers
} from 'lucide-react';

interface WeeklyReportsViewProps {
  classroom: ClassroomState;
  report: WeeklyReport;
}

export const WeeklyReportsView: React.FC<WeeklyReportsViewProps> = ({
  classroom,
  report,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const maxDayKwh = Math.max(...report.dailyRecords.map((r) => r.baselineKwh));

  const handleExportCsv = () => {
    const headers = ['Day', 'Baseline kWh', 'Optimized kWh', 'Saved kWh', 'Savings %', 'Cost Saved (INR)'];
    const rows = report.dailyRecords.map((r) => [
      r.day,
      r.baselineKwh,
      r.optimizedKwh,
      r.savedKwh,
      `${r.savingsPct}%`,
      r.costSaved,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${classroom.id}_weekly_energy_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-lg mt-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 glow-cyan">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Weekly Energy Audit & Cost Savings Report</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                PANDAS ENGINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              7-Day comparative evaluation of energy consumed, power saved, and financial yield
            </p>
          </div>
        </div>

        {/* View toggles & Export */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex items-center">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                viewMode === 'chart' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chart View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                viewMode === 'table' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Data Table
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Download report as CSV file for Excel / Pandas"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400 font-semibold block">
            Weekly Baseline Consumption
          </span>
          <span className="text-xl font-mono font-bold text-rose-400">
            {report.weeklyTotalBaselineKwh} <span className="text-xs text-slate-400">kWh</span>
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400 font-semibold block">
            Weekly Smart Optimized
          </span>
          <span className="text-xl font-mono font-bold text-emerald-400">
            {report.weeklyTotalOptimizedKwh} <span className="text-xs text-slate-400">kWh</span>
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 glow-emerald">
          <span className="text-[10px] uppercase text-emerald-400 font-semibold block">
            Net Energy Saved
          </span>
          <span className="text-xl font-mono font-black text-white">
            {report.weeklyTotalSavedKwh} <span className="text-xs text-emerald-400">kWh ({report.weeklyAverageSavingsPct}%)</span>
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase text-amber-400 font-semibold block">
            Total Financial Savings
          </span>
          <span className="text-xl font-mono font-bold text-amber-400">
            ₹{report.weeklyTotalCostSaved}
          </span>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' ? (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Day-by-Day Energy Profile: Baseline vs. Optimized (kWh)</span>
            </h4>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-sm bg-rose-500/80" />
                <span className="text-slate-400">Baseline (Unregulated)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-300">Optimized (SmartClass)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 pb-2 border-b border-slate-800">
            {report.dailyRecords.map((r) => {
              const baseHeightPct = (r.baselineKwh / maxDayKwh) * 100;
              const optHeightPct = (r.optimizedKwh / maxDayKwh) * 100;

              return (
                <div key={r.day} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-[10px] text-white p-1 rounded font-mono pointer-events-none mb-1 text-center whitespace-nowrap z-10 shadow-lg">
                    <span className="text-emerald-400 font-bold">-{r.savedKwh} kWh</span> (₹{r.costSaved})
                  </div>

                  <div className="flex items-end justify-center space-x-1 sm:space-x-2 w-full h-full">
                    {/* Baseline Bar */}
                    <div className="w-3 sm:w-5 bg-slate-800 rounded-t overflow-hidden flex flex-col justify-end">
                      <div
                        className="bg-rose-500/80 rounded-t transition-all duration-500 hover:brightness-125"
                        style={{ height: `${baseHeightPct}%` }}
                      />
                    </div>

                    {/* Optimized Bar */}
                    <div className="w-3 sm:w-5 bg-slate-800 rounded-t overflow-hidden flex flex-col justify-end">
                      <div
                        className="bg-emerald-500 rounded-t transition-all duration-500 hover:brightness-125"
                        style={{ height: `${optHeightPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Day Label */}
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2 truncate w-full text-center">
                    {r.day.slice(0, 3)}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 hidden sm:block">
                    -{r.savingsPct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Cost Savings Row */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center pt-3 text-[10px] font-mono text-slate-400">
            {report.dailyRecords.map((r) => (
              <div key={r.day}>
                <span className="text-amber-400 font-bold block">₹{r.costSaved}</span>
                <span className="text-[9px] text-slate-500">saved</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Day of Week</th>
                <th className="py-2.5 px-3 text-right">Baseline (kWh)</th>
                <th className="py-2.5 px-3 text-right">Optimized (kWh)</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Net Saved (kWh)</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Reduction %</th>
                <th className="py-2.5 px-3 text-right text-amber-400">Cost Saved (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {report.dailyRecords.map((r) => (
                <tr key={r.day} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{r.day}</td>
                  <td className="py-2.5 px-3 text-right text-rose-300">{r.baselineKwh}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{r.optimizedKwh}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">+{r.savedKwh}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-300 font-semibold">{r.savingsPct}%</td>
                  <td className="py-2.5 px-3 text-right text-amber-400 font-bold">₹{r.costSaved}</td>
                </tr>
              ))}
              {/* Total Summary Row */}
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                <td className="py-3 px-3 text-white uppercase">Weekly Total</td>
                <td className="py-3 px-3 text-right text-rose-400">{report.weeklyTotalBaselineKwh} kWh</td>
                <td className="py-3 px-3 text-right text-slate-200">{report.weeklyTotalOptimizedKwh} kWh</td>
                <td className="py-3 px-3 text-right text-emerald-400 font-black">+{report.weeklyTotalSavedKwh} kWh</td>
                <td className="py-3 px-3 text-right text-emerald-400">{report.weeklyAverageSavingsPct}%</td>
                <td className="py-3 px-3 text-right text-amber-400 text-sm">₹{report.weeklyTotalCostSaved}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Carbon Offsets & Ecological Impact */}
      <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Leaf className="w-4 h-4" />
          <span>
            <strong>Environmental Benefit:</strong> Saving {report.weeklyTotalSavedKwh} kWh prevents approx{' '}
            <strong className="text-white">{(report.weeklyTotalSavedKwh * 0.82).toFixed(1)} kg</strong> of CO₂ emissions each week.
          </span>
        </div>
        <span className="text-slate-500 text-[11px] font-mono">
          DSU Campus Sustainability Metric
        </span>
      </div>
    </div>
  );
};
