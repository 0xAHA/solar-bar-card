# Battery Design v2 - Adjacent Bars

## Layout Concept

```
┌─────────────────────────────────────────────────────────┐
│ Solar Power Card                              🌤️ 24°C  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────┬────────┬────────┬────────┐                  │
│ │ Solar  │ Import │ Usage  │Battery │ ← 4 tiles max    │
│ │ 8.5 kW │ 0 kW   │ 6.2 kW │ 2.1 kW │                  │
│ └────────┴────────┴────────┴────────┘                  │
│                                                          │
│ Power Flow (0-15kW total)                               │
│                                                          │
│ ┌────────┐  ⚡→  ┌─────────────────────────────────┐   │
│ │        │       │ Solar │ Batt │ Home │ Export   │   │
│ │  85%   │       │ 6.4kW │ 2.1  │ 6.2  │ 2.3      │   │
│ │ ▓▓▓▓▓▓ │       │       │      │      │          │   │
│ │ ▓▓▓▓▓▓ │       └─────────────────────────────────┘   │
│ │ ▓▓▓▓▓▓ │  ← Battery SOC filled from bottom           │
│ │ ░░░░░░ │                                              │
│ └────────┘                                              │
│   33%          66%                                      │
│ (Battery)    (Power Flow)                              │
│                                                          │
│ ☀️ Solar  ▓ Usage  ▓ EV  ▓ Batt  ▓ Export              │
│ 8.5kW     4.1kW   0kW   2.1kW   2.3kW                   │
└─────────────────────────────────────────────────────────┘
```

## Proportional Widths

- `batteryWidth = battery_capacity / (battery_capacity + inverter_size)`
- `powerWidth = inverter_size / (battery_capacity + inverter_size)`

Example: 5kW battery + 10kW solar = 33% battery, 66% power

## Battery Bar
- Fills from bottom based on SOC%
- Color gradient: Red (<20%) → Yellow (20-50%) → Green (>50%)
- Shows "XX%" label centered

## Flow Line
- Small arrow/line connecting bars
- Green when charging (→)
- Blue when discharging (←)
- Position between the two bars

## Stats Tiles (4 max)
Always show:
1. Solar Production
2. Import OR Export (whichever is active)
3. Total Usage
4. Battery OR EV (whichever has higher power, or battery if both)

Single-line labels only.

## Legend
Compact labels:
- "Solar" (not "Solar Production")
- "Import" / "Export" (not "Grid Import/Export")
- "Usage" (not "Home Usage")
- "Battery" (not "Battery Charging")
- "EV" (not "EV Charging")

Keep to 5-6 items max to prevent wrapping.
