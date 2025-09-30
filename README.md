# ☀️ Solar Bar Card for Home Assistant

*Visualize your solar power distribution with an intuitive, real-time bar chart. Perfect for monitoring production, consumption, exports, and EV charging at a glance!*

![HACS Badge](https://img.shields.io/badge/HACS-Custom-orange.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
[![GitHub Issues](https://img.shields.io/github/issues/0xAHA/solar-bar-card.svg)](https://github.com/0xAHA/solar-bar-card/issues)
[![GitHub Stars](https://img.shields.io/github/stars/0xAHA/solar-bar-card.svg?style=social)](https://github.com/0xAHA/solar-bar-card)

![Solar Bar Card](https://via.placeholder.com/800x400?text=Solar+Bar+Card+Screenshot)

---

## ✨ Features

### 🎨 Visual Power Distribution
- **Color-coded bar** showing real-time power allocation
- **Green** for self-consumption
- **Blue** for grid export
- **Orange/Red** for active EV charging
- **Grey** for potential EV charging capacity
- **Semi-transparent** for unused inverter capacity

### 🔌 Growatt ModbusTCP Integration
Designed to work seamlessly with the **[Growatt ModbusTCP HACS integration](https://github.com/0xAHA/Growatt_ModbusTCP)**:
- Automatically detects all Growatt inverter entities
- Just enter your device name - no manual entity configuration needed
- Supports all Growatt inverter models via Modbus TCP

### 🚗 EV Charger Support
- Show potential charging capacity (grey dashed bar)
- Display actual charging power (colored bar)
- Automatically switches between modes

### 🌤️ Weather Integration
- Dynamic weather icons (☀️ sunny, 🌧️ rainy, ⛈️ stormy, etc.)
- Supports both weather entities and temperature sensors
- Displays in top-right corner

### 📊 Solar Forecast
- Integration with Solcast (auto-detection)
- Support for custom forecast sensors
- Visual lightning bolt indicator on bar

### 🎛️ Flexible Display
Toggle any component on/off:
- Header with title
- Individual power statistics (4 tiles)
- Power distribution label
- Color-coded legend with values
- Weather/temperature display

### 📱 Responsive Design
- Adapts to Sections view
- Works in Masonry view
- Dynamic card sizing
- Mobile-friendly

---

## 🚀 Installation

### Method 1: HACS (Recommended)

1. Open **HACS** in your Home Assistant instance
2. Click on **Frontend**
3. Click the **⋮** menu and select **Custom repositories**
4. Add repository URL: `https://github.com/0xAHA/solar-bar-card`
5. Category: **Lovelace**
6. Click **Install**
7. Restart Home Assistant

### Method 2: Manual Installation

1. Download `solar-bar-card.js` from [latest release](https://github.com/0xAHA/solar-bar-card/releases)
2. Copy to `<config>/www/solar-bar-card.js`
3. Add resource to dashboard:
   ```yaml
   resources:
     - url: /local/solar-bar-card.js
       type: module
   ```
4. Restart Home Assistant

---

## 🎯 Quick Start

### Minimal Setup (Growatt)
```yaml
type: custom:solar-bar-card
inverter_size: 10
auto_entities: true
growatt_device: "Growatt Inverter"
```

### Manual Configuration
```yaml
type: custom:solar-bar-card
inverter_size: 10
self_consumption_entity: sensor.home_power
export_entity: sensor.grid_export_power
```

### Full Featured Setup
```yaml
type: custom:solar-bar-card
inverter_size: 10
auto_entities: true
growatt_device: "Growatt Inverter"
show_header: true
header_title: "Solar Power"
show_weather: true
weather_entity: weather.home
show_stats: true
show_legend: true
show_legend_values: true
car_charger_load: 7.4
ev_charger_sensor: sensor.ev_charger_power
forecast_entity: sensor.solcast_forecast_today
show_bar_label: true
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `inverter_size` | number | `10` | 🔋 Maximum solar system capacity (kW) |
| `auto_entities` | boolean | `false` | 🤖 Auto-detect Growatt sensors |
| `growatt_device` | string | `null` | 📛 Growatt device name for auto-detection |
| `self_consumption_entity` | string | `null` | 🏠 Home power consumption sensor |
| `export_entity` | string | `null` | ⚡ Grid export power sensor |
| `car_charger_load` | number | `0` | 🚗 EV charger capacity (kW) |
| `ev_charger_sensor` | string | `null` | 🔌 Active EV charger power sensor |
| `use_solcast` | boolean | `false` | ☁️ Auto-detect Solcast forecast |
| `forecast_entity` | string | `null` | 📈 Solar forecast sensor |
| `show_header` | boolean | `false` | 📝 Display card title |
| `header_title` | string | `"Solar Power"` | 🏷️ Custom title text |
| `show_weather` | boolean | `false` | 🌡️ Display current temperature |
| `weather_entity` | string | `null` | 🌤️ Weather or temperature sensor |
| `show_stats` | boolean | `false` | 📊 Display power statistics tiles |
| `show_legend` | boolean | `true` | 🎨 Display color-coded legend |
| `show_legend_values` | boolean | `true` | 🔢 Show kW values in legend |
| `show_bar_label` | boolean | `true` | 🏷️ Show power distribution label |

---

## 🎨 Understanding the Bar

### Segments

| Color | Meaning | When Shown |
|-------|---------|------------|
| 🟢 **Green** | Self-consumption | Power used by your home |
| 🔵 **Blue** | Grid export | Power sent to the grid |
| 🔶 **Orange/Red** | EV charging (active) | When EV is actually charging |
| ⬜ **Light Grey** | EV potential | Charger capacity (not charging) |
| 🔳 **Semi-transparent** | Unused capacity | Available inverter capacity |
| ⚡ **Yellow line** | Solar forecast | Predicted peak production |

---

## 🌤️ Weather Integration

### Weather Entity (Dynamic Icons)
```yaml
show_weather: true
weather_entity: weather.home
```

**Supported weather states:**
- ☀️ Sunny
- ⛅ Partly cloudy
- ☁️ Cloudy
- 🌦️ Rainy
- 🌧️ Pouring
- ⛈️ Thunderstorm
- 🌨️ Snowy
- 🌫️ Fog
- 💨 Windy
- 🌙 Clear night

### Temperature Sensor (Thermometer Icon)
```yaml
show_weather: true
weather_entity: sensor.outdoor_temperature
```

---

## 🚗 EV Charger Integration

### Potential Capacity (Grey Bar)
Shows what *could* be used for EV charging:
```yaml
car_charger_load: 7.4
```

### Active Charging (Colored Bar)
Displays actual power when charging:
```yaml
car_charger_load: 7.4
ev_charger_sensor: sensor.ev_charger_power
```

When `ev_charger_sensor` reports > 0W, the grey bar becomes a colored charging bar automatically!

---

## 📈 Solar Forecast Integration

### Solcast (Auto-Detection)
```yaml
use_solcast: true
```
Automatically finds sensors like:
- `sensor.solcast_pv_forecast_forecast_today`
- `sensor.solcast_forecast_today`

### Custom Forecast
```yaml
forecast_entity: sensor.your_forecast_sensor
```

The forecast appears as a **yellow vertical line with lightning bolt** (⚡) showing predicted peak production.

---

## 🤖 Growatt ModbusTCP Integration

This card is specifically designed to work with the **[Growatt ModbusTCP HACS integration](https://github.com/0xAHA/Growatt_ModbusTCP)**!

### Prerequisites
First, install the Growatt ModbusTCP integration:
1. Add the integration via HACS
2. Configure your Growatt inverter connection
3. Note your device name (e.g., "Growatt Inverter")

### Auto-Detection
Once the ModbusTCP integration is installed, this card automatically finds:
- ✅ Self consumption / Load power
- ✅ Grid export / Grid power  
- ✅ PV total power / Solar production

```yaml
auto_entities: true
growatt_device: "Growatt Inverter"
```

**Device name matching:**
- Must match your Growatt device name in Home Assistant
- Case-insensitive
- Looks for entities with matching `friendly_name`

### Manual Override
Don't have the ModbusTCP integration? No problem! You can manually specify any entities:

```yaml
inverter_size: 10
self_consumption_entity: sensor.home_power
export_entity: sensor.grid_export_power
```

---

## 🔧 Troubleshooting

### 💥 Card Not Appearing
1. **Clear browser cache:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Verify resource:** Developer Tools → Resources
3. **Check console:** F12 → Console tab for errors

### ❌ Wrong Values Displayed
- ✅ Ensure sensors report in **W** or **kW** units
- ✅ Card automatically converts W → kW
- ✅ Verify entity IDs are correct

### 🔍 Growatt Auto-Detection Not Working
- ✅ Check device name matches exactly
- ✅ Ensure entities have proper `device_class` or `friendly_name`
- ✅ Use manual entity configuration as fallback

### 📊 Using Cumulative Sensors (kWh)

If your inverter only provides **total energy** sensors, create derivative helpers:

1. **Settings** → **Devices & Services** → **Helpers**
2. **Create Helper** → **Derivative**
3. Configure:
   - **Input sensor:** Your cumulative sensor
   - **Time window:** 5 minutes
   - **Unit time:** Hours
4. Use the derivative sensor in your card config

This converts kWh accumulation → instantaneous kW power!

---

## 🎯 Example Configurations

### Minimalist
```yaml
type: custom:solar-bar-card
inverter_size: 10
auto_entities: true
growatt_device: "Growatt Inverter"
show_legend: false
show_bar_label: false
```

### Dashboard Hero
```yaml
type: custom:solar-bar-card
inverter_size: 13.2
auto_entities: true
growatt_device: "Growatt Inverter"
show_header: true
header_title: "🏡 Home Solar"
show_weather: true
weather_entity: weather.forecast_home
show_stats: true
show_legend: true
show_legend_values: true
car_charger_load: 11
ev_charger_sensor: sensor.wallbox_power
use_solcast: true
```

### EV Focus
```yaml
type: custom:solar-bar-card
inverter_size: 10
self_consumption_entity: sensor.home_load
export_entity: sensor.grid_export
show_header: true
header_title: "⚡ Solar + EV"
car_charger_load: 7.4
ev_charger_sensor: sensor.ev_charger_power
show_legend: true
show_stats: false
```

---

## 🤝 Contributing

Contributions welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

Please [open an issue](https://github.com/0xAHA/solar-bar-card/issues) for discussion first.

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Credits

- Inspired by the **pool-monitor-card**
- Built for the **Home Assistant** community
- Maintained by [@0xAHA](https://github.com/0xAHA)

---

## 📊 Version History

**v1.0.0** (Current)
- ✨ Initial release
- 🤖 Growatt auto-detection
- 🚗 EV charger support
- 🌤️ Weather integration
- 📈 Solar forecast display
- 🎨 Fully customizable display

---

**Made with ☀️ for the Home Assistant community**
