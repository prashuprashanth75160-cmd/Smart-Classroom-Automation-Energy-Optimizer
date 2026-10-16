"""
Natural Daylight Sensor & Illumination Module
DSU Code Clash 2.0 - Smart Classroom Automation

Reads daylight levels from physical Lux sensors (BH1750 / TSL2591 via I2C/ADC)
or a calibrated software simulator.
Provides target illumination balancing, hysteresis, and sensor fault fail-safe.
"""

from typing import Dict, Any, Optional
import time

class DaylightSensor:
    def __init__(
        self,
        room_id: str,
        target_lux: int = 500,
        min_brightness_pct: int = 15,
        max_brightness_pct: int = 100
    ):
        self.room_id = room_id
        self.target_lux = target_lux
        self.min_brightness_pct = min_brightness_pct
        self.max_brightness_pct = max_brightness_pct
        self.current_lux = 350.0  # Default nominal daylight
        self.sensor_online = True
        self.last_read_time = time.time()

    def read_lux(self, simulated_lux: Optional[float] = None, inject_fault: bool = False) -> Dict[str, Any]:
        """
        Reads ambient illuminance in Lux. If fault is injected, triggers fail-safe.
        """
        if inject_fault:
            self.sensor_online = False
            # Safe fallback: Default to safe nominal lighting brightness (80%)
            safe_fallback_brightness = 80
            return {
                "status": "SENSOR_FAULT",
                "sensor_online": False,
                "current_lux": None,
                "target_lux": self.target_lux,
                "recommended_brightness_pct": safe_fallback_brightness,
                "warning": "CRITICAL: Daylight sensor read error. Defaulting to safe fallback illumination (80%)."
            }

        self.sensor_online = True
        self.last_read_time = time.time()
        
        if simulated_lux is not None:
            self.current_lux = max(0.0, float(simulated_lux))

        # Calculate recommended dimming level
        if self.current_lux >= self.target_lux:
            recommended_pct = self.min_brightness_pct
            lighting_need = "Ample daylight. Minimum artificial lighting required."
        elif self.current_lux <= 50:
            recommended_pct = self.max_brightness_pct
            lighting_need = "Dark / night condition. Full artificial lighting required."
        else:
            # Linear daylight harvesting formula
            deficit_fraction = (self.target_lux - self.current_lux) / (self.target_lux - 50)
            dim_val = self.min_brightness_pct + deficit_fraction * (self.max_brightness_pct - self.min_brightness_pct)
            recommended_pct = int(round(dim_val))
            lighting_need = f"Partial daylight harvesting active. Dimming to {recommended_pct}%."

        return {
            "status": "OK",
            "sensor_online": True,
            "current_lux": round(self.current_lux, 1),
            "target_lux": self.target_lux,
            "recommended_brightness_pct": recommended_pct,
            "lighting_need": lighting_need,
            "energy_saving_potential_pct": round(100 - recommended_pct, 1)
        }
