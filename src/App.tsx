import React, { useState, useEffect } from 'react';
import { ClassroomState, RoomId, HVACMode } from './types';
import { 
  INITIAL_CLASSROOMS, 
  calculateEnergyMetrics, 
  calculateDaylightBrightness, 
  generateWeeklyReport 
} from './utils/energyCalculator';
import { Navbar } from './components/Navbar';
import { CCTVViewer } from './components/CCTVViewer';
import { LightingControllerCard } from './components/LightingControllerCard';
import { HVACCoordinatorCard } from './components/HVACCoordinatorCard';
import { DaylightSensorCard } from './components/DaylightSensorCard';
import { ProjectionModeCard } from './components/ProjectionModeCard';
import { EnergyDashboard } from './components/EnergyDashboard';
import { WeeklyReportsView } from './components/WeeklyReportsView';
import { ManualOverridePanel } from './components/ManualOverridePanel';
import { AIAuditModal } from './components/AIAuditModal';
import { PythonArchitectureModal } from './components/PythonArchitectureModal';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Sparkles, 
  Terminal,
  Zap,
  ShieldCheck,
  Compass,
  Users
} from 'lucide-react';

export default function App() {
  const [classrooms, setClassrooms] = useState<ClassroomState[]>(() => {
    const saved = localStorage.getItem('dsu_smartclass_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved state, using defaults');
      }
    }
    return INITIAL_CLASSROOMS;
  });

  const [activeRoomId, setActiveRoomId] = useState<RoomId>('CR-101');
  const [showAiAudit, setShowAiAudit] = useState<boolean>(false);
  const [showPythonModal, setShowPythonModal] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('dsu_smartclass_state', JSON.stringify(classrooms));
  }, [classrooms]);

  // Active room reference
  const currentRoom = classrooms.find((c) => c.id === activeRoomId) || classrooms[0];

  // Global 1-second countdown interval ticker for empty room auto-shutoff
  useEffect(() => {
    const timer = setInterval(() => {
      setClassrooms((prev) =>
        prev.map((room) => {
          if (room.manualOverrideActive) return room;

          // If room has an active countdown
          if (room.emptyCountdownRemaining > 0) {
            const nextRemaining = room.emptyCountdownRemaining - 1;
            if (nextRemaining <= 0) {
              // Grace period expired -> switch lights OFF
              return {
                ...room,
                emptyCountdownRemaining: 0,
                lightState: 'OFF',
                lightBrightnessPct: 0,
              };
            }
            return {
              ...room,
              emptyCountdownRemaining: nextRemaining,
              lightState: 'DELAY_PENDING',
            };
          }
          return room;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update a single classroom's state
  const updateCurrentRoom = (updater: (prev: ClassroomState) => ClassroomState) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === activeRoomId ? updater(c) : c))
    );
  };

  // =========================================================================
  // FEATURE 1: CCTV Occupancy & Overcapacity Updates
  // =========================================================================
  const handleUpdateOccupancy = (newCount: number) => {
    updateCurrentRoom((room) => {
      const count = Math.max(0, newCount);
      const isOver = count > room.capacity;
      const avail = Math.max(0, room.capacity - count);

      let nextLightState = room.lightState;
      let nextBrightness = room.lightBrightnessPct;
      let nextCountdown = room.emptyCountdownRemaining;

      if (!room.manualOverrideActive) {
        if (count > 0) {
          // Cancel countdown immediately if someone enters
          nextCountdown = 0;
          if (room.projectionActive) {
            nextLightState = 'PROJECTION_MODE';
            nextBrightness = 15;
          } else {
            nextBrightness = calculateDaylightBrightness(
              room.ambientLux,
              room.targetLux,
              room.minBrightnessPct,
              room.maxBrightnessPct
            );
            nextLightState = nextBrightness >= 80 ? 'ON' : 'DIMMED';
          }
        } else {
          // Room just emptied (count == 0)
          // Start 5-minute countdown (300 seconds) if not already counting
          if (room.emptyCountdownRemaining <= 0 && room.lightBrightnessPct > 0) {
            nextCountdown = room.emptyDelaySeconds;
            nextLightState = 'DELAY_PENDING';
          }
        }
      }

      return {
        ...room,
        occupancy: count,
        availableSeats: avail,
        isOvercapacity: isOver,
        lightState: nextLightState,
        lightBrightnessPct: nextBrightness,
        emptyCountdownRemaining: nextCountdown,
      };
    });
  };

  const handleToggleCameraFailure = (fail: boolean) => {
    updateCurrentRoom((room) => ({
      ...room,
      cameraConnected: !fail,
      cameraError: fail ? 'CCTV RTSP Stream Disconnected' : null,
    }));
  };

  // =========================================================================
  // FEATURE 2: Automatic Lighting & Empty Grace Period
  // =========================================================================
  const handleFastForwardCountdown = () => {
    updateCurrentRoom((room) => ({
      ...room,
      emptyCountdownRemaining: 5, // Jump to 5 seconds remaining for instant demo!
      lightState: 'DELAY_PENDING',
    }));
  };

  const handleResetCountdown = () => {
    updateCurrentRoom((room) => ({
      ...room,
      emptyCountdownRemaining: room.emptyDelaySeconds,
      lightState: 'DELAY_PENDING',
    }));
  };

  // =========================================================================
  // FEATURE 3: Fan & AC Mutual Exclusivity
  // =========================================================================
  const handleSetHVACMode = (mode: HVACMode) => {
    updateCurrentRoom((room) => {
      if (room.energySavingPolicyActive) {
        // Enforce strict mutual exclusivity
        return {
          ...room,
          hvacMode: mode,
          fanSpeed: mode === 'FAN' ? (room.fanSpeed || 2) : 0,
        };
      }
      return { ...room, hvacMode: mode };
    });
  };

  const handleSetFanSpeed = (speed: number) => {
    updateCurrentRoom((room) => ({ ...room, fanSpeed: speed }));
  };

  const handleSetAcTemp = (temp: number) => {
    updateCurrentRoom((room) => ({ ...room, acTemp: temp }));
  };

  const handleToggleEnergyPolicy = (active: boolean) => {
    updateCurrentRoom((room) => ({ ...room, energySavingPolicyActive: active }));
  };

  // =========================================================================
  // FEATURE 4: Natural Daylight Detection & Dynamic Dimming
  // =========================================================================
  const handleUpdateAmbientLux = (lux: number) => {
    updateCurrentRoom((room) => {
      const validLux = Math.max(0, lux);
      let calculatedBrightness = room.lightBrightnessPct;
      let nextState = room.lightState;

      if (!room.manualOverrideActive) {
        if (room.projectionActive) {
          calculatedBrightness = 15;
          nextState = 'PROJECTION_MODE';
        } else if (room.occupancy > 0 || room.emptyCountdownRemaining > 0) {
          calculatedBrightness = calculateDaylightBrightness(
            validLux,
            room.targetLux,
            room.minBrightnessPct,
            room.maxBrightnessPct
          );
          nextState = calculatedBrightness >= 80 ? 'ON' : 'DIMMED';
        } else {
          calculatedBrightness = 0;
          nextState = 'OFF';
        }
      }

      return {
        ...room,
        ambientLux: validLux,
        lightBrightnessPct: calculatedBrightness,
        lightState: nextState,
      };
    });
  };

  const handleToggleSensorFault = (fault: boolean) => {
    updateCurrentRoom((room) => {
      const isFault = !fault;
      return {
        ...room,
        luxSensorConnected: isFault,
        luxSensorError: isFault ? null : 'Photodiode Sensor Disconnect',
        // If faulted, fallback to safe 80% illumination
        lightBrightnessPct: isFault
          ? calculateDaylightBrightness(room.ambientLux, room.targetLux)
          : (room.occupancy > 0 ? 80 : 0),
      };
    });
  };

  // =========================================================================
  // FEATURE 5: Projection Mode & Intelligent State Restore
  // =========================================================================
  const handleToggleProjectionMode = (enable: boolean) => {
    updateCurrentRoom((room) => {
      if (enable) {
        // Engaging projection:
        // 1. Save current lighting state
        // 2. Deploy motorized screen
        // 3. Dim lights to 15%
        // 4. Maintain existing HVAC mode without alteration!
        return {
          ...room,
          projectionActive: true,
          screenPosition: room.hasMotorizedScreen ? 'DEPLOYED' : 'NOT_EQUIPPED',
          preProjectionLightBrightness: room.lightBrightnessPct,
          preProjectionLightState: room.lightState,
          lightBrightnessPct: 15,
          lightState: 'PROJECTION_MODE',
        };
      } else {
        // Disengaging projection:
        // 1. Retract motorized screen
        // 2. Restore previous lighting respecting CURRENT occupancy & CURRENT daylight
        let restoredBrightness = 0;
        let restoredState: ClassroomState['lightState'] = 'OFF';

        if (room.occupancy === 0) {
          restoredBrightness = 0;
          restoredState = 'OFF';
        } else {
          restoredBrightness = calculateDaylightBrightness(
            room.ambientLux,
            room.targetLux,
            room.minBrightnessPct,
            room.maxBrightnessPct
          );
          restoredState = restoredBrightness >= 80 ? 'ON' : 'DIMMED';
        }

        return {
          ...room,
          projectionActive: false,
          screenPosition: room.hasMotorizedScreen ? 'RETRACTED' : 'NOT_EQUIPPED',
          lightBrightnessPct: restoredBrightness,
          lightState: restoredState,
        };
      }
    });
  };

  // =========================================================================
  // Manual Overrides
  // =========================================================================
  const handleToggleManualOverride = (active: boolean) => {
    updateCurrentRoom((room) => {
      if (!active) {
        // Restoring autonomous control -> recalculate
        const b = room.occupancy > 0 ? calculateDaylightBrightness(room.ambientLux) : 0;
        return {
          ...room,
          manualOverrideActive: false,
          lightBrightnessPct: b,
          lightState: b > 0 ? (b >= 80 ? 'ON' : 'DIMMED') : 'OFF',
        };
      }
      return { ...room, manualOverrideActive: true };
    });
  };

  const handleManualLight = (pct: number) => {
    updateCurrentRoom((room) => ({
      ...room,
      lightBrightnessPct: pct,
      lightState: pct > 0 ? 'ON' : 'OFF',
    }));
  };

  const handleManualHVAC = (mode: HVACMode) => {
    updateCurrentRoom((room) => ({
      ...room,
      hvacMode: mode,
      fanSpeed: mode === 'FAN' ? 2 : 0,
    }));
  };

  const handleManualScreen = (pos: ClassroomState['screenPosition']) => {
    updateCurrentRoom((room) => ({ ...room, screenPosition: pos }));
  };

  // Metrics and reports
  const currentMetrics = calculateEnergyMetrics(currentRoom);
  const weeklyReport = generateWeeklyReport(currentRoom);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        classrooms={classrooms}
        activeRoomId={activeRoomId}
        onSelectRoom={setActiveRoomId}
        onOpenPythonModal={() => setShowPythonModal(true)}
        onOpenAiAudit={() => setShowAiAudit(true)}
        onOpenSettings={() => {}}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Classroom Header Banner */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">
                  {currentRoom.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {currentRoom.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                <span>{currentRoom.type}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>{currentRoom.daylightOrientation}</span>
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">
                  {currentRoom.hasMotorizedScreen ? 'Motorized 120" AV Screen' : 'Fixed Whiteboard'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Occupancy pill */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 font-mono ${
              currentRoom.isOvercapacity 
                ? 'bg-rose-950/90 text-rose-300 border-rose-700 animate-pulse'
                : 'bg-slate-950 text-slate-300 border-slate-800'
            }`}>
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Headcount: <strong>{currentRoom.occupancy}</strong> / {currentRoom.capacity}</span>
              {currentRoom.isOvercapacity && <span className="text-[10px] bg-rose-900 px-1.5 py-0.2 rounded font-bold uppercase">OVERLIMIT</span>}
            </div>

            {/* Lux pill */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center space-x-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Daylight: <strong>{currentRoom.ambientLux} lx</strong></span>
            </div>

            {/* Power pill */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-900/60 text-emerald-400 flex items-center space-x-2 font-mono">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Draw: <strong>{currentMetrics.optimizedKw} kW</strong></span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded text-emerald-300">
                -{currentMetrics.savingsPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Feature Grid Row 1: CCTV Stream + Automatic Lighting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature 1: CCTV Live Stream & Occupancy */}
          <CCTVViewer
            classroom={currentRoom}
            onUpdateOccupancy={handleUpdateOccupancy}
            onToggleCameraFailure={handleToggleCameraFailure}
            onChangeFeedMode={(mode) => updateCurrentRoom((r) => ({ ...r, cameraFeedMode: mode }))}
          />

          {/* Feature 2: Automatic Lighting Controller */}
          <LightingControllerCard
            classroom={currentRoom}
            onUpdateBrightness={(pct) => updateCurrentRoom((r) => ({ ...r, lightBrightnessPct: pct }))}
            onFastForwardCountdown={handleFastForwardCountdown}
            onResetCountdown={handleResetCountdown}
            onChangeDelaySeconds={(s) => updateCurrentRoom((r) => ({ ...r, emptyDelaySeconds: s }))}
          />
        </div>

        {/* Feature Grid Row 2: HVAC Coordinator + Daylight Sensor + Projection Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 3: Fan and AC Coordination */}
          <HVACCoordinatorCard
            classroom={currentRoom}
            onSetHVACMode={handleSetHVACMode}
            onSetFanSpeed={handleSetFanSpeed}
            onSetAcTemp={handleSetAcTemp}
            onToggleEnergyPolicy={handleToggleEnergyPolicy}
          />

          {/* Feature 4: Natural Daylight Sensor & Simulator */}
          <DaylightSensorCard
            classroom={currentRoom}
            onUpdateAmbientLux={handleUpdateAmbientLux}
            onToggleSensorFault={handleToggleSensorFault}
            onUpdateTargetLux={(t) => updateCurrentRoom((r) => ({ ...r, targetLux: t }))}
            onUpdateMinBrightness={(min) => updateCurrentRoom((r) => ({ ...r, minBrightnessPct: min }))}
            onUpdateMaxBrightness={(max) => updateCurrentRoom((r) => ({ ...r, maxBrightnessPct: max }))}
          />

          {/* Feature 5: Projection Mode & Screen Automation */}
          <ProjectionModeCard
            classroom={currentRoom}
            onToggleProjectionMode={handleToggleProjectionMode}
          />
        </div>

        {/* Real-Time Energy Dashboard */}
        <EnergyDashboard
          classroom={currentRoom}
          metrics={currentMetrics}
          onUpdateRatings={(ratings) => updateCurrentRoom((r) => ({ ...r, powerRatings: ratings }))}
          onUpdateTariff={(tariff) => updateCurrentRoom((r) => ({ ...r, tariffRate: tariff }))}
        />

        {/* Weekly Reports View with 7-Day Bar & Line Graphs */}
        <WeeklyReportsView
          classroom={currentRoom}
          report={weeklyReport}
        />

        {/* Manual Override & Hardware Barrier Panel */}
        <ManualOverridePanel
          classroom={currentRoom}
          onToggleOverride={handleToggleManualOverride}
          onManualLightBrightness={handleManualLight}
          onManualHVACMode={handleManualHVAC}
          onManualScreen={handleManualScreen}
        />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">DSU Code Clash 2.0</span>
            <span>•</span>
            <span>Autonomous Smart Classroom Automation & Energy Optimizer</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Hardware Relays: <strong className="text-emerald-400">Isolated</strong></span>
            <span>Python Engine: <strong className="text-amber-400">OpenCV • NumPy • Pandas</strong></span>
            <span>AI: <strong className="text-cyan-400">Gemini 3.8 Flash</strong></span>
          </div>
        </div>
      </footer>

      {/* AI Energy Audit Modal (Gemini 3.8 Flash) */}
      <AIAuditModal
        isOpen={showAiAudit}
        onClose={() => setShowAiAudit(false)}
        classrooms={classrooms}
      />

      {/* Python Architecture & Test Suite Runner Modal */}
      <PythonArchitectureModal
        isOpen={showPythonModal}
        onClose={() => setShowPythonModal(false)}
      />
    </div>
  );
}
