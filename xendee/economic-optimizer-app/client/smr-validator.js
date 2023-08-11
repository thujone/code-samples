// This is the custom form validator configuration for Small Modular Reactors (SMR).
// See validator.js for more info about form validation across the various technologies in Xendee Economic Optimizer.

import Validator from '../validator.js'
const formId = 'smr-form'
const buttonBarQuerySelector = '.smr-settings-type'
const validator = new Validator(formId, buttonBarQuerySelector)

validator.customConstraints = {
    isUniqueGeneratorName: (value, viewModel, customParams) => {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        validationResult.succeeded = !customParams.existingNames.includes(value.toLowerCase())
        validationResult.type = 'IS_UNIQUE_NAME'
        validationResult.errorMessage = validator.MESSAGES.IS_UNIQUE_NAME(value)
        validationResult.relatedFields = customParams.relatedFields
        validationResult.container = customParams.container
        return validationResult
    },
    validateAge: (value, viewModel, customParams) => {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const checkAge = ['existingSMR', 'existingMoreSMR'].includes(validator.formVariant)
        const age = viewModel['smr-age']
        validationResult.succeeded =  !checkAge || (age && Number.isInteger(Number(age)) && Number(age) >= 0 && Number(age) <= 100)
        validationResult.type = 'VALIDATE_AGE'
        validationResult.errorMessage = validator.MESSAGES.VALIDATE_AGE
        validationResult.relatedFields = customParams.relatedFields
        validationResult.container = customParams.container
        return validationResult
    },
    validateLifetimeAge: (value, viewModel, customParams) => {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const checkAge = ['existingSMR', 'existingMoreSMR'].includes(validator.formVariant)
        const age = viewModel['smr-age']
        const lifetime = viewModel['smr-lifetime']
        validationResult.succeeded =  !checkAge || (Number(age) < Number(lifetime))
        validationResult.type = 'VALIDATE_LIFETIME_AGE'
        validationResult.errorMessage = validator.MESSAGES.VALIDATE_LIFETIME_AGE
        validationResult.relatedFields = customParams.relatedFields
        validationResult.container = customParams.container
        return validationResult
    },
    validateSize: (value, viewModel, customParams) => {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const checkExistingSize = ['existingSMR', 'existingMoreSMR', 'forceSMR', 'forceMoreSMR'].includes(validator.formVariant)
        const existingSize = viewModel['size-SMR-existing']

        validationResult.succeeded = !checkExistingSize || (existingSize && Number.isInteger(Number(existingSize)) && Number(existingSize) >= 0 && Number(existingSize) <= customParams.maxGenerators)
        validationResult.type = 'VALIDATE_NUMBER_OF_GENERATORS'
        validationResult.errorMessage = validator.MESSAGES.VALIDATE_NUMBER_OF_GENERATORS(validator.getFieldLabel('size-SMR-existing'), customParams.maxGenerators)
        validationResult.relatedFields = customParams.relatedFields
        validationResult.container = customParams.container
        return validationResult
    },
    validateMaxSize: (value, viewModel, customParams) => {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const checkMaxNewSize = ['considerSMR', 'existingMoreSMR', 'forceMoreSMR'].includes(validator.formVariant)
        const maxNewSize = viewModel['smr-max-new-size']

        if (
            !checkMaxNewSize || !maxNewSize || (Number.isInteger(Number(maxNewSize)) && Number(maxNewSize) >= 0 && Number(maxNewSize) <= customParams.maxGenerators)
        )
            validationResult.succeeded = true
        else
            validationResult.succeeded = false

        validationResult.type = 'VALIDATE_MAX_NEW_SIZE_GENERATORS'
        validationResult.errorMessage = validator.MESSAGES.VALIDATE_MAX_NEW_SIZE_GENERATORS(customParams.maxGenerators)
        validationResult.relatedFields = customParams.relatedFields
        validationResult.container = customParams.container
        return validationResult
    },
    validateMaxSizeForcedInvest: (value, viewModel, customParams) => {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const maxNewSize = viewModel['smr-max-new-size']
        const forcedInvest = viewModel['size-SMR-existing']
        const checkConstrainMaxSize = validator.formVariant === 'forceMoreSMR'

        if (
            !checkConstrainMaxSize || !maxNewSize || !forcedInvest || parseFloat(maxNewSize) > parseFloat(forcedInvest)
        )
            validationResult.succeeded = true
        else
            validationResult.succeeded = false

        validationResult.type = 'VALIDATE_MAX_SIZE_FORCED_INVEST_GENERATORS'
        validationResult.errorMessage = validator.MESSAGES.VALIDATE_MAX_SIZE_FORCED_INVEST_GENERATORS
        validationResult.relatedFields = customParams.relatedFields
        validationResult.container = customParams.container
        return validationResult
    },
    nonlinearCurveSequentialUnits: (value, viewModel, customParams) => {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const columnIndex = customParams.columnIndex
        const columnNumeral = columnIndex + 1
        const currentColumnUnits = parseInt(value)
        const previousColumnUnits = columnIndex > 0 ? parseInt(viewModel[`nonlinear-curve-row1-${columnIndex - 1}`]) : null

        validationResult.succeeded = isNaN(previousColumnUnits) ||
            columnIndex === 0 ||
            currentColumnUnits > previousColumnUnits
        validationResult.type = 'NONLINEAR_CURVE_SEQUENTIAL_UNITS'
        validationResult.errorMessage = validator.MESSAGES.NONLINEAR_CURVE_SEQUENTIAL_UNITS(columnNumeral)
        validationResult.relatedFields = customParams.relatedFields
        validationResult.container = customParams.container
        return validationResult
    }
}

// These are the rules by DOM ID of all the fields in the SMR form
validator.constraints = {
    fields: {
        'size-SMR-existing': [
            { validator: validator.customConstraints.validateSize, customParams: { maxGenerators, relatedFields: null } },
            { validator: validator.customConstraints.validateMaxSizeForcedInvest, customParams: { relatedFields: ['smr-max-new-size'] } }
        ],
        'smr-max-new-size': [
            { validator: validator.customConstraints.validateMaxSize, customParams: { maxGenerators, relatedFields: null } },
            { validator: validator.customConstraints.validateMaxSizeForcedInvest, customParams: { relatedFields: ['size-SMR-existing'] } }
        ],
        'smr-age': [
            { validator: validator.customConstraints.validateAge, customParams: { relatedFields: null } },
            { validator: validator.customConstraints.validateLifetimeAge, customParams: { relatedFields: ['smr-lifetime'] } }
        ],
        'smr-name': [
            { validator: Validator.isRequired },
            { validator: validator.baseValidators.maxLength, customParams: { length: 50 } },
            { validator: validator.customConstraints.isUniqueGeneratorName, customParams: { existingNames } },
            { validator: Validator.isValidName }
        ],
        'smr-purchase-price': [
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 999999999, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-lifetime': [
            { validator: Validator.isRequired },
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } },
            { validator: validator.customConstraints.validateLifetimeAge, customParams: { relatedFields: ['smr-age'] } }
        ],
        'smr-omvar': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 999.99999, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-omfix': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 999999999, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-decommissioning-cost': [
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 999999, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-front-end-fuel-cost': [
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 99999, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-back-end-fuel-cost': [
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 99999, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-refueling-period': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0.5, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-reactor-capacity': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 999999, inclusiveFloor: true, inclusiveCeiling: false } }
        ],
        'smr-baseload-setpoint-duration': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 24, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-htp-ratio': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-itc': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-amt-depreciable': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-ptc': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-cycle-depth': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-max-cycle': [
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0.00, ceiling: 9999999, inclusiveFloor: true, inclusiveCeiling: false } }
        ],
        'smr-min-load': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-max-annual-hours': [
            { validator: validator.baseValidators.required },
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 8760, inclusiveFloor: false, inclusiveCeiling: true } }
        ],
        'smr-min-annual-hours': [
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 8760, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-rampup-rate': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-rampdown-rate': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-min-updown-time': [
            { validator: Validator.isInteger },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-power-factor': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ],
        'smr-heat-export-price': [
            { validator: Validator.isNumeric },
            { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
        ]
    },

    containers: {
      // Defined programatically below...
    }
}

// Add "containers" selectors to help control tooltip placement
Object.keys(validator.constraints.fields).forEach(key => {
  validator.constraints.containers[key] = `#${key}-group`
})

// For form fields that have no constraints, add their IDs here
validator.noConstraints = [
    'singularPriceNonLinearCurveButton',
    'nonLinearPriceNonLinearCurveButton',
    'singularHTPNonLinearCurveButton',
    'NonLinearHTPValuesNonLinearCurveButton',
    'considerSMR',
    'existingSMR',
    'existingMoreSMR',
    'forceSMR',
    'forceMoreSMR',
    'smr-base-load-enable-label',
    'smr-chp-label',
    'smr-export-label',
    'smr-synchronous-operation-label',
    'smr-macrs-yrs-select'
]

// Add selectors for all buttons / icons that dismiss the modal form
validator.disposeButtons = [
    '#smr-tech-cancel',
    '.close-node-window',
    '#deleteSmr'
]

validator.initialize()