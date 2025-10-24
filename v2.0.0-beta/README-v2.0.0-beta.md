# 🔋 Solar Bar Card v2.0.0-beta - Battery Support

> **BETA VERSION** - Test before deploying to production

---

## 🎉 What's New in v2.0.0

### 🔋 Battery Integration

The card now includes **full battery support** with:

- **Floating Battery Indicator** - Shows battery state of charge (SOC) and current power flow
- **Animated Flow Lines** - Visualizes energy flow direction with particle animations
- **Smart State Detection** - Automatically detects charging, discharging, and idle states
- **Visual Battery Icon** - Color-coded battery level indicator (green/yellow/red)
- **Flow Animations** - Particles move along curved paths showing energy direction

### ✨ Key Features

1. **Battery States**
   - ⬆️ Charging (green glow, particles flow from bar to battery)
   - ⬇️ Discharging (blue/amber glow, particles flow from battery to bar)
   - ⚡ Idle (grey, no animation)
   - ⚠️ Low Battery (red pulse when SOC < 20%)

2. **Smart Flow Routing**
   - Charging: Flow from solar area to battery
   - Discharging to home: Blue flow to consumption area
   - Discharging to export: Amber flow to export area
   - Curved paths that look natural

3. **Enhanced Stats**
   - Battery power and SOC in stats tiles
   - Pulsing border when active
   - Arrow indicators (⬆️/⬇️)

---

## 📦 Installation

### Files Required

Copy both files to your `config/www/` directory:

1. `solar-bar-card.js` - Main card (v2.0.0-beta)
2. `solar-bar-card-palettes.js` - Color palettes with battery colors

### Add Resource

In your Lovelace resources:

```yaml
resources:
  - url: /local/solar-bar-card.js
    type: module
```

---

## ⚙️ Configuration

### Basic Battery Setup

```yaml
type: custom:solar-bar-card
inverter_size: 12

# Existing sensors
production_entity: sensor.solar_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export
import_entity: sensor.grid_import

# NEW: Battery Configuration
battery_power_entity: sensor.battery_power      # Required: +/- kW
battery_soc_entity: sensor.battery_soc          # Required: % (0-100)
battery_capacity: 10                            # Optional: kWh for stats
show_battery_flow: true                         # Show animated flows (default: true)
battery_flow_animation_speed: 2                 # Seconds per cycle (default: 2)

# Display options
show_stats: true
show_legend: true
color_palette: ocean-sunset
```

### Battery Power Sensor Requirements

**Important:** The `battery_power_entity` must follow this convention:
- **Positive values** = Battery is charging
- **Negative values** = Battery is discharging
- **~0 values** = Battery is idle

Example: If your sensor shows `-2.5` kW, it means the battery is discharging at 2.5kW.

If your battery sensor uses the opposite convention, you may need to create a template sensor:

```yaml
template:
  - sensor:
      - name: "Battery Power Corrected"
        unit_of_measurement: "kW"
        device_class: power
        state: "{{ states('sensor.your_battery_power') | float * -1 }}"
```

### Full Configuration Example

```yaml
type: custom:solar-bar-card
inverter_size: 12
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
import_entity: sensor.grid_import_power

# Battery
battery_power_entity: sensor.battery_power
battery_soc_entity: sensor.battery_soc
battery_capacity: 13.5
show_battery_flow: true
battery_flow_animation_speed: 2

# EV Charger
ev_charger_sensor: sensor.ev_charger_power
car_charger_load: 7.4

# Forecast
use_solcast: true

# Appearance
color_palette: garden-fresh
show_header: true
header_title: "⚡ Solar + Battery"
show_weather: true
weather_entity: weather.home

# Display
show_stats: true
show_legend: true
show_legend_values: true
show_bar_values: true
show_bar_label: true
```

---

## 🎨 Battery Colors

All color palettes now include battery-specific colors:

- `battery_charge` - Color used when battery is charging (default: teal/cyan)
- `battery_discharge` - Color used when battery is discharging (default: light blue)

You can override these in any palette:

```yaml
color_palette: classic-solar
custom_colors:
  battery_charge: '#00E676'     # Bright green
  battery_discharge: '#2979FF'  # Bright blue
```

---

## 🎯 Power Flow Scenarios

### Scenario 1: Charging from Solar

```
☀️ Solar: 8.5kW
🔋 Battery: +2.1kW (Charging to 85%)
🏠 Home: 4.1kW
📤 Export: 2.3kW

Flow: Green particles from solar bar → battery indicator
Bar segments: Solar (6.4kW) | Battery Charge (2.1kW) | Export (2.3kW)
```

### Scenario 2: Discharging to Home

```
☀️ Solar: 3.0kW
🔋 Battery: -3.2kW (Discharging from 45%)
🏠 Home: 6.2kW

Flow: Blue particles from battery → home consumption area
Bar segments: Solar (3.0kW) | Home (6.2kW total, mixed solar+battery)
```

### Scenario 3: Discharging to Grid Export

```
☀️ Solar: 2.0kW
🔋 Battery: -5.0kW (Discharging from 92%)
🏠 Home: 3.0kW
📤 Export: 4.0kW

Flow: Amber particles from battery → export area (curved path)
Bar segments: Mixed consumption and export
```

---

## 🔧 Customization Options

### Animation Speed

Control how fast the particles move:

```yaml
battery_flow_animation_speed: 2    # Default: 2 seconds
                                   # Range: 0.5 - 5 seconds
                                   # Lower = faster particles
```

### Disable Flow Animation

If you find the animation distracting:

```yaml
show_battery_flow: false    # Hides flow lines completely
                            # Battery indicator still shows
```

### Battery Warning Threshold

The battery automatically shows a red pulse when SOC < 20%. This is hardcoded but can be customized by editing the card source (line ~780):

```javascript
${batterySOC < 20 ? 'low-battery' : ''}
```

Change `20` to your preferred threshold.

---

## 🎬 Visual Features

### Battery Indicator Elements

- **Battery Shell** - Visual representation with fill level
- **Terminal** - Small protrusion on right side for realism
- **Fill Level** - Dynamically sized based on SOC%
  - Green: SOC ≥ 50%
  - Yellow/Orange: 20% ≤ SOC < 50%
  - Red: SOC < 20%
- **SOC Percentage** - Large, prominent display
- **Power Value** - With arrow indicators (⬆️/⬇️)
- **Pulsing Border** - When charging/discharging

### Flow Line Details

- **Stroke** - Dashed line with glow effect
- **Color** - Changes based on state (green/blue/amber)
- **Particles** - 5 circular particles in sequence
- **Path** - Curved Bézier path for natural flow
- **Animation** - Smooth `ease-in-out` timing

---

## 📊 Stats Display

When `show_stats: true`, battery appears as its own tile:

```
┌─────────────┬──────────────┬─────────────┐
│ Solar       │ Battery 85%  │ Total Usage │
│ 8.5 kW      │ ⚡⬆️ +2.1 kW │ 6.2 kW      │
└─────────────┴──────────────┴─────────────┘
```

Battery tile features:
- Pulsing colored border (green when charging, blue when discharging)
- Arrow indicator showing direction
- Real-time power value

---

## 🐛 Troubleshooting

### Battery not showing

1. **Check entity names** - Both `battery_power_entity` AND `battery_soc_entity` must be configured
2. **Verify sensor values** - Check in Developer Tools → States
3. **Check SOC units** - Must be in `%` (0-100)
4. **Check power units** - Must be in `W` or `kW`

### Flow animation not visible

1. **Check `show_battery_flow`** - Must be `true` (default)
2. **Battery must be active** - Idle state (<0.05kW) shows no animation
3. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)

### Wrong flow direction

1. **Check power sensor sign** - Positive should be charging, negative discharging
2. **Create template sensor** - If your sensor is inverted (see configuration example above)

### Colors not matching palette

1. **Clear cache** - Browser cache may be stale
2. **Check palette name** - Must match exactly (e.g., `ocean-sunset` not `ocean_sunset`)
3. **Battery colors** - Only v2.0.0 palettes include battery colors

---

## 🔄 Backward Compatibility

**Good news:** Existing configurations work without changes!

- If no battery entities are configured, the card works exactly as v1.0.9
- All existing features remain unchanged
- Battery features are opt-in

---

## 📝 Known Issues / Beta Limitations

1. **SVG rendering** - Some older browsers may not support all SVG features
2. **Performance** - 5 animated particles may impact very old devices
3. **Flow path calculation** - Complex scenarios (battery + EV + export) may need path refinement
4. **Responsive design** - Flow line positions are optimized for desktop, may need adjustment on mobile

---

## 🚀 Future Enhancements (Planned for v2.1.0)

- [ ] Configurable flow particle count
- [ ] Bidirectional flow (battery + grid charging)
- [ ] Battery temperature display
- [ ] Historical battery charge/discharge graph
- [ ] Time to empty / time to full estimates
- [ ] Grid charging detection and visualization

---

## 📸 Screenshots

*(Testing required - add screenshots showing):*
- Battery charging state with green flow
- Battery discharging with blue flow
- Low battery warning state
- All stats tiles including battery
- Legend with battery indicators

---

## 💡 Tips

1. **Optimal Animation Speed** - `2` seconds looks natural; `1` second is fast and energetic
2. **Stats Layout** - With battery, 4-5 tiles work best (Solar, Battery, Usage, Grid)
3. **Color Palette** - Ocean Sunset and Garden Fresh have the best battery color contrast
4. **Mobile View** - Consider hiding flow animation on mobile for better performance

---

## 🙏 Feedback Welcome

This is a beta release! Please test and report:
- Any bugs or issues
- Performance on your hardware
- Visual improvements
- Feature requests

Open an issue on GitHub with:
- Your Home Assistant version
- Browser and device
- Screenshots if visual issue
- Full configuration (sanitized)

---

**Made with 🔋☀️ for the Home Assistant community**
