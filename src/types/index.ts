export type RoomId = 'CR-101' | 'CR-102' | 'CR-103';

export type HVACMode = 'OFF' | 'FAN' | 'AC';
export type LightState = 'ON' | 'OFF' | 'DIMMED' | 'PROJECTION_MODE' | 'DELAY_PENDING';
export type ScreenPosition = 'DEPLOYED' | 'RETRACTED' | 'NOT_EQUIPPED';

export interface PowerRatings {
  lightWatts: number;      // Total luminaires at 100%
  acWatts: number;         // Air conditioner compressor & blower
  fanWatts: number;        // Ceiling fans combined
  projectorWatts: number;  // Projector + AV screen
  baseIdleWatts: number;   // Standby sensors & router
}

export interface ClassroomState {
  id: RoomId;
  name: string;
  type: string;
  capacity: number;
  occupancy: number;
  availableSeats: number;
  isOvercapacity: boolean;
  hasMotorizedScreen: boolean;
  daylightOrientation: string;
  
  // CCTV & Vision
  cameraFeedMode: 'stream_lecture' | 'stream_crowd' | 'stream_empty' | 'stream_seminar' | 'webcam';
  cameraConnected: boolean;
  cameraError: string | null;

  // Daylight & Lighting
  luxSensorConnected: boolean;
  luxSensorError: string | null;
  ambientLux: number;
  targetLux: number;
  minBrightnessPct: number;
  maxBrightnessPct: number;
  lightState: LightState;
  lightBrightnessPct: number;
  emptyDelaySeconds: number;       // default 300 (5 min)
  emptyCountdownRemaining: number; // remaining seconds

  // HVAC
  hvacMode: HVACMode;
  fanSpeed: number;                // 1, 2, 3
  acTemp: number;                  // 18 - 26
  energySavingPolicyActive: boolean; // Mutually exclusive Fan vs AC

  // Projection
  projectionActive: boolean;
  screenPosition: ScreenPosition;
  preProjectionLightBrightness: number;
  preProjectionLightState: LightState;

  // Manual Override & Hardware Barrier
  manualOverrideActive: boolean;
  manualLightBrightness: number;
  manualHvacMode: HVACMode;

  // Power & Cost
  powerRatings: PowerRatings;
  tariffRate: number;              // currency per kWh (e.g. 7.50)
  currency: string;                // "₹"
}

export interface EnergyMetrics {
  optimizedWatts: number;
  optimizedKw: number;
  baselineWatts: number;
  baselineKw: number;
  wattsSaved: number;
  kwSaved: number;
  savingsPct: number;
  costPerHour: number;
  costSavedPerHour: number;
  breakdown: {
    lightingWatts: number;
    hvacWatts: number;
    projectorWatts: number;
    baseWatts: number;
  };
}

export interface DailyRecord {
  day: string;
  baselineKwh: number;
  optimizedKwh: number;
  savedKwh: number;
  savingsPct: number;
  costSaved: number;
  baselineCost: number;
  optimizedCost: number;
}

export interface WeeklyReport {
  roomId: RoomId;
  currencySymbol: string;
  costPerKwh: number;
  weeklyTotalBaselineKwh: number;
  weeklyTotalOptimizedKwh: number;
  weeklyTotalSavedKwh: number;
  weeklyAverageSavingsPct: number;
  weeklyTotalCostSaved: number;
  dailyRecords: DailyRecord[];
}

export interface PythonTestFeature {
  id: string;
  name: string;
  status: 'PASSED' | 'FAILED';
}

export interface PythonTestResult {
  success: boolean;
  output: string;
  errorOutput?: string;
  summary: {
    tests_run: number;
    success: boolean;
    failures: number;
    errors: number;
    features_verified: PythonTestFeature[];
  };
}

export interface AIAuditRecommendation {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
  estimatedSavingsPct: number;
}

export interface AIAuditReport {
  overallScore: number;
  executiveSummary: string;
  recommendations: AIAuditRecommendation[];
  peakDemandAlert: string;
  estimatedMonthlyCostReduction: string;
}
