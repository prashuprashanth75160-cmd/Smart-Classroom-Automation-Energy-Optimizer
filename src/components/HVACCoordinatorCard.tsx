import React from 'react';
import { ClassroomState, HVACMode } from '../types';
import { 
  Wind, 
  Snowflake, 
  Power, 
  ShieldAlert, 
  ShieldCheck, 
  Thermometer, 
  Gauge, 
  CheckCircle2,
  Lock
} from 'lucide-react';

interface HVACCoordinatorCardProps {
  classroom: ClassroomState;
  onSetHVACMode: (mode: HVACMode) => void;
  onSetFanSpeed: (speed: number) => void;
  onSetAcTemp: (temp: number) => void;
  onToggleEnergyPolicy: (active: boolean) => void;
}

export const HVACCoordinatorCard: React.FC<HVACCoordinatorCardProps> = ({
  classroom,
  onSetHVACMode,
  onSetFanSpeed,
  onSetAcTemp,
  onToggleEnergyPolicy,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg border transition ${
              classroom.hvacMode === 'AC' 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 glow-cyan' :
              classroom.hvacMode === 'FAN'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 glow-emerald' :
              'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
              {classroom.hvacMode === 'AC' ? (
                <Snowflake className="w-4 h-4 animate-pulse" />
              ) : classroom.hvacMode === 'FAN' ? (
                <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
              ) : (
                <Power className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>HVAC & Cooling Coordinator</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                  classroom.hvacMode === 'AC' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800' :
                  classroom.hvacMode === 'FAN' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {classroom.hvacMode} MODE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Coordinated Fan / Inverter AC exclusive interlock & cooling retention
              </p>
            </div>
          </div>

          {/* Current Temperature / Speed Status */}
          <div className="text-right">
            {classroom.hvacMode === 'AC' ? (
              <div>
                <span className="text-2xl font-black font-mono text-cyan-400">
                  {classroom.acTemp}°C
                </span>
                <span className="text-[10px] block text-slate-400 uppercase tracking-wider">
                  Target Chill
                </span>
              </div>
            ) : classroom.hvacMode === 'FAN' ? (
              <div>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  Speed {classroom.fanSpeed}
                </span>
                <span className="text-[10px] block text-slate-400 uppercase tracking-wider">
                  BLDC Airflow
                </span>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-black font-mono text-slate-500">
                  OFF
                </span>
                <span className="text-[10px] block text-slate-500 uppercase tracking-wider">
                  0 W Draw
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Energy-Saving Mutual Exclusion Policy Banner */}
        <div className={`mb-3 p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
          classroom.energySavingPolicyActive
            ? 'bg-slate-950 border-emerald-800/80 text-emerald-300'
            : 'bg-amber-950/50 border-amber-700 text-amber-200'
        }`}>
          <div className="flex items-center space-x-2">
            {classroom.energySavingPolicyActive ? (
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-semibold block">
                {classroom.energySavingPolicyActive
                  ? 'Mutual Exclusion Policy: ACTIVE'
                  : 'Policy Bypass: Simultaneous HVAC Allowed'}
              </span>
              <span className="text-[10px] text-slate-400">
                {classroom.energySavingPolicyActive
                  ? 'Interlock strictly prevents Fan and AC from running concurrently.'
                  : 'Warning: Running Fan & AC simultaneously increases energy draw by +200W!'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggleEnergyPolicy(!classroom.energySavingPolicyActive)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-medium border transition ${
              classroom.energySavingPolicyActive
                ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
                : 'bg-amber-900 hover:bg-amber-800 text-amber-100 border-amber-600'
            }`}
          >
            {classroom.energySavingPolicyActive ? 'Enforced' : 'Unenforced'}
          </button>
        </div>

        {/* Mode Selector Buttons (Fan, AC, OFF) */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => onSetHVACMode('OFF')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
              classroom.hvacMode === 'OFF'
                ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>HVAC OFF</span>
          </button>

          <button
            onClick={() => onSetHVACMode('FAN')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
              classroom.hvacMode === 'FAN'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-sm glow-emerald'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>FAN MODE</span>
          </button>

          <button
            onClick={() => onSetHVACMode('AC')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
              classroom.hvacMode === 'AC'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-600 shadow-sm glow-cyan'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800/60 border-slate-800'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>INVERTER AC</span>
          </button>
        </div>

        {/* Conditional Controls based on active mode */}
        {classroom.hvacMode === 'FAN' && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ceiling Fan Speed:</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">Level {classroom.fanSpeed}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSetFanSpeed(spd)}
                  className={`py-1 rounded text-xs font-mono font-semibold border ${
                    classroom.fanSpeed === spd
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  Speed {spd} {spd === 1 ? '(Low)' : spd === 2 ? '(Med)' : '(High)'}
                </button>
              ))}
            </div>
          </div>
        )}

        {classroom.hvacMode === 'AC' && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                <span>AC Thermostat Setpoint:</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{classroom.acTemp}°C (Eco Zone)</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onSetAcTemp(Math.max(18, classroom.acTemp - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs"
              >
                -1°C
              </button>
              <input
                type="range"
                min="18"
                max="26"
                value={classroom.acTemp}
                onChange={(e) => onSetAcTemp(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => onSetAcTemp(Math.min(26, classroom.acTemp + 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs"
              >
                +1°C
              </button>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>18°C (Max Chill)</span>
              <span>24°C (ASHRAE Recommended)</span>
              <span>26°C (Max Eco)</span>
            </div>
          </div>
        )}

        {/* Projection Mode HVAC Preservation Note */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center space-x-2 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Presentation Persistence:</strong> Selected cooling mode ({classroom.hvacMode}) is safeguarded from being reset when projector is engaged.
          </span>
        </div>
      </div>

      {/* Footer Power Spec */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>AC Rating: <strong className="text-slate-200">{classroom.powerRatings.acWatts} W</strong></span>
        <span>Fans Rating: <strong className="text-slate-200">{classroom.powerRatings.fanWatts} W</strong></span>
        <span>Simultaneous Prevention: <strong className="text-emerald-400">ENFORCED</strong></span>
      </div>
    </div>
  );
};
