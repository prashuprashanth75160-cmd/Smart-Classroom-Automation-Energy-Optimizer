import React from 'react';
import { ClassroomState, HVACMode } from '../types';
import { 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
  Power, 
  Lightbulb, 
  Wind, 
  Snowflake, 
  Tv, 
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface ManualOverridePanelProps {
  classroom: ClassroomState;
  onToggleOverride: (active: boolean) => void;
  onManualLightBrightness: (pct: number) => void;
  onManualHVACMode: (mode: HVACMode) => void;
  onManualScreen: (pos: ClassroomState['screenPosition']) => void;
}

export const ManualOverridePanel: React.FC<ManualOverridePanelProps> = ({
  classroom,
  onToggleOverride,
  onManualLightBrightness,
  onManualHVACMode,
  onManualScreen,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-lg mt-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg border transition ${
            classroom.manualOverrideActive
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 glow-amber'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Manual Override Control & Hardware Boundary</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                classroom.manualOverrideActive
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {classroom.manualOverrideActive ? 'MANUAL OVERRIDE ENGAGED' : 'AUTONOMOUS AI RUNNING'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Emergency bypass for classroom instructor / facility manager
            </p>
          </div>
        </div>

        {/* Master Override Toggle */}
        <button
          onClick={() => onToggleOverride(!classroom.manualOverrideActive)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition ${
            classroom.manualOverrideActive
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          {classroom.manualOverrideActive ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Autonomous AI Control</span>
            </>
          ) : (
            <>
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Enable Manual Override</span>
            </>
          )}
        </button>
      </div>

      {/* Hardware Boundary Disclaimer (Strict Requirement) */}
      <div className="mb-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start space-x-2.5 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200 block">
            Hardware Isolation Boundary Active:
          </span>
          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
            All actuation actions above are executed inside the validated software sandbox. Real high-voltage relays (Modbus / BACnet / MQTT / GPIO) remain safely decoupled because no verified physical IoT gateway hardware is actively paired in this browser session.
          </p>
        </div>
      </div>

      {/* Manual Controls Grid (Active when override enabled) */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl border transition ${
        classroom.manualOverrideActive
          ? 'bg-slate-950/90 border-amber-700/60'
          : 'bg-slate-950/40 border-slate-800/80 opacity-60 pointer-events-none'
      }`}>
        {/* Manual Light Slider */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Forced Lighting:</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{classroom.lightBrightnessPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={classroom.lightBrightnessPct}
            onChange={(e) => onManualLightBrightness(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <button onClick={() => onManualLightBrightness(0)} className="hover:text-slate-300">0% (Off)</button>
            <button onClick={() => onManualLightBrightness(50)} className="hover:text-slate-300">50%</button>
            <button onClick={() => onManualLightBrightness(100)} className="hover:text-slate-300">100% (Full)</button>
          </div>
        </div>

        {/* Manual HVAC Override */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="font-semibold text-slate-300 flex items-center space-x-1.5 text-xs mb-2">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Forced HVAC Mode:</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onManualHVACMode('OFF')}
              className={`py-1.5 rounded text-xs font-semibold border ${
                classroom.hvacMode === 'OFF' ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              OFF
            </button>
            <button
              onClick={() => onManualHVACMode('FAN')}
              className={`py-1.5 rounded text-xs font-semibold border ${
                classroom.hvacMode === 'FAN' ? 'bg-emerald-900 text-emerald-200 border-emerald-600' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              FAN
            </button>
            <button
              onClick={() => onManualHVACMode('AC')}
              className={`py-1.5 rounded text-xs font-semibold border ${
                classroom.hvacMode === 'AC' ? 'bg-cyan-900 text-cyan-200 border-cyan-600' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              AC
            </button>
          </div>
        </div>

        {/* Manual Screen Override */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="font-semibold text-slate-300 flex items-center space-x-1.5 text-xs mb-2">
            <Tv className="w-3.5 h-3.5 text-purple-400" />
            <span>Motorized Screen Override:</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onManualScreen('RETRACTED')}
              className={`py-1.5 rounded text-xs font-semibold border ${
                classroom.screenPosition === 'RETRACTED'
                  ? 'bg-purple-950 text-purple-300 border-purple-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Retract (Up)
            </button>
            <button
              onClick={() => onManualScreen('DEPLOYED')}
              className={`py-1.5 rounded text-xs font-semibold border ${
                classroom.screenPosition === 'DEPLOYED'
                  ? 'bg-purple-950 text-purple-300 border-purple-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Deploy (Down)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
