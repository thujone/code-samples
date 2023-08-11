/****************************************************************************
 ** Units conversion widget for form input fields.
 ** Supports conversion types of length, area, volume, and temperature.
 **
 ** @license
 ** Copyright (c) 2021 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import configureMeasurements,
{
  area,
  emissionsFactor,
  energy,
  energyCost,
  length,
  temperature,
  thermalPower,
  thermalPowerCost,
  thermalPowerMonthlyCost,
  thermalEnergy,
  thermalEnergyCost,
  thermalEnergyMonthlyCost,
  volume,
  volumeCost
} from './convert-units/index.js?v=20220427'


export default class UnitConverter {
  constructor(techType, formId, metricUnits) {
    this._techType = techType
    this._formId = formId
    this._isMetricUnits = metricUnits
    this._techFieldsConfig = null      // To be set by equipment-specific js

    this.convert = configureMeasurements({
      area,
      emissionsFactor,
      energy,
      energyCost,
      length,
      temperature,
      thermalPower,
      thermalPowerCost,
      thermalPowerMonthlyCost,
      thermalEnergy,
      thermalEnergyCost,
      thermalEnergyMonthlyCost,
      volume,
      volumeCost
    })

    this.constants = {
      CONVERTER_TYPES: {
        AREA: 'area',
        EMISSIONS_FACTOR: 'emissionsFactor',
        ENERGY: 'energy',
        ENERGY_COST: 'energyCost',
        TEMPERATURE: 'temperature',
        THERMAL_POWER: 'thermalPower',
        THERMAL_POWER_COST: 'thermalPowerCost',
        THERMAL_POWER_MONTHLY_COST: 'thermalPowerMonthlyCost',
        THERMAL_ENERGY: 'thermalEnergy',
        THERMAL_ENERGY_COST: 'thermalEnergyCost',
        THERMAL_ENERGY_MONTHLY_COST: 'thermalEnergyMonthlyCost',
        LENGTH: 'length',
        VOLUME: 'volume',
        VOLUME_COST: 'volumeCost'
      },
      CONVERTER_UNITS: {
        AREA: {
          FEET: 'ft2',
          METERS: 'm2'
        },
        ENERGY: {
          THERMS: 'Thm',
          KILOWATT_HOURS: 'kWh'
        },
        ENERGY_COST: {
          CURRENCY_PER_THERM: '$/Thm',
          CURRENCY_PER_KILOWATT_HOUR: '$/kWh'
        },
        LENGTH: {
          FEET: 'ft',
          METERS: 'm'
        },
        VOLUME: {
          FEET: 'ft3',
          METERS: 'm3',
          GALLONS: 'gal',
          LITERS: 'l'
        },
        VOLUME_COST: {
          CURRENCY_PER_GALLON: '$/gal',
          CURRENCY_PER_LITER: '$/l'
        },
        EMISSIONS_FACTOR: {
          KG_CO2_PER_KILOWATT_HOUR: 'kgCO2/kWh',
          LB_CO2_PER_KILOWATT_HOUR: 'lbCO2/kWh',
          MTON_CO2_PER_KILOWATT_HOUR: 'MTonCO2/kWh',
          LB_CO2_PER_MMBTU: 'lbCO2/MMBtu',
          MTON_CO2_PER_MMBTU: 'MTonCO2/MMBtu'
        },
        THERMAL_POWER: {
          KWTH: 'kW(th)',
          KBH: 'kBH',
          MBH: 'MBH',
          HORSEPOWER: 'HP',
        },
        THERMAL_POWER_COST: {
          CURRENCY_PER_KWTH: '$/kW(th)',
          CURRENCY_PER_KBH: '$/kBH',
          CURRENCY_PER_MBH: '$/MBH',
          CURRENCY_PER_HORSEPOWER: '$/HP',
        },
        THERMAL_POWER_MONTHLY_COST: {
          CURRENCY_PER_KWTH_PER_MONTH: '$/kW(th)/Mo',
          CURRENCY_PER_KBH_PER_MONTH: '$/kBH/Mo',
          CURRENCY_PER_MBH_PER_MONTH: '$/MBH/Mo',
          CURRENCY_PER_HORSEPOWER_PER_MONTH: '$/HP/Mo'
        },
        THERMAL_ENERGY: {
            KWHTH: 'kWh(th)',
            MMBTU: 'MMBTU',
            THERMS: 'Therms'
        },
        THERMAL_ENERGY_COST: {
            CURRENCY_PER_KWHTH: '$/kWh(th)',
            CURRENCY_PER_MMBTU: '$/MMBTU',
            CURRENCY_PER_THERMS: '$/Therms'
        },
        THERMAL_ENERGY_MONTHLY_COST: {
            CURRENCY_PER_KWHTH_PER_MONTH: '$/kWh(th)/Mo',
            CURRENCY_PER_MMBTU_PER_MONTH: '$/MMBTU/Mo',
            CURRENCY_PER_THERMS_PER_MONTH: '$/Therms/Mo'
        },
      },
      CONVERTER_FORMATS: {
        WHOLE_NUMBER: '0',
        MANTISSA_FOUR: '0.0000',
        MANTISSA_FIVE: '0.00000'
      }
    }
    this.fieldId = null
    this.unitConverterOverlay = document.querySelector('#unit-converter-overlay')

    // Note: Initialize from the equipment-specific js
  }

  get techType() {
    return this._techType
  }

  set techType(value) {
    this._techType = value
  }

  get isMetricUnits() {
    return this._isMetricUnits
  }
  set isMetricUnits(value) {
    this._isMetricUnits = value
  }

  get formId() {
    return this._formId
  }
  set formId(value) {
    this._formId = value
  }

  get techFieldsConfig() {
    return this._techFieldsConfig
  }

  set techFieldsConfig(value) {
    this._techFieldsConfig = value
  }

  initialize(techFieldsConfig) {

    const lengthPossibilities = this.convert().possibilities('length')
    console.log('UnitLengths.initialize()::lengthPossibilities', lengthPossibilities)
    
    const energyPossibilities = this.convert().possibilities('energy')
    console.log('UnitLengths.initialize()::energyPossibilities', energyPossibilities)

    const energyCostPossibilities = this.convert().possibilities('energyCost')
    console.log('UnitLengths.initialize()::energyCostPossibilities', energyCostPossibilities)

    const volumePossibilities = this.convert().possibilities('volume')
    console.log('UnitLengths.initialize()::volumePossibilities', volumePossibilities)

    const volumeCostPossibilities = this.convert().possibilities('volumeCost')
    console.log('UnitLengths.initialize()::volumeCostPossibilities', volumeCostPossibilities)

    const emissionsFactorPossibilities = this.convert().possibilities('emissionsFactor')
    console.log('UnitLengths.initialize()::emissionsFactorPossibilities', emissionsFactorPossibilities)

    const thermalPowerPossibilities = this.convert().possibilities('thermalPower')
    console.log('UnitLengths.initialize()::thermalPowerPossibilities', thermalPowerPossibilities)

    const thermalPowerCostPossibilities = this.convert().possibilities('thermalPowerCost')
    console.log('UnitLengths.initialize()::thermalPowerCostPossibilities', thermalPowerCostPossibilities)

    const thermalPowerMonthlyCostPossibilities = this.convert().possibilities('thermalPowerMonthlyCost')
    console.log('UnitLengths.initialize()::thermalPowerMonthlyCostPossibilities', thermalPowerMonthlyCostPossibilities)

    const thermalEnergyPossibilities = this.convert().possibilities('thermalEnergy')
    console.log('UnitLengths.initialize()::thermalEnergyPossibilities', thermalEnergyPossibilities)

    const thermalEnergyCostPossibilities = this.convert().possibilities('thermalEnergyCost')
    console.log('UnitLengths.initialize()::thermalEnergyCostPossibilities', thermalEnergyCostPossibilities)

    const thermalEnergyMonthlyCostPossibilities = this.convert().possibilities('thermalEnergyMonthlyCost')
    console.log('UnitLengths.initialize()::thermalEnergyMonthlyCostPossibilities', thermalEnergyMonthlyCostPossibilities)


    this.techFieldsConfig = techFieldsConfig

    // Inject a <button> after each field's label
    Object.keys(this.techFieldsConfig).forEach(item => {
      this.injectConvertButton(item)
      this.addConvertButtonClickListener(item, this.config)
    })
  }

  resetForm() {
    const dropdown = document.getElementById('unit-converter-start-units-dropdown')
    document.getElementById('unit-converter-start-value').value = ''
    document.getElementById('unit-converter-end-value').value = ''
    dropdown && dropdown.remove()
  }

  generateButtonMarkup(fieldId) {
    const inputField = document.getElementById(fieldId);

    // Input field is hidden in the case of a curve that's been applied.
    // If the input field is hidden, then hide the button.
    // If the input field is disabled, then disable the button.
    const isInputDisabled = inputField.disabled;
   
    const isInputHidden = this.getFieldConfig(fieldId).ignoreHidden ? false : $(`#${fieldId}`).is(":hidden");
    
    // TODO: Hydrogen and Biomass fuels lack coversion buttons, likely b/c they were added recently. 

    return `
      <button
          type="button"
          class="btn btn-xs btn-info unit-converter-button"
          data-input-id="${fieldId}"
          style="display: ${isInputHidden ? 'none' : 'inline-block'}"
          ${isInputDisabled ? 'disabled="disabled"' : ''}
      >
        <i class="fal fa-balance-scale-right"></i>
      </button>
    `
  }

  injectConvertButton(fieldId) {
    const buttonMarkup = this.generateButtonMarkup(fieldId)
    const buttonNode = document.createRange().createContextualFragment(buttonMarkup)
    const labelNode = document.querySelector(`label[for="${fieldId}"]`)
    window.insertAfter(buttonNode, labelNode)
  }

  addConvertButtonClickListener(fieldId) {
    $(`button[data-input-id="${fieldId}"]`).off().on('click', event => this.onConvertButtonClick(event))
  }

  onConvertButtonClick(event) {

    // Make sure the event.target is the <button>, not the icon inside of it
    let buttonNode = event.target
    if (event.target.tagName === 'I')
      buttonNode = event.target.closest('button')
      
    this.fieldId = buttonNode.getAttribute('data-input-id')
    const fieldConfig = this.getFieldConfig(this.fieldId)
    const fieldLabelText = document.querySelector(`label[for="${this.fieldId}"]`).innerText
    const startValueNode = document.querySelector('#unit-converter-start-value')
    const startOptionsMarkup = `
      <select id="unit-converter-start-units-dropdown">${this.generateDropdownOptions(fieldConfig)}</select>
    `
    const startOptionsNode = document.createRange().createContextualFragment(startOptionsMarkup)
    window.insertAfter(startOptionsNode, startValueNode)
    document.getElementById('unit-converter-field-label').innerText = fieldLabelText
    document.getElementById('unit-converter-end-units-whole-word').innerHTML = this.getPluralWord(fieldConfig.endUnits)
    document.getElementById('unit-converter-overlay').setAttribute('data-field-id', this.fieldId)

    jQuery('#unit-converter-overlay').modal('show')
    this.addFormListeners(fieldConfig)
    document.getElementById('unit-converter-start-value').focus()

    // Make the escape key listen on the UnitConverter MoM instead of the parent modal
    window.updateEscapeKeyListener('#unit-converter-overlay', '.cancel-button', true, false)
  }

  getFieldConfig(fieldId) {
    return this.techFieldsConfig[fieldId]
  }

  generateDropdownOptions(fieldConfig) {
    const unitAlternatives = this.getAlternatives(fieldConfig.converterType, fieldConfig.endUnits)
    const optionsMarkup = unitAlternatives.map(item => {
      const isDefault = item === fieldConfig.defaultStartUnits
      return this.generateDropdownOption(item, isDefault)
    })
    const dropdownMarkup = optionsMarkup.join("\n")
    return dropdownMarkup
  }

  generateDropdownOption(alternative, isDefault = false) {
    return `<option value="${alternative}" ${isDefault ? 'selected' : ''}>${this.getPluralWord(alternative)}</option>`
  }

  getPluralWord(abbreviation) {
    return this.convert().describe(abbreviation).plural
  }

  getSingularWord(abbreviation) {
    return this.convert().describe(abbreviation).singular
  }

  addFormListeners() {
    $('#unit-converter-start-value').on('keyup', () => this.handleInputChange())
    $('#unit-converter-start-units-dropdown').on('change', () => this.handleInputChange())
    $('#apply-button').on('click', () => this.handleApplyButtonClick())
    $('#unit-converter-overlay .cancel-button').on('click', () => this.handleCancelButtonClick())
  }

  removeFormListeners() {
    $('#unit-converter-start-value, #unit-converter-start-units-dropdown, #apply-button, #unit-converter-overlay .cancel-button').off()
  }

  handleInputChange() {
    this.fieldId = document.getElementById('unit-converter-overlay').getAttribute('data-field-id')
    const fieldConfig = this.getFieldConfig(this.fieldId)
    const startUnitsDropdownValue = document.getElementById('unit-converter-start-units-dropdown').value
    const startFieldValue = Number(document.getElementById('unit-converter-start-value').value)
    const endField = document.getElementById('unit-converter-end-value')
    const endFieldValue = this.convert(startFieldValue).from(startUnitsDropdownValue).to(fieldConfig.endUnits)
    const formattedEndFieldValue = Number(numeral(endFieldValue).format(fieldConfig.format)) || '0'
    console.log('UnitConverter.addFormListeners()::startFieldValue', startFieldValue, 'endFieldValue', endFieldValue, 'formattedEndFieldValue', formattedEndFieldValue)
    endField.value = formattedEndFieldValue
  }

  handleApplyButtonClick() {
    this.fieldId = document.getElementById('unit-converter-overlay').getAttribute('data-field-id')
    const endField = document.getElementById('unit-converter-end-value')
    document.getElementById(this.fieldId).value = endField.value

    // Mark slideout state as dirty, unless instructed not to
    const fieldConfig = this.getFieldConfig(this.fieldId)
    if (!fieldConfig.skipMarkSlideoutStateAsDirty) {
      slideoutState = DIRTY
    }

    this.handleCancelButtonClick()
  }

  handleCancelButtonClick() {
    this.fieldId = document.getElementById('unit-converter-overlay').getAttribute('data-field-id')
    jQuery('#unit-converter-overlay').modal('hide')
    document.getElementById(this.fieldId).focus()
    this.resetForm()
    this.removeFormListeners()
  }

  getAlternatives(converterType, abbreviation) {
    return this.convert().possibilities(converterType).filter(x => x !== abbreviation)
  }
}