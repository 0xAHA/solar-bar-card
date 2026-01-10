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
custom_labels:
  solar: "PV"
  import: "Grid In"
  export: "Grid Out"
  usage: "Home"
  battery: "Storage"
  ev: "Car"
  power_flow: "Energy Flow"
```

Custom labels appear everywhere: stats tiles, legend, bar segments, and tooltips.

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
tap_actions:
  solar:
    action: navigate
    navigation_path: /dashboard-solar
  battery:
    action: call-service
    service: switch.toggle
    service_data:
      entity_id: switch.battery_charge_control
  import:
    action: url
    url_path: https://pvoutput.org
```

**Available Action Keys:** `solar`, `import`, `export`, `usage`, `battery`, `ev`

---

### 🌍 Multi-Language Support
The card now includes built-in translations for 11 languages!

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

**Configuration Example:**
```yaml
language: de  # German
```

All labels automatically translate: Solar, Import, Export, Usage, Battery, EV, Power Flow, tooltips, and messages.

**Priority Order:**
1. Custom Labels (highest)
2. Language Translations
3. English Fallback

You can mix custom labels with translations - custom labels override translated labels for specific items.

---

## 📋 Summary

This release adds three powerful customization features that work seamlessly together:

1. **Custom Labels** - Personalize your card with your preferred terminology
2. **Tap Actions** - Make your card interactive with custom actions for each element
3. **Multi-Language** - Use the card in your native language

### Example: German Card with Custom Labels and Actions

```yaml
type: custom:solar-bar-card
inverter_size: 10
production_entity: sensor.solar_production_power
self_consumption_entity: sensor.home_consumption
export_entity: sensor.grid_export_power
import_entity: sensor.grid_import_power
language: de
custom_labels:
  solar: "PV-Anlage"  # Override translation for solar only
  battery: "Speicher"
tap_actions:
  solar:
    action: navigate
    navigation_path: /dashboard-solar
  battery:
    action: navigate
    navigation_path: /dashboard-battery
```

---

## 🎨 UI Configuration

All new features are fully integrated into the visual configuration editor:

- **Custom Labels Section** - Add/edit label overrides with object editor
- **Tap Actions Section** - Configure actions per element with object editor
- **Language Section** - Dropdown selector with all 11 languages

---

## 🔧 Technical Details

### New Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `custom_labels` | object | `{}` | Custom label overrides |
| `tap_actions` | object | `{}` | Tap action configuration per element |
| `language` | string | `"en"` | Language code for translations |

### Breaking Changes

None! This release is fully backward compatible. All existing configurations will continue to work exactly as before.

### Default Behavior

- If you don't configure these new options, the card behaves exactly as it did in v2.1.2
- Default tap action is `more-info` (entity history)
- Default language is English
- Default labels are in English

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
