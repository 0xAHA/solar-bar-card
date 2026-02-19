# Solar Bar Card - Releases

<a href="https://www.buymeacoffee.com/0xAHA" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## v2.3.0

### Changes
- **Custom background colors for stats tiles**: Each stats tile (Solar, Export, Import, Usage, Battery, EV) can now have its own background color via the palette or `custom_colors` configuration. New color keys: `stats_solar_background`, `stats_export_background`, `stats_import_background`, `stats_usage_background`, `stats_battery_background`, `stats_ev_background`.
- **Custom card background color**: The main card background can now be overridden with the `card_background` color key.
- All new background color keys are included in every palette (defaulting to `null` to preserve existing Home Assistant theme behavior). Set a value in the palette or via `custom_colors` to override.

#### Example
```yaml
type: custom:solar-bar-card
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
