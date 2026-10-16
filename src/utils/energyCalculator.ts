import { ClassroomState, EnergyMetrics, WeeklyReport, DailyRecord } from '../types';

export const INITIAL_CLASSROOMS: ClassroomState[] = [
  {
    id: 'CR-101',
    name: 'Classroom 101: Main Lecture Hall',
    type: 'Tiered Lecture Hall',
    capacity: 40,
    occupancy: 28,
    availableSeats: 12,
    isOvercapacity: false,
    hasMotorizedScreen: true,
    daylightOrientation: 'South-Facing High Windows',
    cameraFeedMode: 'stream_lecture',
    cameraConnected: true,
    cameraError: null,
    luxSensorConnected: true,
    luxSensorError: null,
    ambientLux: 420,
    targetLux: 500,
    minBrightnessPct: 15,
    maxBrightnessPct: 100,
    lightState: 'DIMMED',
    lightBrightnessPct: 35,
    emptyDelaySeconds: 300,
    emptyCountdownRemaining: 0,
    hvacMode: 'AC',
    fanSpeed: 2,
    acTemp: 23,
    energySavingPolicyActive: true,
    projectionActive: false,
    screenPosition: 'RETRACTED',
    preProjectionLightBrightness: 35,
    preProjectionLightState: 'DIMMED',
    manualOverrideActive: false,
    manualLightBrightness: 100,
    manualHvacMode: 'OFF',
    powerRatings: {
      lightWatts: 720,        // 20 fixtures @ 36W
      acWatts: 2400,          // 2.0 Ton Inverter AC
      fanWatts: 200,          // 5 BLDC fans @ 40W
      projectorWatts: 350,    // 5000 Lumens Laser Projector + Screen
      baseIdleWatts: 60,      // Sensors & Access Point
    },
    tariffRate: 7.50,
    currency: '₹',
  },
  {
    id: 'CR-102',
    name: 'Classroom 102: Executive Seminar Room',
    type: 'Interactive Seminar',
    capacity: 25,
    occupancy: 18,
    availableSeats: 7,
    isOvercapacity: false,
    hasMotorizedScreen: true,
    daylightOrientation: 'East-Facing Glass Facade',
    cameraFeedMode: 'stream_seminar',
    cameraConnected: true,
    cameraError: null,
    luxSensorConnected: true,
    luxSensorError: null,
    ambientLux: 650,
    targetLux: 500,
    minBrightnessPct: 15,
    maxBrightnessPct: 100,
    lightState: 'DIMMED',
    lightBrightnessPct: 15,
    emptyDelaySeconds: 300,
    emptyCountdownRemaining: 0,
    hvacMode: 'FAN',
    fanSpeed: 2,
    acTemp: 24,
    energySavingPolicyActive: true,
    projectionActive: false,
    screenPosition: 'RETRACTED',
    preProjectionLightBrightness: 15,
    preProjectionLightState: 'DIMMED',
    manualOverrideActive: false,
    manualLightBrightness: 80,
    manualHvacMode: 'OFF',
    powerRatings: {
      lightWatts: 450,
      acWatts: 1800,
      fanWatts: 120,
      projectorWatts: 280,
      baseIdleWatts: 45,
    },
    tariffRate: 7.50,
    currency: '₹',
  },
  {
    id: 'CR-103',
    name: 'Classroom 103: Advanced Computing Lab',
    type: 'Workstation Computer Lab',
    capacity: 30,
    occupancy: 0,
    availableSeats: 30,
    isOvercapacity: false,
    hasMotorizedScreen: false,
    daylightOrientation: 'North-Facing Diffused',
    cameraFeedMode: 'stream_empty',
    cameraConnected: true,
    cameraError: null,
    luxSensorConnected: true,
    luxSensorError: null,
    ambientLux: 180,
    targetLux: 500,
    minBrightnessPct: 15,
    maxBrightnessPct: 100,
    lightState: 'OFF',
    lightBrightnessPct: 0,
    emptyDelaySeconds: 300,
    emptyCountdownRemaining: 0,
    hvacMode: 'OFF',
    fanSpeed: 0,
    acTemp: 22,
    energySavingPolicyActive: true,
    projectionActive: false,
    screenPosition: 'NOT_EQUIPPED',
    preProjectionLightBrightness: 0,
    preProjectionLightState: 'OFF',
    manualOverrideActive: false,
    manualLightBrightness: 0,
    manualHvacMode: 'OFF',
    powerRatings: {
      lightWatts: 540,
      acWatts: 3000,          // Dual Split AC for high IT thermal load
      fanWatts: 160,
      projectorWatts: 250,
      baseIdleWatts: 280,     // Network switch & server rack idle
    },
    tariffRate: 7.50,
    currency: '₹',
  },
];

/**
 * Calculates daylight dimming brightness percentage given ambient lux.
 */
export function calculateDaylightBrightness(
  lux: number,
  targetLux: number = 500,
  minPct: number = 15,
  maxPct: number = 100
): number {
  if (lux >= targetLux) {
    return minPct;
  }
  if (lux <= 50) {
    return maxPct;
  }
  const ratio = (targetLux - lux) / (targetLux - 50);
  const brightness = minPct + ratio * (maxPct - minPct);
  return Math.min(maxPct, Math.max(minPct, Math.round(brightness)));
}

/**
 * Calculates real-time instantaneous power, baseline, and savings.
 */
export function calculateEnergyMetrics(classroom: ClassroomState): EnergyMetrics {
  const { powerRatings, lightBrightnessPct, hvacMode, projectionActive, tariffRate } = classroom;

  // Active power (Optimized)
  const lightW = (lightBrightnessPct / 100) * powerRatings.lightWatts;
  
  let hvacW = 0;
  if (hvacMode === 'AC') {
    hvacW = powerRatings.acWatts;
  } else if (hvacMode === 'FAN') {
    hvacW = powerRatings.fanWatts;
  }

  const projW = projectionActive ? powerRatings.projectorWatts : 0;
  const baseW = powerRatings.baseIdleWatts;

  const totalOptimizedWatts = baseW + lightW + hvacW + projW;

  // Baseline power (Unmanaged Classroom):
  // Lights 100% full brightness, simultaneous AC & Fan running, projector standby drain
  const baselineLightW = powerRatings.lightWatts;
  const baselineHvacW = powerRatings.acWatts + powerRatings.fanWatts;
  const baselineProjW = projectionActive ? powerRatings.projectorWatts : 25; // standby
  const totalBaselineWatts = baseW + baselineLightW + baselineHvacW + baselineProjW;

  const wattsSaved = Math.max(0, totalBaselineWatts - totalOptimizedWatts);
  const savingsPct = totalBaselineWatts > 0 ? (wattsSaved / totalBaselineWatts) * 100 : 0;

  const optKw = totalOptimizedWatts / 1000;
  const baseKw = totalBaselineWatts / 1000;
  const savedKw = wattsSaved / 1000;

  const costPerHour = optKw * tariffRate;
  const costSavedPerHour = savedKw * tariffRate;

  return {
    optimizedWatts: Math.round(totalOptimizedWatts),
    optimizedKw: Number(optKw.toFixed(3)),
    baselineWatts: Math.round(totalBaselineWatts),
    baselineKw: Number(baseKw.toFixed(3)),
    wattsSaved: Math.round(wattsSaved),
    kwSaved: Number(savedKw.toFixed(3)),
    savingsPct: Number(savingsPct.toFixed(1)),
    costPerHour: Number(costPerHour.toFixed(2)),
    costSavedPerHour: Number(costSavedPerHour.toFixed(2)),
    breakdown: {
      lightingWatts: Math.round(lightW),
      hvacWatts: Math.round(hvacW),
      projectorWatts: Math.round(projW),
      baseWatts: Math.round(baseW),
    },
  };
}

/**
 * Generates 7-day weekly comparison data with daily records.
 */
export function generateWeeklyReport(classroom: ClassroomState): WeeklyReport {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Baseline scaling factors by room type
  const baseMultiplier = classroom.id === 'CR-101' ? 1.0 : classroom.id === 'CR-102' ? 0.75 : 1.25;
  const baselineKwhRaw = [28.6, 31.2, 29.8, 32.5, 27.4, 11.8, 5.4];
  const optimizedKwhRaw = [14.8, 16.1, 15.2, 16.9, 14.2, 4.8, 1.8];

  const dailyRecords: DailyRecord[] = days.map((day, idx) => {
    const b = Number((baselineKwhRaw[idx] * baseMultiplier).toFixed(2));
    const o = Number((optimizedKwhRaw[idx] * baseMultiplier).toFixed(2));
    const saved = Number((b - o).toFixed(2));
    const pct = Number(((saved / b) * 100).toFixed(1));
    const costSaved = Number((saved * classroom.tariffRate).toFixed(2));
    const baselineCost = Number((b * classroom.tariffRate).toFixed(2));
    const optimizedCost = Number((o * classroom.tariffRate).toFixed(2));

    return {
      day,
      baselineKwh: b,
      optimizedKwh: o,
      savedKwh: saved,
      savingsPct: pct,
      costSaved,
      baselineCost,
      optimizedCost,
    };
  });

  const totalBase = Number(dailyRecords.reduce((acc, r) => acc + r.baselineKwh, 0).toFixed(2));
  const totalOpt = Number(dailyRecords.reduce((acc, r) => acc + r.optimizedKwh, 0).toFixed(2));
  const totalSaved = Number((totalBase - totalOpt).toFixed(2));
  const avgPct = Number(((totalSaved / totalBase) * 100).toFixed(1));
  const totalCostSaved = Number((totalSaved * classroom.tariffRate).toFixed(2));

  return {
    roomId: classroom.id,
    currencySymbol: classroom.currency,
    costPerKwh: classroom.tariffRate,
    weeklyTotalBaselineKwh: totalBase,
    weeklyTotalOptimizedKwh: totalOpt,
    weeklyTotalSavedKwh: totalSaved,
    weeklyAverageSavingsPct: avgPct,
    weeklyTotalCostSaved: totalCostSaved,
    dailyRecords,
  };
}
