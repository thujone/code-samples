// This is the unit-conversion calculator modal configuration for Small Modular Reactors (SMR).
// See unit-converter.js for more info about unit conversiokn calculation across the Xendee Economic Optimizer.

import UnitConverter from '../unit-converter.js?v=20230306'

const equipmentType = TECH_CONFIG.SMR.TYPE
const formId = 'smr-form'
const unitConverter = new UnitConverter(equipmentType, formId, window.metricUnits)

const types = unitConverter.constants.CONVERTER_TYPES
const units = unitConverter.constants.CONVERTER_UNITS
const formats = unitConverter.constants.CONVERTER_FORMATS

const techFieldsConfig = {};

techFieldsConfig[`smr-heat-export-price`] = {
    converterType: types.ENERGY_COST,
    defaultStartUnits: units.ENERGY_COST.CURRENCY_PER_THERM,
    endUnits: units.ENERGY_COST.CURRENCY_PER_KILOWATT_HOUR,
    format: formats.MANTISSA_FOUR,
    ignoreHidden: true
};

unitConverter.initialize(techFieldsConfig)
