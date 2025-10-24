# 🚀 Quick Install Guide - Solar Bar Card v2.0.0-beta

## Step 1: Upload Files

Copy these **2 files** to your Home Assistant:

```
config/www/solar-bar-card.js
config/www/solar-bar-card-palettes.js
```

You can do this via:
- **File Editor** add-on
- **Samba Share**
- **SSH/SCP**
- **Terminal** add-on

## Step 2: Add Resource

1. Go to **Settings** → **Dashboards** → **Resources**
2. Click **+ Add Resource**
3. Enter:
   - **URL:** `/local/solar-bar-card.js`
   - **Resource type:** `JavaScript Module`
4. Click **Create**

## Step 3: Add Card to Dashboard

1. Edit your dashboard
2. Click **+ Add Card**
3. Search for "Solar Bar Card" or scroll to bottom
4. Click **Show Code Editor**
5. Paste the example configuration from `example-config.yaml`
6. Update entity names to match your system
7. Click **Save**

## Step 4: Configure Battery Entities

**Required for battery features:**

```yaml
battery_power_entity: sensor.battery_power  # Your battery power sensor
battery_soc_entity: sensor.battery_soc      # Your battery % sensor
```

**Important:** Battery power sensor must use this convention:
- Positive = Charging
- Negative = Discharging

If your sensor is inverted, create a template sensor:

```yaml
# configuration.yaml
template:
  - sensor:
      - name: "Battery Power Corrected"
        unit_of_measurement: "kW"
        device_class: power
        state: "{{ states('sensor.your_battery_power') | float * -1 }}"
```

## Step 5: Test & Customize

1. **Check battery indicator** - Should appear above the power bar
2. **Verify flow animation** - Particles should move when battery is active
3. **Test different states:**
   - Wait for battery to charge (green flow upward)
   - Wait for battery to discharge (blue/amber flow downward)
   - Check low battery warning (SOC < 20%)

4. **Customize appearance:**
   - Try different color palettes
   - Adjust animation speed
   - Enable/disable stats and legend

## Common Entity Names

Different battery systems use different sensor names. Here are common patterns:

### Tesla Powerwall
```yaml
battery_power_entity: sensor.powerwall_battery_now
battery_soc_entity: sensor.powerwall_charge
```

### SolarEdge
```yaml
battery_power_entity: sensor.solaredge_b1_dc_power
battery_soc_entity: sensor.solaredge_b1_state_of_energy
```

### Enphase Encharge
```yaml
battery_power_entity: sensor.enpower_power
battery_soc_entity: sensor.encharge_soc
```

### Huawei LUNA
```yaml
battery_power_entity: sensor.battery_charge_discharge_power
battery_soc_entity: sensor.battery_state_of_capacity
```

### Generic / Template
```yaml
battery_power_entity: sensor.battery_power
battery_soc_entity: sensor.battery_percentage
```

## Troubleshooting

### "Custom element doesn't exist: solar-bar-card"
- Clear browser cache (Ctrl+Shift+R)
- Verify resource URL is exactly `/local/solar-bar-card.js`
- Check Developer Tools → Console for errors

### Battery not showing
- Verify both battery entities are configured
- Check Developer Tools → States that sensors have values
- Confirm SOC sensor reports 0-100 (not 0-1)

### Flow animation not working
- Check `show_battery_flow: true`
- Battery must be charging/discharging (>0.05kW)
- Try different browser (Safari sometimes has SVG issues)

### Wrong flow direction
- Check battery power sensor sign convention
- Create inverted template sensor if needed (see Step 4)

## Performance Tips

- **Mobile devices:** Consider `show_battery_flow: false` for better performance
- **Multiple cards:** Each card runs its own animation loop
- **Slow devices:** Increase `battery_flow_animation_speed` to 3 or 4

## Need Help?

1. Check the full README-v2.0.0-beta.md
2. Review example-config.yaml
3. Open an issue on GitHub with:
   - Home Assistant version
   - Browser and device
   - Your config (remove sensitive data)
   - Screenshots if visual issue

---

**Happy solar (and battery) monitoring! ☀️🔋**
