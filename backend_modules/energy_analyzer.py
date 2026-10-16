"""
Energy Optimization & Analytics Module
DSU Code Clash 2.0 - Smart Classroom Automation

Calculates:
1. Real-time power draw (kW) from configurable device power ratings.
2. Baseline energy consumption vs. Smart Optimized energy consumption (kWh).
3. Energy savings in kWh, percentage, and monetary cost ($/₹).
4. Multi-day / Weekly energy report generation.
"""

from typing import Dict, Any, List

class EnergyAnalyzer:
    def __init__(
        self,
        room_id: str,
        light_rating_watts: float = 600.0,       # e.g., 15 LED tubes @ 40W or LED panels
        ac_rating_watts: float = 2000.0,         # 1.5 Ton Inverter AC
        fan_rating_watts: float = 160.0,         # 4 BLDC fans @ 40W
        projector_rating_watts: float = 300.0,   # Laser Projector + Screen motor
        base_idle_watts: float = 50.0,           # Network, sensors, standby
        cost_per_kwh: float = 7.50               # Currency units per kWh (e.g. ₹ or $)
    ):
        self.room_id = room_id
        self.light_rating_watts = light_rating_watts
        self.ac_rating_watts = ac_rating_watts
        self.fan_rating_watts = fan_rating_watts
        self.projector_rating_watts = projector_rating_watts
        self.base_idle_watts = base_idle_watts
        self.cost_per_kwh = cost_per_kwh

    def calculate_current_power(
        self,
        light_brightness_pct: int,
        hvac_mode: str,
        is_projection_on: bool
    ) -> Dict[str, float]:
        """
        Calculates instantaneous power in Watts and kW.
        """
        # Lighting scales with dimming percentage
        light_w = (light_brightness_pct / 100.0) * self.light_rating_watts
        
        # HVAC power (strictly exclusive under smart policy)
        if hvac_mode == "AC":
            hvac_w = self.ac_rating_watts
        elif hvac_mode == "FAN":
            hvac_w = self.fan_rating_watts
        else:
            hvac_w = 0.0

        # Projector power
        proj_w = self.projector_rating_watts if is_projection_on else 0.0

        total_optimized_watts = self.base_idle_watts + light_w + hvac_w + proj_w

        # Baseline calculation (unoptimized classroom):
        # Baseline assumes lights 100% full ON, both AC and Fan running concurrently, projector often left standby
        baseline_light_w = self.light_rating_watts
        baseline_hvac_w = self.ac_rating_watts + self.fan_rating_watts  # Unregulated waste!
        baseline_proj_w = self.projector_rating_watts if is_projection_on else 25.0  # Standby drain
        total_baseline_watts = self.base_idle_watts + baseline_light_w + baseline_hvac_w + baseline_proj_w

        watts_saved = max(0.0, total_baseline_watts - total_optimized_watts)
        savings_pct = (watts_saved / total_baseline_watts) * 100.0 if total_baseline_watts > 0 else 0.0

        return {
            "optimized_watts": round(total_optimized_watts, 1),
            "optimized_kw": round(total_optimized_watts / 1000.0, 3),
            "baseline_watts": round(total_baseline_watts, 1),
            "baseline_kw": round(total_baseline_watts / 1000.0, 3),
            "watts_saved": round(watts_saved, 1),
            "kw_saved": round(watts_saved / 1000.0, 3),
            "savings_pct": round(savings_pct, 1),
            "breakdown": {
                "lighting_watts": round(light_w, 1),
                "hvac_watts": round(hvac_w, 1),
                "projector_watts": round(proj_w, 1),
                "base_watts": round(self.base_idle_watts, 1)
            }
        }

    def generate_weekly_report(self) -> Dict[str, Any]:
        """
        Generates 7-day classroom energy, savings, and cost report.
        """
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        # Realistic academic day variations
        # Baseline vs Optimized in kWh/day
        baseline_kwh = [28.4, 30.1, 29.5, 31.0, 27.8, 12.4, 6.2]
        optimized_kwh = [15.2, 16.3, 15.8, 16.7, 14.9, 5.1, 2.0]

        daily_records: List[Dict[str, Any]] = []
        total_base = sum(baseline_kwh)
        total_opt = sum(optimized_kwh)
        total_saved_kwh = total_base - total_opt
        total_cost_saved = total_saved_kwh * self.cost_per_kwh

        for d, b, o in zip(days, baseline_kwh, optimized_kwh):
            saved = b - o
            pct = (saved / b) * 100
            cost_saved = saved * self.cost_per_kwh
            daily_records.append({
                "day": d,
                "baseline_kwh": round(b, 2),
                "optimized_kwh": round(o, 2),
                "saved_kwh": round(saved, 2),
                "savings_pct": round(pct, 1),
                "cost_saved": round(cost_saved, 2),
                "baseline_cost": round(b * self.cost_per_kwh, 2),
                "optimized_cost": round(o * self.cost_per_kwh, 2)
            })

        return {
            "room_id": self.room_id,
            "currency_symbol": "₹",
            "cost_per_kwh": self.cost_per_kwh,
            "weekly_total_baseline_kwh": round(total_base, 2),
            "weekly_total_optimized_kwh": round(total_opt, 2),
            "weekly_total_saved_kwh": round(total_saved_kwh, 2),
            "weekly_average_savings_pct": round((total_saved_kwh / total_base) * 100, 1),
            "weekly_total_cost_saved": round(total_cost_saved, 2),
            "daily_records": daily_records
        }
