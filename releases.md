# Solar Bar Card - Releases

<a href="https://www.buymeacoffee.com/0xAHA" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## v2.9.4 — Dressed to Console

### Improvements

- **Console badge restyled**: The browser console load message now uses a two-tone pill badge — orange filled label on the left, light orange version number on the right — matching the style used by other popular HA custom cards.

### Bug Fixes

- **EV icon car colour now configurable in the editor**: `ev_icon_color` controls the colour of the car symbol inside the EV circle and was already functional, but was missing from the editor label map so it appeared as the raw key name `ev_icon_color`. It now shows as **EV Car Icon Color** with a helper tooltip.

- **Removed ghost EV colour options**: `ev_icon_idle_color` and `ev_icon_charging_color` appeared in the config UI but were never wired up — they did nothing. Both have been removed. The circle background is handled automatically (grey when idle, orange when importing, green when net-zero/exporting) and the car symbol colour is controlled by **EV Car Icon Color**.

---

## v2.9.3 — Green Light, Orange Light

### Improvements

- **EV charging icon now shows grid state colour**: While the EV is actively charging, the circle was always grey. It now mirrors the grid icon — orange when the grid is importing (you're drawing power from the grid to charge), green when net-zero or exporting (the car is running on solar/battery). The yellow glow remains in both states to indicate active charging.

- **Config editor label polish**: The power unit dropdown now reads "Unit of measure" with options "kW — kilowatts" and "W — watts". The unit toggle reads "Show unit label (kW / W)" for clarity. The decimal places dropdown now has a proper "Power decimal places" label instead of displaying the raw field name.

---

## v2.9.2 — Watt's the Legend?

### Bug Fixes

- **Legend values now respect `power_unit` setting**: When `power_unit: W` was configured, legend values for Solar, Usage, Export, and Battery were still displayed in kW — only Import and EV happened to use the correct formatter. All six legend items now consistently use the `fmtPow()` helper, so the unit shown in the legend always matches the unit chosen in your card configuration.

---

## v2.9.1 — Polish & Fixes

### Improvements

- **EV icon: solid circle design**: The EV circle has been restyled to match the grid icon's solid filled-circle approach — the ring border is gone. States are now communicated via fill color: idle is a dimmed grey circle; when excess solar covers ≥50% of the EV charger capacity the circle turns orange; at ≥100% it turns green. When the EV is actively charging the circle stays grey with a yellow/orange outer glow to indicate live charging without conflicting with the solar-availability colors.

### Bug Fixes

- **Battery SOC entity not appearing in config UI**: The `battery_soc_entity` selector was filtering strictly by `device_class: "battery"`, which excluded valid sensors (e.g. from ESPHome, MQTT, or custom integrations) that report a percentage without a device class set. The selector now also includes any sensor with `unit_of_measurement: "%"`, so these entities show up in the dropdown without any changes to the sensor itself.

---

## v2.9.0 — Template Whisperer

### New Features

- **HA Jinja2 label templates**: Any label configurable via `custom_labels` or `label_*` YAML keys now accepts full Home Assistant Jinja2 template syntax. When a value contains `{{`, it is evaluated server-side via the HA websocket `render_template` API and updated reactively. Static label strings continue to work as before — no migration needed. The Custom Labels section has been removed from the visual editor (labels are YAML-only with template support); all previously configured labels remain fully compatible.

  ```yaml
  custom_labels:
    solar: "{{ states('sensor.inverter_model') }}"
    export: "{{ 'Selling' if states('sensor.export_power')|float > 0 else 'Export' }}"
  ```

- **Bar segment text templates** (`segment_text_*`): Each of the five bar segments now accepts a freeform text template with token substitution. Configure via YAML; leave unset to use the default `value label` format. Available tokens:

  | Token | Description |
  | --- | --- |
  | `{value}` | Formatted power value (respects `power_unit` and `show_power_unit`) |
  | `{label}` | Translated or custom label for this segment |
  | `{percent}` | Segment width as a rounded percentage of the bar |
  | `{raw}` | Raw numeric value (integer W or decimal kW, no unit suffix) |

  Config keys and their segments:

  | Key | Segment |
  | --- | --- |
  | `segment_text_solar_home` | Solar → Home (self-consumption) |
  | `segment_text_solar_ev` | Solar → EV |
  | `segment_text_battery_charge` | Solar → Battery |
  | `segment_text_export` | Export |
  | `segment_text_ev_potential` | EV potential (pre-charge overlay) |

  ```yaml
  segment_text_solar_home: "{value}"
  segment_text_export: "{percent} → grid"
  segment_text_battery_charge: "⚡ {raw}W"
  ```

---

## v2.8.1 — The Meter Maid

### Bug Fixes

- **Import legend value mismatch**: The Import legend item was displaying `gridToHome` (grid power allocated to the house only), while the Import stats tile correctly displayed `totalGridImport` (the full raw sensor value). When an EV was charging from the grid, the legend showed a lower number — the difference being `gridToEv`. Both now show `totalGridImport`. As a bonus fix, the legend item will now also appear correctly when all grid import is going to the EV (previously it could vanish if `gridToHome` was 0).

---

## v2.8.0 — Live Wires & New Wheels

### New Features

- **EV circle icon** (`ev_charger_sensor`): The EV car icon has been moved out of the solar bar and replaced with a dedicated circular icon element on the **left side** of the bar — sitting between the house icon and battery bar, so all consumers are on the left and the flow direction stays consistent. State is shown via ring and fill: grey ring when idle; colored ring border when excess solar is ≥50% of EV load; brighter ring glow at ≥100%; and full solid fill in the EV color when actively charging. When `show_energy_flow` is enabled, animated dots connect solar and grid to the EV circle via the left bus, tracked as an independent flow group so EV state changes don't interrupt other animations.
- **EV icon symbol color** (`ev_icon_color`): New config option to set the color of the car icon inside the EV circle. Useful when the default (theme primary text color) doesn't contrast well against the circle's background color. Overrides to white automatically when the circle is in solid charging state.
- **Power unit selection** (`power_unit`): Choose between `kW` (default) and `W` to display all live power values in Watts. All value locations update consistently — tiles, bar segment labels, legend, bar capacity label, and tooltips.
- **Show/hide unit suffix** (`show_power_unit`): Toggle the `kW` / `W` unit label after every power value. Defaults to `true`. Useful for very compact displays where the unit can be inferred.

### Improvements

- **Tile order: Solar → Usage → Export/Import**: Stats tiles are now ordered Solar | Usage | Export (or Import) — matching the natural left-to-right flow of the energy bar and aligning with the legend order.
- **Legend order aligned with tiles**: Legend items now follow the same order as tiles — Solar, Usage, Export, Import, then EV and Battery. Previously EV and Battery appeared between Usage and Export.
- **Export tile net indicator centering**: The net position dot (green/red) after the "Export"/"Import" label no longer shifts the label text off-centre. A hidden spacer of equal width is added to the left so the label text stays visually centred while the dot trails it on the right.

---

## v2.7.6

### New Features
- **Forecast peak solar indicator** (`peak_forecast_entity`): Shows today's forecast peak solar power as a solid line on the bar, using the same color as the existing dashed forecast indicator. When `use_solcast` is enabled, auto-detects `sensor.solcast_pv_forecast_peak_forecast_today` (with a fallback search for any Solcast entity containing `peak` and `today`). A manual entity can also be configured independently. The indicator is shown whenever the peak forecast value is greater than zero and a source is configured.
- **Energy flow threshold** (`energy_flow_threshold`): Configurable deadband (default ±0.1 kW) for import/export flow detection. Power levels below this threshold are treated as idle, preventing rapid dot flickering when the system sits near zero.
- **Solar drop origin** (`energy_flow_origin`): Choose where the solar drop line originates — `bar_center` (default, middle of the full solar bar) or `production_center` (middle of the filled production segments, moves with solar output). Production center is rounded to 5 SVG units to reduce unnecessary path rebuilds.
- **House icon**: New `show_house_icon` option adds a 32px house icon to the left of the bar, representing home consumption. Colored by the self-usage palette color, switches to import color when only grid power is being consumed. Tappable with the usage tap action.
- **Energy flow lines**: New `show_energy_flow` option renders animated flow lines below the bar visualising energy paths between solar, house, grid, and battery using a shared bus architecture:
  - **Left bus**: solar junction → house. All consumption flows (solar self-use, battery discharge, grid import) travel left along this shared bus.
  - **Right bus**: solar junction → grid. Export flows right; import flows left from grid across both buses to house.
  - **Vertical stubs**: solar drops down to the junction; battery stub taps into the left bus (particles flow up for charge, down for discharge).
  - One subtle neutral dashed line renders the bus infrastructure; colored particles animate per-flow on top.
  - Solar drop-line is hidden when no solar is generated.
- **Energy flow speed**: New `energy_flow_speed` option to control animation speed (default 2 seconds).

### Improvements
- **Split bus rendering**: Energy flow dots are now split into two independent groups — stable flows (solar→house, solar→battery, battery→house) and grid flows (solar→grid, grid→house). When import/export state changes, only the grid group rebuilds with crossfade; left-side animations continue uninterrupted.
- **Fully static bus lines**: All bus line segments (including the no-solar grid-to-house stub) are now drawn based on element presence only, never on active flow state. This eliminates bus line redraws when flow direction changes.
- **Power-scaled animation speed**: Energy flow dot speed now reflects actual power levels — higher power flows move faster, lower power flows move slower. Uses compressed exponent scaling (`power^0.35`) so even small flows remain visible. Speed is also normalized by path length so dots travel at consistent visual speed regardless of distance, fixing the issue where short-path dots appeared sluggish while long-path dots raced.
- **Dot visibility on vertical segments**: Changed opacity fade-in/fade-out keyTimes from 10%/90% to 3%/97% of the animation cycle. Dots are now visible as they travel down the vertical drop lines and up the destination stubs, instead of being invisible during those segments.
- **Crossfade on flow topology change**: When energy flow paths change (e.g., export starts/stops, battery switches between charge/discharge), the old SVG fades out over 400ms while the new one appears, replacing the abrupt mid-path dot disappearance.
- **Grid icon export threshold**: Aligned the grid icon color threshold with the flow dot threshold (`> 0` instead of `> 0.05`). The grid icon now shows its export color whenever export flow dots are visible, even at minimal export levels.
- **Persistent bus infrastructure**: Bus lines (dashed) now always render between connected elements regardless of active flow. Only animated dots appear/disappear with actual power.
- **Uniform dot spacing**: Dot count per flow scales with path length (~1 dot per 150 SVG units, clamped 2–5) instead of a fixed 3 per flow, keeping consistent visual spacing across short and long buses.

### Bug Fixes
- **Grid icon circle colors not applying**: Fixed `grid_icon_import_color`, `grid_icon_export_color`, and `grid_icon_idle_color` config options being ignored.
- **Tower icon color flash on load**: Fixed the transmission tower icon briefly appearing white before the configured `grid_icon_color` took effect.

---

## v2.7.5

### Bug Fixes
- **Grid icon circle colors not applying**: Fixed `grid_icon_import_color`, `grid_icon_export_color`, and `grid_icon_idle_color` config options being ignored. The colors were set as duplicate CSS rules that got overridden by later selectors. They are now applied directly in the grid icon class definitions so configured colors always take effect.
- **Tower icon color flash on load**: Fixed the transmission tower icon briefly appearing white before the configured `grid_icon_color` took effect. The color is now set as an inline style so it applies immediately, before the `ha-icon` web component finishes rendering its shadow DOM.

---

## v2.7.4

### New Features
- **Grid icon tower color**: New `grid_icon_color` config option with color picker to set the transmission tower icon color inside the circle. Eliminates card-mod flicker when styling the icon color.

### Bug Fixes
- **Idle circle transparency**: Removed `opacity: 0.6` from the idle grid icon circle that caused a washed-out, transparent appearance. The grey background already communicates the idle state.

### Improvements
- Clarified grid icon color option descriptions to distinguish circle background colors from the tower icon color.

---

## v2.7.3

### New Features
- **Configurable grid icon colors**: New `grid_icon_import_color`, `grid_icon_export_color`, and `grid_icon_idle_color` options with color pickers in the editor. Also configurable via `custom_colors` in YAML (`grid_icon_import`, `grid_icon_export`, `grid_icon_idle`).
- **Bar segment text spacing**: Added a space between the value and "kW" in bar segment labels (e.g., "1.2 kW" instead of "1.2kW").

---

## v2.7.2

### New Features
- **Always-visible grid icon**: New `show_grid_icon_always` option keeps the grid transmission tower icon permanently visible next to the solar bar. When there is no import or export, the icon turns grey to indicate an idle grid connection.
- **Consumer tap actions**: Added `tap_action_consumer_1` and `tap_action_consumer_2` config options in the Tap Actions editor section.

### Bug Fixes
- **Usage tile mirrors production (#53)**: Fixed the Usage stats tile showing the same value as Solar when production dropped below actual house consumption. The calculation now uses an energy balance formula (solar - export + import + battery discharge - battery charge) which is always physically correct regardless of what the sensor reports.

---

## v2.7.0

### Changes
- **Total house consumption**: The Usage stats tile now shows total house consumption from all sources (solar + grid import + battery discharge) rather than just solar self-consumption. The legend and bar tooltip also reflect total house load.
- **Battery SOC decimal places**: New `battery_soc_decimal_places` option (0, 1, or 2) separate from the main `decimal_places` setting. Useful for batteries that only report whole percentages — set to 0 to avoid showing ".0".
- **Battery SOC formatting**: Added a space between the SOC value and the percent symbol (e.g., "85 %" instead of "85%") across all displays — stats tile, bar label, and battery bar overlay.
- **Auto-scaling stats tiles**: Stats tiles now use CSS container queries to automatically scale down font sizes on narrow screens (panels, sidebar, mobile) before wrapping to a second row. Two breakpoints at 350px and 280px progressively reduce text size and padding.
- **Editor consolidation**: Merged the separate "EV Charger" and "Additional Consumers" editor sections into a single "Consumers" section. EV config appears first, followed by Consumer 1 and Consumer 2, with both idle toggles paired at the bottom.

---

## v2.6.0

### Changes
- **Inline stats detail mode**: New `stats_detail_position` option — set to `"inline"` to show the detail value next to the kW value separated by a slash (e.g., "1.2 kW / 12.5 kWh") instead of on a separate 3rd row. Saves vertical space while keeping the information visible.
- **EV always-show toggle**: New `show_ev_when_idle` option (default `false`). When enabled, the EV tile always shows even when not charging — same pattern as battery and consumer idle toggles.
- **EV daily energy history**: New `ev_history_entity` config option. Connect a daily kWh sensor to show energy totals on the EV stats tile.
- **Consumer daily energy history**: New `consumer_1_history_entity` and `consumer_2_history_entity` config options. Show daily kWh totals on consumer tiles, following the same `show_stats_detail` / `stats_detail_position` toggle as all other tiles.
- **Reduced tile spacing**: Stats tiles now use tighter padding (6px vs 8px), smaller gaps (6px vs 8px), reduced margins, and smaller label font (11px vs 12px) for a more compact card.
- **Inline detail styling**: New `.stat-detail-inline` CSS class renders the slash-separated detail in a smaller, lighter font on the same line as the kW value.

---

## v2.5.0

### Changes
- **Dynamic stats tile layout**: Stats tiles now adapt dynamically based on which entities are configured. No more fixed 4-tile maximum — the layout grows with your setup.
- **Battery and EV coexistence**: Battery and EV tiles are no longer mutually exclusive. If you have both configured, both tiles display simultaneously.
- **Smart row splitting**: The tile grid automatically splits into two rows when there are 5+ tiles (3 core tiles on row 1, extras on row 2). For 4 or fewer tiles, everything stays in a single row.
- **Persistent battery tile**: Battery tile now always shows when configured, even when idle — useful for monitoring SOC at a glance.
- **Battery bar text fix**: SOC percentage label on the battery bar now stays visible at all charge levels. Previously the text would disappear at low SOC because visibility was tied to the fill width rather than the full bar width.
- **Additional consumer tiles**: New `consumer_1_entity`/`consumer_1_name` and `consumer_2_entity`/`consumer_2_name` config options. Add up to 2 extra power consumers (heat pump, pool heater, hot water, AC, etc.) as stats tiles. Consumers show as tiles only — the bar stays clean.
- **Consumer idle visibility**: New `show_consumers_when_idle` option (default `false`). When enabled, consumer tiles always show even when power is 0 (like battery). When disabled, tiles only appear while actively consuming (like EV).
- **Compact stats mode**: New `show_stats_detail` option (default `true`). Set to `false` to hide the detail row on all stats tiles (daily kWh, net position, battery %) for a slimmer card.
- **Consumer tile background colors**: New palette keys `stats_consumer_1_background` and `stats_consumer_2_background` for per-consumer tile styling via `custom_colors`.
- **README overhaul**: Streamlined documentation — concise feature overview, self-documenting config tables, version history moved to releases.md.

#### Layout Examples

| Your Setup | Row 1 | Row 2 |
|---|---|---|
| No battery, no EV | Solar \| Export/Import \| Usage | — |
| No battery, EV charging | Solar \| Export/Import \| Usage \| EV | — |
| Battery, no EV | Solar \| Export/Import \| Usage \| Battery | — |
| Battery + EV charging | Solar \| Export/Import \| Usage | Battery \| EV |
| Battery + EV + Heat Pump | Solar \| Export/Import \| Usage | Battery \| EV \| Heat Pump |

#### Example: Consumer Tiles
```yaml
type: custom:solar-bar-card
show_stats: true
consumer_1_entity: sensor.heat_pump_power
consumer_1_name: "Heat Pump"
consumer_2_entity: sensor.pool_heater_power
consumer_2_name: "Pool"
```

#### Example: Compact Stats (no detail row)
```yaml
type: custom:solar-bar-card
show_stats: true
show_stats_detail: false
```

---

## v2.3.0

### Changes
- **Custom background colors for stats tiles**: Each stats tile (Solar, Export, Import, Usage, Battery, EV) can now have its own background color via the palette or `custom_colors` configuration. New color keys: `stats_solar_background`, `stats_export_background`, `stats_import_background`, `stats_usage_background`, `stats_battery_background`, `stats_ev_background`.
- **Custom card background color**: The main card background can now be overridden with the `card_background` color key.
- All new background color keys are included in every palette (defaulting to `null` to preserve existing Home Assistant theme behavior). Set a value in the palette or via `custom_colors` to override.
- **Stats tile border radius**: New `stats_border_radius` option (default `8px`) in the Display config section. Increase to match rounded card themes like Bubble Cards.

#### Example
```yaml
type: custom:solar-bar-card
stats_border_radius: 18
custom_colors:
  card_background: '#1a1a2e'
  stats_solar_background: '#2d2d44'
  stats_export_background: '#1e3a2f'
  stats_usage_background: '#3a1e2f'
```

---

## v2.2.2

### Changes
- **Removed 'net' text from Export/Import tiles**: The net position value in Export/Import stat tiles no longer displays the word "net" after the kWh value, reducing line breaks and card height.
- **Battery percentage moved below kW value**: The battery state of charge percentage is now displayed below the power value (in the same position as other stat history values) instead of next to the battery label, preventing line breaks that made the card taller than necessary.

---

## v2.2.1

### Changes
- **Standby mode embedded in bar**: When the solar system is in standby mode, the "Standby Mode" text is now displayed directly inside the solar bar instead of as a separate message below the stats. This prevents the card from increasing in height when the system is idle, which was especially noticeable for users with battery configurations where the bar remained visible alongside the standalone message.
- Standby bar opacity increased from 0.3 to 0.6 for better visibility with the embedded label.
- Standby mode translation strings shortened for all 12 languages to fit cleanly within the bar.

---

## v2.2.0

### Changes
- **Custom Labels**: Customize all labels displayed in the card (Solar, Import, Export, Usage, Battery, EV, Power Flow). Each label has its own text field in the visual editor; leave empty to use auto-detected language translation.
- **Configurable Tap Actions**: Each element supports its own tap action (more-info, navigate, call-service, url, none). Uses Home Assistant's standard `ui-action` selector per element.
- **Multi-Language Support**: Built-in translations for 12 languages (EN, DE, FR, ES, IT, NL, PT, PL, SV, DA, NO, UK) with automatic detection from Home Assistant language settings. Zero configuration needed — custom labels override auto-detected translations when set.
- Full visual configuration editor integration with native Home Assistant controls.
- No breaking changes — fully backward compatible with v2.1.x configurations.

---

## v2.1.2

### Changes
- Daily Solar Production and Usage statistics.
- Reorganized UI sections for better configuration experience.

---

## v2.1.0

### Changes
- Net Import/Export history tracking.
- Header sensors with spread layout.
- Improved configuration organization.

---

## v2.0.0

### Changes
- **Battery integration**: Side-by-side battery and solar bars with flow animations.
- Battery SOC display with charging/discharging indicators.
- SVG-based flow animation with configurable speed.
- Battery bar width proportional to capacity vs inverter size.
