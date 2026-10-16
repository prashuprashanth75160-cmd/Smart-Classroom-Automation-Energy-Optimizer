import React from 'react';
import { ClassroomState } from '../types';
import { 
  Lightbulb, 
  Timer, 
  Sun, 
  Moon, 
  Zap, 
  Clock, 
  FastForward, 
  RotateCcw,
  Sparkles,
  Sliders
} from 'lucide-react';

interface LightingControllerCardProps {
  classroom: ClassroomState;
  onUpdateBrightness: (pct: number) => void;
  onFastForwardCountdown: () => void;
  onResetCountdown: () => void;
  onChangeDelaySeconds: (seconds: number) => void;
}

export const LightingControllerCard: React.FC<LightingControllerCardProps> = ({
  classroom,
  onUpdateBrightness,
  onFastForwardCountdown,
  onResetCountdown,
  onChangeDelaySeconds,
}) => {
  const isDelayActive = classroom.emptyCountdownRemaining > 0;
  const minutes = Math.floor(classroom.emptyCountdownRemaining / 60);
  const seconds = Math.floor(classroom.emptyCountdownRemaining % 60);
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isDaylightDimmed = classroom.ambientLux >= 300 && classroom.occupancy > 0 && !classroom.projectionActive;
  const isNightBright = classroom.ambientLux < 100 && classroom.occupancy > 0 && !classroom.projectionActive;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg border transition ${
              classroom.lightBrightnessPct > 0 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 glow-amber' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Autonomous Lighting Controller</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                  classroom.lightState === 'ON' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                  classroom.lightState === 'DIMMED' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800' :
                  classroom.lightState === 'PROJECTION_MODE' ? 'bg-purple-950/80 text-purple-300 border border-purple-800' :
                  classroom.lightState === 'DELAY_PENDING' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 animate-pulse' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {classroom.lightState}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Occupancy-triggered with 5-minute delayed shutoff & daylight adaptation
              </p>
            </div>
          </div>

          {/* Current Brightness Badge */}
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-amber-400">
              {classroom.lightBrightnessPct}%
            </span>
            <span className="text-[10px] block text-slate-400 uppercase tracking-wider">
              Illumination
            </span>
          </div>
        </div>

        {/* Dynamic Illumination Meter */}
        <div className="mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center space-x-1">
              {isNightBright ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300 font-medium">Night Mode: Full 100% Brightness</span>
                </>
              ) : isDaylightDimmed ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-medium">Daylight Harvesting: Dimmed ({classroom.lightBrightnessPct}%)</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-slate-400" />
                  <span>Artificial Luminaire Level</span>
                </>
              )}
            </span>
            <span className="font-mono text-slate-300 font-semibold">{classroom.lightBrightnessPct}% Output</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                classroom.projectionActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  : classroom.lightBrightnessPct > 60
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${classroom.lightBrightnessPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0% OFF</span>
            <span>15% Floor (Dim)</span>
            <span>50%</span>
            <span>100% Full Max</span>
          </div>
        </div>

        {/* Empty Room Delay Mechanism (5-Minute Countdown) */}
        <div className={`p-3 rounded-lg border transition ${
          isDelayActive
            ? 'bg-emerald-950/40 border-emerald-700/80 glow-emerald'
            : classroom.occupancy === 0
            ? 'bg-slate-950 border-slate-800'
            : 'bg-slate-950 border-slate-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className={`w-4 h-4 ${isDelayActive ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '8s' }} />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Empty Room Auto-Shutoff Timer
                </span>
                <span className="text-[10px] text-slate-400">
                  Configured delay: {classroom.emptyDelaySeconds / 60} minutes ({classroom.emptyDelaySeconds}s)
                </span>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="text-right">
              <span className={`text-xl font-bold font-mono px-2 py-0.5 rounded ${
                isDelayActive 
                  ? 'bg-emerald-900/90 text-emerald-300 border border-emerald-600 animate-pulse' 
                  : 'text-slate-500'
              }`}>
                {isDelayActive ? timeFormatted : 'INACTIVE'}
              </span>
            </div>
          </div>

          {/* Explanation / Progress */}
          {isDelayActive ? (
            <div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="bg-emerald-400 h-full transition-all duration-1000"
                  style={{
                    width: `${((classroom.emptyDelaySeconds - classroom.emptyCountdownRemaining) / classroom.emptyDelaySeconds) * 100}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-emerald-300/90 mb-2">
                Room vacated. Grace period running to prevent abrupt shutoff if a student stepped out briefly.
              </p>
              
              {/* Fast Forward and Reset Demo Buttons */}
              <div className="flex items-center space-x-2 pt-1 border-t border-emerald-900/60">
                <button
                  onClick={onFastForwardCountdown}
                  className="flex-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center space-x-1 shadow transition"
                  title="Fast forward remaining time to 5 seconds to demonstrate auto-shutoff without waiting 5 full minutes"
                >
                  <FastForward className="w-3 h-3" />
                  <span>Fast-Forward to 5s (Judge Demo)</span>
                </button>
                <button
                  onClick={onResetCountdown}
                  className="px-2 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 border border-slate-700"
                  title="Reset 5-minute countdown"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              {classroom.occupancy > 0 
                ? `Active occupancy (${classroom.occupancy} present). Lights held ON continuously.` 
                : 'Classroom is currently empty and lights have turned OFF.'}
            </p>
          )}
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Target Lux: <strong className="text-slate-200">{classroom.targetLux} lx</strong></span>
        <span>Min Floor: <strong className="text-slate-200">{classroom.minBrightnessPct}%</strong></span>
        <span>Connected Fixtures: <strong className="text-slate-200">18 LED Panels</strong></span>
      </div>
    </div>
  );
};
