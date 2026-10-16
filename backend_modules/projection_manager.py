"""
Projection Mode Manager Module
DSU Code Clash 2.0 - Smart Classroom Automation

Handles:
1. Presentation toggle & motorized projector screen automation.
2. Presentation lighting scene (dim to 15% or turn off).
3. Maintaining active HVAC state without interruption.
4. Intelligent state restoration upon exit, recalculating optimal lighting
   based on real-time occupancy and daylight readings.
"""

from typing import Dict, Any, Optional

class ProjectionManager:
    def __init__(self, room_id: str, has_motorized_screen: bool = True):
        self.room_id = room_id
        self.has_motorized_screen = has_motorized_screen
        self.is_active = False
        self.screen_position = "RETRACTED"  # "DEPLOYED", "RETRACTED", "NOT_EQUIPPED"
        self.pre_projection_light_state = "ON"
        self.pre_projection_brightness = 100

    def activate_projection(self, current_light_state: str, current_brightness: int) -> Dict[str, Any]:
        """
        Activates projection mode:
        - Saves pre-projection lighting state
        - Deploys motorized screen if equipped
        - Dims lights to presentation level (15%)
        """
        self.is_active = True
        self.pre_projection_light_state = current_light_state
        self.pre_projection_brightness = current_brightness

        if self.has_motorized_screen:
            self.screen_position = "DEPLOYED"

        return {
            "projection_active": True,
            "screen_position": self.screen_position,
            "target_brightness_pct": 15,
            "target_light_state": "PROJECTION_MODE",
            "message": "Projection Mode ENGAGED: Screen deployed and luminaires dimmed for presentation."
        }

    def deactivate_projection(
        self,
        current_occupancy: int,
        current_daylight_lux: float,
        target_lux: int = 500,
        min_pct: int = 15,
        max_pct: int = 100
    ) -> Dict[str, Any]:
        """
        Deactivates projection mode:
        - Retracts motorized screen
        - Restores lighting state respecting CURRENT occupancy and daylight readings.
        """
        self.is_active = False
        if self.has_motorized_screen:
            self.screen_position = "RETRACTED"

        # Restore lighting considering current occupancy & daylight
        if current_occupancy == 0:
            restored_state = "OFF"
            restored_brightness = 0
            reason = "Restored to OFF because classroom has zero occupancy."
        else:
            if current_daylight_lux >= target_lux:
                restored_brightness = min_pct
            elif current_daylight_lux <= 50:
                restored_brightness = max_pct
            else:
                ratio = (target_lux - current_daylight_lux) / (target_lux - 50)
                restored_brightness = int(round(min_pct + ratio * (max_pct - min_pct)))
            
            restored_state = "ON" if restored_brightness >= 80 else "DIMMED"
            reason = f"Restored based on current occupancy ({current_occupancy}) and ambient daylight ({current_daylight_lux} lux)."

        return {
            "projection_active": False,
            "screen_position": self.screen_position,
            "restored_state": restored_state,
            "restored_brightness_pct": restored_brightness,
            "reason": reason,
            "message": "Projection Mode DISENGAGED: Screen retracted and dynamic lighting restored."
        }
