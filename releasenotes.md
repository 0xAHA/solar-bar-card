# Solar Bar Card v2.2.0 Release Notes

## 🎉 Major New Features

### 🏷️ Custom Labels
You can now customize all labels displayed in the card! Rename any item to match your preferences:
- Solar → "PV", "Panels", or any custom name
- Import → "Grid In", "Netzbezug", etc.
- Export → "Grid Out", "Feed-in", etc.
- Usage → "Home", "Consumption", etc.
- Battery → "Storage", "Accu", etc.
- EV → "Car", "Charger", etc.
- Power Flow → "Energy Flow", "Distribution", etc.

**Configuration Example:**
```yaml
label_solar: "PV"
label_import: "Grid In"
label_export: "Grid Out"
label_usage: "Home"
label_battery: "Storage"
label_ev: "Car"
label_power_flow: "Energy Flow"
```

**UI Configuration:**
- Each label has its own text field in the "Custom Labels" section
- Leave empty to use auto-detected language translation
- Custom labels appear everywhere: stats tiles, legend, bar segments, and tooltips

---

### 🖱️ Configurable Tap Actions
Each element in the card can now have its own tap action! No more being limited to just entity history.

**Supported Actions:**
- `more-info` - Show entity history (default)
- `navigate` - Go to a dashboard or view
- `call-service` - Trigger any Home Assistant service
- `url` - Open an external URL
- `none` - Disable tap action

**Configuration Example:**
```yaml
tap_action_solar:
  action: navigate
  navigation_path: /dashboard-solar
tap_action_battery:
  action: call-service
  service: switch.toggle
  service_data:
    entity_id: switch.battery_charge_control
tap_action_import:
  action: url
  url_path: https://pvoutput.org
```

**UI Configuration:**
- Each element has its own action selector using Home Assistant's standard `ui-action` control
- Choose action type from dropdown (more-info, navigate, call-service, url, none)
- Configure action parameters based on selected type
- Visual, user-friendly interface - no manual YAML editing needed

**Available Elements:** `solar`, `import`, `export`, `usage`, `battery`, `ev`

---

### 🌍 Multi-Language Support
The card now includes built-in translations for 11 languages with **automatic detection** from your Home Assistant language setting!

**Supported Languages:**
- 🇬🇧 English (en)
- 🇩🇪 German (de)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇮🇹 Italian (it)
- 🇳🇱 Dutch (nl)
- 🇵🇹 Portuguese (pt)
- 🇵🇱 Polish (pl)
- 🇸🇪 Swedish (sv)
- 🇩🇰 Danish (da)
- 🇳🇴 Norwegian (no)

**Zero Configuration:**
- Language is automatically detected from your Home Assistant language setting (Settings → System → General → Language)
- No manual configuration needed!
- All labels automatically translate: Solar, Import, Export, Usage, Battery, EV, Power Flow, tooltips, and messages

**Priority Order:**
1. Custom Labels (highest priority)
2. Auto-Detected Language Translation
3. English Fallback

You can mix custom labels with auto-detected translations - custom labels override translated labels for specific items.

---

## 📋 Summary

This release adds three powerful customization features that work seamlessly together:

1. **Custom Labels** - Personalize your card with your preferred terminology
2. **Tap Actions** - Make your card interactive with custom actions for each element
3. **Multi-Language** - Use the card in your native language

### Example: Card with Auto-Detected Language, Custom Labels, and Actions

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
import_entity: sensor.grid_import_power
# Language auto-detected from HA settings (e.g., German)
label_solar: "PV-Anlage"  # Override auto-detected translation
label_battery: "Speicher"  # Override auto-detected translation
# Other labels use auto-detected German translations
tap_action_solar:
  action: navigate
  navigation_path: /dashboard-solar
tap_action_battery:
  action: navigate
  navigation_path: /dashboard-battery
```

---

## 🎨 UI Configuration

All new features are fully integrated into the visual configuration editor with native Home Assistant controls:

- **Custom Labels Section**
  - Individual text fields for each label (Solar, Import, Export, Usage, Battery, EV, Power Flow)
  - Grid layout for easy organization
  - Clear descriptions for each field
  - Leave empty to use auto-detected language

- **Tap Actions Section**
  - Uses Home Assistant's standard `ui-action` selector for each element
  - Visual dropdown interface - no manual YAML needed
  - Action type selector with parameter fields
  - Per-element configuration (Solar, Import, Export, Usage, Battery, EV)

- **Language**
  - Automatically detected from Home Assistant settings
  - No UI configuration needed!

---

## 🔧 Technical Details

### New Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `label_solar` | string | `null` | Custom label for Solar |
| `label_import` | string | `null` | Custom label for Import |
| `label_export` | string | `null` | Custom label for Export |
| `label_usage` | string | `null` | Custom label for Usage |
| `label_battery` | string | `null` | Custom label for Battery |
| `label_ev` | string | `null` | Custom label for EV |
| `label_power_flow` | string | `null` | Custom label for Power Flow |
| `tap_action_solar` | object | `{action: "more-info"}` | Tap action for Solar elements |
| `tap_action_import` | object | `{action: "more-info"}` | Tap action for Import elements |
| `tap_action_export` | object | `{action: "more-info"}` | Tap action for Export elements |
| `tap_action_usage` | object | `{action: "more-info"}` | Tap action for Usage elements |
| `tap_action_battery` | object | `{action: "more-info"}` | Tap action for Battery elements |
| `tap_action_ev` | object | `{action: "more-info"}` | Tap action for EV elements |

### Breaking Changes

None! This release is fully backward compatible. All existing configurations will continue to work exactly as before.

### Default Behavior

- If you don't configure these new options, the card behaves exactly as it did in v2.1.2
- Default tap action is `more-info` (entity history)
- Language is auto-detected from Home Assistant settings
- Default labels use auto-detected language (or English fallback)

---

## 📚 Documentation

Full documentation for all new features has been added to the [README.md](README.md):
- [Custom Labels Section](README.md#-custom-labels)
- [Tap Actions Section](README.md#-tap-actions)
- [Multi-Language Support Section](README.md#-multi-language-support)

---

## 🙏 Feedback

Please report any issues or feature requests on [GitHub Issues](https://github.com/0xAHA/solar-bar-card/issues).

---

**Full Changelog:** v2.1.2...v2.2.0
