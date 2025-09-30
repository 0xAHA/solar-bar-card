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
      header_title: 'Solar Power',
      weather_entity: null,
      use_solcast: false,
      auto_entities: false,
      growatt_device: null,
      car_charger_load: 0,
      ev_charger_sensor: null,
      ...config
    };
    this.updateCard();
  }

  updateCard() {
    if (!this._hass || !this.config) return;

    const {
      inverter_size = 10,
      self_consumption_entity,
      export_entity,
      forecast_entity,
      show_header = false,
      show_weather = false,
      show_stats = false,
      show_legend = true,
      show_legend_values = true,
      show_bar_label = true,
      header_title = 'Solar Power',
      weather_entity = null,
      use_solcast = false,
      auto_entities = false,
      growatt_device = null,
      car_charger_load = 0,
      ev_charger_sensor = null
    } = this.config;

    let selfConsumption = 0;
    let exportPower = 0;
    let solarProduction = 0;
    
    // Check for actual EV charging
    const actualEvCharging = this.getSensorValue(ev_charger_sensor) || 0;

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
            // Weather entity - get temperature attribute and icon
            weatherTemp = weatherState.attributes.temperature;
            weatherUnit = this._hass.config.unit_system.temperature || '°C';
            
            // Map weather state to icon
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
            // Temperature sensor - get state directly
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

    // Auto-detect Growatt entities if enabled
    if (auto_entities && growatt_device) {
      const growattEntities = this.findGrowattEntities(growatt_device);
      
      // Prefer self consumption sensor, fallback to load power
      if (growattEntities.self_consumption) {
        selfConsumption = this.getSensorValue(growattEntities.self_consumption) || 0;
      } else if (growattEntities.load_power) {
        selfConsumption = this.getSensorValue(growattEntities.load_power) || 0;
      }
      
      // Prefer explicit export sensor, fallback to extracting from grid_power
      if (growattEntities.grid_export_power) {
        exportPower = this.getSensorValue(growattEntities.grid_export_power) || 0;
      } else if (growattEntities.grid_power) {
        const gridPower = this.getSensorValue(growattEntities.grid_power) || 0;
        exportPower = Math.max(0, gridPower); // Only positive values are export
      }
      
      if (growattEntities.pv_total_power) {
        solarProduction = this.getSensorValue(growattEntities.pv_total_power) || 0;
      }
    } else {
      // Use manually configured entities
      selfConsumption = this.getSensorValue(self_consumption_entity) || 0;
      exportPower = this.getSensorValue(export_entity) || 0;
      solarProduction = selfConsumption + exportPower;
    }

    let forecastSolar = 0;
    if (use_solcast && !forecast_entity) {
      forecastSolar = this.getSolcastForecast();
    } else if (forecast_entity) {
      forecastSolar = this.getSensorValue(forecast_entity) || 0;
    }

    const currentOutput = solarProduction;
    const anticipatedPotential = Math.min(forecastSolar, inverter_size);
    
    // EV Charging logic: Use actual charging if available, otherwise show potential
    const isActuallyCharging = actualEvCharging > 0;
    const evDisplayPower = isActuallyCharging ? actualEvCharging : car_charger_load;
    
    // Calculate used capacity and remaining unused capacity
    const usedCapacityKw = selfConsumption + exportPower + (isActuallyCharging ? actualEvCharging : 0);
    const unusedCapacityKw = Math.max(0, inverter_size - usedCapacityKw - (isActuallyCharging ? 0 : car_charger_load));

    // Calculate percentages for bar segments
    const usagePercent = (selfConsumption / inverter_size) * 100;
    const exportPercent = (exportPower / inverter_size) * 100;
    const evPercent = (evDisplayPower / inverter_size) * 100;
    const unusedPercent = (unusedCapacityKw / inverter_size) * 100;
    const anticipatedPercent = (anticipatedPotential / inverter_size) * 100;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --solar-usage-color: #4CAF50;
          --solar-export-color: #2196F3;
          --solar-available-color: #FF9800;
          --solar-anticipated-color: #FFC107;
        }

        ha-card {
          padding: 8px;
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

        .solar-bar-container {
          margin: 8px 0;
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

        .usage-segment {
          background: linear-gradient(90deg, var(--solar-usage-color), #66BB6A);
        }

        .export-segment {
          background: linear-gradient(90deg, var(--solar-export-color), #42A5F5);
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

        .ev-charging-segment {
          background: linear-gradient(90deg, #FF5722, #FF7043);
          opacity: 0.9;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .unused-segment {
          background: var(--card-background-color, var(--primary-background-color));
          opacity: 0.3;
          border: none;
        }

        .forecast-indicator {
          position: absolute;
          top: 0;
          width: 3px;
          height: 100%;
          background: var(--solar-anticipated-color);
          box-shadow: 0 0 6px var(--solar-anticipated-color);
          z-index: 10;
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

        .legend {
          display: flex;
          justify-content: space-around;
          margin-top: 8px;
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

        .usage-color { background: var(--solar-usage-color); }
        .export-color { background: var(--solar-export-color); }
        .car-charger-color { background: #E0E0E0; opacity: 0.8; }
        .anticipated-color { background: var(--solar-anticipated-color); }

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
            <div class="stat">
              <div class="stat-label">System Capacity</div>
              <div class="stat-value">${inverter_size} kW</div>
            </div>
            <div class="stat">
              <div class="stat-label">Home Usage</div>
              <div class="stat-value">${selfConsumption.toFixed(1)} kW</div>
            </div>
            <div class="stat">
              <div class="stat-label">Grid Export</div>
              <div class="stat-value">${exportPower.toFixed(1)} kW</div>
            </div>
          </div>
        ` : ''}

        ${(self_consumption_entity || export_entity || (auto_entities && growatt_device)) ? `
          <div class="solar-bar-container">
            ${show_bar_label ? `
              <div class="solar-bar-label">
                <span>Power Distribution</span>
                <span class="capacity-label">0 - ${inverter_size}kW</span>
              </div>
            ` : ''}
            <div class="solar-bar-wrapper">
              <div class="solar-bar">
                ${usagePercent > 0 ? `<div class="bar-segment usage-segment" style="width: ${usagePercent}%">${selfConsumption.toFixed(1)}kW</div>` : ''}
                ${exportPercent > 0 ? `<div class="bar-segment export-segment" style="width: ${exportPercent}%">${exportPower.toFixed(1)}kW</div>` : ''}
                ${evPercent > 0 && isActuallyCharging ? `<div class="bar-segment ev-charging-segment" style="width: ${evPercent}%">${actualEvCharging.toFixed(1)}kW EV</div>` : ''}
                ${evPercent > 0 && !isActuallyCharging ? `<div class="bar-segment car-charger-segment" style="width: ${evPercent}%">${car_charger_load}kW EV</div>` : ''}
                ${unusedPercent > 0 ? `<div class="bar-segment unused-segment" style="width: ${unusedPercent}%"></div>` : ''}
              </div>
              ${anticipatedPotential > 0 && (forecast_entity || use_solcast) ? `
                <div class="forecast-indicator" 
                     style="left: ${anticipatedPercent}%" 
                     title="Forecast solar potential: ${anticipatedPotential.toFixed(1)}kW"></div>
              ` : ''}
            </div>
          </div>

          ${show_legend ? `
            <div class="legend">
              <div class="legend-item">
                <div class="legend-color usage-color"></div>
                <span>Self-Use${show_legend_values ? `: ${selfConsumption.toFixed(1)}kW` : ''}</span>
              </div>
              <div class="legend-item">
                <div class="legend-color export-color"></div>
                <span>Export${show_legend_values ? `: ${exportPower.toFixed(1)}kW` : ''}</span>
              </div>
              ${car_charger_load > 0 && !isActuallyCharging ? `
                <div class="legend-item">
                  <div class="legend-color car-charger-color"></div>
                  <span>EV Potential${show_legend_values ? `: ${car_charger_load}kW` : ''}</span>
                </div>
              ` : ''}
              ${isActuallyCharging ? `
                <div class="legend-item">
                  <div class="legend-color" style="background: #FF5722;"></div>
                  <span>EV Charging${show_legend_values ? `: ${actualEvCharging.toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
              ${(forecast_entity || use_solcast) && anticipatedPotential > 0 ? `
                <div class="legend-item">
                  <div class="legend-color anticipated-color"></div>
                  <span>Forecast${show_legend_values ? `: ${anticipatedPotential.toFixed(1)}kW` : ''}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        ` : `
          <div class="no-data">
            Configure sensor entities or enable auto-entities to display solar data
          </div>
        `}
      </ha-card>
    `;
  }

  findGrowattEntities(deviceName) {
    const entities = {};
    const allEntities = Object.keys(this._hass.states);
    
    // Look for entities that belong to the specified Growatt device
    const growattEntities = allEntities.filter(entityId => {
      const entity = this._hass.states[entityId];
      return entity.attributes.device_class === 'power' || 
             entityId.includes('growatt') ||
             (entity.attributes.friendly_name && 
              entity.attributes.friendly_name.toLowerCase().includes(deviceName.toLowerCase()));
    });

    // Map specific entity types
    for (const entityId of growattEntities) {
      const entity = this._hass.states[entityId];
      const friendlyName = entity.attributes.friendly_name || entityId;
      
      if (friendlyName.toLowerCase().includes('self consumption') ||
          friendlyName.toLowerCase().includes('self_consumption')) {
        entities.self_consumption = entityId;
      } else if (friendlyName.toLowerCase().includes('load') || 
          friendlyName.toLowerCase().includes('consumption')) {
        entities.load_power = entityId;
      } else if (friendlyName.toLowerCase().includes('export')) {
        entities.grid_export_power = entityId;
      } else if (friendlyName.toLowerCase().includes('import')) {
        entities.grid_import_power = entityId;
      } else if (friendlyName.toLowerCase().includes('grid power') ||
                 friendlyName.toLowerCase().includes('grid_power')) {
        // Use grid power if specific export/import not found
        if (!entities.grid_export_power) {
          entities.grid_power = entityId;
        }
      } else if (friendlyName.toLowerCase().includes('total power') ||
                 friendlyName.toLowerCase().includes('pv_total') ||
                 friendlyName.toLowerCase().includes('solar total')) {
        entities.pv_total_power = entityId;
      }
    }

    return entities;
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
      'sensor.solcast_pv_forecast_forecast_today',
      'sensor.solcast_forecast_today',
      'sensor.solcast_pv_forecast_today'
    ];
    
    for (const pattern of solcastPatterns) {
      if (this._hass.states[pattern]) {
        return this.getSensorValue(pattern);
      }
    }
    
    const solcastSensors = Object.keys(this._hass.states).filter(entityId => 
      entityId.includes('solcast') && entityId.includes('forecast')
    );
    
    if (solcastSensors.length > 0) {
      return this.getSensorValue(solcastSensors[0]);
    }
    
    return 0;
  }

  getCardSize() {
    if (!this.config) return 2;
    
    // Base size (bar + padding) = ~50px = 1 unit
    let size = 1;
    
    // Header or weather adds ~26px = 0.5 units (they share the same row)
    if (this.config.show_header || this.config.show_weather) size += 0.5;
    
    // Stats section adds ~60px = 1.2 units
    if (this.config.show_stats) size += 1.2;
    
    // Bar label adds ~22px = 0.4 units
    if (this.config.show_bar_label) size += 0.4;
    
    // Legend adds ~30px = 0.6 units
    if (this.config.show_legend) size += 0.6;
    
    return Math.ceil(size);
  }

  getGridOptions() {
    return {
      columns: 6,
      min_columns: 3,
    };
  }

  static getConfigForm() {
    const SCHEMA = [
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
      {
        name: "auto_entities",
        default: false,
        selector: {
          boolean: {}
        }
      },
      {
        name: "growatt_device",
        selector: {
          text: {}
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
      },
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
      },
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
      },
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
      },
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
      },
      {
        name: "show_stats",
        default: false,
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
      },
      {
        name: "show_legend_values",
        default: true,
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
    ];

    const assertConfig = (config) => {
      if (config.inverter_size !== undefined && (isNaN(Number(config.inverter_size)) || Number(config.inverter_size) <= 0)) {
        throw new Error('Inverter size must be a positive number');
      }
    };

    const computeLabel = (schema) => {
      const labels = {
        inverter_size: "Inverter Size",
        auto_entities: "Auto-detect Growatt Entities",
        growatt_device: "Growatt Device Name",
        self_consumption_entity: "Self Consumption Sensor",
        export_entity: "Export to Grid Sensor",
        car_charger_load: "Car Charger Load",
        ev_charger_sensor: "EV Charger Power Sensor",
        use_solcast: "Auto-detect Solcast",
        forecast_entity: "Forecast Solar Sensor",
        show_header: "Show Header",
        header_title: "Header Title",
        show_weather: "Show Weather/Temperature",
        weather_entity: "Weather or Temperature Sensor",
        show_stats: "Show Individual Stats",
        show_legend: "Show Legend",
        show_legend_values: "Show Legend Values",
        show_bar_label: "Show Bar Label"
      };
      return labels[schema.name] || schema.name;
    };

    const computeHelper = (schema) => {
      const helpers = {
        inverter_size: "Your solar system's maximum capacity in kW",
        auto_entities: "Automatically find Growatt sensors for this device",
        growatt_device: "Name of your Growatt device (e.g., 'Growatt Inverter')",
        self_consumption_entity: "Sensor showing power used by your home (ignored if auto-entities enabled)",
        export_entity: "Sensor showing power exported to the grid (ignored if auto-entities enabled)",
        car_charger_load: "EV charger load in kW to show potential usage (grey bar)",
        ev_charger_sensor: "Actual EV charger power sensor - shows colored bar when charging (overrides grey potential bar)",
        use_solcast: "Automatically detect Solcast forecast sensors",
        forecast_entity: "Sensor showing solar forecast data (ignored if Solcast auto-detect is enabled)",
        show_header: "Display a title at the top of the card",
        header_title: "Custom title for the card header",
        show_weather: "Display current temperature in the top-right corner",
        weather_entity: "Weather entity or temperature sensor (auto-detects which type)",
        show_stats: "Display individual power statistics above the bar",
        show_legend: "Display color-coded legend below the bar",
        show_legend_values: "Show current kW values in the legend",
        show_bar_label: "Show 'Power Distribution 0-XkW' label above the bar"
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
      auto_entities: true,
      growatt_device: "Growatt Inverter",
      show_header: false,
      show_stats: false,
      show_legend: true,
      header_title: 'Solar Power',
      use_solcast: false
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
  description: 'A visual solar power distribution card with Growatt integration support',
  preview: false,
  documentationURL: 'https://github.com/your-repo/growatt-modbus-integration'
});

console.info('%c🌞 Solar Bar Card v8.4 loaded! Responsive stats grid', 'color: #FFC107; font-weight: bold;');