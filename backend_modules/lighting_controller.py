"""
Automatic Lighting Controller Module
DSU Code Clash 2.0 - Smart Classroom Automation

Controls classroom illumination based on:
1. Occupancy: Auto-ON when occupancy > 0.
2. Empty room delay: Wait for configurable delay (default 300 seconds / 5 mins) before auto-OFF.
3. Natural daylight dimming: Dims in daylight, brightens in darkness.
4. Projection mode override: Dims or switches off for presentations.
"""

from typing import Dict, Any, Optional
import time

class LightingController:
    def __init__(
        self,
        room_id: str,
        empty_delay_seconds: int = 300,  # 5 minutes default
        target_lux: int = 500,
        min_brightness_pct: int = 15,
        max_brightness_pct: int = 100
    ):
        self.room_id = room_id
        self.empty_delay_seconds = empty_delay_seconds
        self.target_lux = target_lux
        self.min_brightness_pct = min_brightness_pct
        self.max_brightness_pct = max_brightness_pct

        self.state = "OFF"  # "ON", "OFF", "DIMMED", "PROJECTION_MODE"
        self.brightness_pct = 0
        self.empty_start_time: Optional[float] = None
        self.is_manual_override = False
        self.saved_pre_projection_brightness = 100

    def calculate_daylight_brightness(self, ambient_lux: float) -> int:
        """
        Calculates required artificial brightness (0 - 100%) to meet target_lux.
        If natural daylight is high (> target_lux), artificial light dims to min_brightness_pct.
        If night/dark (< 50 lux), artificial light goes to max_brightness_pct (100%).
        """
        if ambient_lux >= self.target_lux:
            return self.min_brightness_pct
        elif ambient_lux <= 50:
            return self.max_brightness_pct
        
        # Linear daylight dimming interpolation
        ratio = (self.target_lux - ambient_lux) / (self.target_lux - 50)
        calculated = self.min_brightness_pct + ratio * (self.max_brightness_pct - self.min_brightness_pct)
        return int(max(self.min_brightness_pct, min(self.max_brightness_pct, round(calculated))))

    def update(
        self,
        occupancy: int,
        ambient_lux: float,
        is_projection_mode: bool,
        current_time: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Evaluates current classroom conditions and adjusts lighting.
        """
        now = current_time if current_time is not None else time.time()

        if self.is_manual_override:
            return {
                "state": self.state,
                "brightness_pct": self.brightness_pct,
                "override": True,
                "empty_countdown_remaining": 0,
                "message": "Manual override active"
            }

        # Check occupancy
        if occupancy > 0:
            # Cancel any empty room countdown
            self.empty_start_time = None

            if is_projection_mode:
                self.state = "PROJECTION_MODE"
                self.brightness_pct = 15  # Presentation dimming level
                message = "Projection mode active: Lights dimmed for screen readability"
            else:
                self.brightness_pct = self.calculate_daylight_brightness(ambient_lux)
                self.state = "ON" if self.brightness_pct >= 80 else "DIMMED"
                message = f"Occupancy detected ({occupancy}). Ambient light: {ambient_lux} lux -> Set to {self.brightness_pct}%"

            return {
                "state": self.state,
                "brightness_pct": self.brightness_pct,
                "override": False,
                "empty_countdown_remaining": 0,
                "message": message
            }
        else:
            # Room is empty (occupancy == 0)
            if self.empty_start_time is None:
                self.empty_start_time = now

            elapsed_empty = now - self.empty_start_time
            remaining = max(0, self.empty_delay_seconds - elapsed_empty)

            if elapsed_empty >= self.empty_delay_seconds:
                # Delay expired: switch lights OFF
                self.state = "OFF"
                self.brightness_pct = 0
                return {
                    "state": "OFF",
                    "brightness_pct": 0,
                    "override": False,
                    "empty_countdown_remaining": 0,
                    "message": f"Room empty. {self.empty_delay_seconds}s delay expired. Lights turned OFF."
                }
            else:
                # In delay period: keep lights on/dimmed until timeout
                countdown_pct = self.calculate_daylight_brightness(ambient_lux)
                if is_projection_mode:
                    countdown_pct = 15
                self.brightness_pct = countdown_pct
                return {
                    "state": "DELAY_PENDING",
                    "brightness_pct": self.brightness_pct,
                    "override": False,
                    "empty_countdown_remaining": round(remaining, 1),
                    "message": f"Room empty. Turning off in {int(remaining)}s (Energy saving delay active)."
                }
