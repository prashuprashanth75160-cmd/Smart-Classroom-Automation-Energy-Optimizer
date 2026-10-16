import React, { useState, useEffect } from 'react';
import { ClassroomState, RoomId } from '../types';
import { 
  Cpu, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Users, 
  Zap,
  Layers
} from 'lucide-react';

interface NavbarProps {
  classrooms: ClassroomState[];
  activeRoomId: RoomId;
  onSelectRoom: (id: RoomId) => void;
  onOpenPythonModal: () => void;
  onOpenAiAudit: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  classrooms,
  activeRoomId,
  onSelectRoom,
  onOpenPythonModal,
  onOpenAiAudit,
  onOpenSettings,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hackathon Badge */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  DSU SmartClass
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded">
                  Code Clash 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous CCTV Vision & Multi-Zone Energy Optimizer
              </p>
            </div>
          </div>

          {/* Center: System Status & Hardware Safety Indicator */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hardware Isolation: <strong className="text-emerald-400 font-normal">Active (Sandbox)</strong></span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 font-mono text-slate-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{timeStr || '09:09:15'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenPythonModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition shadow-sm"
              title="Inspect Modular Python, OpenCV, NumPy, Pandas and run test suite"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Python Engine & Tests</span>
              <span className="sm:hidden">Tests</span>
            </button>

            <button
              onClick={onOpenAiAudit}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Energy Audit</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition"
              title="Classroom Ratings & Tariff Configuration"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Classroom Tabs Navigation */}
        <div className="flex space-x-2 pb-2 pt-1 overflow-x-auto no-scrollbar border-t border-slate-900">
          {classrooms.map((cr) => {
            const isActive = cr.id === activeRoomId;
            return (
              <button
                key={cr.id}
                onClick={() => onSelectRoom(cr.id)}
                className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap border ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'}`} />
                <span className="font-semibold">{cr.id}</span>
                <span className="text-slate-400 hidden md:inline">({cr.type})</span>
                
                {/* Badge tags */}
                <div className="flex items-center space-x-1.5 ml-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 ${
                    cr.isOvercapacity 
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800 font-bold animate-pulse'
                      : cr.occupancy > 0 
                        ? 'bg-slate-900 text-slate-300 border border-slate-700' 
                        : 'bg-slate-900/50 text-slate-500'
                  }`}>
                    <Users className="w-2.5 h-2.5 mr-0.5 inline" />
                    {cr.occupancy}/{cr.capacity}
                  </span>

                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    cr.hvacMode === 'AC' ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60' :
                    cr.hvacMode === 'FAN' ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60' :
                    'bg-slate-900 text-slate-500'
                  }`}>
                    {cr.hvacMode}
                  </span>

                  {cr.projectionActive && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800">
                      PROJ
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
