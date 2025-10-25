# Battery Design v2 - Adjacent Bars

## Layout Concept

```
┌─────────────────────────────────────────────────────────┐
│ Solar Power Card                                 24°C   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────┬─────────┬─────────┬──────────┐             │
│ │ Solar   │ Export  │ Usage   │ Battery  │ ← 4 tiles   │
│ │ 8.5 kW  │ 2.3 kW  │ 6.2 kW  │ ↑2.1 kW  │   max       │
│ └─────────┴─────────┴─────────┴──────────┘             │
│                                                          │
│ Power Flow       Battery 85% | 0 - 10kW                 │
│                                                          │
│ ┌────────┐→┌──────────────────────────────────────┐    │
│ │  85%   ││ Solar │ Batt │ Home │ Export          │    │
│ │ ▓▓▓▓▓▓ ││ 6.4kW │ 2.1  │ 6.2  │ 2.3             │    │
│ │ ▓▓▓▓▓▓ ││       │      │      │                 │    │
│ │ ░░░░░░ │└──────────────────────────────────────┘    │
│ └────────┘  ← Battery SOC fills from left               │
│   33%          66%                                       │
│ (Battery)    (Power Flow)                               │
│                                                          │
│ ☀️ Solar 8.5kW  ▓ Usage 6.2kW  ▓ Batt 2.1kW            │
│ ▓ Export 2.3kW                                          │
└─────────────────────────────────────────────────────────┘
```

## Proportional Widths

- `batteryWidth = battery_capacity / (battery_capacity + inverter_size)`
- `powerWidth = inverter_size / (battery_capacity + inverter_size)`

Example: 5kW battery + 10kW solar = 33% battery, 66% power

## Battery Bar
- Fills from LEFT based on SOC%
- Color gradient: Red (<20%) → Yellow (20-50%) → Green (>50%)
- Shows "XX%" label centered when SOC > 15%
- Same height as power bar (32px)
- Rounded corners on left side only

## Flow Line
- Small horizontal line connecting bars
- Green when charging (power → battery)
- Blue/Amber when discharging (battery → power/export)
- Positioned at junction between the two bars
- Animated particles flow along the line

## Stats Tiles (4 max)
Priority order:
1. Solar (always shown)
2. Export OR Import (whichever is active)
3. Usage (always shown)
4. Battery OR EV (battery takes priority if power >= EV power)

Single-line labels only:
- "Solar" (not "Solar Production")
- "Export" / "Import" (not "Grid Export/Import")
- "Usage" (not "Total Usage")
- "Battery XX%" with ↑/↓ arrow
- "EV"

## Legend
Compact labels (no colons before values):
- "Solar 8.5kW" (not "Solar: 8.5kW")
- "Import 1.2kW" / "Export 2.3kW"
- "Usage 6.2kW"
- "Batt 2.1kW"
- "EV 7.4kW"

Priority order (shows active items only):
1. Solar (if producing)
2. Usage (if consuming)
3. EV (if charging)
4. Battery (if charging/discharging)
5. Export (if exporting)
6. Import (if importing)

Keep to 5-6 items max to prevent wrapping to two lines.
