# 📦 Solar Bar Card v2.0.0-beta - Package Contents

## Files Included

### Core Files (Required)
1. **solar-bar-card.js** (49KB)
   - Main card component with battery support
   - Animated flow visualization
   - All color palettes integrated

2. **solar-bar-card-palettes.js** (3.4KB)
   - Color palette definitions
   - Battery colors included in all palettes
   - Helper functions for color management

### Documentation
3. **README-v2.0.0-beta.md** (10KB)
   - Complete feature documentation
   - Configuration examples
   - Troubleshooting guide
   - All power flow scenarios explained

4. **INSTALL.md** (3.9KB)
   - Quick installation steps
   - Common battery sensor patterns
   - Troubleshooting tips

5. **example-config.yaml** (2.4KB)
   - Ready-to-use configuration
   - Commented options
   - Multiple integration examples

6. **PACKAGE_CONTENTS.md** (this file)
   - Package overview
   - File locations

---

## Installation Quick Start

### 1. Extract Files
```bash
tar -xzf solar-bar-card-v2.0.0-beta.tar.gz
cd v2.0.0-beta
```

### 2. Copy to Home Assistant
Copy these 2 files to your HA installation:
```
solar-bar-card.js           → config/www/
solar-bar-card-palettes.js  → config/www/
```

### 3. Add Resource
In Home Assistant:
- Settings → Dashboards → Resources → Add Resource
- URL: `/local/solar-bar-card.js`
- Type: JavaScript Module

### 4. Configure Card
Use `example-config.yaml` as a starting point. Update entity names to match your system.

---

## What's New in v2.0.0

### 🔋 Battery Support
- Floating battery indicator showing SOC% and power
- Visual battery icon with dynamic fill level
- Color-coded states (green/yellow/red based on SOC)
- Pulsing border when charging/discharging

### ✨ Animated Flow Visualization
- SVG-based flow lines showing energy direction
- Particle animations along curved paths
- Smart routing (charging vs discharging vs export)
- Configurable animation speed (0.5-5 seconds)
- Color-coded flows:
  - Green: Battery charging from solar
  - Blue: Battery discharging to home
  - Amber: Battery discharging to grid export

### 🎨 Enhanced Palettes
All 7 color palettes now include:
- `battery_charge` - Color for charging state
- `battery_discharge` - Color for discharging state

### 📊 Stats Integration
- Battery stats tile with SOC% and power
- Pulsing effects when active
- Arrow indicators (⬆️/⬇️)

---

## Key Configuration Options

### Battery (New)
```yaml
battery_power_entity: sensor.battery_power      # Required
battery_soc_entity: sensor.battery_soc          # Required
battery_capacity: 10                            # Optional (kWh)
show_battery_flow: true                         # Show animations
battery_flow_animation_speed: 2                 # Seconds/cycle
```

### Existing Options (Still Supported)
- Solar production, consumption, grid power
- EV charger support
- Solar forecast (Solcast)
- Weather integration
- Custom color overrides
- Stats, legend, labels

---

## Battery Power Sensor Convention

⚠️ **Important:** Your battery power sensor must follow this pattern:
- **Positive values** (+) = Battery charging
- **Negative values** (-) = Battery discharging

Example values:
- `+2.5` kW = Charging at 2.5kW
- `-3.2` kW = Discharging at 3.2kW
- `0.0` kW = Idle

If your sensor is inverted, see INSTALL.md for template sensor example.

---

## File Locations After Installation

```
Home Assistant
├── config/
│   ├── www/
│   │   ├── solar-bar-card.js              ← Main file
│   │   └── solar-bar-card-palettes.js     ← Palettes
│   └── configuration.yaml                  ← (Template sensors if needed)
└── Lovelace Dashboard
    └── (Your card configuration)
```

---

## Browser Compatibility

### Tested & Working
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+ (macOS/iOS)
- ✅ Home Assistant Companion App

### Known Issues
- Safari < 14: SVG animations may not work
- Internet Explorer: Not supported

---

## Performance Notes

### Recommended
- Desktop/laptop: Full animations, 2s speed
- Modern tablets: Full animations, 2-3s speed
- Modern phones: Full animations, 2-3s speed

### Slower Devices
- Older tablets: `show_battery_flow: false`
- Older phones: `show_battery_flow: false`
- Raspberry Pi 3: Works fine with animations

---

## Backward Compatibility

✅ **Fully backward compatible with v1.0.9**

Existing configurations work without changes:
- If no battery entities configured → behaves exactly like v1.0.9
- All existing features unchanged
- Battery features are opt-in

---

## Support & Feedback

This is a **beta release** - please test thoroughly!

**Found a bug?**
- Check INSTALL.md troubleshooting section
- Review README-v2.0.0-beta.md for detailed docs
- Open GitHub issue with:
  - HA version
  - Browser/device
  - Configuration (sanitized)
  - Screenshots

**Want to suggest improvements?**
- Flow animation enhancements
- Additional battery features
- UI/UX improvements
- Performance optimizations

---

## Version History

**v2.0.0-beta** (Current)
- Initial battery support
- Animated flow visualization
- Enhanced color palettes

**v1.0.9** (Previous stable)
- Grouped config UI layout
- Color palette selector
- Removed System Capacity tile

---

## Next Steps

1. Read **INSTALL.md** for step-by-step setup
2. Review **example-config.yaml** for configuration
3. Consult **README-v2.0.0-beta.md** for detailed features
4. Test with your battery system
5. Provide feedback!

---

**Built with ☀️🔋 for the Home Assistant community**
