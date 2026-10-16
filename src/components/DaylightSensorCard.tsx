import React from 'react';
import { ClassroomState } from '../types';
import { 
  SunMedium, 
  Sun, 
  CloudSun, 
  Moon, 
  AlertCircle, 
  Activity, 
  Sliders, 
  Settings2,
  CheckCircle2,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface DaylightSensorCardProps {
  classroom: ClassroomState;
  onUpdateAmbientLux: (lux: number) => void;
  onToggleSensorFault: (fault: boolean) => void;
  onUpdateTargetLux: (target: number) => void;
  onUpdateMinBrightness: (minPct: number) => void;
  onUpdateMaxBrightness: (maxPct: number) => void;
}

export const DaylightSensorCard: React.FC<DaylightSensorCardProps> = ({
  classroom,
  onUpdateAmbientLux,
  onToggleSensorFault,
  onUpdateTargetLux,
  onUpdateMinBrightness,
  onUpdateMaxBrightness,
}) => {
  const getLuxCondition = (lux: number) => {
    if (lux >= 600) return { label: 'Direct Sunlight / Bright Noon', color: 'text-amber-400', icon: Sun };
    if (lux >= 350) return { label: 'Diffused Daylight / Overcast', color: 'text-cyan-400', icon: CloudSun };
    if (lux >= 120) return { label: 'Twilight / Late Afternoon', color: 'text-indigo-400', icon: SunMedium };
    return { label: 'Night / Darkened Room', color: 'text-indigo-500', icon: Moon };
  };

  const cond = getLuxCondition(classroom.ambientLux);
  const IconComp = cond.icon;

  // Calculated natural light contribution %
  const daylightContributionPct = Math.min(100, Math.round((classroom.ambientLux / classroom.targetLux) * 100));

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg border transition ${
              classroom.luxSensorConnected 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 glow-amber' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <SunMedium className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Natural Daylight & Lux Sensor</span>
                <span className={`w-2 h-2 rounded-full ${classroom.luxSensorConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Compass className="w-3 h-3 inline text-slate-400" />
                <span>{classroom.daylightOrientation}</span>
              </p>
            </div>
          </div>

          {/* Fault injection button */}
          <button
            onClick={() => onToggleSensorFault(!classroom.luxSensorConnected)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border transition ${
              !classroom.luxSensorConnected
                ? 'bg-rose-950 text-rose-200 border-rose-700 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Inject sensor hardware fault to test fail-safe illumination fallback"
          >
            {!classroom.luxSensorConnected ? 'Sensor Faulted (Active)' : 'Inject Fault'}
          </button>
        </div>

        {/* Sensor Fault Alert */}
        {!classroom.luxSensorConnected && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>FAIL-SAFE ACTIVE:</strong> Lux photodiode read error. Lights automatically defaulted to safe 80% backup brightness.
            </span>
          </div>
        )}

        {/* Big Lux Readout & Condition Banner */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-slate-900 border border-slate-800 ${cond.color}`}>
              <IconComp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-white">
                  {classroom.ambientLux}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  LUX (lx)
                </span>
              </div>
              <span className={`text-[11px] font-medium ${cond.color}`}>
                {cond.label}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-emerald-400 font-bold block">
              {daylightContributionPct}% Target
            </span>
            <span className="text-[10px] text-slate-400">
              Harvested Solar
            </span>
          </div>
        </div>

        {/* Clearly Labelled Lux Simulator with Presets */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-semibold flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calibrated Daylight Simulator:</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">{classroom.ambientLux} lx</span>
          </div>

          {/* Quick Real-World Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
            <button
              onClick={() => onUpdateAmbientLux(850)}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-left border border-slate-700/60 transition"
            >
              <div className="text-[11px] font-bold text-amber-300">Sunny (850 lx)</div>
              <div className="text-[9px] text-slate-400">Dims lights to 15%</div>
            </button>

            <button
              onClick={() => onUpdateAmbientLux(450)}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-left border border-slate-700/60 transition"
            >
              <div className="text-[11px] font-bold text-cyan-300">Overcast (450 lx)</div>
              <div className="text-[9px] text-slate-400">Dims lights to 35%</div>
            </button>

            <button
              onClick={() => onUpdateAmbientLux(180)}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-left border border-slate-700/60 transition"
            >
              <div className="text-[11px] font-bold text-indigo-300">Twilight (180 lx)</div>
              <div className="text-[9px] text-slate-400">Lights to 75%</div>
            </button>

            <button
              onClick={() => onUpdateAmbientLux(15)}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-left border border-slate-700/60 transition"
            >
              <div className="text-[11px] font-bold text-indigo-400">Night (15 lx)</div>
              <div className="text-[9px] text-slate-400">Lights to 100%</div>
            </button>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={classroom.ambientLux}
            onChange={(e) => onUpdateAmbientLux(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
            <span>0 lx (Pitch Dark)</span>
            <span>500 lx (Target Illumination)</span>
            <span>1000 lx (High Noon)</span>
          </div>
        </div>

        {/* Configurable Thresholds */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target</span>
            <span className="text-xs font-mono font-bold text-slate-200">{classroom.targetLux} lx</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Min Floor</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{classroom.minBrightnessPct}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Max Ceiling</span>
            <span className="text-xs font-mono font-bold text-amber-400">{classroom.maxBrightnessPct}%</span>
          </div>
        </div>
      </div>

      {/* Footer Spec */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Sensor: <strong className="text-slate-200">BH1750 I2C Photodiode</strong></span>
        <span>Sampling: <strong className="text-slate-200">10 Hz Calibrated</strong></span>
        <span>Dimming Law: <strong className="text-emerald-400">Continuous Linear</strong></span>
      </div>
    </div>
  );
};
