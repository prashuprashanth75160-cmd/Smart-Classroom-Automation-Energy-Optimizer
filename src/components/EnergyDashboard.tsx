import React, { useState } from 'react';
import { ClassroomState, EnergyMetrics } from '../types';
import { 
  Zap, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Check, 
  Sliders, 
  Leaf, 
  Flame,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EnergyDashboardProps {
  classroom: ClassroomState;
  metrics: EnergyMetrics;
  onUpdateRatings: (ratings: ClassroomState['powerRatings']) => void;
  onUpdateTariff: (tariff: number) => void;
}

export const EnergyDashboard: React.FC<EnergyDashboardProps> = ({
  classroom,
  metrics,
  onUpdateRatings,
  onUpdateTariff,
}) => {
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [editRatings, setEditRatings] = useState(classroom.powerRatings);
  const [editTariff, setEditTariff] = useState(classroom.tariffRate);

  const handleSaveConfig = () => {
    onUpdateRatings(editRatings);
    onUpdateTariff(editTariff);
    setShowConfig(false);
  };

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-lg">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 glow-emerald">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Energy Optimization & Real-Time Power Telemetry</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                ACTIVE AUDIT
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live comparison: Unmanaged Continuous Baseline vs Smart Automated State
            </p>
          </div>
        </div>

        {/* Configure Ratings Toggle */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Configure Power Ratings (W)</span>
          {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Config Drawer */}
      {showConfig && (
        <div className="mb-5 p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configurable Device Electrical Load Ratings (Watts):</span>
            </h4>
            <span className="text-[11px] text-slate-500">Classroom: {classroom.name}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
                Luminaires (100%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={editRatings.lightWatts}
                  onChange={(e) => setEditRatings({ ...editRatings, lightWatts: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
                />
                <span className="absolute right-2 top-1 text-[10px] text-slate-500">W</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
                AC Unit Load
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={editRatings.acWatts}
                  onChange={(e) => setEditRatings({ ...editRatings, acWatts: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
                />
                <span className="absolute right-2 top-1 text-[10px] text-slate-500">W</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
                Ceiling Fans
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={editRatings.fanWatts}
                  onChange={(e) => setEditRatings({ ...editRatings, fanWatts: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
                />
                <span className="absolute right-2 top-1 text-[10px] text-slate-500">W</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
                Projector & Screen
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={editRatings.projectorWatts}
                  onChange={(e) => setEditRatings({ ...editRatings, projectorWatts: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
                />
                <span className="absolute right-2 top-1 text-[10px] text-slate-500">W</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
                Base Standby Load
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={editRatings.baseIdleWatts}
                  onChange={(e) => setEditRatings({ ...editRatings, baseIdleWatts: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
                />
                <span className="absolute right-2 top-1 text-[10px] text-slate-500">W</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
                Electricity Tariff
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.25"
                  value={editTariff}
                  onChange={(e) => setEditTariff(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
                />
                <span className="absolute right-2 top-1 text-[10px] text-slate-500">₹/kWh</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowConfig(false)}
              className="px-3 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-3 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Ratings</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Optimized Active Load */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Optimized Load</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {metrics.optimizedKw}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">kW</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            ({metrics.optimizedWatts} Watts real-time)
          </span>
        </div>

        {/* Baseline Wasteful Load */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Baseline (Unmanaged)</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-rose-400">
              {metrics.baselineKw}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">kW</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            ({metrics.baselineWatts} Watts standard)
          </span>
        </div>

        {/* Instantaneous Reduction */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 glow-emerald">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Instant Savings</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-white">
              {metrics.savingsPct}%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">SAVED</span>
          </div>
          <span className="text-[10px] text-emerald-400/90 font-mono">
            Curtailing -{metrics.kwSaved} kW
          </span>
        </div>

        {/* Cost Rate Saved */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hourly Cost Saved</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-amber-400">
              ₹{metrics.costSavedPerHour}
            </span>
            <span className="text-xs font-mono text-slate-400">/hr</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Current burn: ₹{metrics.costPerHour}/hr
          </span>
        </div>
      </div>

      {/* Energy Comparison Progress Bars */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-4">
        <div className="flex justify-between text-xs mb-2 font-semibold">
          <span className="text-slate-300">Continuous Electrical Load Comparison:</span>
          <span className="text-emerald-400 font-mono">
            Curtailing {metrics.wattsSaved} Watts right now
          </span>
        </div>

        {/* Baseline bar */}
        <div className="mb-2">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Baseline (Continuous Full Lights + Dual Fan/AC)</span>
            <span className="font-mono text-rose-300 font-bold">{metrics.baselineWatts} W</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-rose-500 h-full w-full rounded-full" />
          </div>
        </div>

        {/* Optimized bar */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Optimized (Daylight Dimmed + Interlocked HVAC)</span>
            <span className="font-mono text-emerald-300 font-bold">{metrics.optimizedWatts} W</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-700"
              style={{
                width: `${metrics.baselineWatts > 0 ? (metrics.optimizedWatts / metrics.baselineWatts) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Subsystem Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Luminaires</span>
          <span className="font-mono font-bold text-amber-400">{metrics.breakdown.lightingWatts} W</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">HVAC Cooling</span>
          <span className="font-mono font-bold text-cyan-400">{metrics.breakdown.hvacWatts} W</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Projector AV</span>
          <span className="font-mono font-bold text-purple-400">{metrics.breakdown.projectorWatts} W</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sensors & Idle</span>
          <span className="font-mono font-bold text-slate-300">{metrics.breakdown.baseWatts} W</span>
        </div>
      </div>
    </div>
  );
};
