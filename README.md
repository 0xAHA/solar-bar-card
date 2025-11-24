# ☀️ Solar Bar Card for Home Assistant

*Visualize your solar power distribution with an intuitive, real-time bar chart. Perfect for monitoring production, consumption, exports, and EV charging at a glance!*

![HACS Badge](https://img.shields.io/badge/HACS-Custom-orange.svg)
![Version](https://img.shields.io/badge/Version-2.1.0-blue.svg)
[![GitHub Issues](https://img.shields.io/github/issues/0xAHA/solar-bar-card.svg)](https://github.com/0xAHA/solar-bar-card/issues)
[![GitHub Stars](https://img.shields.io/github/stars/0xAHA/solar-bar-card.svg?style=social)](https://github.com/0xAHA/solar-bar-card)

![1759611909382.png](https://github.com/0xAHA/solar-bar-card/raw/main/1759611909382.png)

![1761360830828.png](https://github.com/0xAHA/solar-bar-card/raw/main/1761360830828.png)

---

## ✨ Features

### 🔋 Battery Integration (NEW in v2.0.0!)

* **Adjacent bars layout** - Battery and solar bars side-by-side with proportional widths
* **Proportional sizing** - Bar widths based on battery capacity vs inverter size
* **Visual SOC indicator** - Battery bar fills from left showing state of charge
* **Flexible configuration** - Single sensor or dual charge/discharge sensors
* **Animated flow lines** - Shows charging/discharging direction with particles
* **Smart stats tiles** - Maximum 4 tiles with single-line headers
* **Compact legend** - Short labels to prevent wrapping

### 📊 Net Import/Export History (NEW in v2.1.0!)

* **Daily energy tracking** - Connect your daily import/export energy sensors
* **Net position indicator** - Green dot = net exporter, red dot = net importer for the day
* **Second line on tiles** - Shows daily kWh totals on import/export tiles
* **Perfect for template sensors** - Works with Utility Meter helpers or custom templates

### 📍 Header Sensors (NEW in v2.1.0!)

* **Up to 2 additional sensors** - Add custom sensors to the header bar
* **Spread layout** - Title, sensors, and weather evenly distributed across header
* **Flexible formatting** - Custom icons (emoji), labels, and units
* **Click for history** - All header sensors are clickable to show entity history

### 🎨 Visual Power Distribution

* **Color-coded bar** showing real-time power allocation
* **Green** for solar self-consumption
* **Orange** for EV charging (solar + grid split)
* **Red/Coral** for grid import
* **Grey dashed** for potential EV charging capacity
* **Semi-transparent** for unused inverter capacity
* **Yellow dotted line** for solar forecast
* **Grid icon dynamically changes** 🟢 green when exporting, 🟠 orange when importing

### 🎨 Customizable Color Palettes

* **6 beautiful preset palettes** with soft pastel colors:
  * 🌞 Classic Solar - Bright, traditional solar colors
  * 🌸 Soft Meadow - Gentle pastels with spring vibes
  * 🌊 Ocean Sunset - Warm sunset meets cool ocean
  * 🌿 Garden Fresh - Natural greens and soft tones
  * 🍑 Peachy Keen - Warm peach and lavender blend
  * ☁️ Cloudy Day - Soft, cloudy sky palette
* **Custom color overrides** - Override any individual color while keeping the palette
* **Color picker integration** in the UI editor

### ⚙️ Organized Configuration UI

* **Well-organized sections** with emoji visual grouping:
  * ⚙️ Basic Settings - Inverter capacity
  * 🔌 Entity Configuration - Power sensors
  * 🚗 EV Charger - EV-related settings
  * 🔮 Forecast - Solcast and custom forecast
  * 🎨 Appearance & Colors - Palette, header, weather
  * 👁️ Display Options - Stats, legend, bar options
* **Visual palette selector** with emoji icons
* **Clear section headers** in helper text for easy navigation

### 🌙 Smart Idle Detection

* Automatically detects when solar system is in standby mode
* Shows "Solar system in standby mode" message
* Prevents displaying stale data overnight

### 🚗 Intelligent EV Charger Support

* **Smart power flow visualization** - Automatically splits EV charging into solar (green) vs grid (orange)
* **EV Ready Indicator** - Shows ⚡🚗 icon when excess solar can power your charger (half/full charge detection)
* **Potential capacity display** - Shows additional charging capacity available (grey dashed bar)
* **Active charging detection** - Displays actual charging power with proper color coding

### 🌤️ Weather Integration

* Dynamic weather icons (☀️ sunny, 🌧️ rainy, ⛈️ stormy, etc.)
* Supports both weather entities and temperature sensors
* Displays in top-right corner

### 📊 Solar Forecast

* Integration with Solcast (auto-detection)
* Support for custom forecast sensors
* Visual lightning bolt indicator on bar

### 🎛️ Flexible Display

Toggle any component on/off:

* Header with title
* Individual power statistics (4 tiles)
* Power distribution label
* Color-coded legend with values
* Weather/temperature display
* Bar segment values
* Tick marks with scale labels

### 📱 Responsive Design

* Adapts to Sections view
* Works in Masonry view
* Dynamic card sizing
* Mobile-friendly

---

## 🚀 Installation

### Method 1: HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=0xAHA&repository=solar-bar-card&category=dashboard)

1. Open **HACS** in your Home Assistant instance
2. Click on **Frontend**
3. Click the **⋮** menu and select **Custom repositories**
4. Add repository URL: `https://github.com/0xAHA/solar-bar-card`
5. Category: **Lovelace**
6. Click **Install**
7. Restart Home Assistant

### Method 2: Manual Installation

1. Download `solar-bar-card.js` and `solar-bar-card-palettes.js` from [latest release](https://github.com/0xAHA/solar-bar-card/releases)
2. Copy both files to `<config>/www/`
3. Add resource to dashboard:
   ```yaml
   resources:  - url: /local/solar-bar-card.js    type: module
   ```
4. Restart Home Assistant

**Note:** Both `.js` files are required as of v1.0.8 for the color palette system.

---

## 🎯 Quick Start

### Basic Setup

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
import_entity: sensor.grid_import_power
```

### With Color Palette

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
import_entity: sensor.grid_import_power
color_palette: ocean-sunset
show_legend: true
```

### Full Featured Setup

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
import_entity: sensor.grid_import_power
color_palette: garden-fresh
show_header: true
header_title: "Solar Power"
show_weather: true
weather_entity: weather.home
show_stats: true
show_legend: true
show_legend_values: true
show_bar_values: true
ev_charger_sensor: sensor.ev_charger_power
car_charger_load: 7.4
use_solcast: true
```

---

## ⚙️ Configuration Options


| Option                    | Type    | Default           | Description                                                                                                                   |
| --------------------------- | --------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `inverter_size`           | number  | `10`              | 🔋 Maximum solar system capacity (kW)                                                                                         |
| `production_entity`       | string  | `null`            | ☀️ Solar production power sensor (required)                                                                                 |
| `self_consumption_entity` | string  | `null`            | 🏠 Home power consumption sensor (required)                                                                                   |
| `grid_power_entity`       | string  | `null`            | ⚡ Combined grid sensor (positive=export, negative=import) - overrides separate import/export sensors. (optional/alternative) |
| `invert_grid_power`       | boolean | `false`           | ⚡ Inverts grid_power_entity sensor import/export value. (optional)                                                           |
| `export_entity`           | string  | `null`            | ⚡ Grid export power sensor (optional/alternative)                                                                            |
| `import_entity`           | string  | `null`            | 📥 Grid import power sensor (optional/alternative)                                                                            |
| `ev_charger_sensor`       | string  | `null`            | 🔌 Active EV charger power sensor (optional)                                                                                  |
| `car_charger_load`        | number  | `0`               | 🚗 EV charger capacity in kW (for potential display)                                                                          |
| `use_solcast`             | boolean | `false`           | ☁️ Auto-detect Solcast forecast sensor                                                                                      |
| `forecast_entity`         | string  | `null`            | 📈 Solar forecast power sensor                                                                                                |
| `color_palette`           | string  | `"classic-solar"` | 🎨 Preset color scheme (see Color Palettes section)                                                                           |
| `custom_colors`           | object  | `{}`              | 🎨 Override individual colors (see Color Palettes section)                                                                    |
| `show_header`             | boolean | `false`           | 📝 Display card title                                                                                                         |
| `header_title`            | string  | `"Solar Power"`   | 🏷️ Custom title text                                                                                                        |
| `show_weather`            | boolean | `false`           | 🌡️ Display current temperature                                                                                              |
| `weather_entity`          | string  | `null`            | 🌤️ Weather or temperature sensor                                                                                            |
| `header_sensor_1`         | object  | `null`            | 📍 First header sensor `{entity, name, icon, unit}`                                                                          |
| `header_sensor_2`         | object  | `null`            | 📍 Second header sensor `{entity, name, icon, unit}`                                                                         |
| `import_history_entity`   | string  | `null`            | 📊 Daily grid import energy sensor (kWh)                                                                                      |
| `export_history_entity`   | string  | `null`            | 📊 Daily grid export energy sensor (kWh)                                                                                      |
| `show_net_indicator`      | boolean | `true`            | 🔴🟢 Show net import/export indicator on tiles                                                                               |
| `show_stats`              | boolean | `false`           | 📊 Display power statistics tiles                                                                                             |
| `show_legend`             | boolean | `true`            | 🎨 Display color-coded legend                                                                                                 |
| `show_legend_values`      | boolean | `true`            | 🔢 Show kW values in legend                                                                                                   |
| `show_bar_label`          | boolean | `true`            | 🏷️ Show power distribution label above bar                                                                                  |
| `show_bar_values`         | boolean | `true`            | 📊 Show kW values on bar segments                                                                                             |

---

## 🎨 Color Palettes

### Available Palettes

The card includes 6 carefully designed soft pastel color palettes:


| Palette         | Icon | Description                      | Best For                         |
| ----------------- | ------ | ---------------------------------- | ---------------------------------- |
| `classic-solar` | 🌞   | Bright, traditional solar colors | Clear, professional dashboards   |
| `soft-meadow`   | 🌸   | Gentle pastels with spring vibes | Light, airy themes               |
| `ocean-sunset`  | 🌊   | Warm sunset meets cool ocean     | Balanced, harmonious displays    |
| `garden-fresh`  | 🌿   | Natural greens and soft tones    | Eco-friendly, natural aesthetics |
| `peachy-keen`   | 🍑   | Warm peach and lavender blend    | Warm, inviting interfaces        |
| `cloudy-day`    | ☁️ | Soft, cloudy sky palette         | Subtle, minimal designs          |
| `custom`        | 🎨   | Define your own colors           | Complete customization           |

### Using Presets

Simply specify the palette key:

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
color_palette: ocean-sunset
```

### Custom Color Overrides

Override specific colors while keeping the palette base:

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
color_palette: classic-solar
custom_colors:
  solar: '#FFA500'      # Override just solar to orange
  ev_charge: '#FF6347'  # Override just EV to tomato red
```

### Fully Custom Colors

Use the `custom` palette and define all colors:

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
color_palette: custom
custom_colors:
  solar: '#FFE082'
  export: '#A5D6A7'
  import: '#FFAB91'
  self_usage: '#B39DDB'
  ev_charge: '#81D4FA'
```

### Color Mappings


| Color Key    | Used For                                           | Example Hex |
| -------------- | ---------------------------------------------------- | ------------- |
| `solar`      | Solar production, forecast indicator               | `#FFE082`   |
| `export`     | Grid export (blue bar)                             | `#A5D6A7`   |
| `import`     | Grid import (coral/red bar)                        | `#FFAB91`   |
| `self_usage` | Solar self-consumption (green bar), EV ready icon  | `#B39DDB`   |
| `ev_charge`  | EV charging (orange bar), EV ready icon half-power | `#81D4FA`   |

### Using the Visual Editor

In the Home Assistant UI editor:

1. Add or edit the Solar Bar Card
2. Expand the **🎨 Appearance & Colors** section
3. Select a palette from the dropdown (shows emoji + name)
4. Optionally expand **Custom Color Overrides** to tweak individual colors
5. Use the color picker for visual selection

---

## 🎨 Understanding the Bar

### Segments


| Color                    | Meaning                | When Shown                                                 |
| -------------------------- | ------------------------ | ------------------------------------------------------------ |
| 🟢**Green**              | Solar self-consumption | Solar power used by your home (excluding EV)               |
| 🟠**Orange**             | EV charging            | EV power from solar (bright) or grid (darker)              |
| 🔴**Coral/Red**          | Grid import            | Power imported from grid (home usage)                      |
| 🔵**Blue**               | Grid export            | Power sent to the grid                                     |
| ⬜**Light Grey Dashed**  | EV potential           | Additional charger capacity available                      |
| 🔳**Semi-transparent**   | Unused capacity        | Available inverter capacity                                |
| ⚡**Yellow dotted line** | Solar forecast         | Predicted solar production                                 |
| ⚡🚗**EV Ready Icon**    | Excess solar ready     | Appears when excess solar can power EV (green/orange glow) |

**v2.0.1 Solar Bar Visualization:**

* When solar output < consumption: Dashed outline shows total demand, solid shaded section shows actual solar contribution
* Grid import no longer appears on solar bar (keeps it focused on solar performance)
* Grid icon dynamically changes: 🟢 green when exporting, 🟠 orange when importing

### Power Flow Logic

The card intelligently splits power consumption to show you exactly where your energy is coming from:

* **Home consumption from solar** (green) - Your house running on sunshine
* **Home consumption from grid** (coral) - Grid power for your house
* **EV consumption from solar** (bright orange) - Your car charging on sunshine
* **EV consumption from grid** (darker orange) - Grid power for your car

This gives you instant visibility into how much of your consumption (home + EV) is solar-powered vs grid-powered!

---

## 🌤️ Weather Integration

### Weather Entity (Dynamic Icons)

```yaml
show_weather: true
weather_entity: weather.home
```

**Supported weather states:**

* ☀️ Sunny
* ⛅ Partly cloudy
* ☁️ Cloudy
* 🌦️ Rainy
* 🌧️ Pouring
* ⛈️ Thunderstorm
* 🌨️ Snowy
* 🌫️ Fog
* 💨 Windy
* 🌙 Clear night

### Temperature Sensor (Thermometer Icon)

```yaml
show_weather: true
weather_entity: sensor.outdoor_temperature
```

---

## 🚗 EV Charger Integration

### Smart Power Flow Visualization

When you have an active EV charger sensor, the card automatically splits the EV charging power into solar vs grid:

```yaml
ev_charger_sensor: sensor.ev_charger_power
car_charger_load: 7.4
```

**What you see:**

* **Bright orange segment** - EV power coming from solar
* **Darker orange segment** - EV power coming from grid
* **Green segment** - Home consumption from solar (excluding EV)
* **Coral segment** - Home consumption from grid (excluding EV)

This gives you instant visibility into whether your EV is charging on sunshine or grid power!

### EV Ready Indicator

When excess solar is available and you're not currently charging:

* **Orange ⚡🚗** - Excess solar can cover 50%+ of your EV charger capacity
* **Green ⚡🚗** - Excess solar can fully power your EV charger

Perfect for knowing when to plug in!

### Potential Capacity (Grey Dashed Bar)

Shows additional charging capacity available beyond current export:

```yaml
car_charger_load: 7.4
```

The grey dashed bar intelligently shows only the **additional** power needed. For example:

* Currently exporting 2kW
* Charger capacity is 7.4kW
* Grey bar shows: 5.4kW (the extra power needed)

---

## 📈 Solar Forecast Integration

### Solcast (Auto-Detection)

```yaml
use_solcast: true
```

Automatically finds Solcast forecast sensors like:

* `sensor.solcast_pv_forecast_power_now`
* `sensor.solcast_forecast_power_now`
* `sensor.solcast_power_now`

**Note:** The forecast indicator only appears when the forecasted power exceeds your current production.

### Custom Forecast

```yaml
forecast_entity: sensor.your_forecast_power_sensor
```

The forecast appears as a **yellow vertical dotted line with lightning bolt** (⚡) showing predicted solar production.

---

## 🔧 Troubleshooting

### 💥 Card Not Appearing

1. **Clear browser cache:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Verify resource:** Developer Tools → Resources
3. **Check console:** F12 → Console tab for errors
4. **Ensure both files are present:** Both `solar-bar-card.js` and `solar-bar-card-palettes.js` must be in `/config/www/`

### 🎨 Colors Not Changing

1. **Clear browser cache** - Color changes require a hard refresh
2. **Verify both files are installed** - The palette system needs both `.js` files
3. **Check palette name** - Must match exactly (e.g., `ocean-sunset` not `ocean_sunset`)
4. **Inspect custom_colors format** - Must use hex format `#RRGGBB`

### ⚙️ Expandable Sections Not Showing

* **Check Home Assistant version** - Requires HA 2023.9 or later
* The visual editor needs the `type: "expandable"` fields to render properly
* You can still configure via YAML without the UI sections

### ❌ Wrong Values Displayed

* ✅ Ensure sensors report in **W** or **kW** units
* ✅ Card automatically converts W → kW
* ✅ Verify entity IDs are correct
* ✅ Check that `production_entity` is a power sensor (not energy/kWh)
* ✅ Import sensor is optional but recommended for accurate grid import display

### 📊 Using Cumulative Sensors (kWh)

If your inverter only provides **total energy** sensors, create derivative helpers:

1. **Settings** → **Devices & Services** → **Helpers**
2. **Create Helper** → **Derivative**
3. Configure:
   * **Input sensor:** Your cumulative sensor
   * **Time window:** 5 minutes
   * **Unit time:** Hours
4. Use the derivative sensor in your card config

This converts kWh accumulation → instantaneous kW power!

---

## 🎯 Example Configurations

### Minimalist

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
color_palette: cloudy-day
show_legend: false
show_bar_label: false
show_bar_values: false
```

### Dashboard Hero

```yaml
type: custom:solar-bar-card
inverter_size: 13.2
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
import_entity: sensor.grid_import_power
color_palette: garden-fresh
show_header: true
header_title: "🏡 Home Solar"
show_weather: true
weather_entity: weather.forecast_home
show_stats: true
show_legend: true
show_legend_values: true
show_bar_values: true
ev_charger_sensor: sensor.wallbox_power
car_charger_load: 11
use_solcast: true
```

### EV Focus

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_load
export_entity: sensor.grid_export
import_entity: sensor.grid_import
color_palette: peachy-keen
show_header: true
header_title: "⚡ Solar + EV"
ev_charger_sensor: sensor.ev_charger_power
car_charger_load: 7.4
show_legend: true
show_stats: true
show_bar_values: true
custom_colors:
  ev_charge: '#FF6B35'  # Make EV charging stand out
```

### Ocean Theme

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
color_palette: ocean-sunset
show_header: true
header_title: "☀️ Ocean Power"
show_weather: true
weather_entity: weather.home
show_legend: true
show_bar_label: true
```

### With Net Import/Export History

Track your daily energy balance with net position indicator:

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
grid_power_entity: sensor.grid_power
show_stats: true
show_legend: true
# Daily energy sensors (create with Utility Meter helper)
import_history_entity: sensor.daily_grid_import
export_history_entity: sensor.daily_grid_export
show_net_indicator: true
```

**Result:** Import/Export tiles show:
- Current power (e.g., "1.2 kW")
- Daily total (e.g., "+4.2 kWh" or "-3.1 kWh")
- Green/red indicator showing net position

### With Header Sensors

Add custom sensors like electricity price or forecast to the header:

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
show_header: true
header_title: "Solar"
show_weather: true
weather_entity: weather.home
header_sensor_1:
  entity: sensor.solcast_forecast_today
  name: "Forecast"
  icon: "⚡"
  unit: "kWh"
header_sensor_2:
  entity: sensor.electricity_price
  name: "Rate"
  icon: "💰"
  unit: "¢/kWh"
```

**Result:** Header shows spread layout:
```
☀️ Solar     ⚡ Forecast: 12.5kWh     💰 Rate: 8.5¢/kWh     ☁️ 72°F
```

### Full Featured with Everything

```yaml
type: custom:solar-bar-card
inverter_size: 13.2
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
grid_power_entity: sensor.grid_power
color_palette: garden-fresh
show_header: true
header_title: "🏡 Solar"
show_weather: true
weather_entity: weather.home
header_sensor_1:
  entity: sensor.daily_solar_yield
  name: "Today"
  icon: "☀️"
  unit: "kWh"
show_stats: true
show_legend: true
show_legend_values: true
show_bar_values: true
import_history_entity: sensor.daily_grid_import
export_history_entity: sensor.daily_grid_export
show_net_indicator: true
ev_charger_sensor: sensor.wallbox_power
car_charger_load: 11
use_solcast: true
```

---

## 🤝 Contributing

Contributions welcome! Feel free to:

* 🐛 Report bugs
* 💡 Suggest features
* 🎨 Submit new color palettes
* 🔧 Submit pull requests

Please [open an issue](https://github.com/0xAHA/solar-bar-card/issues) for discussion first.

### Adding Your Own Palette

Want to contribute a new color palette? Edit `solar-bar-card-palettes.js`:

```javascript
export const COLOR_PALETTES = {
  'my-awesome-palette': {
    name: 'My Awesome Palette',
    icon: '✨',
    description: 'Your amazing color scheme',
    colors: {
      solar: '#XXXXXX',
      export: '#XXXXXX',
      import: '#XXXXXX',
      self_usage: '#XXXXXX',
      ev_charge: '#XXXXXX'
    }
  },
  // ... existing palettes
};
```

Submit a PR with your palette for consideration!

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Credits

* Inspired by the **pool-monitor-card**
* Built for the **Home Assistant** community
* Maintained by [@0xAHA](https://github.com/0xAHA)

---

## 📊 Version History

**v2.1.0** (Current)

* 📊 **Net Import/Export History** - Track daily energy with import/export history sensors
* 🔴🟢 **Net Position Indicator** - Green/red dot on tiles showing if you're a net exporter or importer
* 📈 **Daily Totals on Tiles** - Second line showing daily kWh on import/export tiles
* 📍 **Header Sensors** - Add up to 2 custom sensors to the header bar
* 🎯 **Spread Layout** - Header items evenly distributed (title, sensors, weather)
* 🖱️ **Clickable Sensors** - Header sensors open entity history on click

**v2.0.8**

* ⚖️ **Bar Width** - Fixed bar width when battery bar hidden
* 🎨 **More Colours!** - Added more diverse profiles to the colour palette

**v2.0.6**

* ⚖️ **Decimal Precision** - Added configurable decimal places (1, 2 or 3 decimal places)

**v2.0.5**

* 🐛 **Battery Flow Animation** - Fixed misaligned flow animation between battery and solar bars
* 🎯 **Smoother Animation** - Improved flow animation with bigger particles and better overlap for mobile visibility
* 🏷️ **Solar Text Overlap** - Fixed "Solar" label overlapping with kW values when bar values are shown

**v2.0.4**

* 🐛 **Battery SoC** - Fixed battery SoC value showing too many decimal places - now just one!
* 🚦 **More-Info** - Clicking any of the card elements now shows the more-info (history graph) for the related entity

**v2.0.3**

* 🐛 **Grid Power display Bugfix** - Fixed incorrect grid import display when battery is charging

**v2.0.2**

* 🐛 **Battery Display Bugfix** - Battery showing on solar bar when charging from grid

**v2.0.1**

* 🐛 **Battery Discharge Bugfix** - Fixed battery discharge incorrectly showing as solar import
* 🚦 **Smart Grid Icon** - Separated import/export icons (🟢 green when exporting, 🟠 orange when importing)
* 📊 **Improved Solar Visualization** - Dashed line shows full consumption demand, shaded portion shows actual solar output
* ⚖️ **Better Balance** - Battery section capped at 30% card width to keep solar as the hero
* 🎨 **Cleaner Grid Logic** - Solar export shows on solar bar, grid import no longer clutters it

**v2.0.0**

* 🔋 **Battery Integration** - Side-by-side adjacent bars layout with proportional widths
* 📊 **Proportional Bar Sizing** - Battery and solar bars sized based on capacity ratios
* 🔌 **Flexible Battery Configuration** - Single sensor with optional invert OR dual charge/discharge sensors
* ⚡ **Animated Flow Lines** - Visual charging/discharging indicators between bars
* 📉 **Optimized Stats Tiles** - Limited to 4 tiles with single-line headers (Solar, Import/Export, Usage, Battery/EV)
* 🏷️ **Compact Labels** - Shortened legend labels to prevent wrapping (Solar, Import, Export, Usage, Batt, EV)
* 🎨 **Battery Bar Color** - Added to all 7 color palettes
* 📱 **Mobile-Friendly** - Battery label shows just percentage on small screens
* 🎨 **Clean Config UI** - Removed emojis, organized sections with clear separators

**v1.0.9**

* ✨ **Improved Configuration UI** - Well-organized sections with emoji visual grouping
* 🎨 **Fixed Color Palette Selector** - Color palette is now clearly visible and accessible
* 📁 **Better Organization** - Entity, EV Charger, Forecast, Appearance, and Display sections with emoji icons (⚙️ 🔌 🚗 🔮 🎨 👁️)
* ✅ **Universal Compatibility** - Works across all Home Assistant versions
* ✅ **Full Backward Compatibility** - Existing configs work without changes

**v1.0.8**

* 🎨 **6 Beautiful Color Palettes** - Soft pastel themes with visual selector
* 🎨 **Custom Color Overrides** - Fine-tune individual colors while keeping palettes
* 🌈 **Color Picker Integration** - Visual color selection in UI
* 📦 **Separate Palette File** - Clean architecture with `solar-bar-card-palettes.js`
* ✅ **Full Backward Compatibility** - Existing configs work without changes

**v1.0.7**

* ✨ Invert Grid Power Values - Enable if your grid sensor reports from meter perspective (positive=import, negative=export) - for Enphase, Powerly, etc.

**v1.0.2**

* ✨ Manual entity configuration (removed Growatt auto-detection)
* 📥 Added grid import sensor support
* 🌙 Idle/standby state detection
* 🎨 Softer color scheme (amber EV charging)
* 📊 Toggle for bar segment values
* 🧮 Smart EV potential calculation (accounts for export)
* ⚡ Improved Solcast integration (uses power_now sensor)
* 📏 Tighter vertical spacing for better layout
* 🔧 Refined stats tiles (shows either import OR export)

**v1.0.0**

* ✨ Initial release
* 🚗 EV charger support
* 🌤️ Weather integration
* 📈 Solar forecast display
* 🎨 Fully customizable display

---

## 📊 Known Issues

None currently! 🎉

Report issues at: https://github.com/0xAHA/solar-bar-card/issues

---

**Made with ☀️ for the Home Assistant community**
