import React from 'react';
import { ClassroomState } from '../types';
import { 
  Projector, 
  Tv, 
  Check, 
  RotateCcw, 
  Play, 
  Square, 
  Sun, 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Sparkles
} from 'lucide-react';

interface ProjectionModeCardProps {
  classroom: ClassroomState;
  onToggleProjectionMode: (enable: boolean) => void;
}

export const ProjectionModeCard: React.FC<ProjectionModeCardProps> = ({
  classroom,
  onToggleProjectionMode,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg border transition ${
              classroom.projectionActive 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 glow-cyan' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
              <Projector className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Presentation & Projection Mode</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                  classroom.projectionActive
                    ? 'bg-purple-950/90 text-purple-300 border border-purple-800 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {classroom.projectionActive ? 'ACTIVE PRESENTATION' : 'STANDBY'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated motorized screen deployment, luminaire dimming & smart restoration
              </p>
            </div>
          </div>

          {/* Screen Motor Status */}
          <div className="text-right">
            <span className={`text-xs font-mono font-bold uppercase px-2 py-1 rounded border block ${
              classroom.screenPosition === 'DEPLOYED' 
                ? 'bg-purple-950 text-purple-300 border-purple-800' :
              classroom.screenPosition === 'RETRACTED'
                ? 'bg-slate-950 text-slate-400 border-slate-800' :
              'bg-slate-900 text-slate-600 border-slate-800'
            }`}>
              {classroom.screenPosition}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {classroom.hasMotorizedScreen ? 'Motorized 120" Screen' : 'Fixed Whiteboard'}
            </span>
          </div>
        </div>

        {/* Master Presentation Toggle Button */}
        <button
          onClick={() => onToggleProjectionMode(!classroom.projectionActive)}
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 border transition shadow-md mb-3 ${
            classroom.projectionActive
              ? 'bg-gradient-to-r from-rose-600 to-purple-700 hover:from-rose-500 hover:to-purple-600 text-white border-purple-500/50 shadow-purple-950'
              : 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white border-purple-600/50 shadow-indigo-950'
          }`}
        >
          {classroom.projectionActive ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>END PRESENTATION (Restore Dynamic Lighting & Retract Screen)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>START PRESENTATION (Deploy Screen & Dim Lights to 15%)</span>
            </>
          )}
        </button>

        {/* Visualized Screen & Projector Status Box */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <Tv className="w-3.5 h-3.5 text-purple-400" />
              <span>Motorized Projection Screen State:</span>
            </span>
            <span className="font-mono text-xs text-purple-300 font-bold">
              {classroom.screenPosition === 'DEPLOYED' ? 'LOWERED (100% Ext)' : 'RETRACTED (Ceiling)'}
            </span>
          </div>

          {/* Motorized Screen Graphic */}
          <div className="w-full bg-slate-900 rounded-lg p-2 border border-slate-800 flex flex-col items-center">
            {/* Screen casing bar */}
            <div className="w-4/5 h-2 bg-slate-700 rounded-full border border-slate-600 mb-1" />
            
            {/* Extended fabric preview */}
            <div
              className={`w-3/4 rounded border transition-all duration-700 overflow-hidden flex items-center justify-center ${
                classroom.screenPosition === 'DEPLOYED'
                  ? 'h-20 bg-gradient-to-b from-slate-100 to-slate-200 border-white text-slate-900 shadow-lg'
                  : 'h-2 bg-slate-800 border-slate-700 text-transparent'
              }`}
            >
              {classroom.screenPosition === 'DEPLOYED' && (
                <div className="text-center p-1">
                  <span className="text-[11px] font-extrabold tracking-wide block uppercase text-slate-900">
                    DSU Code Clash 2.0
                  </span>
                  <span className="text-[9px] font-mono text-purple-700 block font-semibold">
                    1080p High Contrast Laser Display
                  </span>
                </div>
              )}
            </div>

            {/* Roller bottom weight */}
            <div className="w-3/4 h-1.5 bg-slate-600 rounded-full mt-0.5" />
          </div>
        </div>

        {/* Smart State Restoration Logic Rule Explainer */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
          <div className="flex items-center space-x-1.5 text-purple-400 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Restoration Rule (Feature 5 Requirement):</span>
          </div>
          <p className="text-slate-400">
            When projection mode ends, system does not blindly restore outdated states:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 block font-bold">1. Current Occupancy Check:</span>
              <span className="text-slate-400">If room vacated during talk -&gt; Switches OFF (0%)</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-400 block font-bold">2. Real-Time Daylight:</span>
              <span className="text-slate-400">Recalculates lux ({classroom.ambientLux} lx) dimming level</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Spec */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Projector Load: <strong className="text-slate-200">{classroom.powerRatings.projectorWatts} W</strong></span>
        <span>Presentation Light Level: <strong className="text-purple-300">15% Dimmed</strong></span>
        <span>HVAC State: <strong className="text-emerald-400">PRESERVED ({classroom.hvacMode})</strong></span>
      </div>
    </div>
  );
};
