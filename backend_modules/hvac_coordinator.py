"""
Fan & AC HVAC Coordination Module
DSU Code Clash 2.0 - Smart Classroom Automation

Operating Modes: 'OFF', 'FAN', 'AC'
Enforces Energy-Saving Mutual Exclusion Policy:
Prevents Fan and AC from running simultaneously.
Preserves user cooling preferences across projection mode changes.
"""

from typing import Dict, Any

class HVACCoordinator:
    def __init__(self, room_id: str, energy_saving_policy: bool = True):
        self.room_id = room_id
        self.energy_saving_policy = energy_saving_policy
        self.mode = "OFF"  # "OFF", "FAN", "AC"
        self.fan_speed = 0  # 0, 1, 2, 3
        self.ac_temp = 24  # degrees Celsius
        self.is_manual_override = False
        self.cached_cooling_mode = "OFF"

    def set_mode(self, requested_mode: str, fan_speed: int = 2, ac_temp: int = 24) -> Dict[str, Any]:
        """
        Sets cooling mode while strictly preventing simultaneous Fan and AC operation.
        """
        requested_mode = requested_mode.upper()
        if requested_mode not in ["OFF", "FAN", "AC"]:
            raise ValueError(f"Invalid HVAC mode: {requested_mode}. Must be 'OFF', 'FAN', or 'AC'")

        if self.energy_saving_policy:
            # Mutual exclusion enforcement
            if requested_mode == "AC":
                self.mode = "AC"
                self.ac_temp = ac_temp
                self.fan_speed = 0  # Force fan off
                policy_note = "Energy Policy: Fan interlocked OFF while AC is active."
            elif requested_mode == "FAN":
                self.mode = "FAN"
                self.fan_speed = max(1, min(3, fan_speed))
                self.ac_temp = 0  # AC off
                policy_note = "Energy Policy: AC interlocked OFF while Fan is active."
            else:
                self.mode = "OFF"
                self.fan_speed = 0
                self.ac_temp = 0
                policy_note = "HVAC powered down."
        else:
            self.mode = requested_mode
            policy_note = "Non-restricted mode active."

        # Cache cooling state for projection persistence
        self.cached_cooling_mode = self.mode

        return {
            "mode": self.mode,
            "fan_running": self.mode == "FAN",
            "fan_speed": self.fan_speed,
            "ac_running": self.mode == "AC",
            "ac_temp": self.ac_temp if self.mode == "AC" else None,
            "simultaneous_prevented": True,
            "policy_active": self.energy_saving_policy,
            "message": policy_note
        }

    def handle_projection_change(self, is_projection_active: bool) -> Dict[str, Any]:
        """
        Preserves user cooling mode when projection mode is toggled.
        """
        # Feature 3: Cooling state must NOT be reset or perturbed when presentation starts or ends
        return {
            "projection_active": is_projection_active,
            "preserved_mode": self.mode,
            "fan_running": self.mode == "FAN",
            "ac_running": self.mode == "AC",
            "message": f"Cooling mode '{self.mode}' preserved during projection transition."
        }
