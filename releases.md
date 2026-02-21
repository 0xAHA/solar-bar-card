# Solar Bar Card - Releases

<a href="https://www.buymeacoffee.com/0xAHA" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## v2.7.0

### Changes
- **Total house consumption**: The Usage stats tile now shows total house consumption from all sources (solar + grid import + battery discharge) rather than just solar self-consumption. The legend and bar tooltip also reflect total house load.
- **Battery SOC decimal places**: New `battery_soc_decimal_places` option (0, 1, or 2) separate from the main `decimal_places` setting. Useful for batteries that only report whole percentages — set to 0 to avoid showing ".0".
- **Battery SOC formatting**: Added a space between the SOC value and the percent symbol (e.g., "85 %" instead of "85%") across all displays — stats tile, bar label, and battery bar overlay.
- **Auto-scaling stats tiles**: Stats tiles now use CSS container queries to automatically scale down font sizes on narrow screens (panels, sidebar, mobile) before wrapping to a second row. Two breakpoints at 350px and 280px progressively reduce text size and padding.
- **Consumer tap actions**: Added `tap_action_consumer_1` and `tap_action_consumer_2` config options in the Tap Actions editor section. Consumer stats tiles now have dedicated tap action pickers alongside the existing Solar, Import, Export, Usage, Battery, and EV actions.
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
