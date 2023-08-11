 /****************************************************************************
 ** Client-side validation for Optimizer forms
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import Notification from './notification.js'
export default class Validator {
    constructor(formId, buttonBarQuerySelector = '') {
        this.formId = formId                   // The DOM ID of the form to validate
        this.buttonBarQuerySelector = buttonBarQuerySelector
                                               // The className of the button bar across the top of the form
        this.prependLabels = null              // Page sections that require the name of the section to be prepended to the field names
        this.formVariant = null                // e.g.: 'considerBESS' | 'existingBESS' | 'existingMoreBESS' |
                                               //       'forceBESS' | 'forceMoreBESS'

        this.createFormValidation = window['lc-form-validation'].createFormValidation
                                            // Creates the validation engine and applies it to the current form
        this.baseValidators = window['lc-form-validation'].Validators
                                            // A few generic validation rules that come with the library

        this.validationResult = {}             // The current field's validation status
        this.formValidation                    // The instantiated validation engine, applied to the current form
        this.constraints = {}                  // Standard ID list of field constraints (provided by caller)
        this.customConstraints = {}            // Special multi-field validation ID list (provided by caller)
        this.noConstraints = []                // List of fields with tooltips but no constraints (provided by caller)
        this.disposeButtons = []               // Any button or icon that can dismiss the modal form (provided by caller)


        this.errorTemplate = `<div class="tooltip error" role="tooltip"><div class="arrow"></div>
                            <div class="tooltip-inner"></div></div>`
                                            // Bootstrap tooltip markup
        this.notification = new Notification() // Class for showing Notys for validation errors
    }

    initialize() {

        // The viewmodel is required by both the full-page form post and by multi-field custom constraints
        this.setFormValidationConstraints()
        this.generateViewModel()
        this.setFormVariant()


        // For fields with no constraints, generate a simple tooltip
        this.noConstraints.forEach(item => {
            $(`#${item}`).tooltip()
        })

        // Add a click listener to dispose all tooltips if the modal is being closed
        this.disposeButtons.forEach(item => {
            $(item).one('click', () => {
                Object.entries(this.constraints.fields).forEach(item => {
                    const itemId = `#${item[0]}`

                    $(itemId).tooltip('dispose')

                })
                this.noConstraints.forEach(item => $(`#${item}`).tooltip('dispose'))
            })
        })

        // Iterate through all the single-field constraints and add the blur event listener
        Object.entries(this.constraints.fields).forEach(item => {
            const itemId = `#${item[0]}`
            const recurseRelatedFields = true
            const recurseRelatedFieldsOfRelatedFields = false

            // Create the default tooltip for this field
            $(itemId).tooltip()

            // Save the title prop before changing it
            $(itemId).data('info-tooltip', $(itemId).data('original-title'))

            // The onBlur() handler that runs the single-field validation
            $(itemId).blur(() => {

                // When the user tabs out of the input field, run the validation for a single field
                this.validateSingle(

                    // The field id
                    item[0],

                    // Success callback for good input
                    (validationResult) => {

                        this.changeToOriginalTooltip(`#${item[0]}`)

                        // Re-validate array of field ids stored in customParams.relatedFields
                        if (validationResult.relatedFields && Array.isArray(validationResult.relatedFields)) {

                            validationResult.relatedFields.forEach(relatedField => this.validateSingle(
                                relatedField,
                                () => {
                                    this.changeToOriginalTooltip(`#${relatedField}`)
                                },
                                (relatedFieldValidationResult) => {
                                    this.changeToErrorTooltip(`#${relatedField}`, relatedFieldValidationResult)
                                },

                                // Don't recurse anymore!
                                recurseRelatedFieldsOfRelatedFields
                            ))
                        }
                        return validationResult
                    },

                    // Error callback for bad input
                    (validationResult) => {

                        // Change the black tooltip into an error tooltip
                        this.changeToErrorTooltip(itemId, validationResult)

                        // Re-validate array of field ids stored in customParams.relatedFields
                        if (validationResult.relatedFields && Array.isArray(validationResult.relatedFields)) {

                            validationResult.relatedFields.forEach(relatedField => this.validateSingle(
                                relatedField,
                                () => {
                                    this.changeToOriginalTooltip(`#${relatedField}`)
                                },
                                (relatedFieldValidationResult) => {
                                    this.changeToErrorTooltip(`#${relatedField}`, relatedFieldValidationResult)
                                },

                                // Don't recurse anymore!
                                recurseRelatedFieldsOfRelatedFields
                            ))
                        }

                        // Now that we're showing an error tooltip, add a focus handler that will remove
                        // the error state and restore the original black tooltip
                        $(itemId).focus(() => {
                            this.changeToOriginalTooltip(itemId)
                        })

                        return validationResult

                    },

                    // Yes, loop through the array of related fields
                    recurseRelatedFields
                )
            })
        })

        // Only try to set the form in `formValidators` if we're in the GUI
        if (window.formValidators)
            window.formValidators[this.formId] = this

        window.validator = this
    }

    changeToOriginalTooltip(itemId) {
        $(itemId).removeClass('error')

        $(itemId).tooltip('hide')
        $(itemId).prop('title', $(itemId).data('info-tooltip'))
        $(itemId).data('original-title', $(itemId).data('info-tooltip'))

        $(itemId).tooltip('dispose')
        $(itemId).tooltip()
    }

    changeToErrorTooltip(itemId, validationResult) {
        let prependEntry = []
        let prependHeader = ''

        $(itemId).addClass('error')

        $(itemId).data('original-title', validationResult.errorMessage)

        if (this.prependLabels !== null) {
            const fieldId = itemId.substring(1);
            prependEntry = Object.entries(this.prependLabels).find(x => fieldId.startsWith(x[0]))
            prependHeader = prependEntry ? prependEntry[1] : ''
        }
        $(itemId).prop('title', prependHeader !== '' ? `<strong>${prependHeader} \u2014 </strong>${validationResult.errorMessage}` : validationResult.errorMessage)

        $(itemId).tooltip('dispose')

        $(itemId).tooltip({
            title: prependHeader !== '' ? `${prependHeader} \u2014 ${validationResult.errorMessage}` : validationResult.errorMessage,
            trigger: 'manual',
            html: true,
            template: this.errorTemplate,
            boundary: 'window',
            container: `${validator.constraints.containers[itemId.substring(1)]}`
        })

        $(itemId).tooltip('show')
    }

    validateSingle(fieldId, successCallback, errorCallback, recurseRelatedFields = true) {
        this.generateViewModel()
        this.setFormVariant()

        // Check if this field is formatted by AutoNumeric
        const fieldSelector = `#${fieldId}`
        let valueToTest = document.querySelector(fieldSelector).value
        if (AutoNumeric.isManagedByAutoNumeric(fieldSelector))
            valueToTest = AutoNumeric.getNumericString(fieldSelector)

        this.formValidation.validateField(this.viewModel, fieldId, valueToTest)
            .then(validationResult => {
                if (!!validationResult.skipBlurCheck || validationResult.succeeded)
                    successCallback(validationResult)
                else {
                    if (!validationResult.errorMessage || validationResult.type === 'REQUIRED') {
                        const fieldKey = validationResult.key
                        const fieldLabel = this.getFieldLabel(fieldKey)
                        const fieldErrorType = validationResult.type
                        validationResult.errorMessage = this.generateErrorMessage(fieldKey, fieldLabel, fieldErrorType, validationResult)
                    }
                    console.log('Validator found an error.', validationResult)
                    errorCallback(validationResult)
                }
            })
            .catch(error => {
                console.log('Error: Validation crashed', error)
            })
    }

    revalidateField(id) {
        this.validateSingle(id,
            () => {
                this.changeToOriginalTooltip(`#${id}`)
            },
            (validationResult) => {
                this.changeToErrorTooltip(id, validationResult)
                $(`#${id}`).focus(() => {
                    this.changeToOriginalTooltip(`#${id}`)
                })
            },
            false
        )
    }

    // Validate entire form using the validation viewmodel
    validate(successCallback, errorCallback = null) {
        this.generateViewModel()
        this.setFormVariant()

        this.formValidation.validateForm(this.viewModel)
            .then(validationResult => {
                if (validationResult.succeeded) {
                    successCallback()
                } else {
                    this.showFormErrors(validationResult)
                    errorCallback && errorCallback(validationResult)
                }
            }).catch(error => {
                console.log('validate() full form crash', error)
            })
    }

    // Validate a subset of existing rules by passing in an array of fields to validate
    validatePartial(fields, successCallback, errorCallback = null) {
        this.generateViewModel(fields)

        this.formValidation.validateForm(this.viewModel)
            .then(validationResult => {
                if (validationResult.succeeded) {
                    successCallback()
                } else {
                    this.showFormErrors(validationResult)
                    errorCallback && errorCallback(validationResult)
                }
            }).catch(error => {
                console.log('validatePartial() form crash', error)
            })
    }

    setFormValidationConstraints() {
        console.log('Validator.setFormValidationConstraints()::this.constraints', this.constraints)
        this.formValidation = this.createFormValidation(this.constraints)
    }

    setFormVariant() {
        const activeButton = document.querySelector(`#${this.formId} ${this.buttonBarQuerySelector}.active`)
        if (typeof activeButton !== 'undefined' && activeButton !== null) {
            this.formVariant = activeButton.id
        }
    }

    generateViewModel(partialFieldList = null) {

        // Clear out the existing viewModel
        this.viewModel = {}

        // Get the list of all fields to constrain for this form
        const fields = Object.keys(this.constraints.fields)

        // Build up a validation "viewmodel" that gets all the values from the form
        fields.forEach(item => {
            if (!partialFieldList || partialFieldList.includes(item)) {
                const fieldSelector = `#${item}`

                // Check if this field is formatted by AutoNumeric
                if (AutoNumeric.isManagedByAutoNumeric(fieldSelector))
                    this.viewModel[item] = AutoNumeric.getNumericString(fieldSelector)
                else
                    this.viewModel[item] = this.getFieldValue(item)
            }
        })
    }

    generateErrorMessage(fieldKey, fieldLabel, fieldErrorType, validationResult) {
        if (!fieldLabel)
        fieldLabel = 'Field'

        switch(fieldErrorType) {
            case this.VALIDATION_ERROR_TYPES.REQUIRED:
                return this.getMessage(this.MESSAGES.VALIDATION_REQUIRED, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.CUSTOM_REQUIRED:
                return this.getMessage(this.MESSAGES.VALIDATION_CUSTOM_REQUIRED, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.CUSTOM_REQUIRED_TERSE:
                return this.getMessage(this.MESSAGES.VALIDATION_CUSTOM_REQUIRED_TERSE, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_DROPDOWN_REQUIRED:
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_DROPDOWN_REQUIRED, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_NUMERIC:
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_NUMERIC, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_INTEGER:
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_INTEGER, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_AGE:
                return `${messages.VALIDATION_IS_NOT_AGE}`
            case this.VALIDATION_ERROR_TYPES.IS_NOT_BOOLEAN:
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_BOOLEAN, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_BIT:
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_BIT, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.MAX_LENGTH:
                const maxLength = this.getMaxLengthSetting(fieldKey)
                return this.getMessage(this.MESSAGES.VALIDATION_MAX_LENGTH, [fieldLabel, maxLength])
            case this.VALIDATION_ERROR_TYPES.MIN_LENGTH:
                const minLength = this.getMinLengthSetting(fieldKey)
                return this.getMessage(this.MESSAGES.VALIDATION_MIN_LENGTH, [fieldLabel, minLength])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_WITHIN_NUMERIC_RANGE:
                const rangeParams = this.getNumericRangeSettings(fieldKey)
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_WITHIN_NUMERIC_RANGE, [fieldLabel, rangeParams])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_WITHIN_NUMERIC_RANGE_TERSE:
                const terseRangeParams = this.getNumericRangeSettings(fieldKey)
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_WITHIN_NUMERIC_RANGE_TERSE, [fieldLabel, terseRangeParams])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_GREATER_THAN:
                const params = this.getIsGreaterThanSettings(fieldKey)
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_GREATER_THAN, [fieldLabel, params])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_LESS_THAN:
                const lessThanParams = this.getIsLessThanSettings(fieldKey)
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_LESS_THAN, [fieldLabel, lessThanParams])
            case this.VALIDATION_ERROR_TYPES.IS_NOT_VALID_NAME:
                return this.getMessage(this.MESSAGES.VALIDATION_IS_NOT_VALID_NAME, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.CONTAINS_LEADING_OR_TRAILING_WHITESPACE:
                return this.getMessage(this.MESSAGES.VALIDATION_CONTAINS_LEADING_OR_TRAILING_WHITESPACE, [fieldLabel])
            case this.VALIDATION_ERROR_TYPES.ONE_FIELD_IS_EMPTY:
                const isComparableParameters = this.getIsComparableSettings(fieldKey, validationResult.compareSequence)
                const otherFieldLabel = this.getFieldLabel(isComparableParameters.compareTo.substring(1))
                return this.getMessage(this.MESSAGES.VALIDATION_ONE_FIELD_IS_EMPTY, [fieldLabel, otherFieldLabel])
            case this.VALIDATION_ERROR_TYPES.DOES_NOT_COMPARE:
                const isComparableParams = this.getIsComparableSettings(fieldKey, validationResult.compareSequence)
                const comparedFieldLabel = this.getFieldLabel(isComparableParams.compareTo.substring(1))
                let operatorLabel = ''
                if (isComparableParams.isEqualTo)
                    operatorLabel = this.COMPARISON_OPERATOR_LABELS['isEqualTo']
                else if (isComparableParams.isGT)
                    operatorLabel = this.COMPARISON_OPERATOR_LABELS['isGT']
                else if (isComparableParams.isLT)
                    operatorLabel = this.COMPARISON_OPERATOR_LABELS['isLT']
                else if (isComparableParams.isGTE)
                    operatorLabel = this.COMPARISON_OPERATOR_LABELS['isGTE']
                else if (isComparableParams.isLTE)
                    operatorLabel = this.COMPARISON_OPERATOR_LABELS['isLTE']

                return this.getMessage(this.MESSAGES.VALIDATION_DOES_NOT_COMPARE, [fieldLabel, comparedFieldLabel, operatorLabel])
            default:
                console.error('Validator.generateErrorMessage() error: Invalid fieldErrorType')
        }
    }

    getFieldValue(fieldName) {
        const field = document.querySelector(`#${this.formId} #${fieldName}`)
        const formlessField = document.querySelector(`#${fieldName}`)
        if (field !== null) {
            //console.log('Validator.getFieldValue::fieldName', fieldName, '::field.value', field.value)
            return field.value
        } else if (formlessField !== null) {
            return formlessField.value
        } else {
            return null
        }
    }

    getFieldLabel(fieldName) {
        const label = document.querySelector(`#${this.formId} label[for="${fieldName}"]`)
        const formlessLabel = document.querySelector(`label[for="${fieldName}"]`)
        if (label !== null) {
            //console.log('Validator.getFieldLabel:fieldName', fieldName, '::selector', `#${this.formId} label[for="${fieldName}"]`)
            return label.innerText
        } else if (formlessLabel !== null) {
            return formlessLabel.innerText
        } else {
            return null
        }
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
                let prependHeader = null

                if (this.prependLabels !== null) {
                    const prependLabelEntry =  Object.entries(this.prependLabels).find(x => fieldValidationResult.key.startsWith(x[0]))
                    if (prependLabelEntry)
                        prependHeader = prependLabelEntry[1]
                }

                if (prependHeader !== null) {
                    if (!fieldValidationResult.errorMessage || fieldErrorType === 'REQUIRED')
                        return `<li><strong>${prependHeader} \u2014 </strong>${this.generateErrorMessage(fieldKey, fieldLabel, fieldErrorType, fieldValidationResult)}</li>`
                    else
                        return `<li><strong>${prependHeader} \u2014 </strong>${fieldValidationResult.errorMessage}</li>`
                } else {
                    if (!fieldValidationResult.errorMessage || fieldErrorType === 'REQUIRED')
                        return `<li>${this.generateErrorMessage(fieldKey, fieldLabel, fieldErrorType, fieldValidationResult)}</li>`
                    else
                        return `<li>${fieldValidationResult.errorMessage}</li>`
                }
            })

        console.log('Validator.showFormErrors()::listItems', listItems)

        if (listItems.length) {
            let distinctListItems = listItems.filter((c, index) => listItems.indexOf(c) === index)

            // Only display the first ten errors
            if (distinctListItems.length > 10) {
                const totalDistinctErrors = distinctListItems.length - 10
                distinctListItems = distinctListItems.slice(0, 9)
                distinctListItems.push(`<em>...plus ${totalDistinctErrors} other validation issues</em>`)
            }
            this.notification.showError(this.getMessage(this.MESSAGES.VALIDATION_LIST_PROMPT, [distinctListItems]))
        }
    }

    markInvalidField(fieldId) {
        $(fieldId).addClass('error')
    }

    unmarkInvalidField(fieldId) {
        $(fieldId).removeClass('error')
    }

    getMaxLengthSetting(fieldKey) {
        const maxLengthConstraint = this.constraints.fields[fieldKey].find(item => item.validator === this.validators.maxLength)
        return maxLengthConstraint.customParams.length
    }

    getMinLengthSetting(fieldKey) {
        const minLengthConstraint = this.constraints.fields[fieldKey].find(item => item.validator === this.validators.minLength)
        return minLengthConstraint.customParams.length
    }

    getNumericRangeSettings(fieldKey) {
        const isWithinNumericRangeConstraint = this.constraints.fields[fieldKey].find(item => item.validator === Validator.isWithinNumericRange)
        return isWithinNumericRangeConstraint.customParams
    }

    getIsGreaterThanSettings(fieldKey) {
        const isGreaterThanConstraint =  this.constraints.fields[fieldKey].find(item => item.validator === Validator.isGreaterThan)
        return isGreaterThanConstraint.customParams
    }

    getIsLessThanSettings(fieldKey) {
        const isLessThanConstraint =  this.constraints.fields[fieldKey].find(item => item.validator === Validator.isLessThan)
        return isLessThanConstraint.customParams
    }

    getIsComparableSettings(fieldKey, compareSequence) {
        const isComparableConstraint = this.constraints.fields[fieldKey].find(item => item.validator === Validator.isComparable && item.customParams.compareSequence === compareSequence)
        return isComparableConstraint.customParams
    }


    // Custom validators
    static isRequired(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const toggleEnabledState = customParams.toggleEnabledState === undefined ? true : customParams.toggleEnabledState
        const isToggled = customParams.toggleId ?
            (toggleEnabledState && document.getElementById(customParams.toggleId).checked) || (!toggleEnabledState && !document.getElementById(customParams.toggleId).checked) :
            false
        const mustExist = typeof customParams.mustExist === 'boolean' ? customParams.mustExist : true
        const multiToggles = customParams.multiToggles && Array.isArray(customParams.multiToggles) ? customParams.multiToggles : null
        const skipIsRequired = typeof customParams.skipIsRequired === 'boolean' ? customParams.skipIsRequired : false
        const checkIsHidden = customParams.checkIsHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsHidden).style.visibiility === 'hidden'
                    )
                )
        const checkIsSectionHidden = customParams.checkIsSectionHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsSectionHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsSectionHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsSectionHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsSectionHidden).style.visibiility === 'hidden'
                    )
                )

        if (skipIsRequired || checkIsHidden || checkIsSectionHidden) {
            validationResult.succeeded = true

        } else if (!mustExist && value === null) {
            validationResult.succeeded = true

        } else if (!multiToggles) {
            if (!customParams.toggleId || (customParams.toggleId && isToggled)) {
                validationResult.succeeded = value !== ''
            } else if (customParams.toggleId && !isToggled) {
                validationResult.succeeded = true
            } else {
                console.log('Validator.isRequired() error')
            }

        } else if (multiToggles) {
            let passesAllToggleConditions = true
            multiToggles.forEach(item => {
                const enabledState = item.toggleEnabledState === undefined ? true : item.toggleEnabledState
                const toggled = item.toggleId ?
                    (enabledState && document.getElementById(item.toggleId).checked) || (!enabledState && !document.getElementById(item.toggleId).checked) :
                    false

                if (passesAllToggleConditions && !toggled)
                    passesAllToggleConditions = false

            })
            if (!passesAllToggleConditions) {
                validationResult.succeeded = true
            } else if (passesAllToggleConditions && value !== '') {
                validationResult.succeeded = true
            } else {
                validationResult.succeeded = false
            }
        }

        if (customParams.terseMessage)
            validationResult.type = 'CUSTOM_REQUIRED_TERSE'
        else
            validationResult.type = 'CUSTOM_REQUIRED'

        validationResult.errorMessage = ''
        validationResult.skipBlurCheck = !!customParams.skipBlurCheck

        return validationResult
    }

    static isDropdownRequired(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()

        validationResult.succeeded = value !== '-1'
        validationResult.type = 'IS_NOT_DROPDOWN_REQUIRED'
        validationResult.errorMessage = ''

        return validationResult
    }

    static isNumeric(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const toggleEnabledState = customParams.toggleEnabledState === undefined ? true : customParams.toggleEnabledState
        const isToggled = customParams.toggleId ?
            (toggleEnabledState && document.getElementById(customParams.toggleId).checked) || (!toggleEnabledState && !document.getElementById(customParams.toggleId).checked) :
            false
        const mustExist = typeof customParams.mustExist === 'boolean' ? customParams.mustExist : true
        const multiToggles = customParams.multiToggles && Array.isArray(customParams.multiToggles) ? customParams.multiToggles : null
        const skipIsRequired = typeof customParams.skipIsRequired === 'boolean' ? customParams.skipIsRequired : false
        const checkIsHidden = customParams.checkIsHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsHidden).style.visibiility === 'hidden'
                    )
                )
        const checkIsSectionHidden = customParams.checkIsSectionHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsSectionHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsSectionHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsSectionHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsSectionHidden).style.visibiility === 'hidden'
                    )
                )

        if (skipIsRequired || checkIsHidden || checkIsSectionHidden) {
            validationResult.succeeded = true

        } else if (!mustExist && value === null) {
            validationResult.succeeded = true

        } else if (!multiToggles) {
            if (!customParams.toggleId || (customParams.toggleId && isToggled)) {
                validationResult.succeeded = !isNaN(value)
            } else if (customParams.toggleId && !isToggled) {
                validationResult.succeeded = true
            } else {
                console.log('Validator.isNumeric() error')
            }

        } else if (multiToggles) {
            let passesAllToggleConditions = true
            multiToggles.forEach(item => {
                const enabledState = item.toggleEnabledState === undefined ? true : item.toggleEnabledState
                const toggled = item.toggleId ?
                    (enabledState && document.getElementById(item.toggleId).checked) || (!enabledState && !document.getElementById(item.toggleId).checked) :
                    false

                if (passesAllToggleConditions && !toggled)
                    passesAllToggleConditions = false

            })
            if (!passesAllToggleConditions) {
                validationResult.succeeded = true
            } else if (passesAllToggleConditions && !isNaN(value)) {
                validationResult.succeeded = true
            } else {
                validationResult.succeeded = false
            }
        }

        validationResult.type = 'IS_NOT_NUMERIC'
        validationResult.errorMessage = ''
        validationResult.skipBlurCheck = !!customParams.skipBlurCheck

        return validationResult
    }

    static isInteger(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const toggleEnabledState = customParams.toggleEnabledState === undefined ? true : customParams.toggleEnabledState
        const isToggled = customParams.toggleId ?
            (toggleEnabledState && document.getElementById(customParams.toggleId).checked) ||
            (!toggleEnabledState && !document.getElementById(customParams.toggleId).checked)
            : false
        const mustExist = typeof customParams.mustExist === 'boolean' ? customParams.mustExist : true
        const multiToggles = customParams.multiToggles && Array.isArray(customParams.multiToggles) ? customParams.multiToggles : null
        const skipIsRequired = typeof customParams.skipIsRequired === 'boolean' ? customParams.skipIsRequired : false
        const checkIsHidden = customParams.checkIsHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsHidden).style.visibiility === 'hidden'
                    )
                )
        const checkIsSectionHidden = customParams.checkIsSectionHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsSectionHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsSectionHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsSectionHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsSectionHidden).style.visibiility === 'hidden'
                    )
                )

        if (skipIsRequired || checkIsHidden || checkIsSectionHidden) {
            validationResult.succeeded = true

        } else if (!mustExist && value === null) {
            validationResult.succeeded = true

        } else if (!multiToggles) {
            if (!customParams.toggleId || (customParams.toggleId && isToggled)) {
                validationResult.succeeded = Number.isInteger(Number(value))
            } else if (customParams.toggleId && !isToggled) {
                validationResult.succeeded = true
            } else {
                console.log('Validator.isInteger() error')
            }

        } else if (multiToggles) {
            let passesAllToggleConditions = true
            multiToggles.forEach(item => {
                const enabledState = item.toggleEnabledState === undefined ? true : item.toggleEnabledState
                const toggled = item.toggleId ?
                    (enabledState && document.getElementById(item.toggleId).checked) || (!enabledState && !document.getElementById(item.toggleId).checked) :
                    false

                if (passesAllToggleConditions && !toggled)
                    passesAllToggleConditions = false

            })
            if (!passesAllToggleConditions) {
                validationResult.succeeded = true
            } else if (passesAllToggleConditions && Number.isInteger(Number(value))) {
                validationResult.succeeded = true
            } else {
                validationResult.succeeded = false
            }
        }

        validationResult.type = 'IS_NOT_INTEGER'
        validationResult.errorMessage = ''
        validationResult.skipBlurCheck = !!customParams.skipBlurCheck

        return validationResult
    }

    static isComparable(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const operators = ['isEqualTo', 'isLT', 'isGT', 'isLTE', 'isGTE']
        const compareToNode = document.querySelector(customParams.compareTo)
        const canOneFieldBeEmpty = typeof customParams.canOneFieldBeEmpty === 'undefined' ? true : !!customParams.canOneFieldBeEmpty

        // If the input field to compare against doesn't even exist, then just no-op immediately
        if (compareToNode === null) {
            validationResult.succeeded = true
            validationResult.type = 'DOES_NOT_COMPARE'
            validationResult.errorMessage = ''
            validationResult.skipBlurCheck = !!customParams.skipBlurCheck
            validationResult.compareSequence = customParams.compareSequence
            return validationResult
        }

        // Set the relatedFields param so that the compareTo field can be revalidated.
        // We need to remove the error tooltip from compareTo if it's been fixed.
        //customParams.relatedFields = [customParams.compareTo.substring(1)]

        const compareTo = vm[customParams.compareTo.substring(1)]

        const toggleEnabledState = customParams.toggleEnabledState === undefined ? true : customParams.toggleEnabledState
        const isToggled = customParams.toggleId ?
            (toggleEnabledState && document.getElementById(customParams.toggleId).checked) ||
            (!toggleEnabledState && !document.getElementById(customParams.toggleId).checked)
            : false

        const mustExist = typeof customParams.mustExist === 'boolean' ? customParams.mustExist : true
        const skipIsRequired = typeof customParams.skipIsRequired === 'boolean' ? customParams.skipIsRequired : false
        const checkIsHidden = customParams.checkIsHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsHidden).style.visibiility === 'hidden'
                    )
                )
        const checkIsSectionHidden = customParams.checkIsSectionHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsSectionHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsSectionHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsSectionHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsSectionHidden).style.visibiility === 'hidden'
                    )
                )
        const isOneFieldEmpty = (
            (value === '' || value === '0') && (compareTo !== '' && compareTo !== '0')
            ||
            (value !== '' && value !== '0') && (compareTo === '' || compareTo === '0')
        )

        let operatorLabel = ''

        operators.forEach(item => {
            operatorLabel = typeof customParams[item] === 'boolean' && customParams[item] ? item : operatorLabel
        })

        const oneFieldIsEmptyError = isOneFieldEmpty && !canOneFieldBeEmpty

        if (skipIsRequired || checkIsHidden || checkIsSectionHidden) {
            validationResult.succeeded = true

        } else if (customParams.toggleId && !isToggled) {
            validationResult.succeeded = true

        } else if (!mustExist && value === null) {
            validationResult.succeeded = true

        } else if (oneFieldIsEmptyError) {
            validationResult.succeeded = false

        } else if (value === '' || value === '0' || compareTo === '' || compareTo === '0' ) {
            validationResult.succeeded = true

        } else if (!customParams.toggleId || (customParams.toggleId && isToggled)) {
            if (operatorLabel === operators[0])
                validationResult.succeeded = Number(value) === Number(compareTo)
            else if (operatorLabel === operators[1])
                validationResult.succeeded = Number(value) < Number(compareTo)
            else if (operatorLabel === operators[2])
                validationResult.succeeded = Number(value) > Number(compareTo)
            else if (operatorLabel === operators[3])
                validationResult.succeeded = Number(value) <= Number(compareTo)
            else if (operatorLabel === operators[4])
                validationResult.succeeded = Number(value) >= Number(compareTo)

        } else {
            console.log('Validator.isComparable() error')
        }
        validationResult.type = oneFieldIsEmptyError ? 'ONE_FIELD_IS_EMPTY' : 'DOES_NOT_COMPARE'
        validationResult.errorMessage = ''
        validationResult.skipBlurCheck = !!customParams.skipBlurCheck
        validationResult.compareSequence = customParams.compareSequence

        return validationResult
    }

    static isBoolean(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        validationResult.succeeded = typeof value === "boolean" || value === "1" || value === "true" || value === true || value === "on"
        validationResult.type = 'IS_NOT_BOOLEAN'
        validationResult.errorMessage = ''

        return validationResult
    }

    static isBit(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        validationResult.succeeded = value === "1" || value === "0"
        validationResult.type = 'IS_NOT_BIT'
        validationResult.errorMessage = ''

        return validationResult
    }

    static isWithinNumericRange(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const toggleEnabledState = customParams.toggleEnabledState === undefined ? true : customParams.toggleEnabledState
        const isToggled = customParams.toggleId ?
            (toggleEnabledState && document.getElementById(customParams.toggleId).checked) || (!toggleEnabledState && !document.getElementById(customParams.toggleId).checked) :
            false
        const mustExist = typeof customParams.mustExist === 'boolean' ? customParams.mustExist : true
        const multiToggles = customParams.multiToggles && Array.isArray(customParams.multiToggles) ? customParams.multiToggles : null
        const skipIsRequired = typeof customParams.skipIsRequired === 'boolean' ? customParams.skipIsRequired : false
        const checkIsHidden = customParams.checkIsHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsHidden).style.visibiility === 'hidden'
                    )
                )
        const checkIsSectionHidden = customParams.checkIsSectionHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsSectionHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsSectionHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsSectionHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsSectionHidden).style.visibiility === 'hidden'
                    )
                )

        if (skipIsRequired || checkIsHidden || checkIsSectionHidden) {
            validationResult.succeeded = true

        } else if (!mustExist && value === null) {
            validationResult.succeeded = true

        } else if (!multiToggles) {
            if (!customParams.toggleId || (customParams.toggleId && isToggled)) {
                if (customParams.inclusiveFloor) {
                    if (customParams.inclusiveCeiling) {
                        validationResult.succeeded = (customParams.floor <= value && value <= customParams.ceiling) || (value === null || value === '')
                    } else {
                        validationResult.succeeded = (customParams.floor <= value && value < customParams.ceiling) || (value === null || value === '')
                    }
                } else {
                    if (customParams.inclusiveCeiling) {
                        validationResult.succeeded = (customParams.floor < value && value <= customParams.ceiling) || (value === null || value === '')
                    } else {
                        validationResult.succeeded = (customParams.floor < value && value < customParams.ceiling) || (value === null || value === '')
                    }
                }
            } else if (customParams.toggleId && !isToggled) {
                validationResult.succeeded = true
            } else {
                console.log('Validator.isWithinNumericRange() error')
            }

        } else if (multiToggles) {
            let passesAllToggleConditions = true
            multiToggles.forEach(item => {
                const enabledState = item.toggleEnabledState === undefined ? true : item.toggleEnabledState
                const toggled = item.toggleId ?
                    (enabledState && document.getElementById(item.toggleId).checked) || (!enabledState && !document.getElementById(item.toggleId).checked) :
                    false

                if (passesAllToggleConditions && !toggled)
                    passesAllToggleConditions = false

            })
            if (!passesAllToggleConditions) {
                validationResult.succeeded = true
            } else {
                if (customParams.inclusiveFloor) {
                    if (customParams.inclusiveCeiling) {
                        validationResult.succeeded = (customParams.floor <= value && value <= customParams.ceiling) || (value === null || value === '')
                    } else {
                        validationResult.succeeded = (customParams.floor <= value && value < customParams.ceiling) || (value === null || value === '')
                    }
                } else {
                    if (customParams.inclusiveCeiling) {
                        validationResult.succeeded = (customParams.floor < value && value <= customParams.ceiling) || (value === null || value === '')
                    } else {
                        validationResult.succeeded = (customParams.floor < value && value < customParams.ceiling) || (value === null || value === '')
                    }
                }
            }
        }

        if (customParams.terseMessage)
            validationResult.type = 'IS_NOT_WITHIN_NUMERIC_RANGE_TERSE'
        else
            validationResult.type = 'IS_NOT_WITHIN_NUMERIC_RANGE'

        validationResult.errorMessage = ''
        validationResult.skipBlurCheck = !!customParams.skipBlurCheck
        return validationResult
    }

    static isGreaterThan(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const skipIsRequired = typeof customParams.skipIsRequired === 'boolean' ? customParams.skipIsRequired : false
        const checkIsHidden = customParams.checkIsHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsHidden).style.visibiility === 'hidden'
                    )
                )
        const checkIsSectionHidden = customParams.checkIsSectionHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsSectionHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsSectionHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsSectionHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsSectionHidden).style.visibiility === 'hidden'
                    )
                )

        if (skipIsRequired || checkIsHidden || checkIsSectionHidden) {
            validationResult.succeeded = true

        } else if (customParams.inclusive)
            validationResult.succeeded = customParams.floor <= value || (value === null || value === '')
        else
            validationResult.succeeded = customParams.floor < value || (value === null || value === '')
        validationResult.type = 'IS_NOT_GREATER_THAN'
        validationResult.errorMessage = ''
        validationResult.skipBlurCheck = !!customParams.skipBlurCheck

        return validationResult
    }

    static isLessThan(value, vm, customParams) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const skipIsRequired = typeof customParams.skipIsRequired === 'boolean' ? customParams.skipIsRequired : false
        const checkIsHidden = customParams.checkIsHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsHidden).style.visibiility === 'hidden'
                    )
                )
        const checkIsSectionHidden = customParams.checkIsSectionHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsSectionHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsSectionHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsSectionHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsSectionHidden).style.visibiility === 'hidden'
                    )
                )

        if (skipIsRequired || checkIsHidden || checkIsSectionHidden) {
            validationResult.succeeded = true
        } else if (customParams.inclusive)
            validationResult.succeeded = customParams.ceiling >= value || (value === null || value === '')
        else
            validationResult.succeeded = customParams.ceiling > value || (value === null || value === '')
        validationResult.type = 'IS_NOT_LESS_THAN'
        validationResult.errorMessage = ''
        validationResult.skipBlurCheck = !!customParams.skipBlurCheck

        return validationResult
    }

    static isValidName(value, vm, customParams ) {
        const validationResult = new window['lc-form-validation'].FieldValidationResult()
        const regex = /[^a-z0-9'()._ -]/i
        const leadingOrTrailingWhitespaceRegex = /(^\s+)|(\s+$)/
        const skipIsRequired = typeof customParams.skipIsRequired === 'boolean' ? customParams.skipIsRequired : false
        const checkIsHidden = customParams.checkIsHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsHidden).style.visibiility === 'hidden'
                    )
                )
        const checkIsSectionHidden = customParams.checkIsSectionHidden === undefined ?
                false :
                (document.querySelector(customParams.checkIsSectionHidden) !== null &&
                    (
                        document.querySelector(customParams.checkIsSectionHidden).classList.contains('hidden') ||
                        document.querySelector(customParams.checkIsSectionHidden).style.display === 'none' ||
                        document.querySelector(customParams.checkIsSectionHidden).style.visibiility === 'hidden'
                    )
                )

        if (skipIsRequired || checkIsHidden || checkIsSectionHidden) {
            validationResult.succeeded = true
        } else if (leadingOrTrailingWhitespaceRegex.test(value)) {
            validationResult.succeeded = false
            validationResult.type = 'CONTAINS_LEADING_OR_TRAILING_WHITESPACE'
            validationResult.errorMessage = ''
        } else {
            validationResult.succeeded = !regex.test(value)
            validationResult.type = 'IS_NOT_VALID_NAME'
            validationResult.errorMessage = ''
        }
        validationResult.skipBlurCheck = !!customParams.skipBlurCheck

        return validationResult
    }

    getMessage(messageFunc, paramsArr) {
        return messageFunc.call(this.MESSAGES, ...paramsArr)
    }

    getMessageAsListItem(messageFunc, paramsArr) {
        return `<li>${this.getMessage(messageFunc, paramsArr)}</li>`
    }

    getMessageAsErrorTooltip(messageFunc, paramsArr) {
        return `<div class="error">${this.getMessage(messageFunc, paramsArr)}</div>`
    }

    addNonlinearCurveRules(curveType) {
        const unitFields = document.querySelectorAll('#nonlinearcurve-modal-form .nonlinear-unit')
        const valueFields = document.querySelectorAll('#nonlinearcurve-modal-form .nonlinear-value')

        if (curveType === 'gencost' || curveType === 'smrcost' || curveType === 'windcost') {
            Array.from(unitFields).map((item, i) => {
                if (i < unitFields.length) {
                    return [item.id, [
                        { validator: Validator.isRequired, customParams: { terseMessage: true } },
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1 + i, ceiling: 31 - unitFields.length + i, inclusiveFloor: true, inclusiveCeiling: true, terseMessage: true } },
                        { validator: validator.customConstraints.nonlinearCurveSequentialUnits, customParams: { columnIndex: i } }
                    ]]
                } else {
                    return [item.id, []]
                }
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            });

            Array.from(valueFields).map((item, i) => {
                return [item.id, [
                    { validator: Validator.isRequired, customParams: {terseMessage: true } },
                    { validator: Validator.isInteger },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 999999999, inclusiveFloor: false, inclusiveCeiling: true, terseMessage: true } },
                ]]
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })

        } else if (curveType === 'geneff') {
            Array.from(valueFields).map((item, i) => {
            return [item.id, [
                { validator: Validator.isNumeric },
                { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: true, inclusiveCeiling: true, terseMessage: true } },
                { validator: validator.customConstraints.efficiencyCurveFieldHtpRatio,
                    customParams: {
                        container: `#nonlinear-curve-row2-${i}-group`,
                        fieldId: item.id
                    }
                },
                { validator: validator.customConstraints.efficiencyCurveFieldRecoveryCurveField,
                    customParams: {
                        container: `#nonlinear-curve-row2-${i}-group`,
                        fieldId: item.id,
                        columnIndex: i
                    }
                }
            ]]
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })

        } else if (curveType === 'runofriverhydrocost') {
            Array.from(unitFields).map((item, i) => {
                if (i < unitFields.length) {
                    return [item.id, [
                        { validator: Validator.isRequired, customParams: { terseMessage: true } },
                        { validator: Validator.isInteger },
                        { validator: Validator.isGreaterThan, customParams: { floor: 1 + i, inclusive: true, terseMessage: true } },
                        { validator: validator.customConstraints.nonlinearCurveSequentialUnits, customParams: { columnIndex: i } }
                    ]]
                } else {
                    return [item.id, []]
                }
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            });
            Array.from(valueFields).map((item, i) => {
                return [item.id, [
                    { validator: Validator.isRequired, customParams: { terseMessage: true } },
                    { validator: Validator.isInteger },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 999999999, inclusiveFloor: false, inclusiveCeiling: true, terseMessage: true } },
                ]]
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })
    
        } else if (curveType === 'gentemp' ||
                curveType === 'besstemp' ||
                curveType === 'airsourceheatpumptempheating' ||
                curveType === 'airsourceheatpumptempcooling' ||
                curveType === 'chillertemp' ||
                curveType === 'abschillertemp' ||
                curveType === 'groundheatpumptempheating' ||
                curveType === 'groundheatpumptempcooling' ||
                curveType === 'refrigtemp' ||
                curveType === 'absfridgetemp') {
            Array.from(valueFields).map((item, i) => {
                return [item.id, [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange,
                        customParams: {
                            floor: 0,
                            ceiling: 200,
                            inclusiveFloor: true,
                            inclusiveCeiling: true
                        }
                    }
                ]]
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })

        } else if (curveType === 'genhtp') {
            Array.from(valueFields).map((item, i) => {
                return [item.id, [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange,
                        customParams: {
                            floor: 0,
                            ceiling: 100,
                            inclusiveFloor: true,
                            inclusiveCeiling: true
                        }
                    },
                    { validator: validator.customConstraints.recoveryCurveFieldEfficiencyFlatFieldOrCurveFields,
                        customParams: {
                            container: `#nonlinear-curve-row2-${i}-group`,
                            fieldId: item.id,
                            columnIndex: i
                        }
                    }
                ]]
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })

        // SMR HTP Ratio curve validation is similar to GEN HTP Ratio, except SMR doesn't have an efficiency field / curve,
        // so exclude the custom `recoveryCurveFieldEfficiencyFlatFieldOrCurveFields` validator
        } else if (curveType === 'smrhtp') {
            Array.from(valueFields).map((item, i) => {
                return [item.id, [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange,
                        customParams: {
                            floor: 0,
                            ceiling: 100,
                            inclusiveFloor: true,
                            inclusiveCeiling: true
                        }
                    }
                ]]
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })



        } else if (curveType.startsWith('inveff')) {
            Array.from(unitFields).map((item, i) => {
                if (i === 0 || i === unitFields.length - 1) {
                    return [item.id, []]
                } else {
                    return [item.id, [
                        { validator: Validator.isRequired, customParams: { terseMessage: true } },
                        { validator: Validator.isInteger },
                        { validator: Validator.isWithinNumericRange, customParams: { floor: 1 + i, ceiling: 100 - unitFields.length + i, inclusiveFloor: true, inclusiveCeiling: true, terseMessage: true } },
                        { validator: validator.customConstraints.nonlinearCurveSequentialUnits, customParams: { columnIndex: i } }
                    ]]
                }
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            });

            Array.from(valueFields).map((item, i) => {
                if (i === 0) {
                    return [item.id, []]
                } else {
                    return [item.id, [
                    { validator: Validator.isRequired, customParams: {terseMessage: true } },
                    { validator: Validator.isInteger },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 100, inclusiveFloor: false, inclusiveCeiling: true, terseMessage: true } },
                    ]]
                }
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })

        } else if (curveType === 'solarpvcost' || curveType === 'solarthermalcost' || curveType === 'besscost' || curveType === 'boilercost' || curveType === 'electrolyzercost' || curveType === 'methanizercost' || curveType === 'hydrogenstoragecost' || curveType === 'heatercost' || curveType === 'heatstoragecost' || curveType === 'coldstoragecost' || curveType === 'chillercost' || curveType === 'refrigcost' || curveType === 'absfridgecost' || curveType === 'abschillercost' || curveType === 'groundheatpumpcost' || curveType === 'airsourceheatpump') {
            Array.from(unitFields).map((item, i) => {
                if (i < unitFields.length) {
                    return [item.id, [
                    { validator: Validator.isRequired, customParams: { terseMessage: true } },
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 1 + i, ceiling: 1000000, inclusiveFloor: true, inclusiveCeiling: true, terseMessage: true } },
                    { validator: validator.customConstraints.nonlinearCurveSequentialUnits, customParams: { columnIndex: i } }
                    ]]
                } else {
                    return [item.id, []]
                }
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            });
            Array.from(valueFields).map((item, i) => {
                return [item.id, [
                    { validator: Validator.isRequired, customParams: { terseMessage: true } },
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange, customParams: { floor: 0, ceiling: 999999999, inclusiveFloor: false, inclusiveCeiling: true, terseMessage: true } },
                ]]
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })
        } else if (curveType === 'chillercop' || curveType === 'abschillercop' || curveType === 'refrigcop' || curveType === 'absfridgecop' || curveType === 'groundheatpumpcopcooling' || curveType === 'groundheatpumpcopheating' || curveType === 'airsourceheatpumpheating' || curveType === 'airsourceheatpumpcooling') {
            Array.from(valueFields).map((item, i) => {
                return [item.id, [
                    { validator: Validator.isNumeric },
                    { validator: Validator.isWithinNumericRange,
                    customParams: {
                        floor: 0,
                        ceiling: 20,
                        inclusiveFloor: true,
                        inclusiveCeiling: true
                    }
                    }
                ]]
            }).forEach(entry => {
                validator.constraints.fields[entry[0]] = entry[1]
            })
        }

        console.log('validator.constraints.fields', validator.constraints.fields)

        // Add "containers" selectors to help control tooltip placement
        Object.keys(validator.constraints.fields).forEach(key => {
            validator.constraints.containers[key] = `#${key}-group`
        })
        validator.initialize()

    }

    deleteNonlinearCurveRules() {
        // Remove existing variable rules
        const unitFields = document.getElementsByClassName('nonlinear-unit')
        const valueFields = document.getElementsByClassName('nonlinear-value')

        Array.from(unitFields).forEach(item => {
            delete validator.constraints.fields[item.id]
        })
        Array.from(valueFields).forEach(item => {
            delete validator.constraints.fields[item.id]
        })
    }

    getMaxCurveValueFromField(fieldId) {
        const pairs = document.querySelector(fieldId).value.split('*')
        return Math.max.apply(Math, pairs.map(pair => pair.split('#')[1]))
    }

    getMaxCurveValueFromForm() {
        const values = Array.from(document.querySelectorAll('#nonlinearcurve-modal-form .nonlinear-value')).map(x => x.value === '' ? 0 : Number(x.value));
        return Math.max(...values)
    }

    checkIfArrayIsUnique(myArray) {
        return myArray.length === new Set(myArray).size;
    }

    // Error types
    VALIDATION_ERROR_TYPES = {
        REQUIRED: 'REQUIRED',
        CUSTOM_REQUIRED: 'CUSTOM_REQUIRED',
        CUSTOM_REQUIRED_TERSE: 'CUSTOM_REQUIRED_TERSE',
        IS_NOT_DROPDOWN_REQUIRED: 'IS_NOT_DROPDOWN_REQUIRED',
        MAX_LENGTH: 'MAX_LENGTH',
        MIN_LENGTH: 'MIN_LENGTH',
        IS_NOT_NUMERIC: 'IS_NOT_NUMERIC',
        IS_NOT_INTEGER: 'IS_NOT_INTEGER',
        IS_NOT_AGE: 'IS_NOT_AGE',
        IS_NOT_BIT: 'IS_NOT_BIT',
        IS_NOT_BOOLEAN: 'IS_NOT_BOOLEAN',
        IS_NOT_WITHIN_NUMERIC_RANGE: 'IS_NOT_WITHIN_NUMERIC_RANGE',
        IS_NOT_WITHIN_NUMERIC_RANGE_TERSE: 'IS_NOT_WITHIN_NUMERIC_RANGE_TERSE',
        IS_NOT_GREATER_THAN: 'IS_NOT_GREATER_THAN',
        IS_NOT_LESS_THAN: 'IS_NOT_LESS_THAN',
        IS_NOT_VALID_NAME: 'IS_NOT_VALID_NAME',
        CONTAINS_LEADING_OR_TRAILING_WHITESPACE: 'CONTAINS_LEADING_OR_TRAILING_WHITESPACE',
        DOES_NOT_COMPARE: 'DOES_NOT_COMPARE',
        ONE_FIELD_IS_EMPTY: 'ONE_FIELD_IS_EMPTY'
    }

    COMPARISON_OPERATOR_LABELS = {
        isEqualTo: 'equal to',
        isLT: 'less than',
        isGT: 'greater than',
        isLTE: 'less than or equal to',
        isGTE: 'greater than or equal to'
    }

    DEFAULTS = {
        MAX_SIZE: 1000000,
        MAX_EV_CHARGER_SIZE: 9999,
        MAX_NEW_SIZE_LABEL: 'Max New Size',
        MAX_COST_EXCLUSIVE: 1000000000
    }

    MESSAGES = {
        VALIDATION_REQUIRED: fieldLabel => `<strong>${fieldLabel}</strong> is a required field.`,
        VALIDATION_CUSTOM_REQUIRED: fieldLabel => `<strong>${fieldLabel}</strong> is a required field.`,
        VALIDATION_CUSTOM_REQUIRED_TERSE: fieldLabel => `<strong>${fieldLabel}</strong> is required.`,
        IS_UNIQUE_NAME: name => `Sorry, the name <strong>${name}</strong> is already used in this project. Please try a different name.`,
        IS_UNIQUE_INVERTER_NAME: `The Inverter Model names on this form must be unique.`,
        IS_MODELING_VALID: `When modeling <strong>Existing</strong>, <strong>Existing + More</strong>, <strong>Forced</strong> or <strong>Forced + More you</strong> can only define <strong>one</strong> Inverter.`,

        VALIDATION_IS_NOT_DROPDOWN_REQUIRED: fieldLabel => `<strong>${fieldLabel}</strong> is a required field.`,
        VALIDATION_IS_NOT_NUMERIC: fieldLabel => `<strong>${fieldLabel}</strong> must be a valid number.`,
        VALIDATION_IS_NOT_INTEGER: fieldLabel => `<strong>${fieldLabel}</strong> must be a whole number.`,
        VALIDATION_IS_NOT_BOOLEAN: fieldLabel => `<strong>${fieldLabel}</strong> must be a boolean value.`,
        VALIDATION_IS_NOT_AGE: 'For an existing <strong>Lifetime</strong>, <strong>Age</strong> is required and must be greater than 0 and less than the value of <strong>Lifetime</strong>.',
        VALIDATION_IS_NOT_BIT: fieldLabel => `<strong>${fieldLabel}</strong> must be "on" or "off".`,
        VALIDATION_MAX_LENGTH: (fieldLabel, maxLength) => `<strong>${fieldLabel}</strong> must be no longer than ${maxLength} characters in length.`,
        VALIDATION_MIN_LENGTH: (fieldLabel, minLength) => `<strong>${fieldLabel}</strong> must be at least ${minLength} characters in length.`,
        VALIDATION_IS_NOT_WITHIN_NUMERIC_RANGE: (fieldLabel, rangeParams) =>
            `<strong>${fieldLabel}</strong> must be a number greater than ${rangeParams.inclusiveFloor ? 'or equal to' : ''} ${rangeParams.floor} and less than ${rangeParams.inclusiveCeiling ? 'or equal to' : ''} ${rangeParams.ceiling}.`,
        VALIDATION_IS_NOT_WITHIN_NUMERIC_RANGE_TERSE: (fieldLabel, rangeParams) =>
            `<strong>${fieldLabel}</strong> must be >${rangeParams.inclusiveFloor ? '=' : ''} ${rangeParams.floor} and <${rangeParams.inclusiveCeiling ? '=' : ''} ${rangeParams.ceiling}.`,
        VALIDATION_IS_NOT_GREATER_THAN: (fieldLabel, params) =>
            `<strong>${fieldLabel}</strong> must be a number greater than ${params.inclusive ? 'or equal to' : ''} ${params.floor}.`,
        VALIDATION_IS_NOT_LESS_THAN: (fieldLabel, params) =>
            `<strong>${fieldLabel}</strong> must be a number less than ${params.inclusive ? 'or equal to' : ''} ${params.ceiling}.`,
        VALIDATION_LIST_PROMPT: listItems => `
            <p style="display: block; width: 500px;"><strong>Please fix the following issues:</strong></p>
            <ul>${listItems.join("\n")}</ul>
        `,
        DIRTY_FORM_CONFIRM: 'There are unsaved changes. Are you sure you want to leave?',
        GET_NAME_AVAILABILITY_FAILURE: proposedName => `Sorry, the name <strong>${proposedName}</strong> already exists in the catalog. Please try again.`,
        GENERIC_SERVER_ERROR: 'Sorry, a server error has occurred.',
        VALIDATION_IS_NOT_VALID_NAME: fieldLabel => `<strong>${fieldLabel}</strong> contains illegal characters. Please restrict the input to letters, numbers, periods, dashes, apostrophes and parentheses.`,
        VALIDATION_CONTAINS_LEADING_OR_TRAILING_WHITESPACE: fieldLabel => `<strong>${fieldLabel}</strong> may not contain any leading or traiing whitespace characters. Please remove them before continuing.`,
        VALIDATION_DOES_NOT_COMPARE: (fieldLabel, comparedFieldLabel, operatorLabel) => `
            <strong>${fieldLabel}</strong> must be ${operatorLabel} <strong>${comparedFieldLabel}</strong>.
        `,
        VALIDATION_ONE_FIELD_IS_EMPTY: (fieldLabel, comparedFieldLabel) => `
            Both <strong>${fieldLabel}</strong> and <strong>${comparedFieldLabel}</strong> must have values, or both must be empty.
        `,

        // NOTE: Put all generic, cross-technology messages here
        COMMON: {
            VALIDATE_LIFETIME_AGE: '<strong>Existing Age</strong> must be less than the <strong>Lifetime</strong>.',
            VALIDATE_SIZE: (fieldName, size) => `The <strong>${fieldName}</strong> is required and must be a non-negative number less than ${!!size ? size : this.DEFAULTS.MAX_SIZE}.`,
            VALIDATE_MAX_NEW_SIZE: (fieldName, size) => `The <strong>${!!fieldName ? fieldName : this.DEFAULTS.MAX_NEW_SIZE_LABEL}</strong>, if provided, must be a non-negative whole number less than ${!!size ? size : this.DEFAULTS.MAX_SIZE}.`,
            VALIDATE_MAX_SIZE_FORCED_INVEST: (fieldName) => `The <strong>${!!fieldName ? fieldName : this.DEFAULTS.MAX_NEW_SIZE_LABEL}</strong>, if provided, must be greater than the forced size.`
        },

        //
        // Custom-constraint messages
        //

        // BESS storage
        VALIDATE_ANCILLARY_SERVICES_SPINNING_RESERVE_PRICE: 'Because you have set <strong>Ancillary Services</strong> to "yes," you must provide a <strong>Spinning Reserve Price</strong> greater than or equal to 0.',
        VALIDATE_ANCILLARY_SERVICES_NON_SPINNING_RESERVE_PRICE: 'Because you have set <strong>Ancillary Services</strong> to "yes," you must provide a <strong>Non-Spinning Reserve Price</strong> greater than or equal to 0.',
        VALIDATE_AGE: '<strong>Existing Age</strong> is required and must be a whole number greater than or equal to 0 and less than or equal to 100.',
        VALIDATE_LIFETIME_AGE: '<strong>Existing Age</strong> must be less than the <strong>System Lifetime</strong>.',
        VALIDATE_MAX_SOC_MIN_SOC: '<strong>Max S.O.C.</strong> must be greater than or equal to <strong>Min S.O.C.</strong>.',
        VALIDATE_MAX_MIN_FLOWRATE: '<strong>Max Flow Rate</strong> must be greater than or equal to <strong>Min Flow Rate</strong>.',
        RESERVE_SOC_EMERGENCY_MIN_SOC: 'If <strong>Reserve S.O.C.</strong> is greater than 0, <strong>Emergency Min. S.O.C.</strong> must be less than or equal to <strong>Reserve S.O.C.</strong>.',
        EMERGENCY_SOC_MAX_STATE_CHANGE: '<strong>Emergency Min. S.O.C.</strong> must be less than the <strong>Max S.O.C.</strong>.',
        RESERVE_SOC_MAX_STATE_CHANGE: '<strong>Reserve S.O.C.</strong> must be less than the <strong>Max S.O.C.</strong>.',
        VALIDATE_MAX_MIN_CYCLES: '<strong>Max # of Cycles per Year</strong>, if specified, must be greater than or equal to <strong>Min # of Cycles per Year</strong>.',

        // Hydrogen Storage
        VALIDATION_MAX_MIN_CAPACITY: '<strong>Maximum Stored Capacity</strong>, if provided, must be greater than or equal to <strong>Minimum Stored Capacity</strong>.',

        // Wind Turbine
        VALIDATE_MAX_NEW_SIZE_TURBINES: (fieldName, maxTurbines) => `The <strong>${fieldName}</strong>, if provided, must be a positive whole number less than or equal to ${maxTurbines}.`,
        VALIDATE_NUMBER_OF_TURBINES: (fieldName, maxTurbines) => `The <strong>${fieldName}</strong> is required and must be a non-negative whole number less than or equal to ${maxTurbines}.`,
        VALIDATE_TURBINES_FORCED_INVEST: 'The <strong>Max Number of New Turbines</strong>, if provided, must be greater than the <strong>Number of Turbines</strong>.',

        // EV
        AVAILABLE_ENERGY_SUFFICIENT: (evFleetTotalDemand, totalAvailableEnergy) => `The Fleet Daily Charging Energy (<strong>${numeral(evFleetTotalDemand).format('0,0')} kWh</strong>) must be less than or equal to the total available charging energy (<strong>${numeral(totalAvailableEnergy).format('0,0')} kWh</strong>).`,
        PEAK_DEMAND_SUFFICIENT: (peakEvDemand, totalChargingCapacity) => `The peak EV Demand (<strong>${numeral(peakEvDemand).format('0,0.[00]')} kW</strong>) exceeds the available charging capacity (<strong>${numeral(totalChargingCapacity).format('0,0.[00]')} kW</strong>).`,

        // EV Charger
        VALIDATE_EV_CHARGER_SIZE: (fieldName) => `The <strong>${fieldName}</strong> is required and must be a non-negative number less than ${this.DEFAULTS.MAX_EV_CHARGER_SIZE}.`,
        VALIDATE_MAX_EV_CHARGER_NEW_SIZE: `The <strong>Max Number</strong>, if provided, must be a non-negative whole number less than ${this.DEFAULTS.MAX_EV_CHARGER_SIZE}.`,

        // Generator
        VALIDATE_NUMBER_OF_GENERATORS: (fieldName, maxGenerators) => `The <strong>${fieldName}</strong> is required and must be a non-negative whole number less than or equal to ${maxGenerators}.`,
        VALIDATE_MAX_NEW_SIZE_GENERATORS: maxGenerators => `The <strong>Max Number of New Generators</strong>, if provided, must be a positive whole number less than or equal to ${maxGenerators}.`,
        VALIDATE_MAX_SIZE_FORCED_INVEST_GENERATORS: 'The <strong>Max Number of New Generators</strong>, if provided, must be greater than the <strong>Min. Number of New Generators</strong>.',
        SPRINT_CAP_GT_RATING: 'You have specified a non-zero value for <strong>Sprint Hours</strong>, but your <strong>Sprint Rating</strong> is invalid. <strong>Sprint Rating</strong> must be greater than or equal to the <strong>Capacity Rating</strong>.',
        MAX_HOURS_GT_MIN_HOURS: 'The <strong>Min Annual Hours</strong> must be less than or equal to the <strong>Max Annual Hours</strong>.',
        NONLINEAR_CURVE_SEQUENTIAL_UNITS: (columnIndex) => `<strong>Units (Column ${columnIndex})</strong> must be > <strong>Units (Column ${columnIndex - 1})</strong>.`,
        NONLINEAR_CURVE_SEQUENTIAL_CAPACITY: (columnIndex) => `<strong>Capacity (Column ${columnIndex})</strong> must be > <strong>Capacity (Column ${columnIndex - 1})</strong>.`,
        EFFICIENCY_FLAT_FIELD_HTP_RATIO_FLAT_FIELD: (upperEfficiencyBoundNumber, heatToPowerRatioNumber) => `Either <strong>Nameplate Efficiency</strong> or <strong>Heat to Power Ratio</strong> must be reduced. With a <strong>Heat to Power Ratio</strong> of ${heatToPowerRatioNumber}, <strong>Nameplate Efficiency</strong> must be less than or equal to ${upperEfficiencyBoundNumber}, i.e. <i>1 / (HTP Ratio + 1)</i>`,
        EFFICIENCY_FLAT_FIELD_HTP_RATIO_CURVE_FIELDS: (upperEfficiencyBoundNumber, maxHeatToPowerValueNumber) => `With a peak <strong>HTP Ratio</strong> in the heat recovery curve of ${maxHeatToPowerValueNumber}, the <strong>Nameplate Efficiency</strong> must be less than or equal to ${upperEfficiencyBoundNumber}, i.e. <i>1 / (HTP Ratio + 1)</i>`,
        EFFICIENCY_CURVE_FIELD_HTP_RATIO: (fieldLabel, upperEfficiencyBoundNumber, heatToPowerRatioNumber) => `With a <strong>Heat to Power Ratio</strong> of ${heatToPowerRatioNumber}, <strong>${fieldLabel}</strong> must be less than or equal to ${upperEfficiencyBoundNumber}, i.e. <i>1 / (HTP Ratio + 1)</i>`,
        HTP_RATIO_EFFICIENCY_FLAT_FIELD: (upperHtpBoundNumber, nameplateEfficiencyNumber) => `Either <strong>Nameplate Efficiency</strong> or <strong>Heat to Power Ratio</strong> must be reduced. With a <strong>Nameplate Efficiency</strong> of ${nameplateEfficiencyNumber}, <strong>Heat to Power Ratio</strong> must be less than ${upperHtpBoundNumber}, i.e. <i>(1 / Efficiency) - 1</i>`,
        HTP_RATIO_EFFICIENCY_CURVE_FIELDS: (upperHtpBoundNumber, maxEfficiencyValueNumber) => `With a peak <strong>Efficiency [%]</strong> in the loading efficiency curve of ${maxEfficiencyValueNumber}, the <strong>Heat to Power Ratio</strong> must be less than ${upperHtpBoundNumber}, i.e. <i>(1 / Efficiency) - 1</i>`,
        EFFICIENCY_CURVE_FIELD_RECOVERY_CURVE_FIELD: (fieldLabel, recoveryCurveValue, upperEfficiencyBoundNumber) => `<strong>${fieldLabel}</strong> may not exceed ${upperEfficiencyBoundNumber} due to the value of the heat recovery curve at the same loading, <strong>${recoveryCurveValue}</strong>, i.e. <i>1 / (HTP Ratio + 1)</i>`,
        RECOVERY_CURVE_FIELD_EFFICIENCY_FLAT_FIELD: (fieldLabel, upperHtpBoundNumber, efficiencyValueNumber) => `With a <strong>Nameplate Efficiency</strong> of ${efficiencyValueNumber}, <strong>${fieldLabel}</strong> must be less than ${upperHtpBoundNumber}, i.e. <i>(1 / Efficiency) - 1</i>`,
        RECOVERY_CURVE_FIELD_EFFICIENCY_CURVE_FIELD: (fieldLabel, efficiencyCurveValue, upperHtpBoundNumber) => `<strong>${fieldLabel}</strong> may not exceed ${upperHtpBoundNumber} due to the value of the efficiency curve at the same loading, <strong>${efficiencyCurveValue}%</strong>, i.e. <i>(1 / Efficiency) - 1</i>`,

        // Run Optimization
        VALIDATE_COST_FACTOR: '<strong>Premium Cost Factor</strong> must be a number greater than 0 and less than 1000.',
        VALIDATE_BASELINE_COST: '<strong>Baseline Cost</strong> is required and must be a number greater than or equal to zero and less than 1,000,000,000.',
        VALIDATE_BASELINE_CO2: '<strong>Baseline Emissions</strong> is required and must be a number greater than or equal to zero and less than 1,000,000,000.',
        VALIDATE_REDUCE_COST_REDUCE_CO2: 'You must choose <strong>Reduce Cost</strong> or <strong>Reduce CO<sub>2</sub></strong> or <strong>Multi-Objective Optimization</strong>.',
        VALIDATE_MO_COST_RELAXATION: 'When <strong>Multi-Objective Optimization</strong> is set to "yes", you must enter a whole number value for <strong>Cost Relaxation Factor</strong> that is greater than or equal to 0 and less than 100,000.',
        VALIDATE_MO_PAYBACK_RELAXATION: 'When <strong>Multi-Objective Optimization</strong> is set to "yes", you must enter a whole number value for <strong>Payback Period Relaxation</strong> that is greater than or equal to 0 and less than 100,000.',
        VALIDATE_SA_RANGE_REQUIRED: 'The sensitivity analysis range values are required.',
        VALIDATE_SA_RANGE_LOWER_BOUND_INVALID: 'The sensitivity analysis lower range value must be greater than or equal to zero and less than or equal to the upper bound.',
        VALIDATE_SA_RANGE_UPPER_BOUND_INVALID: 'The sensitivity analysis upper range value must be greater than or equal to zero.',

        // Outages
        OUTAGE_START_DATE_END_DATE: '<strong>Outage End Date</strong> must occur after <strong>Outage Start Date</strong>.',
        DEMAND_LEVEL_SOLAR_LEVEL_WIND_LEVEL: '<strong>Demand Level</strong>, <strong>Solar Level</strong> and <strong>Wind Level</strong> are required, and each must be a whole number between 0 and 200.',
        CURTAILMENT_COSTS_REQUIRED: '<strong>Curtailment Costs</strong> is required when defining load curtailment behavior.',
        CURTAILMENT_COSTS_NUMERIC: '<strong>Curtailment Costs</strong> must be greater than or equal to 0 and less than or equal to 500.',
        PERCENT_LOAD_REQUIRED: 'The <strong>% of Load in Level</strong> is required when defining load curtailment behavior.',
        PERCENT_LOAD_RANGE: 'The <strong>% of Load in Level</strong> must be greater than 0 and less than or equal to 100.',
        TOTAL_PERCENTAGE_VALUE_CEILING: 'The total of all <strong>% of Load in Level</strong> values cannot exceed 100%.',

        // Financing
        LOAN_LENGTH_PROJECT_LENGTH: 'The <strong>Loan Length</strong> must be less than or equal to the <strong>Project Length</strong>.',
        MIN_PERCENTAGE_MAX_PERCENTAGE: `<strong>Percentage Financed \u2014 Maximum Percentage</strong> must be greater than or equal to <strong>Percentage Financed \u2014 Minimum Percentage</strong>.`,
        PERCENTAGE_FINANCED: '<strong>Percentage Financed</strong> must be a whole number greater than or equal to 0 and less than or equal to 100.',
        DEBT_SERVICE_COVERAGE_RATIO: '<strong>Debt Service Coverage Ratio</strong> must be greater than or equal to 0 and less than or equal to 10.',
        ALTERNATE_ELECTRIC_SALES_PRICE: '<strong>Alternate Electricity Sales Price</strong> ',

        // Load
        AGE_LIFETIME: 'The <strong>Age</strong> of the infrastructure must be less than the <strong>Lifetime</strong>.',

        // Market
        VALIDATE_SPINNING_MIN_MAX_BID: '<strong>Maximum Bid</strong> must be greater than or equal to <strong>Minimum Bid</strong>.',
    }
}