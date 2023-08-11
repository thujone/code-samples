// This is the number-formatting configuration for Small Modular Reactors (SMR).
// See number-formatter.js for more info about as-you-type number formatting across Xendee Economic Optimizer.

NumberFormatter.initialize(TECH_CONFIG.SMR.FORM_ID, {
    'size-SMR-existing': {
        format: NumberFormatter.formats.technologyDecisionInteger
    },
    'smr-age': {
        format: NumberFormatter.formats.technologyDecisionInteger
    },
    'smr-max-new-size': {
        format: NumberFormatter.formats.technologyDecisionInteger
    },
    'smr-purchase-price': {
        format: NumberFormatter.formats.integer
    },
    'smr-lifetime': {
        format: NumberFormatter.formats.integer
    },
    'smr-omvar': {
        format: NumberFormatter.formats.dynamicMoney
    },
    'smr-omfix': {
        format: NumberFormatter.formats.dynamicMoney
    },
    'smr-front-end-fuel-cost': {
        format: NumberFormatter.formats.integer
    },
    'smr-back-end-fuel-cost': {
        format: NumberFormatter.formats.integer
    },
    'smr-refueling-period': {
        format: NumberFormatter.formats.decimalPlacesUpTo2
    },
    'smr-decommissioning-cost': {
        format: NumberFormatter.formats.integer
    },
    'smr-reactor-capacity': {
        format: NumberFormatter.formats.decimalPlacesUpTo2
    },
    'smr-baseload-setpoint-duration': {
        format: NumberFormatter.formats.decimalPlacesUpTo2
    },
    'smr-htp-ratio': {
        format: NumberFormatter.formats.decimalPlacesUpTo4
    },
    'smr-itc': {
        format: NumberFormatter.formats.decimalPlacesUpTo2
    },
    'smr-amt-depreciable': {
        format: NumberFormatter.formats.decimalPlacesUpTo2
    },
    'smr-ptc': {
        format: NumberFormatter.formats.dynamicMoney
    },
    'smr-cycle-depth': {
        format: NumberFormatter.formats.decimalPlacesUpTo4
    },
    'smr-max-cycle': {
        format: NumberFormatter.formats.integer
    },
    'smr-min-load': {
        format: NumberFormatter.formats.decimalPlacesUpTo2
    },
    'smr-max-annual-hours': {
        format: NumberFormatter.formats.integer
    },
    'smr-min-annual-hours': {
        format: NumberFormatter.formats.integer
    },
    'smr-rampup-rate': {
        format: NumberFormatter.formats.decimalPlacesUpTo5
    },
    'smr-rampdown-rate': {
        format: NumberFormatter.formats.decimalPlacesUpTo5
    },
    'smr-min-updown-time': {
        format: NumberFormatter.formats.integer
    },
    'smr-power-factor': {
        format: NumberFormatter.formats.decimalPlacesUpTo2
    },
    'smr-heat-export-price': {
        format: NumberFormatter.formats.dynamicMoney
    }
});