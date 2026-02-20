# Solar Bar Card for Home Assistant

A real-time solar power distribution card for Home Assistant. Visualize how your solar energy flows between home consumption, grid export/import, battery storage, EV charging, and additional consumers — all in a single, intuitive bar chart.

![HACS Badge](https://img.shields.io/badge/HACS-Custom-orange.svg)
![Version](https://img.shields.io/badge/Version-2.6.0-blue.svg)
[![GitHub Issues](https://img.shields.io/github/issues/0xAHA/solar-bar-card.svg)](https://github.com/0xAHA/solar-bar-card/issues)
[![GitHub Stars](https://img.shields.io/github/stars/0xAHA/solar-bar-card.svg?style=social)](https://github.com/0xAHA/solar-bar-card)

<a href="https://www.buymeacoffee.com/0xAHA" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

![1759611909382.png](https://github.com/0xAHA/solar-bar-card/raw/main/1759611909382.png)

![1761360830828.png](https://github.com/0xAHA/solar-bar-card/raw/main/1761360830828.png)

---

## Key Features

- **Color-coded power bar** — solar (green), grid import (red), grid export (blue), EV charging (orange), with unused capacity and forecast overlay
- **Battery integration** — adjacent battery bar with proportional sizing, animated charge/discharge flow lines, and SOC indicator
- **Stats tiles** — dynamic tile layout that adapts to your setup (solar, import/export, usage, battery, EV, additional consumers)
- **Additional consumers** — add up to 2 extra power consumers (heat pump, pool, hot water, etc.) as stats tiles
- **Daily energy tracking** — connect daily kWh sensors for net import/export position with green/red indicator
- **EV charger support** — automatic solar vs grid split, EV-ready indicator, potential capacity display
- **Solar forecast** — Solcast auto-detection or custom forecast sensor with visual indicator
- **6 color palettes** — plus full custom color support and per-tile background colors
- **Custom labels and tap actions** — rename any element, configure per-element tap actions
- **Multi-language** — 11 languages auto-detected from your Home Assistant setting
- **Compact mode** — `show_stats_detail: false` hides the detail row on tiles for a slimmer card
- **Full visual editor** — organized expandable sections, no YAML required
- **Responsive** — works in Sections view, Masonry view, and mobile

---

## Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=0xAHA&repository=solar-bar-card&category=dashboard)

1. Open **HACS** > **Frontend** > **Custom repositories**
2. Add `https://github.com/0xAHA/solar-bar-card` as **Lovelace**
3. Click **Install** and restart Home Assistant

### Manual Installation

1. Download `solar-bar-card.js` and `solar-bar-card-palettes.js` from [latest release](https://github.com/0xAHA/solar-bar-card/releases)
2. Copy both files to `<config>/www/`
3. Add resource: `resources: - url: /local/solar-bar-card.js  type: module`
4. Restart Home Assistant

**Note:** Both `.js` files are required for the color palette system.

---

## Quick Start

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
import_entity: sensor.grid_import_power
show_stats: true
show_legend: true
```

---

## Configuration Options

### Core Sensors

| Option | Type | Default | Description |
|---|---|---|---|
| `inverter_size` | number | `10` | Maximum solar system capacity in kW. Defines the bar's full-scale range. |
| `production_entity` | string | required | Solar production power sensor. Must report in W or kW (auto-converted). |
| `self_consumption_entity` | string | required | Home power consumption sensor (total home load including EV if active). |
| `grid_power_entity` | string | `null` | Combined grid sensor (positive=export, negative=import). Use this OR separate import/export sensors below. |
| `invert_grid_power` | boolean | `false` | Invert grid power values. Enable if your sensor uses meter perspective (positive=import, negative=export) — common with Enphase, Powerly. |
| `export_entity` | string | `null` | Grid export power sensor. Ignored if `grid_power_entity` is set. |
| `import_entity` | string | `null` | Grid import power sensor. Ignored if `grid_power_entity` is set. |

### Battery

| Option | Type | Default | Description |
|---|---|---|---|
| `battery_soc_entity` | string | `null` | Battery state of charge sensor (0-100%). Required to enable battery features. |
| `battery_power_entity` | string | `null` | Single battery power sensor (positive=charging, negative=discharging). Use this OR dual sensors below. |
| `invert_battery_power` | boolean | `false` | Invert battery power values. Enable if your sensor reports positive=discharging. |
| `battery_charge_entity` | string | `null` | Battery charging power sensor (dual sensor mode). Leave empty if using single sensor above. |
| `battery_discharge_entity` | string | `null` | Battery discharging power sensor (dual sensor mode). Leave empty if using single sensor above. |
| `battery_capacity` | number | `10` | Battery total capacity in kWh. Determines the proportional width of the battery bar relative to inverter size. |
| `show_battery_indicator` | boolean | `true` | Show battery bar adjacent to the power bar with SOC fill level. Width is proportional to capacity. |
| `show_battery_flow` | boolean | `true` | Show animated particle flow lines between battery and solar bars indicating charge/discharge direction. |
| `battery_flow_animation_speed` | number | `2` | Flow animation speed in seconds (lower = faster, range 0.5-10). |

### EV Charger

| Option | Type | Default | Description |
|---|---|---|---|
| `ev_charger_sensor` | string | `null` | Active EV charger power sensor. When set, the bar automatically splits EV charging into solar-powered (bright orange) vs grid-powered (darker orange) segments. |
| `car_charger_load` | number | `0` | EV charger capacity in kW. When set, shows a grey dashed bar segment for potential/unused charging capacity. Also enables the EV-ready indicator icon when excess solar is available. |
| `show_ev_when_idle` | boolean | `false` | Always show EV tile even when not charging. When off (default), tile only appears while actively charging. |
| `ev_history_entity` | string | `null` | Daily EV energy sensor (kWh). Shows daily total on the EV stats tile when stats detail is enabled. |

### Additional Consumers

| Option | Type | Default | Description |
|---|---|---|---|
| `consumer_1_entity` | string | `null` | Power sensor for an additional consumer (e.g., heat pump, pool heater, hot water). Appears as a stats tile only — no bar segment. |
| `consumer_1_name` | string | `null` | Display name for Consumer 1 (e.g., "Heat Pump", "Pool"). Defaults to "Consumer 1" if not set. |
| `consumer_1_history_entity` | string | `null` | Daily energy sensor (kWh) for Consumer 1. Shows daily total on tile when stats detail is enabled. |
| `consumer_2_entity` | string | `null` | Power sensor for a second additional consumer. Same behavior as Consumer 1. |
| `consumer_2_name` | string | `null` | Display name for Consumer 2 (e.g., "Hot Water", "AC"). |
| `consumer_2_history_entity` | string | `null` | Daily energy sensor (kWh) for Consumer 2. Shows daily total on tile when stats detail is enabled. |
| `show_consumers_when_idle` | boolean | `false` | When enabled, consumer tiles always show (even at 0 kW), like the battery tile. When disabled, consumer tiles only appear while the consumer is actively drawing power (> 0 kW). |

### Solar Forecast

| Option | Type | Default | Description |
|---|---|---|---|
| `use_solcast` | boolean | `false` | Auto-detect Solcast forecast sensors (e.g., `sensor.solcast_pv_forecast_power_now`). The forecast appears as a yellow dotted vertical line on the bar when predicted production exceeds current output. |
| `forecast_entity` | string | `null` | Custom solar forecast power sensor. Ignored if `use_solcast` is enabled. |

### Daily Energy History

| Option | Type | Default | Description |
|---|---|---|---|
| `import_history_entity` | string | `null` | Daily grid import energy sensor (kWh). Used with `export_history_entity` to calculate net import/export position shown on stats tiles. Works with Utility Meter helpers or template sensors. |
| `export_history_entity` | string | `null` | Daily grid export energy sensor (kWh). Combined with import history to show net position (e.g., "+4.2 kWh" net export) and green/red indicator dot. |
| `production_history_entity` | string | `null` | Daily solar production energy sensor (kWh). Shows daily total on the Solar stats tile (e.g., "12.5 kWh"). |
| `consumption_history_entity` | string | `null` | Daily home consumption energy sensor (kWh). Shows daily total on the Usage stats tile. |

### Display

| Option | Type | Default | Description |
|---|---|---|---|
| `show_header` | boolean | `false` | Display a header bar with title, optional sensors, and weather. |
| `header_title` | string | `"Solar Power"` | Title text displayed in the header (left side). |
| `show_weather` | boolean | `false` | Display weather icon and temperature in the header (right side). Supports dynamic icons (sunny, cloudy, rainy, etc.) for weather entities, or thermometer for temperature sensors. |
| `weather_entity` | string | `null` | Weather entity or temperature sensor for the header display. Auto-detects entity type. |
| `header_sensor_1` | object | `null` | Custom sensor in header. Format: `{entity: 'sensor.x', name: 'Label', icon: 'mdi:icon', icon_color: '#hex', unit: 'kWh'}`. Icon supports emoji or MDI. `icon_color` accepts hex, `"state"` (entity state as color), or `"attributes.rgb_color"` (entity attribute). |
| `header_sensor_2` | object | `null` | Second custom header sensor. Same format as `header_sensor_1`. |
| `show_stats` | boolean | `false` | Display power statistics tiles above the bar. Layout adapts dynamically: 3 core tiles (Solar, Import/Export, Usage) plus extras (Battery, EV, Consumers) on a second row when needed. |
| `show_stats_detail` | boolean | `true` | Show the detail row (3rd line) on stats tiles — daily kWh totals, net import/export position, battery SOC%. Set to `false` for a more compact card. |
| `stats_detail_position` | string | `"below"` | Where to show the detail: `"below"` as a 3rd row, or `"inline"` next to the kW value separated by a slash (e.g., "1.2 kW / 12.5 kWh"). |
| `show_net_indicator` | boolean | `true` | Show a colored dot on import/export tiles: green = net exporter for the day, red = net importer. Requires history entities. |
| `show_bar_label` | boolean | `true` | Show "Power Flow 0-XkW" label above the power bar, including battery SOC if configured. |
| `show_bar_values` | boolean | `true` | Show kW values and labels directly on bar segments. Hidden automatically when a segment is too narrow. |
| `show_legend` | boolean | `true` | Display a color-coded legend below the bar showing all active power sources. |
| `show_legend_values` | boolean | `true` | Show current kW values next to each legend item. |
| `decimal_places` | number | `1` | Decimal places for all power values and battery percentage (1, 2, or 3). |
| `stats_border_radius` | number | `8` | Border radius for stats tiles in pixels. Increase to match rounded themes like Bubble Cards. |
| `color_palette` | string | `"classic-solar"` | Color scheme. Options: `classic-solar`, `soft-meadow`, `ocean-sunset`, `garden-fresh`, `peachy-keen`, `cloudy-day`, `custom`. |
| `custom_colors` | object | `{}` | Override individual colors. Keys: `solar`, `export`, `import`, `self_usage`, `ev_charge`. Also supports tile backgrounds: `stats_solar_background`, `stats_battery_background`, `stats_consumer_1_background`, etc. |

### Custom Labels

| Option | Type | Default | Description |
|---|---|---|---|
| `label_solar` | string | `null` | Custom label for Solar. Appears on stats tiles, legend, bar segments, and tooltips. Leave empty to use auto-detected language (11 languages supported). |
| `label_import` | string | `null` | Custom label for Import. |
| `label_export` | string | `null` | Custom label for Export. |
| `label_usage` | string | `null` | Custom label for Usage. |
| `label_battery` | string | `null` | Custom label for Battery. |
| `label_ev` | string | `null` | Custom label for EV. |
| `label_power_flow` | string | `null` | Custom label for the "Power Flow" bar heading. |

### Tap Actions

Tap actions support `more-info` (default, shows entity history), `navigate` (go to a dashboard path), `call-service` (trigger HA service), `url` (open external URL), and `none` (disable).

| Option | Type | Default | Description |
|---|---|---|---|
| `tap_action_solar` | object | `{action: "more-info"}` | Tap action for Solar elements (stats tile, bar segment, legend). |
| `tap_action_import` | object | `{action: "more-info"}` | Tap action for Import elements (stats tile, grid icon when importing, legend). |
| `tap_action_export` | object | `{action: "more-info"}` | Tap action for Export elements (stats tile, grid icon when exporting, legend). |
| `tap_action_usage` | object | `{action: "more-info"}` | Tap action for Usage elements (stats tile, legend). |
| `tap_action_battery` | object | `{action: "more-info"}` | Tap action for Battery elements (stats tile, battery bar, legend). |
| `tap_action_ev` | object | `{action: "more-info"}` | Tap action for EV elements (stats tile, legend). |

**Note:** Language is automatically detected from your Home Assistant setting. Supported: English, German, French, Spanish, Italian, Dutch, Portuguese, Polish, Swedish, Danish, Norwegian. Custom labels always take priority over translations.

---

## Understanding the Bar

| Color | Meaning | When Shown |
|---|---|---|
| **Green** | Solar self-consumption | Solar power used by your home (excluding EV) |
| **Orange** | EV charging | Bright = solar-powered, darker = grid-powered |
| **Coral/Red** | Grid import | Power imported from grid for home usage |
| **Blue** | Grid export | Surplus power sent to the grid |
| **Light Grey Dashed** | EV potential | Unused charger capacity (based on `car_charger_load`) |
| **Semi-transparent** | Unused capacity | Remaining inverter capacity |
| **Yellow dotted line** | Solar forecast | Predicted production (shown when forecast > actual) |

The grid icon changes dynamically: green when exporting, orange when importing. When solar < consumption, a dashed outline shows total demand while the solid fill shows actual solar contribution.

---

## Example Configurations

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

### Full Featured

```yaml
type: custom:solar-bar-card
inverter_size: 13.2
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
grid_power_entity: sensor.grid_power
color_palette: garden-fresh
show_header: true
header_title: "Home Solar"
show_weather: true
weather_entity: weather.home
header_sensor_1:
  entity: sensor.solcast_forecast_today
  name: "Forecast"
  icon: "mdi:solar-power"
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
battery_soc_entity: sensor.battery_soc
battery_power_entity: sensor.battery_power
battery_capacity: 10
consumer_1_entity: sensor.heat_pump_power
consumer_1_name: "Heat Pump"
consumer_2_entity: sensor.pool_heater_power
consumer_2_name: "Pool"
label_solar: "PV"
label_usage: "Home"
tap_action_solar:
  action: navigate
  navigation_path: /dashboard-solar
```

### Compact (Space Saver)

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
show_stats: true
show_stats_detail: false
show_bar_label: false
show_legend: false
```

---

## Troubleshooting

- **Card not appearing** — Clear browser cache (`Ctrl+Shift+R`), verify resource in Developer Tools > Resources, check F12 console for errors. Both `.js` files must be in `/config/www/`.
- **Wrong values** — Ensure sensors report in W or kW (auto-converted). `production_entity` must be a power sensor, not energy (kWh).
- **Cumulative sensors only (kWh)** — Create a Derivative helper (Settings > Helpers > Derivative) to convert kWh accumulation to instantaneous kW power.
- **Colors not changing** — Clear browser cache. Verify palette name uses hyphens (e.g., `ocean-sunset` not `ocean_sunset`). Custom colors must use hex format `#RRGGBB`.

---

## Contributing

Contributions welcome! Please [open an issue](https://github.com/0xAHA/solar-bar-card/issues) for discussion first.

---

## Version History

See [releases.md](releases.md) for full changelog.

---

## License

MIT License - see LICENSE file for details.

## Credits

* Inspired by the **pool-monitor-card**
* Built for the **Home Assistant** community
* Maintained by [@0xAHA](https://github.com/0xAHA)

---

**Made with solar power for the Home Assistant community**
