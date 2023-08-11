/****************************************************************************
 ** Useful routines for the Xendee One-Line diagramming app.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import numeral from 'numeral'
import App from './app.js'
import constants from '../one-line/constants.js'

const utils = {
    addEventListenerByClass: (className, event, fn, opt = false) => {
        const list = document.getElementsByClassName(className)
        for (let i = 0, len = list.length; i < len; i++) {
            list[i].addEventListener(event, fn, opt)
        }
    },

    addEventListenerByTag: (tagName, event, fn) => {
        const list = document.getElementsByTagName(tagName)
        for (let i = 0, len = list.length; i < len; i++) {
            list[i].addEventListener(event, fn, false)
        }
    },


    addEvent: (element, type, handler) => {
        if (element.attachEvent)
            element.attachEvent('on' + type, handler)
        else
            element.addEventListener(type, handler)
    },

    removeEvent: (element, type, handler) => {
        if (element.detachEvent)
            element.detachEvent('on' + type, handler)
        else
            element.removeEventListener(type, handler)
    },

    // Similar to jQuery's .on()
    // NOTE: recent versions of ES literally have .off() and .on(), so look there first
    delegateEvent: (selector, eventType, handler, context) => {
        document.querySelector(context).addEventListener(eventType, (event) => {
            const listeningTarget = event.target.closest(selector)
            if (listeningTarget) 
                handler.call(listeningTarget, event)
            else
                console.warn('utils.delegateEvent: Ancestor could not be found')
        })
    },

    // This gets rid of all the event listeners for a node or nodelist

    destroyListeners: (selector) => {
        document.querySelectorAll(selector).forEach(item =>
            item.outerHTML = item.outerHTML
        )
    },

    defeatEnterKey: (selector) => {
        utils.addEventListenerByClass(selector, 'keypress', (event) => {
            event.key === 'Enter' && event.preventDefault()
        })
    },

    hasES6Support: () => {
        try {
            eval('"use strict"; class foo {}')
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },

    capitalizeWords: str => {
        return str.toLowerCase().split(' ').map(word =>
            word[0].toUpperCase() + word.substr(1)).join(' ')
    },

    simulateClick: element => {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
        setTimeout(() => {
            element.dispatchEvent(event)
            console.log('utils.simulateClick()::element', element, '::event', event)
        }, 50)
    },

    show: selector => {
        const elements = document.querySelectorAll(selector)
        Array.from(elements).forEach(item => item.style.display = 'block')
    },

    showInlineBlock: selector => {
        const elements = document.querySelectorAll(selector)
        Array.from(elements).forEach(item => item.style.display = 'inline-block')
    },

    hide: selector => {
        const elements = document.querySelectorAll(selector)
        Array.from(elements).forEach(item => item.style.display = 'none')
    },

    showElementFlex: selector => {
        document.getElementById(selector).style.display = 'flex'
    },
    
    showElementBlock: selector => {
        document.getElementById(selector).style.display = 'block'
    },

    hideElementById: selector => {
        document.getElementById(selector).style.display = 'none'
    },

    // Also, consider toggleFade() defined below
    toggleDisplay: selector => {
        const element = document.querySelector(selector)
        if (element.style.display !== 'none')
            element.style.display = 'none';
        else
            element.style.display = 'block';
    },

    // Ensure a row in a scrollbar table is visible and centered vertically
    autoScroll: (container, row) => {
        const containerHeight = container.offsetHeight;
        const rowHeight = row.clientHeight;
        const rowOffset = row.offsetTop;

        // Put row in middle of container viewport
        const scrollTopStart = container.scrollTop
        const scrollTopEnd =  rowOffset - (containerHeight * .5) + (rowHeight * 1.5)
        const numberOfSteps = 40
        const stepAmount = (scrollTopEnd - scrollTopStart) / numberOfSteps
        let i = 1
        const interval = setInterval(() => {
            container.scrollTop += stepAmount
            i++
            if (i >= numberOfSteps) clearInterval(interval)
        }, 5)
    },
    
    disableButtons: selector => {
        const buttons = document.querySelectorAll(selector)
        Array.from(buttons).forEach(item => {
          item.classList.add('disabled')
          item.setAttribute('disabled', '')
        })
    },

    enableButtons: selector => {
        const buttons = document.querySelectorAll(selector)
        Array.from(buttons).forEach(item => {
          item.classList.remove('disabled')
          item.removeAttribute('disabled', '')
        })
    },

    disableButton: function(id) {
        utils.disableButtons(`#${id}`)
    },

    enableButton: function(id) {
        utils.enableButtons(`#${id}`)
    },

    emptyInnerHTML: selector => {
        const elements = document.querySelectorAll(selector)
        Array.from(elements).forEach(item => item.innerHTML = '')
    },

    isNullOrEmpty: str => {
        return !str || str === null || str.length === 0
    },

    isString: x => Object.prototype.toString.call(x) === '[object String]',

    areObjectsEqual: (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2),

    removeSpecialChars: str => {

        // Preserve valid JSON chars
        str = str.replace(/\\n/g, "\\n")
                 .replace(/\\'/g, "\\'")
                 .replace(/\\"/g, '\\"')
                 .replace(/\\&/g, "\\&")
                 .replace(/\\r/g, "\\r")
                 .replace(/\\t/g, "\\t")
                 .replace(/\\b/g, "\\b")
                 .replace(/\\f/g, "\\f")

        // Remove hidden/special invalid JSON chars
        return str.replace(/[\u0000-\u0019]+/g, '')
    },

    fadeIn: (target, duration, steps, callback = null) => {
        const fadeTarget = document.querySelector(target)
        const durationPerStep = duration / steps
        const stepSize = 1 / steps
        const fadeEffect = setInterval(() => {
            let targetOpacity = Number(fadeTarget.style.opacity)
            if (targetOpacity < 1) {
                targetOpacity += stepSize
                fadeTarget.style.opacity = targetOpacity
            } else {
                fadeTarget.style.opacity = "1"
                clearInterval(fadeEffect)
                callback && callback()
            }
        }, durationPerStep)
    },

    fadeOut: (target, duration, steps, callback = null) => {
        const fadeTarget = typeof target === 'string' ? document.querySelector(target) : target
        const durationPerStep = duration / steps
        const stepSize = 1 / steps
        const fadeEffect = setInterval(() => {
            let targetOpacity = Number(fadeTarget.style.opacity)
            if (targetOpacity > 0) {
                targetOpacity -= stepSize
                fadeTarget.style.opacity = targetOpacity
            } else {
                fadeTarget.style.opacity = ""
                clearInterval(fadeEffect)
                if (callback) {
                    setTimeout(() => {
                        callback()
                    }, duration)
                }
            }
        }, durationPerStep)
    },

    alphaSort: (arr, prop = null) => {
        if (prop === null) {
            return arr.sort((a, b) => {
                if (a < b) return -1
                else if (a > b) return 1
                else return 0
            })
        } else {
            return arr.sort((a, b) => {
                if (a[prop] < b[prop]) return -1
                else if (a[prop] > b[prop]) return 1
                else return 0
            })
        }
    },

    getFieldOptionLabelByValue: (fieldOptions, value) => {
        if (value) value = parseInt(value)
        for (let i = 0; i < fieldOptions.length; i++)
            if (fieldOptions[i].value === value)
                return fieldOptions[i].label

        return ''
    },

    formatValue: (value, format) => {
        if (value === null) return ''
        if (format !== null) {
            return isNaN(value) ? value : numeral(value).format(format)
        } else
            return value
    },

    formatUnitValue: (value, unitsFormat, includeUnitSymbol) => {
        if (value === null) return ''

        if (!isNaN(value)) {
            switch (unitsFormat) {
                case constants.UNITS.V:
                    if (App.Project.VoltageUnits === constants.UNITS.kV) {
                        return includeUnitSymbol ?
                            numeral(value / 1000).format(constants.FORMATS.kV) + " " + constants.UNITS.kV :
                            numeral(value / 1000).format(constants.FORMATS.kV)
                    }
                    else {
                        return includeUnitSymbol ?
                            numeral(value).format(constants.FORMATS.V) + " " + constants.UNITS.V :
                            numeral(value).format(constants.FORMATS.V)
                    }

                case constants.UNITS.A:
                    if (App.Project.CurrentUnits === constants.UNITS.kA) {
                        return includeUnitSymbol ?
                            numeral(value / 1000).format(constants.FORMATS.kA) + " " + constants.UNITS.kA :
                            numeral(value / 1000).format(constants.FORMATS.kA)
                    }
                    else {
                        return includeUnitSymbol ?
                            numeral(value).format(constants.FORMATS.A) + " " + constants.UNITS.A :
                            numeral(value).format(constants.FORMATS.A)
                    }

                case constants.UNITS.kVA:
                    if (App.Project.CapacityUnits === constants.UNITS.MVA) {
                        return includeUnitSymbol ?
                            numeral(value / 1000).format(constants.FORMATS.MVA) + " " + constants.UNITS.MVA :
                            numeral(value / 1000).format(constants.FORMATS.MVA)
                    }
                    else {
                        return includeUnitSymbol ?
                            numeral(value).format(constants.FORMATS.kVA) + " " + constants.UNITS.kVA :
                            numeral(value).format(constants.FORMATS.kVA)
                    }
            }
        }

        return value
    },

    closeOpenWindows(selector, closeBtn) {
        if (document.querySelector(selector).style.display === 'block') {
            this.simulateClick(document.getElementById(closeBtn))
        }
    },

    // For use with Properties overlay, and hopefully useful elsewhere
    formats: {
        formatTemperature: value => value ? `${value}${App.Project.TemperatureSymbol}` : '',
        formatAngle: value => `${value}${constants.UNITS.DEGREES}`,
        formatFeet: value => value ? `${value} ${constants.UNITS.FEET}` : `0 ${constants.UNITS.FEET}`,
        formatLength: value => value ? `${value} ${App.Project.AbbreviatedLengthLabel}` : `0 ${App.Project.AbbreviatedLengthLabel}`,
        formatLowerCaseLength: value => value ? `${value} ${App.Project.AbbreviatedLengthLabel.toLowerCase()}` : `0 ${App.Project.AbbreviatedLengthLabel.toLowerCase()}`,
        formatUnitArea: value => value ? `${value} ${App.Project.AbbreviatedLengthLabel}\u00b2` : '',
        formatCurrency: value => value ? `${App.Project.CurrencySign}${numeral(value).format(constants.FORMATS.N02)}` : '',
        formatPercentage: value => value ? `${value}${constants.UNITS.PERCENT}` : '',
        formatCableSize: value => value ? `${value} ${constants.UNITS.AWG_KCMIL}` : '',
        formatYears: value => value ? `${value} ${constants.UNITS.YEARS}` : '',
        formatKw: value => value ? `${value} ${constants.UNITS.kW}` : '',
        formatKwH: value => value ? `${value} ${constants.UNITS.kWh}` : '',
        formatCurrencyPerM: value => value ? `${numeral(value).format(constants.FORMATS.N02)} ${App.Project.CurrencySign}/M` : '',
        formatCurrencyPerKw: value => value ? `${numeral(value).format(constants.FORMATS.N02)} ${App.Project.CurrencySign}/kW` : '',
        formatCurrencyPerKwH: value => value ? `${numeral(value).format(constants.FORMATS.N02)} ${App.Project.CurrencySign}/kWh` : '',
        formatCurrencyPerKwDc: value => value ? `${numeral(value).format(constants.FORMATS.N02)} ${App.Project.CurrencySign}/kW<sub>DC</sub>` : '',
        formatCurrencyPerKwDcPerMonth: value => value ? `${numeral(value).format(constants.FORMATS.N02)} ${App.Project.CurrencySign}/kW<sub>DC</sub>/Month` : '',
        formatKva: value => value ? `${value} ${constants.UNITS.kVA}` : '',
        formatKvar: value => value ? `${value} ${constants.UNITS.kVAR}` : '',
        formatMva: value => value ? `${value} ${constants.UNITS.MVA}` : '',
        formatMvar: value => value ? `${value} ${constants.UNITS.MVAR}` : '',
        formatPu: value => value || value === 0 ? `${value} ${constants.UNITS.PU}` : '',
        formatWithUnit: (value, unitTypes, unitValue) => value ? `${value} ${utils.getFieldOptionLabelByValue(unitTypes, unitValue)}` : '',
        formatOhms: value => value ? `${value} ${constants.UNITS.OHMS}` : '',
        formatOhmsPerThousandFeet: value => value ? `${value} ${constants.UNITS.OHMS_PER_THOUSAND_FEET}` : '',
        formatCostPerUnitLength: value => value ? `${App.Project.CurrencySign}${numeral(value).format(constants.FORMATS.N02)}/${App.Project.UnitLength}` : '',
        formatResistancePerUnitLength: value => value ? `${value} ${constants.UNITS.OHMS}/${App.Project.UnitLength}` : '',
        formatDeviceState: value => value ? constants.DEVICE_STATE_LABELS.OPEN : constants.DEVICE_STATE_LABELS.CLOSE,
        formatCtRatio: (numerator, denominator) => `${numerator}/${denominator}`,
        formatHz: value => value ? `${value} ${constants.UNITS.HZ}` : '',
        formatToggle: value => value ? constants.TOGGLE_CONTROL_LABELS.ON : constants.TOGGLE_CONTROL_LABELS.OFF,
        formatCoordinate: value => Number(numeral(value).format(constants.FORMATS.LAT_LNG)),
        formatLatLng: (lat, lng) => lat && lng ? `${numeral(lat).format(constants.FORMATS.LAT_LNG)}${constants.UNITS.DEGREES}, ${numeral(lng).format(constants.FORMATS.LAT_LNG)}${constants.UNITS.DEGREES}` : '',
        hideNull: value => value ? value : '',
    },

    // Functions to help with form elements
    forms: {

        getTextFieldValue: name => document.getElementsByName(name)[0].value.trim(),

        getTextAreaFieldValue: name => document.getElementsByName(name)[0].value.trim(),

        getHiddenFieldValue: name => document.getElementsByName(name)[0].value,

        getBooleanFieldValue: input => {
            if (['1', 1, 'true', true, 'on'].includes(document.getElementsByName(input)[0].checked))
              return true
            else
              return false
        },

        getNullableTextFieldValue: name => document.getElementsByName(name)[0].value.trim() || null,

        // For nullable integers/decimals/floats etc.
        getNumericFieldValue: name => {
            if ([null, ''].includes(document.getElementsByName(name)[0].value))
                return null
            else
                return Number(document.getElementsByName(name)[0].value)
        },

        getCheckboxFieldValue: name => {
            if (document.getElementsByName(name)[0].checked)
                return document.getElementsByName(name)[0].value
            else
                return null
        },

        getIsCheckboxChecked: (name, value = '1') => {
            if (document.getElementsByName(name)[0].checked)
                return value === document.getElementsByName(name)[0].value
            else
                return false
        },

        getSelectFieldValue: name => document.getElementsByName(name)[0].value,

        getNumericSelectFieldValue: name => Number(document.getElementsByName(name)[0].value),

        getCurrencyFieldValue: name => {
            if ([null, ''].includes(document.getElementsByName(name)[0].value))
                return null
            else
                return Number(document.getElementsByName(name)[0].value).toFixed(2)
        },

        getRadioFieldValue: name => {
            const options = document.getElementsByName(name)
            for (let option of options) {
                if (option.checked)
                    return option.value
            }
        },

        setRadioFieldValue: (name, value) => {
            const options = document.getElementsByName(name)
            for (let option of options) {
                if (option.value === value)
                    option.checked = true
                else
                    option.checked = false
            }
        },

        // Convert a percentage to a decimal (100% => 1.0)
        getDecimalFieldValue: name => Number(document.getElementsByName(name)[0].value.trim()) / 100,

        // See if the form value is checked. If so, return the "on" value. If not, return the "off" value
        getToggleFieldValue: (name, fieldOptions) => {
            if (document.getElementsByName(name)[0].checked)
                return fieldOptions[0].value
            else return fieldOptions[1].value
        },

        getCoordinateFieldValue: name => {
            const val = document.getElementsByName(name)[0].value.trim()
            return val ? Number(numeral(val).format(constants.FORMATS.LAT_LNG)) : null
        },

        convertDecimalToPercentage: decimal => {
            if ([null, ''].includes(decimal))
                return null
            else
                return parseInt(decimal * 100)
        },

        convertPuToPercentage: decimal => {
            if ([null, ''].includes(decimal))
                return null
            else
                return decimal * 100
        },

        convertAmperesToKiloamperes: a => {
            if ([null, ''].includes(a))
                return null
            else
                return Number(a) / 1000
        },

        convertVoltsToKilovolts: v => {
            if ([null, ''].includes(v))
                return null
            else
                return Number(v) / 1000
        },

        convertKvaToMva: kva => {
            if ([null, ''].includes(kva))
                return null
            else
                return Number(kva) / 1000
        },

        convertKiloUnitToUnit: ku => {
            if ([null, ''].includes(ku))
                return null
            else
                return Number(ku) * 1000
        },

        convertFeetToMeters: ft => {
            if ([null, ''].includes(ft))
            return null
        else
            return  Number(ft) * constants.FT_TO_M_FACTOR
        },

        calculatePositiveResistance: (baseMva, threePhaseShortCircuit, xrRatioPos) => {
            if (baseMva === 0) return ''
            return ((baseMva * 1000 / threePhaseShortCircuit) * (Math.cos(Math.atan(xrRatioPos)))).toFixed(7)
        },

        calculatePositiveReactance: (baseMva, threePhaseShortCircuit, xrRatioPos) => {
            if (baseMva === 0) return ''
            return ((baseMva * 1000 / threePhaseShortCircuit) * (Math.sin(Math.atan(xrRatioPos)))).toFixed(7)
        },

        calculateZeroResistance: (baseMva, threePhaseShortCircuit, xrRatioZero) => {
            if (baseMva === 0) return ''
            return ((baseMva * 1000 / threePhaseShortCircuit) * (Math.cos(Math.atan(xrRatioZero)))).toFixed(7)
        },

        calculateZeroReactance: (baseMva, threePhaseShortCircuit, xrRatioZero) => {
            if (baseMva === 0) return ''
            return ((baseMva * 1000 / threePhaseShortCircuit) * (Math.sin(Math.atan(xrRatioZero)))).toFixed(7)
        },

        calculateCableLength: (fromLatitude, fromLongitude, toLatitude, toLongitude, overagePercent) => {
            if (fromLatitude === null || fromLongitude === null || toLatitude === null || toLongitude === null) {
                console.error('Utils.calculateCableLength() error: Null lat/lng arguments not allowed', 'fromLatitude', fromLatitude,
                        'fromLongitude', fromLongitude, 'toLatitude', toLatitude, 'toLongitude', toLongitude)
            }

            const diffLatitudeRadians = utils.forms.degreesToRadians(toLatitude - fromLatitude)
            const diffLongitudeRadians = utils.forms.degreesToRadians(toLongitude - fromLongitude)
            const a = utils.forms.square(Math.sin(diffLatitudeRadians/2)) +
                Math.cos(fromLatitude) *
                Math.cos(toLatitude) *
                utils.forms.square(Math.sin(diffLongitudeRadians/2))
            const lengthInKilometers = 2 * constants.EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
            const lengthInMiles = lengthInKilometers * constants.KM_TO_MILES_FACTOR
            const lengthInFeet = lengthInMiles * constants.MILES_TO_FT_FACTOR
            const lengthWithOverhead = lengthInFeet + (lengthInFeet * (overagePercent / 100))
            return Number(numeral(lengthWithOverhead).format(constants.FORMATS.U0))
        },

        // calculate cable lengths with multiple vertices
        calculateCableSegmentLengths: (flightPath, overagePercent) => {
            let accumulator = 0
            flightPath.forEach((item, i) => {
                if (i > 0) {
                    accumulator += utils.forms.calculateCableLength(
                        flightPath[i - 1].Latitude,
                        flightPath[i - 1].Longitude,
                        flightPath[i].Latitude,
                        flightPath[i].Longitude,
                        overagePercent
                    )
                }
            })
            return Number(numeral(accumulator).format(constants.FORMATS.U0))
        },

        degreesToRadians: degrees => degrees * (Math.PI/180),

        square: x => Math.pow(x, 2),

        fahrenheitToCelsius: fahrenheit => (Number(fahrenheit) - 32) * .5555,

        celsiusToFahrenheit: celsius => (Number(celsius) * 1.8) + 32,

        convertUtcDateTimeToRelativeTime: utcDateTime => {
            const threeDaysAgo = moment().subtract(3, 'd')
            const timestamp = moment(utcDateTime)
            const duration = moment.duration(timestamp.diff(threeDaysAgo));
            const durationAsMilliseconds = duration.asMilliseconds();

            // Uncomment these lines for testing
            // console.table(duration)
            // console.log('Utils.convertUtcDateTimeToRelativeTime::durationAsMilliseconds', durationAsMilliseconds)

            // Only show relative time if timestamp is less than 3 days old
            if (durationAsMilliseconds > 0)
                return timestamp.fromNow()
            else
                return timestamp.format('LL')
        },

        convertUtcDateToEpochSeconds: utcDateTime => moment(utcDateTime).valueOf(),

        getUtcNow: () => moment().utc().toISOString(),

        getAnnotations: (annotationFields) => {
            let annotations = []
            annotationFields.forEach(item => {
                if (document.getElementsByName(item.name)[0].checked)
                    annotations.push(item.value)
            })
            return annotations
        },

        getEnumLabel: (field, enumValue) => field.find(x => x.value === enumValue).label,
        
        getEnumValue: (field, enumLabel) => {
            return Number(field.find(x => x.label === enumLabel).value)
        },

        empty: selector => {
            const elements = document.querySelectorAll(selector)
            Array.from(elements).forEach(item => item.value = '')
        }
    }
}

utils.toggleFade = (selector, callback = null) => {
    const element = document.querySelector(selector)
    element.style.visibility = 'visible'
    if (element.style.opacity === '1') {
        utils.fadeOut(selector, constants.TRANSITION_SPEEDS.SLOW, constants.TRANSITION_FRAME_COUNTS.STANDARD, () => {
            element.style.display = 'none'
            callback && callback()
        })
    } else if (element.style.opacity === '') {
        element.style.display = 'block'
        utils.fadeIn(selector, constants.TRANSITION_SPEEDS.SLOW, constants.TRANSITION_FRAME_COUNTS.STANDARD, () => {
            callback && callback()
        })
    }
}

utils.showBlockingSpinner = () => utils.show(constants.SELECTORS.SPINNER_OVERLAY)

utils.hideBlockingSpinner = () => utils.hide(constants.SELECTORS.SPINNER_OVERLAY)

utils.forms = {
    ...utils.forms,

    getVoltageUnitsFieldValue: (fieldValue, unitSetting) => {
        return unitSetting === constants.FIELD_OPTIONS.VOLTAGE_UNITS[0].value ?
            fieldValue :
            utils.forms.convertVoltsToKilovolts(fieldValue)
    },

    getCurrentUnitsFieldValue: (fieldValue, unitSetting) => {
        return unitSetting === constants.FIELD_OPTIONS.CURRENT_UNITS[0].value ?
            fieldValue :
            utils.forms.convertAmperesToKiloamperes(fieldValue)
    },
    
    getCapacityUnitsFieldValue: (fieldValue, unitSetting) => {
        return unitSetting === constants.FIELD_OPTIONS.CAPACITY_UNITS[0].value ?
            fieldValue :
            utils.forms.convertKvaToMva(fieldValue)
    },

    getConvertedNumericFieldValue: (name, unitType, unitSetting) => { 
        const defaultUnitValue = constants.FIELD_OPTIONS[`${unitType}_UNITS`][0].value
        if (defaultUnitValue === unitSetting) {
            return utils.forms.getNumericFieldValue(name)
        } else {
            return utils.forms.convertKiloUnitToUnit(utils.forms.getNumericFieldValue(name))
        }
    }
}

Object.freeze(utils)

export default utils