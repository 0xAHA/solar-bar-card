// solar-bar-card.js
// Enhanced Solar Bar Card with battery support and animated flow visualization
// Version 2.0.0-beta - Battery integration with flow animations

import { COLOR_PALETTES, getCardColors, getPaletteOptions } from './solar-bar-card-palettes.js';

class SolarBarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = {
      inverter_size: 10,
      show_header: false,
      show_weather: false,
      show_stats: false,
      show_legend: true,
      show_legend_values: true,
      show_bar_label: true,
      show_bar_values: true,
      header_title: 'Solar Power',
      weather_entity: null,
      use_solcast: false,
      auto_entities: false,
      growatt_device: null,
      car_charger_load: 0,
      ev_charger_sensor: null,
      import_entity: null,
      grid_power_entity: null,
      invert_grid_power: false,
      color_palette: 'classic-solar',
      custom_colors: {},
      battery_power_entity: null,
      battery_soc_entity: null,
      battery_capacity: 10,
      show_battery_flow: true,
      battery_flow_animation_speed: 2,
      ...config
    };
    this.updateCard();
  }

  updateCard() {
    if (!this._hass || !this.config) return;

    const {
      inverter_size = 10,
      production_entity,
      self_consumption_entity,
      export_entity,
      import_entity = null,
      grid_power_entity = null,
      invert_grid_power = false,
      forecast_entity,
      show_header = false,
      show_weather = false,
      show_stats = false,
      show_legend = true,
      show_legend_values = true,
      show_bar_label = true,
      show_bar_values = true,
      header_title = 'Solar Power',
      weather_entity = null,
      use_solcast = false,
      car_charger_load = 0,
      ev_charger_sensor = null,
      battery_power_entity = null,
      battery_soc_entity = null,
      battery_capacity = 10,
      show_battery_flow = true,
      battery_flow_animation_speed = 2
    } = this.config;

    // Get colors from palette
    const colors = getCardColors(this.config);

    let selfConsumption = 0;
    let exportPower = 0;
    let gridImportPower = 0;
    let solarProduction = 0;

    // Battery state
    let batteryPower = 0;
    let batterySOC = 0;
    let hasBattery = false;

    if (battery_power_entity && battery_soc_entity) {
      batteryPower = this.getSensorValue(battery_power_entity) || 0;
      batterySOC = Math.max(0, Math.min(100, parseFloat(this._hass.states[battery_soc_entity]?.state) || 0));
      hasBattery = true;
    }

    const batteryCharging = batteryPower > 0.05;
    const batteryDischarging = batteryPower < -0.05;
    const batteryIdle = Math.abs(batteryPower) <= 0.05;

    // Check for actual EV charging
    const actualEvCharging = this.getSensorValue(ev_charger_sensor) || 0;
    const isActuallyCharging = actualEvCharging > 0;

    // Get weather/temperature data
    let weatherTemp = null;
    let weatherUnit = '°C';
    let weatherIcon = '🌡️';
    if (show_weather && weather_entity) {
      try {
        const weatherState = this._hass.states[weather_entity];
        if (weatherState) {
          const domain = weather_entity.split('.')[0];

          if (domain === 'weather') {
            weatherTemp = weatherState.attributes.temperature;
            weatherUnit = this._hass.config.unit_system.temperature || '°C';

            const state = weatherState.state;
            const weatherIcons = {
              'clear-night': '🌙',
              'cloudy': '☁️',
              'fog': '🌫️',
              'hail': '🌨️',
              'lightning': '⛈️',
              'lightning-rainy': '⛈️',
              'partlycloudy': '⛅',
              'pouring': '🌧️',
              'rainy': '🌦️',
              'snowy': '🌨️',
              'snowy-rainy': '🌨️',
              'sunny': '☀️',
              'windy': '💨',
              'exceptional': '⚠️'
            };
            weatherIcon = weatherIcons[state] || '🌡️';
          } else {
            const tempValue = parseFloat(weatherState.state);
            if (!isNaN(tempValue)) {
              weatherTemp = tempValue;
              weatherUnit = weatherState.attributes.unit_of_measurement || '°C';
            }
          }
        }
      } catch (error) {
        console.warn('Error reading weather entity:', error);
      }
    }

    // Use manually configured entities
    solarProduction = this.getSensorValue(production_entity) || 0;
    selfConsumption = this.getSensorValue(self_consumption_entity) || 0;

    // Handle grid power - can be a single sensor (positive=export, negative=import) or separate sensors
    if (grid_power_entity) {
      let gridPower = this.getSensorValue(grid_power_entity) || 0;

      // Invert if needed (for systems that report from meter perspective)
      if (invert_grid_power) {
        gridPower = -gridPower;
      }

      if (gridPower > 0) {
        exportPower = gridPower;
        gridImportPower = 0;
      } else {
        exportPower = 0;
        gridImportPower = Math.abs(gridPower);
      }
    } else {
      exportPower = this.getSensorValue(export_entity) || 0;
      gridImportPower = this.getSensorValue(import_entity) || 0;
    }

    let forecastSolar = 0;
    if (use_solcast && !forecast_entity) {
      forecastSolar = this.getSolcastForecast();
    } else if (forecast_entity) {
      forecastSolar = this.getSensorValue(forecast_entity) || 0;
    }

    const currentOutput = solarProduction;
    const anticipatedPotential = Math.min(forecastSolar, inverter_size);

    // Check if system is idle (no solar production and no consumption)
    const isIdle = solarProduction === 0 && selfConsumption === 0 && exportPower === 0 && gridImportPower === 0 && batteryIdle;

    // Calculate EV usage split
    const evUsage = isActuallyCharging ? actualEvCharging : 0;
    const nonEvConsumption = Math.max(0, selfConsumption - evUsage);

    // Calculate how much solar and grid power each type of consumption
    const solarToLoad = Math.min(solarProduction, selfConsumption);

    let solarToHome = 0;
    let solarToEv = 0;
    let gridToHome = 0;
    let gridToEv = 0;

    if (selfConsumption > 0) {
      const homeRatio = nonEvConsumption / selfConsumption;
      const evRatio = evUsage / selfConsumption;

      solarToHome = solarToLoad * homeRatio;
      solarToEv = solarToLoad * evRatio;

      gridToHome = Math.max(0, nonEvConsumption - solarToHome);
      gridToEv = Math.max(0, evUsage - solarToEv);
    }

    const totalGridImport = gridToHome + gridToEv;

    // EV Potential display (only when not charging)
    const evDisplayPower = isActuallyCharging ? 0 : Math.max(0, car_charger_load - exportPower);

    // Calculate excess solar for EV ready indicator
    const excessSolar = solarProduction - selfConsumption;
    const evReadyHalf = car_charger_load > 0 && !isActuallyCharging && excessSolar >= (car_charger_load * 0.5);
    const evReadyFull = car_charger_load > 0 && !isActuallyCharging && excessSolar >= car_charger_load;

    // Calculate used capacity and remaining unused capacity
    const usedCapacityKw = selfConsumption + exportPower;
    const unusedCapacityKw = Math.max(0, inverter_size - usedCapacityKw - evDisplayPower);

    // Calculate percentages for bar segments
    const solarHomePercent = (solarToHome / inverter_size) * 100;
    const solarEvPercent = (solarToEv / inverter_size) * 100;
    const gridHomePercent = (gridToHome / inverter_size) * 100;
    const gridEvPercent = (gridToEv / inverter_size) * 100;
    const exportPercent = (exportPower / inverter_size) * 100;
    const evPotentialPercent = (evDisplayPower / inverter_size) * 100;
    const unusedPercent = (unusedCapacityKw / inverter_size) * 100;
    const anticipatedPercent = (anticipatedPotential / inverter_size) * 100;

    // Calculate battery segment (if charging, it's in the consumption/bar)
    const batterySegmentPercent = batteryCharging ? (batteryPower / inverter_size) * 100 : 0;

    // Calculate cumulative positions for flow line targeting
    let cumulativePercent = 0;
    const solarHomeEnd = cumulativePercent + solarHomePercent;
    cumulativePercent += solarHomePercent;
    const solarEvEnd = cumulativePercent + solarEvPercent;
    cumulativePercent += solarEvPercent;
    const gridHomeEnd = cumulativePercent + gridHomePercent;
    cumulativePercent += gridHomePercent;
    const gridEvEnd = cumulativePercent + gridEvPercent;
    cumulativePercent += gridEvPercent;
    const exportEnd = cumulativePercent + exportPercent;
    cumulativePercent += exportPercent;
    const batteryEnd = cumulativePercent + batterySegmentPercent;

    // Determine flow color and path
    let flowColor = '#4CAF50';
    let flowPath = '';
    let showFlow = show_battery_flow && hasBattery && !batteryIdle;

    if (showFlow) {
      const barY = 200; // Y position of top of bar
      const batteryY = 140; // Y position of bottom of battery indicator
      const batteryX = 250; // X position of center of battery

      if (batteryCharging) {
        // Flow from bar to battery (charging)
        flowColor = '#4CAF50';
        const chargeSourceX = (solarHomeEnd > 0 ? (solarHomeEnd / 2) : (solarHomePercent + solarEvPercent / 2)) / 100 * 500;
        flowPath = `M ${chargeSourceX} ${barY} Q ${chargeSourceX} ${(barY + batteryY) / 2}, ${batteryX} ${batteryY}`;
      } else if (batteryDischarging) {
        // Flow from battery to bar (discharging)
        const isExporting = exportPower > 0.1;
        flowColor = isExporting ? '#FFC107' : '#2196F3';

        let targetX = 250;
        if (isExporting) {
          // Target the export segment
          targetX = ((exportEnd - exportPercent / 2) / 100) * 500;
        } else {
          // Target the home consumption area
          targetX = ((solarHomeEnd + gridHomeEnd) / 2 / 100) * 500;
        }

        flowPath = `M ${batteryX} ${batteryY} Q ${(batteryX + targetX) / 2} ${(batteryY + barY) / 2}, ${targetX} ${barY}`;
      }
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --solar-usage-color: ${colors.self_usage};
          --ev-charging-color: ${colors.ev_charge};
          --grid-usage-color: ${colors.import};
          --solar-export-color: ${colors.export};
          --solar-available-color: ${colors.solar};
          --solar-anticipated-color: ${colors.solar};
          --battery-charge-color: ${colors.battery_charge};
          --battery-discharge-color: ${colors.battery_discharge};
        }

        ha-card {
          padding: 4px 8px;
          position: relative;
        }

        .card-header {
          color: var(--primary-text-color);
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .card-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-header-weather {
          font-size: 16px;
          color: var(--secondary-text-color);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .power-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .stat {
          background: var(--secondary-background-color);
          padding: 8px;
          border-radius: 8px;
          text-align: center;
        }

        .stat.battery-stat {
          position: relative;
        }

        .stat.battery-stat.charging {
          border: 2px solid var(--battery-charge-color);
          box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
        }

        .stat.battery-stat.discharging {
          border: 2px solid var(--battery-discharge-color);
          box-shadow: 0 0 8px rgba(33, 150, 243, 0.3);
        }

        .stat-label {
          color: var(--secondary-text-color);
          font-size: 12px;
          margin-bottom: 4px;
        }

        .stat-value {
          color: var(--primary-text-color);
          font-size: 16px;
          font-weight: 600;
        }

        .battery-container {
          position: relative;
          width: 100%;
          height: 120px;
          margin-bottom: 8px;
        }

        .battery-indicator {
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          background: var(--secondary-background-color);
          border: 2px solid var(--divider-color);
          border-radius: 12px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 100px;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .battery-indicator.charging {
          border-color: var(--battery-charge-color);
          animation: batteryPulse 2s ease-in-out infinite;
        }

        .battery-indicator.discharging {
          border-color: var(--battery-discharge-color);
          animation: batteryPulse 2s ease-in-out infinite;
        }

        .battery-indicator.low-battery {
          border-color: #f44336;
          animation: batteryPulseSlow 3s ease-in-out infinite;
        }

        @keyframes batteryPulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
            transform: translateX(-50%) scale(1);
          }
          50% {
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
            transform: translateX(-50%) scale(1.02);
          }
        }

        @keyframes batteryPulseSlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
            transform: translateX(-50%) scale(1);
          }
          50% {
            box-shadow: 0 0 20px rgba(244, 67, 54, 0.6);
            transform: translateX(-50%) scale(1.02);
          }
        }

        .battery-icon-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .battery-icon {
          width: 32px;
          height: 18px;
          border: 2px solid var(--primary-text-color);
          border-radius: 3px;
          position: relative;
          opacity: 0.8;
        }

        .battery-terminal {
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 8px;
          background: var(--primary-text-color);
          border-radius: 0 2px 2px 0;
          opacity: 0.8;
        }

        .battery-level {
          position: absolute;
          left: 2px;
          top: 2px;
          bottom: 2px;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .battery-level.low {
          background: linear-gradient(90deg, #f44336, #ff9800);
        }

        .battery-level.medium {
          background: linear-gradient(90deg, #ff9800, #FFC107);
        }

        .battery-soc {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .battery-power {
          font-size: 12px;
          color: var(--secondary-text-color);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .battery-power.charging {
          color: var(--battery-charge-color);
        }

        .battery-power.discharging {
          color: var(--battery-discharge-color);
        }

        .flow-line-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }

        .flow-particle {
          animation: flowParticles ${battery_flow_animation_speed}s ease-in-out infinite;
        }

        @keyframes flowParticles {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }

        .solar-bar-container {
          margin: 2px 0;
        }

        .solar-bar-label {
          color: var(--primary-text-color);
          font-size: 14px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }

        .capacity-label {
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        .solar-bar-wrapper {
          position: relative;
          height: 32px;
          background: var(--divider-color);
          border-radius: 16px;
          overflow: hidden;
        }

        .solar-bar {
          height: 100%;
          display: flex;
          border-radius: 16px;
          overflow: hidden;
        }

        .bar-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .solar-home-segment {
          background: linear-gradient(90deg, var(--solar-usage-color), var(--solar-usage-color));
        }

        .solar-ev-segment {
          background: linear-gradient(90deg, var(--ev-charging-color), var(--ev-charging-color));
          border-left: 1px solid rgba(255,255,255,0.3);
        }

        .grid-home-segment {
          background: linear-gradient(90deg, var(--grid-usage-color), var(--grid-usage-color));
        }

        .grid-ev-segment {
          background: linear-gradient(90deg, var(--ev-charging-color), var(--ev-charging-color));
          opacity: 0.8;
          border-left: 1px solid rgba(255,255,255,0.3);
        }

        .export-segment {
          background: linear-gradient(90deg, var(--solar-export-color), var(--solar-export-color));
        }

        .battery-charge-segment {
          background: linear-gradient(90deg, var(--battery-charge-color), var(--battery-charge-color));
          border-left: 1px solid rgba(255,255,255,0.3);
        }

        .car-charger-segment {
          background: linear-gradient(90deg, #E0E0E0, #F5F5F5);
          opacity: 0.8;
          border: 1px dashed rgba(158,158,158,0.3);
          border-left: none;
          border-right: none;
          color: #424242;
          text-shadow: none;
        }

        .ev-ready-indicator {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          z-index: 3;
          filter: drop-shadow(0 0 3px rgba(0,0,0,0.3));
        }

        .ev-ready-indicator.half-charge {
          color: #FFB74D;
        }

        .ev-ready-indicator.full-charge {
          color: #81C784;
        }

        .idle-state {
          text-align: center;
          color: var(--secondary-text-color);
          padding: 12px;
          font-style: italic;
          opacity: 0.7;
        }

        .unused-segment {
          background: var(--card-background-color, var(--primary-background-color));
          opacity: 0.3;
          border: none;
        }

        .forecast-indicator {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background: repeating-linear-gradient(
            to bottom,
            var(--solar-anticipated-color),
            var(--solar-anticipated-color) 4px,
            transparent 4px,
            transparent 8px
          );
          box-shadow: 0 0 6px var(--solar-anticipated-color);
          z-index: 1;
          pointer-events: none;
        }

        .forecast-indicator::before {
          content: '⚡';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--solar-anticipated-color);
          font-size: 16px;
          text-shadow: 0 0 4px rgba(255,193,7,0.8);
        }

        .tick-marks {
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 8px;
          display: flex;
          justify-content: space-between;
          padding: 0 2px;
        }

        .tick {
          width: 1px;
          height: 6px;
          background: var(--divider-color);
          position: relative;
        }

        .tick-label {
          position: absolute;
          bottom: -14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          color: var(--secondary-text-color);
          white-space: nowrap;
        }

        .legend {
          display: flex;
          justify-content: space-around;
          margin-top: 4px;
          font-size: 11px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--secondary-text-color);
        }

        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }

        .solar-home-color { background: var(--solar-usage-color); }
        .ev-charging-color { background: var(--ev-charging-color); }
        .grid-home-color { background: var(--grid-usage-color); }
        .export-color { background: var(--solar-export-color); }
        .car-charger-color { background: #E0E0E0; opacity: 0.8; }
        .anticipated-color { background: var(--solar-anticipated-color); }
        .battery-charge-color { background: var(--battery-charge-color); }
        .battery-discharge-color { background: var(--battery-discharge-color); }

        .no-data {
          text-align: center;
          color: var(--secondary-text-color);
          padding: 20px;
          font-style: italic;
        }
      </style>

      <ha-card>
        ${show_header || show_weather ? `
          <div class="card-header">
            <div class="card-header-left">
              ${show_header ? `
                <span>☀️</span>
                <span>${header_title}</span>
              ` : ''}
            </div>
            ${show_weather && weatherTemp !== null ? `
              <div class="card-header-weather">
                <span>${weatherIcon}</span>
                <span>${weatherTemp}${weatherUnit}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${show_stats ? `
          <div class="power-stats">
            <div class="stat">
              <div class="stat-label">Solar Production</div>
              <div class="stat-value">${solarProduction.toFixed(1)} kW</div>
            </div>
            ${hasBattery ? `
              <div class="stat battery-stat ${batteryCharging ? 'charging' : batteryDischarging ? 'discharging' : ''}">
                <div class="stat-label">Battery ${batterySOC}%</div>
                <div class="stat-value">${batteryCharging ? '⚡⬆️' : batteryDischarging ? '⚡⬇️' : '⚡'} ${Math.abs(batteryPower).toFixed(1)} kW</div>
              </div>
            ` : ''}
            <div class="stat">
              <div class="stat-label">Total Usage</div>
              <div class="stat-value">${selfConsumption.toFixed(1)} kW</div>
            </div>
            ${exportPower > 0 ? `
              <div class="stat">
                <div class="stat-label">Grid Export</div>
                <div class="stat-value">${exportPower.toFixed(1)} kW</div>
              </div>
            ` : totalGridImport > 0 ? `
              <div class="stat">
                <div class="stat-label">Grid Import</div>
                <div class="stat-value">${totalGridImport.toFixed(1)} kW</div>
              </div>
            ` : ''}
            ${isActuallyCharging ? `
              <div class="stat">
                <div class="stat-label">EV Charging</div>
                <div class="stat-value">${evUsage.toFixed(1)} kW</div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${hasBattery ? `
          <div class="battery-container">
            <div class="battery-indicator ${batteryCharging ? 'charging' : batteryDischarging ? 'discharging' : ''} ${batterySOC < 20 ? 'low-battery' : ''}">
              <div class="battery-icon-wrapper">
                <div class="battery-icon">
                  <div class="battery-level ${batterySOC < 20 ? 'low' : batterySOC < 50 ? 'medium' : ''}" style="width: ${batterySOC}%"></div>
                  <div class="battery-terminal"></div>
                </div>
                <div class="battery-soc">${batterySOC}%</div>
              </div>
              <div class="battery-power ${batteryCharging ? 'charging' : batteryDischarging ? 'discharging' : ''}">
                ${batteryCharging ? '⬆️' : batteryDischarging ? '⬇️' : ''} ${Math.abs(batteryPower).toFixed(1)} kW
              </div>
            </div>
            ${showFlow ? `
              <svg class="flow-line-container" width="100%" height="100%" viewBox="0 0 500 220">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path id="flowPath" 
                      d="${flowPath}" 
                      stroke="${flowColor}" 
                      stroke-width="3" 
                      fill="none"
                      filter="url(#glow)"
                      stroke-dasharray="5,5"
                      opacity="0.8">
                  <animate attributeName="stroke-dashoffset" 
                           from="0" 
                           to="10" 
                           dur="0.5s" 
                           repeatCount="indefinite"/>
                </path>
                ${[0, 1, 2, 3, 4].map(i => `
                  <circle class="flow-particle" r="4" fill="${flowColor}">
                    <animateMotion dur="${battery_flow_animation_speed}s" repeatCount="indefinite" begin="${i * battery_flow_animation_speed / 5}s">
                      <mpath href="#flowPath"/>
                    </animateMotion>
                  </circle>
                `).join('')}
              </svg>
            ` : ''}
          </div>
        ` : ''}

        ${(production_entity || self_consumption_entity || export_entity) ? `
          ${isIdle ? `
            <div class="idle-state">
              🌙 Solar system in standby mode
            </div>
          ` : `
          <div class="solar-bar-container">
            ${show_bar_label ? `
              <div class="solar-bar-label">
                <span>Power Flow</span>
                <span class="capacity-label">0 - ${inverter_size}kW</span>
              </div>
            ` : ''}
            <div class="solar-bar-wrapper">
              <div class="solar-bar">
                ${solarHomePercent > 0 ? `<div class="bar-segment solar-home-segment" style="width: ${solarHomePercent}%">${show_bar_values && solarToHome > 0.1 ? `${solarToHome.toFixed(1)}kW` : ''}</div>` : ''}
                ${solarEvPercent > 0 ? `<div class="bar-segment solar-ev-segment" style="width: ${solarEvPercent}%">${show_bar_values && solarToEv > 0.1 ? `${solarToEv.toFixed(1)}kW EV` : ''}</div>` : ''}
                ${gridHomePercent > 0 ? `<div class="bar-segment grid-home-segment" style="width: ${gridHomePercent}%">${show_bar_values && gridToHome > 0.1 ? `${gridToHome.toFixed(1)}kW Grid` : ''}</div>` : ''}
                ${gridEvPercent > 0 ? `<div class="bar-segment grid-ev-segment" style="width: ${gridEvPercent}%">${show_bar_values && gridToEv > 0.1 ? `${gridToEv.toFixed(1)}kW EV` : ''}</div>` : ''}
                ${exportPercent > 0 ? `<div class="bar-segment export-segment" style="width: ${exportPercent}%">${show_bar_values ? `${exportPower.toFixed(1)}kW Export` : ''}</div>` : ''}
                ${batterySegmentPercent > 0 ? `<div class="bar-segment battery-charge-segment" style="width: ${batterySegmentPercent}%">${show_bar_values ? `${batteryPower.toFixed(1)}kW 🔋` : ''}</div>` : ''}
                ${evPotentialPercent > 0 ? `<div class="bar-segment car-charger-segment" style="width: ${evPotentialPercent}%">${show_bar_values ? `${car_charger_load}kW EV` : ''}</div>` : ''}
                ${unusedPercent > 0 ? `<div class="bar-segment unused-segment" style="width: ${unusedPercent}%"></div>` : ''}
              </div>
              ${evReadyHalf ? `
                <div class="ev-ready-indicator ${evReadyFull ? 'full-charge' : 'half-charge'}" 
                     title="${evReadyFull ? 'Excess solar can fully power EV charging' : 'Excess solar can cover 50%+ of EV charging'}">
                  <ha-icon icon="mdi:car-electric"></ha-icon>
                </div>
              ` : ''}
              ${anticipatedPotential > solarProduction && (forecast_entity || use_solcast) ? `
                <div class="forecast-indicator" 
                     style="left: ${anticipatedPercent}%" 
                     title="Forecast solar potential: ${anticipatedPotential.toFixed(1)}kW"></div>
              ` : ''}
              <div class="tick-marks">
                ${Array.from({length: inverter_size + 1}, (_, i) => {
                  const tickPercent = (i / inverter_size) * 100;
                  const showLabel = i % Math.ceil(inverter_size / 10) === 0;
                  return `<div class="tick" style="left: ${tickPercent}%">
                    ${showLabel ? `<span class="tick-label">${i}kW</span>` : ''}
                  </div>`;
                }).join('')}
              </div>
            </div>
          </div>

          ${show_legend ? `
            <div class="legend">
              ${solarProduction > 0 ? `
                <div class="legend-item">
                  <span>☀️</span>
                  <span>Solar${show_legend_values ? `: ${solarProduction.toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
              ${hasBattery && batteryCharging ? `
                <div class="legend-item">
                  <div class="legend-color battery-charge-color"></div>
                  <span>Battery ⬆️${show_legend_values ? `: ${batteryPower.toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
              ${hasBattery && batteryDischarging ? `
                <div class="legend-item">
                  <div class="legend-color battery-discharge-color"></div>
                  <span>Battery ⬇️${show_legend_values ? `: ${Math.abs(batteryPower).toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
              ${solarToHome > 0 ? `
                <div class="legend-item">
                  <div class="legend-color solar-home-color"></div>
                  <span>Usage${show_legend_values ? `: ${solarToHome.toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
              ${(solarToEv > 0 || gridToEv > 0) ? `
                <div class="legend-item">
                  <div class="legend-color ev-charging-color"></div>
                  <span>EV${show_legend_values ? `: ${(solarToEv + gridToEv).toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
              ${gridToHome > 0 ? `
                <div class="legend-item">
                  <div class="legend-color grid-home-color"></div>
                  <span>Grid Import${show_legend_values ? `: ${gridToHome.toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
              ${exportPower > 0 ? `
                <div class="legend-item">
                  <div class="legend-color export-color"></div>
                  <span>Export${show_legend_values ? `: ${exportPower.toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
              ${car_charger_load > 0 && !isActuallyCharging ? `
                <div class="legend-item">
                  <div class="legend-color car-charger-color"></div>
                  <span>EV${show_legend_values ? `: ${car_charger_load}kW` : ''}</span>
                </div>
              ` : ''}
              ${(forecast_entity || use_solcast) && anticipatedPotential > solarProduction ? `
                <div class="legend-item">
                  <div class="legend-color anticipated-color"></div>
                  <span>Forecast${show_legend_values ? `: ${anticipatedPotential.toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
          `}
        ` : `
          <div class="no-data">
            Configure sensor entities to display solar data
          </div>
        `}
      </ha-card>
    `;
  }

  getSensorValue(entityId) {
    if (!entityId || !this._hass.states[entityId]) return 0;
    let value = parseFloat(this._hass.states[entityId].state);

    // Handle W to kW conversion
    const unit = this._hass.states[entityId].attributes.unit_of_measurement;
    if (unit === 'W') {
      value = value / 1000;
    }

    return isNaN(value) ? 0 : value;
  }

  getSolcastForecast() {
    const solcastPatterns = [
      'sensor.solcast_pv_forecast_power_now',
      'sensor.solcast_forecast_power_now',
      'sensor.solcast_power_now'
    ];

    for (const pattern of solcastPatterns) {
      if (this._hass.states[pattern]) {
        return this.getSensorValue(pattern);
      }
    }

    const solcastSensors = Object.keys(this._hass.states).filter(entityId => 
      entityId.includes('solcast') && entityId.includes('power') && entityId.includes('now')
    );

    if (solcastSensors.length > 0) {
      return this.getSensorValue(solcastSensors[0]);
    }

    return 0;
  }

  getCardSize() {
    if (!this.config) return 1;

    let size = 0.8;
    if (this.config.show_header || this.config.show_weather) size += 0.5;
    if (this.config.show_stats) size += 1.2;
    if (this.config.battery_power_entity && this.config.battery_soc_entity) size += 1.5;
    if (this.config.show_bar_label) size += 0.3;
    if (this.config.show_legend) size += 0.4;

    return Math.max(1, size);
  }

  getGridOptions() {
    return {
      columns: 6,
      min_columns: 3,
    };
  }

  static getConfigForm() {
    const SCHEMA = [
      // ⚙️ BASIC SETTINGS
      {
        name: "inverter_size",
        default: 10,
        selector: {
          number: {
            min: 1,
            max: 100,
            step: 0.1,
            mode: "box",
            unit_of_measurement: "kW"
          }
        }
      },
      // 🔌 ENTITY CONFIGURATION
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "production_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "power"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["W", "kW", "MW"]
                    }
                  }
                ]
              }
            }
          },
          {
            name: "self_consumption_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "power"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["W", "kW", "MW"]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      {
        name: "grid_power_entity",
        selector: {
          entity: {
            filter: [
              {
                domain: "sensor",
                device_class: "power"
              },
              {
                domain: "sensor",
                attributes: {
                  unit_of_measurement: ["W", "kW", "MW"]
                }
              }
            ]
          }
        }
      },
      {
        name: "invert_grid_power",
        default: false,
        selector: {
          boolean: {}
        }
      },
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "export_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "power"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["W", "kW", "MW"]
                    }
                  }
                ]
              }
            }
          },
          {
            name: "import_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "power"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["W", "kW", "MW"]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      // 🔋 BATTERY
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "battery_power_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "power"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["W", "kW", "MW"]
                    }
                  }
                ]
              }
            }
          },
          {
            name: "battery_soc_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "battery"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["%"]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "battery_capacity",
            default: 10,
            selector: {
              number: {
                min: 0,
                max: 100,
                step: 0.5,
                mode: "box",
                unit_of_measurement: "kWh"
              }
            }
          },
          {
            name: "show_battery_flow",
            default: true,
            selector: {
              boolean: {}
            }
          }
        ]
      },
      // 🚗 EV CHARGER
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "ev_charger_sensor",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "power"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["W", "kW", "MW"]
                    }
                  }
                ]
              }
            }
          },
          {
            name: "car_charger_load",
            default: 0,
            selector: {
              number: {
                min: 0,
                max: 50,
                step: 0.5,
                mode: "box",
                unit_of_measurement: "kW"
              }
            }
          }
        ]
      },
      // 🔮 FORECAST
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "use_solcast",
            default: false,
            selector: {
              boolean: {}
            }
          },
          {
            name: "forecast_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "power"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["W", "kW", "MW"]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      // 🎨 APPEARANCE & COLORS
      {
        name: "color_palette",
        default: "classic-solar",
        selector: {
          select: {
            options: getPaletteOptions(),
            mode: "dropdown"
          }
        }
      },
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "show_header",
            default: false,
            selector: {
              boolean: {}
            }
          },
          {
            name: "header_title",
            default: "Solar Power",
            selector: {
              text: {}
            }
          }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "show_weather",
            default: false,
            selector: {
              boolean: {}
            }
          },
          {
            name: "weather_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "weather"
                  },
                  {
                    domain: "sensor",
                    device_class: "temperature"
                  }
                ]
              }
            }
          }
        ]
      },
      // 👁️ DISPLAY OPTIONS
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "show_stats",
            default: false,
            selector: {
              boolean: {}
            }
          },
          {
            name: "show_bar_label",
            default: true,
            selector: {
              boolean: {}
            }
          }
        ]
      },
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "show_bar_values",
            default: true,
            selector: {
              boolean: {}
            }
          },
          {
            name: "show_legend",
            default: true,
            selector: {
              boolean: {}
            }
          }
        ]
      },
      {
        name: "show_legend_values",
        default: true,
        selector: {
          boolean: {}
        }
      }
    ];

    const assertConfig = (config) => {
      if (config.inverter_size !== undefined && (isNaN(Number(config.inverter_size)) || Number(config.inverter_size) <= 0)) {
        throw new Error('Inverter size must be a positive number');
      }
    };

    const computeLabel = (schema) => {
      const labels = {
        inverter_size: "Inverter Size",
        production_entity: "Solar Production Sensor",
        self_consumption_entity: "Self Consumption Sensor",
        export_entity: "Export to Grid Sensor",
        import_entity: "Import from Grid Sensor",
        grid_power_entity: "Combined Grid Power Sensor",
        invert_grid_power: "Invert Grid Power Values",
        battery_power_entity: "Battery Power Sensor",
        battery_soc_entity: "Battery State of Charge Sensor",
        battery_capacity: "Battery Capacity",
        show_battery_flow: "Show Animated Flow Lines",
        ev_charger_sensor: "EV Charger Power Sensor",
        car_charger_load: "EV Charger Capacity",
        use_solcast: "Auto-detect Solcast",
        forecast_entity: "Forecast Solar Sensor",
        color_palette: "Color Palette",
        "custom_colors.solar": "☀️ Solar Power Color",
        "custom_colors.export": "↗️ Export Power Color",
        "custom_colors.import": "↙️ Import Power Color",
        "custom_colors.self_usage": "🏠 Self Usage Color",
        "custom_colors.ev_charge": "🚗 EV Charge Color",
        "custom_colors.battery_charge": "🔋⬆️ Battery Charge Color",
        "custom_colors.battery_discharge": "🔋⬇️ Battery Discharge Color",
        show_header: "Show Header",
        header_title: "Header Title",
        show_weather: "Show Weather/Temperature",
        weather_entity: "Weather or Temperature Sensor",
        show_stats: "Show Individual Stats",
        show_legend: "Show Legend",
        show_legend_values: "Show Legend Values",
        show_bar_label: "Show Bar Label",
        show_bar_values: "Show Bar Values"
      };
      return labels[schema.name] || schema.name;
    };

    const computeHelper = (schema) => {
      const helpers = {
        inverter_size: "⚙️ BASIC SETTINGS — Your solar system's maximum capacity in kW",
        production_entity: "🔌 ENTITY CONFIGURATION — Sensor showing current solar production power",
        self_consumption_entity: "Sensor showing power used by your home (includes EV charging if active)",
        export_entity: "Sensor showing power exported to the grid",
        import_entity: "Sensor showing power imported from the grid",
        grid_power_entity: "Combined grid sensor (positive=export, negative=import) - overrides separate import/export sensors",
        invert_grid_power: "Enable if your grid sensor reports from meter perspective (positive=import, negative=export) - for Enphase, Powerly, etc.",
        battery_power_entity: "🔋 BATTERY — Battery power sensor (positive=charging, negative=discharging)",
        battery_soc_entity: "Battery state of charge sensor (0-100%)",
        battery_capacity: "Battery total capacity in kWh (for statistics)",
        show_battery_flow: "Show animated flow lines indicating battery charge/discharge direction",
        ev_charger_sensor: "🚗 EV CHARGER — Actual EV charger power sensor - automatically splits usage into solar vs grid",
        car_charger_load: "EV charger capacity in kW to show potential usage (grey dashed bar when not charging)",
        use_solcast: "🔮 FORECAST — Automatically detect Solcast forecast sensors",
        forecast_entity: "Sensor showing solar forecast data (ignored if Solcast auto-detect is enabled)",
        color_palette: "🎨 APPEARANCE & COLORS — Choose a preset color scheme or select Custom to define your own",
        "custom_colors.solar": "Override the solar power color from the palette",
        "custom_colors.export": "Override the export power color from the palette",
        "custom_colors.import": "Override the import power color from the palette",
        "custom_colors.self_usage": "Override the self usage color from the palette",
        "custom_colors.ev_charge": "Override the EV charge color from the palette",
        "custom_colors.battery_charge": "Override the battery charging color from the palette",
        "custom_colors.battery_discharge": "Override the battery discharging color from the palette",
        show_header: "Display a title at the top of the card",
        header_title: "Custom title for the card header",
        show_weather: "Display current temperature in the top-right corner",
        weather_entity: "Weather entity or temperature sensor (auto-detects which type)",
        show_stats: "👁️ DISPLAY OPTIONS — Display individual power statistics above the bar",
        show_legend: "Display color-coded legend below the bar",
        show_legend_values: "Show current kW values in the legend",
        show_bar_label: "Show 'Power Flow 0-XkW' label above the bar",
        show_bar_values: "Show kW values and labels on the bar segments"
      };
      return helpers[schema.name];
    };

    return {
      schema: SCHEMA,
      assertConfig: assertConfig,
      computeLabel: computeLabel,
      computeHelper: computeHelper
    };
  }

  static getStubConfig() {
    return {
      inverter_size: 10,
      show_header: false,
      show_stats: false,
      show_legend: true,
      header_title: 'Solar Power',
      use_solcast: false,
      color_palette: 'classic-solar',
      custom_colors: {},
      show_battery_flow: true,
      battery_flow_animation_speed: 2
    };
  }
}

// Register the custom elements
customElements.define('solar-bar-card', SolarBarCard);

// Add to custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'solar-bar-card',
  name: 'Solar Bar Card',
  description: 'A visual solar power distribution card with battery support, animated flow visualization, and customizable color palettes',
  preview: false,
  documentationURL: 'https://github.com/your-repo/solar-bar-card'
});

console.info('%c🌞 Solar Bar Card v2.0.0-beta loaded! Battery support + Animated flows + Color palettes', 'color: #4CAF50; font-weight: bold;');
