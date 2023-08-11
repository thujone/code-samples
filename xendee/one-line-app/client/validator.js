/****************************************************************************
 ** Client-side validation for the Xendee One-Line diagramming app.
**
** @license
** Copyright (c) 2019 Xendee Corporation. All rights reserved.
***************************************************************************/
import App from '../one-line/app.js'
import constants from './constants.js'
import messages, { getMessageAsListItem } from './messages.js'
import Notification from './notification.js'
import utils from './utils.js'
import { Validators, createFormValidation, FieldValidationResult } from 'lc-form-validation'

export default class Validator {
    constructor() {
        this.notification = new Notification()
        this.createFormValidation = createFormValidation
        this.validators = Validators
        this.validationResult
        this.formId
        this.formValidation
        this.formValidationConstraints = {}
        this.viewModel = {}

        // Keep track of what fields are in "side-panels" so we can display their validation errors properly
        this.solarSidePanelFields = ['xr-ratio', 'fault-x', 'cut-in-power', 'cut-out-power']
        this.generatorSidePanelFields = ['longitude', 'latitude']

        this.init()
        this.setRules()
    }

    init() {
        this.baseValidators = Validators
    }

    validate(formId, successCallback, errorCallback = null) {
        this.formId = formId
        this.setFormValidationConstraints()
        this.generateViewModel()

        this.formValidation.validateForm(this.viewModel)
            .then(validationResult => {
                if (validationResult.succeeded) {
                    successCallback()
                } else {
                    this.showFormErrors(validationResult)
                    this.highlightInvalidFields(validationResult)
                    errorCallback && errorCallback(validationResult)
                }
            }).catch(error => {
                console.log('error.message', error.message, error)
            })
    }

    setFormValidationConstraints() {
        this.formValidationConstraints = this.VALIDATION_CONSTRAINTS[this.formId]

        // WIND has special constraints based on WTGType
        if (this.formId === constants.MODAL_FORM_IDS.WIND[0]) {
            const wtgType = Number(Array.from(document.getElementsByName('wtg-type')).find(x => x.checked).value)
            if ([1, 2].includes(wtgType)) {
                this.formValidationConstraints = {
                    fields: {
                        ...this.formValidationConstraints.fields,
                        ...this.VALIDATION_CONSTRAINTS['wind-main-form-wtgtype-1-2'].fields
                    }
                }
            } else if ([3, 4].includes(wtgType)) {
                this.formValidationConstraints = {
                    fields: {
                        ...this.formValidationConstraints.fields,
                        ...this.VALIDATION_CONSTRAINTS['wind-main-form-wtgtype-3-4'].fields
                    }
                }
            } else {
                console.error('Could not determine WIND validation constraints based on WTGType')
            }
        }

        console.log('Validator.setFormValidationConstraints()::this.formValidationConstraints', this.formValidationConstraints)
        this.formValidation = this.createFormValidation(this.formValidationConstraints)
    }

    generateViewModel() {

        // Clear out the existing viewModel
        this.viewModel = {}

        // Get the list of all fields to constrain for this form
        const fields = Object.keys(this.formValidationConstraints.fields)

        // Build up a validation "viewmodel" that gets all the values from the form
        fields.forEach(item => {
            //console.log('Validator.generateViewModel()::key:', item, ' value:', this.getFieldValue(item))
            this.viewModel[item] = this.getFieldValue(item)
        })
    }

    generateErrorMessage(fieldKey, fieldLabel, fieldErrorType, fieldValidationResult) {
        switch(fieldErrorType) {
            case this.VALIDATION_ERROR_TYPES.REQUIRED:
                return getMessageAsListItem(messages.VALIDATION_REQUIRED, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_NUMERIC:
                return getMessageAsListItem(messages.VALIDATION_IS_NOT_NUMERIC, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_INTEGER:
                return getMessageAsListItem(messages.VALIDATION_IS_NOT_INTEGER, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_AGE:
                return `<li>${messages.VALIDATION_IS_NOT_AGE}</li>`
            case this.VALIDATION_ERROR_TYPES.IS_NOT_BOOLEAN:
                return getMessageAsListItem(messages.VALIDATION_IS_NOT_BOOLEAN, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_BIT:
                return getMessageAsListItem(messages.VALIDATION_IS_NOT_BIT, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.MAX_LENGTH:
                const maxLength = this.getMaxLengthSetting(fieldKey)
                return getMessageAsListItem(messages.VALIDATION_MAX_LENGTH, [fieldLabel, maxLength])
            case this.VALIDATION_ERROR_TYPES.MIN_LENGTH:
                const minLength = this.getMinLengthSetting(fieldKey)
                return getMessageAsListItem(messages.VALIDATION_MIN_LENGTH, [fieldLabel, minLength])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_WITHIN_NUMERIC_RANGE:
                const rangeParams = this.getNumericRangeSettings(fieldKey)
                return getMessageAsListItem(messages.VALIDATION_IS_NOT_WITHIN_NUMERIC_RANGE, [fieldLabel, rangeParams, fieldValidationResult])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_GREATER_THAN:
                const params = this.getIsGreaterThanSettings(fieldKey)
                return getMessageAsListItem(messages.VALIDATION_IS_NOT_GREATER_THAN, [fieldLabel, params, fieldValidationResult])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_LESS_THAN:
                const lessThanParams = this.getIsLessThanSettings(fieldKey)
                return getMessageAsListItem(messages.VALIDATION_IS_NOT_LESS_THAN, [fieldLabel, lessThanParams])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_EQUIPMENT_NAME:
                return getMessageAsListItem(messages.VALIDATION_IS_NOT_EQUIPMENT_NAME, [fieldLabel])
            default:
                console.error('Validator.generateErrorMessage() error: Invalid fieldErrorType')
        }
    }

    getFieldValue(fieldName) {
        //console.log('Validator.getFieldValue::fieldName', fieldName, '::selector', `#${this.formId} [name="${fieldName}"]`)
        return document.querySelector(`#${this.formId} [name="${fieldName}"]`).value
    }

    getFieldLabel(fieldName) {
        //console.log('Validator.getFieldLabel:fieldName', fieldName, '::selector', `#${this.formId} label[for="${fieldName}"]`)
        return document.querySelector(`#${this.formId} label[for="${fieldName}"]`).innerText
    }

    showFormErrors(validationResult) {
        console.log('Validator.showFormErrors()::validationResult', validationResult)
        const listItems = Object.entries(validationResult.fieldErrors)
            .map(entry => entry[1])
            .filter(fieldValidationResult => {
                return (!fieldValidationResult.succeeded)
            })
            .map(fieldValidationResult => {
                const fieldKey = fieldValidationResult.key
                const fieldLabel = this.getFieldLabel(fieldKey)
                const fieldErrorType = fieldValidationResult.type
                return this.generateErrorMessage(fieldKey, fieldLabel, fieldErrorType, fieldValidationResult)
            })
        console.log('Validator.showFormErrors()::listItems', listItems)
        if (listItems.length)
            this.notification.showError(`
                <p style="display: block; width: 500px;"><strong>Please fix the following issues:</strong></p>
                <ul>${listItems.join("\n")}</ul>
            `)
    }

    highlightInvalidFields(validationResult) {

        // Un-focus any active input field
        const okButton = document.querySelector(constants.SELECTORS.ERROR_NOTIFICATION_OK_BUTTON)
        okButton && okButton.focus()

        const invalidFieldNames = Object.entries(validationResult.fieldErrors)
            .map(entry => entry[1])
            .filter(fieldValidationResult => {
                return (!fieldValidationResult.succeeded)
            })
            .map(fieldValidationResult => fieldValidationResult.key)
        // console.log('Validator.highlightInvalidFields()::invalidFieldNames', invalidFieldNames)
        invalidFieldNames.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`)
            field.classList.add('invalid')
            field.addEventListener('blur', (event) => {
                event.target.classList.remove('invalid')
            })
        })

    }

    getMaxLengthSetting(fieldKey) {
        const maxLengthConstraint = this.formValidationConstraints.fields[fieldKey].find(item => item.validator === this.validators.maxLength)
        return maxLengthConstraint.customParams.length
    }

    getMinLengthSetting(fieldKey) {
        const minLengthConstraint = this.formValidationConstraints.fields[fieldKey].find(item => item.validator === this.validators.minLength)
        return minLengthConstraint.customParams.length
    }

    getNumericRangeSettings(fieldKey) {
        const isWithinNumericRangeConstraint = this.formValidationConstraints.fields[fieldKey].find(item => item.validator === Validator.isWithinNumericRange)
        return isWithinNumericRangeConstraint.customParams
    }

    getIsGreaterThanSettings(fieldKey) {
        const isGreaterThanConstraint =  this.formValidationConstraints.fields[fieldKey].find(item => item.validator === Validator.isGreaterThan)
        return isGreaterThanConstraint.customParams
    }

    getIsLessThanSettings(fieldKey) {
        const isLessThanConstraint =  this.formValidationConstraints.fields[fieldKey].find(item => item.validator === Validator.isLessThan)
        return isLessThanConstraint.customParams
    }


    // Custom validators
    static isNumeric(value) {
        const validationResult = new FieldValidationResult()
        validationResult.succeeded = !isNaN(value)
        validationResult.type = 'IS_NOT_NUMERIC'
        validationResult.errorMessage = ''
        return validationResult
    }

    static isInteger(value) {
        const validationResult = new FieldValidationResult()
        validationResult.succeeded = Number.isInteger(Number(value))
        validationResult.type = 'IS_NOT_INTEGER'
        validationResult.errorMessage = ''
        return validationResult
    }

    static isAge(value) {
        const validationResult = new FieldValidationResult()
        validationResult.succeeded =
            document.getElementById('existing').value === 'false' ||
            (value !== '' && value !== null && Number(value) < document.getElementById('lifetime').value && Number(value) > 0)
        validationResult.type = 'IS_NOT_AGE'
        validationResult.errorMessage = ''
        return validationResult
    }

    static isBoolean(value) {
        const validationResult = new FieldValidationResult()
        validationResult.succeeded = typeof value === "boolean" || value === "1" || value === "true" || value === true || value === "on"
        validationResult.type = 'IS_NOT_BOOLEAN'
        validationResult.errorMessage = ''
        return validationResult
    }

    static isBit(value) {
        const validationResult = new FieldValidationResult()
        validationResult.succeeded = value === "1" || value === "0"
        validationResult.type = 'IS_NOT_BIT'
        validationResult.errorMessage = ''
        return validationResult
    }

    static isWithinNumericRange(value, vm, customParams) {
        const validationResult = new FieldValidationResult()
        let floor
        let ceiling
        // The floor param can be either a number or an object containing both an ANSI and IEC floor.
        // Same goes for ceiling.
        if (typeof customParams.floor === 'object') {
            if (App.Project.IsAnsi) {
                floor = customParams.floor.ansi
                ceiling = customParams.ceiling.ansi
            } else {
                floor = customParams.floor.iec
                ceiling = customParams.ceiling.iec
            }
        } else {
            floor = customParams.floor
            ceiling = customParams.ceiling
        }
        let inclusiveFloor = customParams.inclusiveFloor
        validationResult.floor = floor
        validationResult.ceiling = ceiling
        validationResult.inclusiveFloor = inclusiveFloor

        if (customParams.isVoltageField) {
            const voltageUnits = document.getElementById('voltage-units').value
            if (voltageUnits === constants.UNITS.V) {
                floor = customParams.voltsFloor
                inclusiveFloor = true
                validationResult.floor = floor
                validationResult.inclusiveFloor = inclusiveFloor
            }
        }

        if (inclusiveFloor) {
            if (customParams.inclusiveCeiling) {
                validationResult.succeeded = (floor <= value && value <= ceiling) || (value === null || value === '')
            } else {
                validationResult.succeeded = (floor <= value && value < ceiling) || (value === null || value === '')
            }
        } else {
            if (customParams.inclusiveCeiling) {
                validationResult.succeeded = (floor < value && value <= ceiling) || (value === null || value === '')
            } else {
                validationResult.succeeded = (floor < value && value < ceiling) || (value === null || value === '')
            }
        }

        validationResult.type = 'IS_NOT_WITHIN_NUMERIC_RANGE'
        validationResult.errorMessage = ''
        return validationResult
    }

    static isGreaterThan(value, vm, customParams) {
        const validationResult = new FieldValidationResult()
        let floor = customParams.floor
        let inclusive = customParams.inclusive
        validationResult.floor = floor
        validationResult.inclusive = inclusive
        if (customParams.isVoltageField) {
            const voltageUnits = document.getElementById('voltage-units').value
            if (voltageUnits === constants.UNITS.V) {
                floor = customParams.voltsFloor
                inclusive = true
                validationResult.floor = floor
                validationResult.inclusive = inclusive
            }
        }
        if (inclusive)
            validationResult.succeeded = (floor <= value) || (value === null || value === '')
        else
            validationResult.succeeded = (floor < value) || (value === null || value === '')

        validationResult.type = 'IS_NOT_GREATER_THAN'
        validationResult.errorMessage = ''
        return validationResult
    }

    static isLessThan(value, vm, customParams) {
        const validationResult = new FieldValidationResult()
        if (customParams.inclusive)
            validationResult.succeeded = (customParams.ceiling >= value) || (value === null || value === '')
        else
            validationResult.succeeded = (customParams.ceiling > value) || (value === null || value === '')
        validationResult.type = 'IS_NOT_LESS_THAN'
        validationResult.errorMessage = ''
        return validationResult
    }

    static isEquipmentName(value, vm, customParams) {
        const validationResult = new FieldValidationResult()
        const equipmentNamePattern = /^[\w ]*$/
        validationResult.succeeded = value.match(equipmentNamePattern) !== null
                && value.match(equipmentNamePattern)[0] === value
                && value.trim() !== '';

        validationResult.type = 'IS_NOT_EQUIPMENT_NAME'
        validationResult.errorMessage = ''
        return validationResult
    }

    setRules() {
        this.VALIDATION_ERROR_TYPES = {
            REQUIRED: 'REQUIRED',
            MAX_LENGTH: 'MAX_LENGTH',
            MIN_LENGTH: 'MIN_LENGTH',
            IS_NOT_NUMERIC: 'IS_NOT_NUMERIC',
            IS_NOT_INTEGER: 'IS_NOT_INTEGER',
            IS_NOT_AGE: 'IS_NOT_AGE',
            IS_NOT_BIT: 'IS_NOT_BIT',
            IS_NOT_BOOLEAN: 'IS_NOT_BOOLEAN',
            IS_NOT_WITHIN_NUMERIC_RANGE: 'IS_NOT_WITHIN_NUMERIC_RANGE',
            IS_NOT_GREATER_THAN: 'IS_NOT_GREATER_THAN',
            IS_NOT_LESS_THAN: 'IS_NOT_LESS_THAN',
            IS_NOT_EQUIPMENT_NAME: 'IS_NOT_EQUIPMENT_NAME'
        }

        this.COMMON_VALIDATION_CONSTRAINTS = {
            fields: {
                'name': [
                    { validator: this.baseValidators.required },
                    { validator: this.baseValidators.maxLength, customParams: { length: 100 } },
                    { validator: Validator.isEquipmentName }
                ],
                'description': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 512 } },
                ]
            }
        }

        this.COMMON_DEVICE_VALIDATION_CONSTRAINTS = {
            fields: {
                'device-name': [
                    { validator: this.baseValidators.required },
                    { validator: this.baseValidators.maxLength, customParams: { length: 100 } },
                    { validator: Validator.isEquipmentName }
                ],
                'device-description': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 512 } },
                ],
                'device-id': [
                    { validator: this.baseValidators.required }
                ],
                'device-type': [
                    { validator: this.baseValidators.required }
                ],
                'device-catalog-name': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                ],
                'device-manufacturer': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                ],
                'device-part-number': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                ],
                'device-model-number': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 20 } }
                ],
                'device-notes': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 1024 } }
                ]
            }
        }

        // Constraint definitions for the various forms
        this.VALIDATION_CONSTRAINTS = {

            // Project Settings constraints
            [constants.MODAL_FORM_IDS.SETTINGS[0]]: {
                fields: {
                    'description': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 512 } }
                    ]
                }
            },

            [constants.MODAL_FORM_IDS.SAVE_PROJECT[0]]: {
                fields: {
                    'new-project-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'new-project-description': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 512 } }
                    ]
                }
            },

            // Utility constraints
            [constants.MODAL_FORM_IDS.UTILITY[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                    'three-phase-short-circuit': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'base-mva': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 4 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'line-ground-short-circuit': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'operating-voltage': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'stiffness': [
                        { validator: Validator.isBit }
                    ],
                    'voltage': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'voltage-angle': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 5 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -180, ceiling: 180, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'xr-ratio-positive': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'xr-ratio-zero': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'latitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -90, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'longitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -180, ceiling: 180, inclusiveFloor: true, inclusiveCeiling: true } }
                    ]
                }
            },

            // Utility Save Catalog constraints
            [constants.MODAL_FORM_IDS.UTILITY[2]]: {
                fields: {
                    'sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'sc-node-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Busbar constraints
            [constants.MODAL_FORM_IDS.BUSBAR[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                    'age': [
                        { validator: Validator.isInteger },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } },
                        { validator: Validator.isAge }
                    ],
                    'amp-rating': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'annual-maintenance-costs': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 20 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'infrastructure-capital-costs': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 20 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'lifetime': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'latitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -90, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'longitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -180, ceiling: 180, inclusiveFloor: true, inclusiveCeiling: true } }
                    ]
                }
            },

            // Busbar Save Catalog constraints
            [constants.MODAL_FORM_IDS.BUSBAR[2]]: {
                fields: {
                    'sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-node-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Load constraints
            [constants.MODAL_FORM_IDS.LOAD[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                    'connection': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'load-model': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'min-voltage-per-unit': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 4 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'power-factor': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'power-factor-type': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'rated-power': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 10 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'rated-power-units': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'rated-voltage': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false, isVoltageField: true, voltsFloor: 1 } },
                    ],
                    'latitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -90, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'longitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -180, ceiling: 180, inclusiveFloor: true, inclusiveCeiling: true } }
                    ]
                }
            },

            // Load Save Catalog constraints
            [constants.MODAL_FORM_IDS.LOAD[2]]: {
                fields: {
                    'sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-node-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },


            // Solar main form constraints
            [constants.MODAL_FORM_IDS.SOLAR[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                    'voltage': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'rated-power': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'power-factor': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'connection': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } }
                    ],
                    'inverter-rating': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 10 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'stiffness': [
                        { validator: Validator.isBoolean }
                    ],
                    'force-seq-pos': [
                        { validator: Validator.isBoolean }
                    ],
                    'xr-ratio': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'fault-x': [
                        { validator: Validator.isInteger },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 9, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'cut-in-power': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 5 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'cut-out-power': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 5 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'latitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -90, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'longitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -180, ceiling: 180, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'pv-space': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 99999999, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'tilt': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'system-losses': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -5, ceiling: 99, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'inverter-efficiency': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 90, ceiling: 99.5, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'inverter-costs': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'inverter-life': [
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'pv-costs': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'pv-life': [
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'pv-maint-costs-per-kw-per-month': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'pv-installation-costs': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ]
                }
            },

            // Load Save Catalog constraints
            [constants.MODAL_FORM_IDS.SOLAR[2]]: {
                fields: {
                    'sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-node-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Wind main form constraints
            [constants.MODAL_FORM_IDS.WIND[0]]: {
            fields: {
                ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                'voltage': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                    { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false, isVoltageField: true, voltsFloor: 1 } }
                ],
                'rated-power': [
                        { validator: this.baseValidators.required },
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                    { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                ],
                'wtg-type': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 1 } }
                ],
                'max-power-absorption': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                    { validator: Validator.isLessThan, customParams: { ceiling: 0, inclusive: false } }
                ],
                'max-power-delivery': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                    { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                ],
                'neg-seq-reactance': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                ],
                'steady-state': [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: false, inclusiveCeiling: false } }
                ],
                'subtransient': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                ],
                'x0': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                ],
                'transient': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                ],
                'xr-ratio': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: false, inclusiveCeiling: false } }
                ],
                'lifetime': [
                    { validator: Validator.isInteger },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                ],
                'cost': [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                ],
                'fixed-maint-cost': [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                ],
                'var-maint-cost': [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: true, inclusiveCeiling: false } }
                ],
                'hub-height': [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange, customParams: {floor: { ansi: 35, iec: 10 }, ceiling: { ansi: 490, iec: 150 }, inclusiveFloor: true, inclusiveCeiling: true } }
                ],
                'gen-shedding': [
                    { validator: Validator.isBoolean }
                ],
                'turbine-model': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                ]
            }
        },

        ['wind-main-form-wtgtype-1-2']: {
            fields: {
                'power-factor-full-load': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                ],
                'power-factor-correction': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                ],
                'shunt-capacitor-stages': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 3 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                ],
                'shunt-capacitor-rating': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                ]
            }
        },

        ['wind-main-form-wtgtype-3-4']: {
            fields: {
                'max-power-factor-over': [
                { validator: Validator.isNumeric },
                { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                ],
                'max-power-factor-under': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                ],
                'control-mode': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 5 } }
                ]
            }
        },


        // Wind Save+Catalog constraints
        [constants.MODAL_FORM_IDS.WIND[2]]: {
            fields: {
                'sc-new-item-catalog-name': [
                    { validator: this.baseValidators.required },
                    { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                ],
                'sc-phases': [
                    { validator: Validator.isNumeric },
                    { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                ],
                'sc-manufacturer': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                ],
                'sc-part-number': [
                    { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                ],
                'sc-node-id': [
                    { validator: this.baseValidators.required }
                ]
            }
        },

            // Generator main form constraints
            [constants.MODAL_FORM_IDS.GENERATOR[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                    'poles': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 5 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'power-model': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'connection': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'latitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -90, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'longitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -180, ceiling: 180, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'max-power-absorption': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isLessThan, customParams: { ceiling: 0, inclusive: false } }
                    ],
                    'max-power-delivery': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'power-factor': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'rated-power': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'rated-rpm': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'reactance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'resistance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'x-2': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'steady-state': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'stiffness': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } }
                    ],
                    'subtransient': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'x0': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'transient': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'voltage': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'xr-ratio': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'cost': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'lifetime': [
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'fixed-maintenance-costs': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'variable-maintenance-costs': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ]
                }
            },

            // Load Save Catalog constraints
            [constants.MODAL_FORM_IDS.GENERATOR[2]]: {
                fields: {
                    'sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-node-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Storage main form constraints
            [constants.MODAL_FORM_IDS.STORAGE[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                    'stored': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'fault-x': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 9, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'force-seq-plus': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 5 } }
                    ],
                    'connection': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -90, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'idling-losses': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'losses-kvar': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'limit-current': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 5 } }
                    ],
                    'max-voltage': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 4 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 2, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'min-voltage': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 4 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'inverter-power-factor': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'inverter-rated-power': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'rated-voltage': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'reactance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'resistance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'storage-rated-capacity': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 10 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'x-r': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'system-installation': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'inverter-purchase': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'energy-modules-cost': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'discrete-module-size': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'maintenance-cost': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'charging': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'discharging': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'max-charge': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 5, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'min-charge': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'system-lifetime': [
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'charging-c-rating': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'discharging-c-rating': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'latitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -90, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'longitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -180, ceiling: 180, inclusiveFloor: true, inclusiveCeiling: true } }
                    ]
                }
            },

            // Storage Save Catalog constraints
            [constants.MODAL_FORM_IDS.STORAGE[2]]: {
                fields: {
                    'sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-node-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Direct Connection constraints
            [constants.MODAL_FORM_IDS.DCON[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields
                }
            },

            // Cable constraints
            [constants.MODAL_FORM_IDS.CABLE[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                    'number-of-cables-in-parallel': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 3 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'number-of-conductors': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 4 } }
                    ],
                    'ampacity': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'cable-length': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isInteger },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } },
                    ],
                    'cable-material': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'cable-size': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } }
                    ],
                    'insulation-type': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'voltage-rating': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'resistance-pos': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: { ansi: 0, iec: 0 }, ceiling: { ansi: 12, iec: 39 }, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'resistance-zero': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: { ansi: 0, iec: 0 }, ceiling: { ansi: 12, iec: 39 }, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'rated-temperature': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 3 } }
                    ],
                    'reactance-pos': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: { ansi: 0, iec: 0 }, ceiling: { ansi: 12, iec: 39 }, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'reactance-zero': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: { ansi: 0, iec: 0 }, ceiling: { ansi: 12, iec: 39 }, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'costs-per-unit-distance': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'life': [
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ]
                }
            },

            // Cable Save Catalog constraints
            [constants.MODAL_FORM_IDS.CABLE[2]]: {
                fields: {
                    'sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-branch-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Transformer constraints
            [constants.MODAL_FORM_IDS.TRANS2W[0]]: {
                fields: {
                    ...this.COMMON_VALIDATION_CONSTRAINTS.fields,
                    'number-of-taps': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 3 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'cooling-class-code': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 10 } }
                    ],
                    'cooling-factor': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 1, inclusive: true } }
                    ],
                    'impedance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'max-tap': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'min-tap': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'primary-grounding-reactance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'primary-grounding-resistance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'primary-winding': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'rating': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'secondary-grounding-reactance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'secondary-grounding-resistance': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 8 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: false } }
                    ],
                    'secondary-rated-voltage': [
                        { validator: this.baseValidators.required },
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'secondary-winding': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'tap': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 300, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'tap-side': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 50 } }
                    ],
                    'xr-ratio': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 6 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 1000, inclusiveFloor: false, inclusiveCeiling: false } }
                    ],
                    'latitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -90, ceiling: 90, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'longitude': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: -180, ceiling: 180, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'cost': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100000000, inclusiveFloor: true, inclusiveCeiling: false } }
                    ],
                    'life': [
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 2, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true } }
                    ]
                }
            },

            [constants.MODAL_FORM_IDS.TRANS2W[2]]: {
                fields: {
                    'sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'sc-branch-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Breaker constraints
            [constants.MODAL_FORM_IDS.BREAKER[0]]: {
                fields: {
                    ...this.COMMON_DEVICE_VALIDATION_CONSTRAINTS.fields,
                    'device-amp-rating': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 2000000000, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'device-interrupt-rating': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'device-voltage-rating': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 2000000000, inclusiveFloor: false, inclusiveCeiling: true, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'device-frame-size': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ],
                    'device-frame-type': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ],
                    'device-trip-unit-type': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ]
                }
            },

            // Switch constraints
            [constants.MODAL_FORM_IDS.SWITCH[0]]: {
                fields: {
                    ...this.COMMON_DEVICE_VALIDATION_CONSTRAINTS.fields,
                    'device-amp-rating': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 2000000000, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'device-interrupt-rating': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'device-voltage-rating': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 2000000000, inclusiveFloor: false, inclusiveCeiling: true, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'device-frame-size': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ],
                    'device-frame-type': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ],
                    'device-trip-unit-type': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ]
                }
            },

            // Fuse constraints
            [constants.MODAL_FORM_IDS.FUSE[0]]: {
                fields: {
                    ...this.COMMON_DEVICE_VALIDATION_CONSTRAINTS.fields,
                    'device-amp-rating': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 2000000000, inclusiveFloor: false, inclusiveCeiling: true } }
                    ],
                    'device-interrupt-rating': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 7 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'device-voltage-rating': [
                        { validator: Validator.isNumeric },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 2000000000, inclusiveFloor: false, inclusiveCeiling: true, isVoltageField: true, voltsFloor: 1 } }
                    ],
                    'device-fuse-class': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ],
                    'device-fuse-speed': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ],
                    'device-fuse-type': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ]
                }
            },

            // Relay constraints
            [constants.MODAL_FORM_IDS.RELAY[0]]: {
                fields: {
                    ...this.COMMON_DEVICE_VALIDATION_CONSTRAINTS.fields,
                    'device-ct-ratio-numerator': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 5 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'device-ct-ratio-denominator': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 5 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'device-relay-type': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 32 } }
                    ],
                    'device-tap-setting': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 15 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ],
                    'device-time-dial': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 15 } },
                        { validator: Validator.isGreaterThan, customParams: { floor: 0, inclusive: true } }
                    ]
                }
            },

            // Breaker Save + Catalog form
            [constants.MODAL_FORM_IDS.BREAKER[2]]: {
                fields: {
                    'device-sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'device-sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'device-sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'device-sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'device-sc-device-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Fuse Save + Catalog form
            [constants.MODAL_FORM_IDS.FUSE[2]]: {
                fields: {
                    'device-sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'device-sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'device-sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'device-sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'device-sc-device-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Relay Save + Catalog form
            [constants.MODAL_FORM_IDS.RELAY[2]]: {
                fields: {
                    'device-sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'device-sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'device-sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'device-sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'device-sc-device-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            },

            // Switch Save + Catalog form
            [constants.MODAL_FORM_IDS.SWITCH[2]]: {
                fields: {
                    'device-sc-new-item-catalog-name': [
                        { validator: this.baseValidators.required },
                        { validator: this.baseValidators.maxLength, customParams: { length: 100 } }
                    ],
                    'device-sc-phases': [
                        { validator: Validator.isNumeric },
                        { validator: this.baseValidators.maxLength, customParams: { length: 1 } },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1, ceiling: 3, inclusiveFloor: true, inclusiveCeiling: true } }
                    ],
                    'device-sc-manufacturer': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'device-sc-part-number': [
                        { validator: this.baseValidators.maxLength, customParams: { length: 64 } }
                    ],
                    'device-sc-device-id': [
                        { validator: this.baseValidators.required }
                    ]
                }
            }
        }
    }
}