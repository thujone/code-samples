 /****************************************************************************
 ** As-you-type number formatting using the AutoNumeric library
 **
 ** @license
 ** Copyright (c) 2022 Xendee Corporation. All rights reserved.
 ***************************************************************************/
export default class NumberFormatter {
    constructor(formId, fields) {
        this.formId = formId;
        this.fields = fields;

        // Every field in this form will be an autoNumeric instance
        this.autoNumericInstances = {};
    }

    static commonFormatOptions = {
          decimalCharacter: '.',
          digitGroupSeparator: ',',
          negativePositiveSignPlacement: null,
          isCancellable: false,                  // Unbind the 'esc' key undoing the latest field change,
          onInvalidPaste: 'error',
          watchExternalChanges: true,            // Automatically format field values that are changed programatically
          showOnlyNumbersOnFocus: false,         // Thousands separator added as you type
          selectOnFocus: false,
          selectNumberOnly: false
    };

    static textAlignments = {
        left: 'left',
        center: 'center',
        right: 'right'
    };

    static formats = {
        dynamicMoney: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 4,
            decimalPlacesRawValue: 4,
            dynamicDecimalPadding: true,
            allowDecimalPadding: false
        },
        decimalPlacesUpTo2: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 2,
            decimalPlacesRawValue: 2,
            allowDecimalPadding: false
        },
        decimalPlacesUpTo3: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 3,
            decimalPlacesRawValue: 3,
            allowDecimalPadding: false
        },
        decimalPlacesUpTo4: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 4,
            decimalPlacesRawValue: 4,
            allowDecimalPadding: false
        },
        decimalPlacesUpTo5: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 5,
            decimalPlacesRawValue: 5,
            allowDecimalPadding: false
        },
        decimalPlacesUpTo6: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 6,
            decimalPlacesRawValue: 6,
            allowDecimalPadding: false
        },
        decimalPlacesUpTo9: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 9,
            decimalPlacesRawValue: 9,
            allowDecimalPadding: false
        },
        technologyDecision: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 3,
            decimalPlacesRawValue: 3,
            allowDecimalPadding: false,
            centerAlign: true
        },
        technologyDecisionInteger: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 0,
            centerAlign: true
        },
        integer: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 0,
            decimalPlacesRawValue: 0
        },
        decimalPlacesExactly1: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 1,
            decimalPlacesRawValue: 1
        },
        decimalPlacesExactly2: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 2,
            decimalPlacesRawValue: 2
        },
        decimalPlacesExactly3: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 3,
            decimalPlacesRawValue: 3
        },
        decimalPlacesExactly4: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 4,
            decimalPlacesRawValue: 4
        },
        decimalPlacesExactly5: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 5,
            decimalPlacesRawValue: 5
        },
        decimalPlacesExactly6: {
            ...NumberFormatter.commonFormatOptions,
            decimalPlaces: 6,
            decimalPlacesRawValue: 6
        }
    };

    // Called from the technology's specific javascript file,
    // e.g., ~/js/optimization/number-formatting/wind-turbine-tech.js
    static initialize(formId, fields) {
        // Create a new NumberFormatter only if needed
        let numberFormatter = window.numberFormatters[formId];
        if (!numberFormatter) {
            numberFormatter = new NumberFormatter(formId, fields);

            // Set these variables in the global namespace so it can be accessed from anyhwere in the app
            window.numberFormatters[formId] = numberFormatter;
        }

        numberFormatter.applyAutoNumericToFields();
    }

    applyAutoNumericToFields() {

        // Apply AutoNumeric formatting to each field in the list
        Object.entries(this.fields).forEach(item => {

            const id = item[0];
            const options = item[1].format;
            const element = document.getElementById(id);
            if (!!element) {

                // Add a CSS rule to set this field's justification
                if (options['centerAlign']) {
                    this.setTextAlignment(element, NumberFormatter.textAlignments.center);
                } else {
                    this.setTextAlignment(element, NumberFormatter.textAlignments.right);
                }

                // Add dynamic option editing on the fly, after initialization and anytime a raw value has been changed
                ['autoNumeric:initialized', 'autoNumeric:rawValueModified'].forEach(customEvent => {
                    element.addEventListener(customEvent, (event) => {
                        console.log('NumberFormatter.applyAutoNumericToFields()  autoNumeric:formatted event: ', event);

                        if (typeof options['dynamicDecimalPadding'] !== 'undefined' && options['dynamicDecimalPadding']) {
                            const rawValueString = `${event.detail.newRawValue}`;
                            const existingOptions = event.detail.aNElement.options;
                            const mantissaString = rawValueString.split('.')[1];

                            if (rawValueString !== '' && existingOptions !== undefined) {

                                // While user is inputting data, make sure there is no decimal padding in the live input.
                                // 'allowDecimalPadding' overrides all the 'decimalPlaces*' settings, so we must change it first.
                                // This is what allows the padding for a float with one decimal place.
                                existingOptions['allowDecimalPadding'](true);

                                // If the raw value string does not contain a '.', then just show the whole number value of the field (there is no mantissa)
                                if (!rawValueString.includes('.')) {
                                    existingOptions.decimalPlacesShownOnBlur(0);

                                // Else split the string and examine the mantissa
                                } else {

                                    // If the mantissa is one or two chars long, then format to two decimal places
                                    if (mantissaString.length <= 2) {
                                        existingOptions.decimalPlacesShownOnBlur(2);

                                    // Else, format the decimal places to match the length of the mantissa
                                    } else {

                                        // It's possible that there's a setting that forces only two digits to be shown on focus.
                                        // If that's the case, then change the setting to allow for longer lengths.
                                        existingOptions.decimalPlacesShownOnFocus(mantissaString.length);
                                        existingOptions.decimalPlacesShownOnBlur(mantissaString.length);
                                    }
                                }
                            }
                        }
                    }, false);
                });

                // With listening in place, instantiate the new AutoNumeric field
                this.autoNumericInstances[id] = new AutoNumeric(`#${id}`, options);

                // Apply extra event listeners (onfocus and onblur) for dynamically-formatted fields
                // i.e., `NumberFormatter.formats.dynamicMoney`
                if (typeof options['dynamicDecimalPadding'] !== 'undefined' && options['dynamicDecimalPadding']) {

                    // Make sure decimal padding is turned off when entering the input field.
                    // We don't want trailing zeroes in the raw input.
                    element.addEventListener('focus', (event) => {
                        console.log(`NumberFormatter.applyAutoNumericToFields():  #${id} FOCUS`);
                        const aNElement = AutoNumeric.getAutoNumericElement(`#${id}`);

                        const rawValueOnFocusString = aNElement.rawValueOnFocus;
                        const mantissaString = rawValueOnFocusString.includes('.') ? rawValueOnFocusString.split('.')[1] : null;

                        if (mantissaString !== null && mantissaString.length === 1) {

                            // If the mantissa is 1 digit long, force it to show 2 digits.
                            aNElement.options['decimalPlacesShownOnFocus'](2);
                            aNElement.options['allowDecimalPadding'](true);

                        } else {

                            // Set to false to strip away any trailing zeroes from the raw value input
                            aNElement.options['allowDecimalPadding'](false);
                        }
                    });

                    // Make sure decimal padding is turned on when leaving the input field
                    element.addEventListener('blur', (event) => {
                        console.log(`NumberFormatter.applyAutoNumericToFields():  #${id} BLUR`);
                        const aNElement = AutoNumeric.getAutoNumericElement(`#${id}`);

                        // This MUST be set back to true, because 'allowDecimalPadding' overrides the 'decimalPlaces*' options if set to false
                        aNElement.options['allowDecimalPadding'](true);
                    });
                }

            } else {
                console.error(`NumberFormatter.applyAutoNumericToFields(): Skipped AutoNumeric field. Could not find field id '${item[0]}'`);
            }
        });

        // Set these variables in the global namespace so it can be accessed from anyhwere in the app
        window.numberFormatters[this.formId] = this;
        console.log(`NumberFormatter.applyAutoNumericToFields(): window.numberFormatters['${this.formId}']`, window.numberFormatters[this.formId]);
    }

    setTextAlignment(element, alignment) {
        element.style.textAlign = alignment;
    }

    getValue(fieldSelector) {
        if (AutoNumeric.isManagedByAutoNumeric(fieldSelector)) {
            const anValue = AutoNumeric.getNumericString(fieldSelector);
            console.log('NumberFormatter.getValue()  fieldSelector (managed): ', fieldSelector, ' ::value: ', anValue);
            return anValue;
        } else {
            const value = document.querySelector(fieldSelector)?.value ?? 0;
            console.log('NumberFormatter.getValue()  fieldSelector (unmanaged): ', fieldSelector, ' ::value: ', value);
            return value;
        }
    }
}
