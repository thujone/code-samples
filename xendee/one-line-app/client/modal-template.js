/****************************************************************************
 ** Templated dialogs for the Xendee One-Line diagramming app.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import moment from 'moment'
import App from './app.js'
import constants from './constants.js'
import utils from './utils.js'
import graphics from './graphics.js'
import { initModal } from './modal-listeners/common.js'
import { initDeviceModal } from './modal-listeners/common-devices.js'

/**
 * Compile and bind data to Handlebars templates for the various modals.
 * */
export default class ModalTemplate {
    constructor(templateName, templateType, context) {
        this.templateName = templateName
        this.templateType = templateType
        this.context = context

        if (!this.context.meta) this.context['meta'] = {}

        // this.context.meta.converted contains all properties that undergo unit conversion
        this.context.meta['converted'] = {}

        if (this.templateType === constants.MODAL_CATEGORIES.ACTION)
            this.modalName = this.context.data.modalName
        else if (this.templateType === constants.MODAL_CATEGORIES.NODE)
            this.modalName = this.context.data.NodeType
        else if (this.templateType === constants.MODAL_CATEGORIES.BRANCH)
            this.modalName = this.context.data.BranchType
        else if (this.templateType === constants.MODAL_CATEGORIES.DEVICE)
            this.modalName = this.context.data.DeviceType
        else
            console.error('ModalTemplate.constructor()', 'Could not determine modalName')

        console.log(`ModalTemplate.constructor()::constants.MODALS_BY_TYPE[this.modalName][0]', ${constants.MODALS_BY_TYPE[this.modalName][0]}`)

        this.templateId = `${constants.MODALS_BY_TYPE[this.modalName][0]}`
        this.source = document.getElementById(this.templateName).innerHTML

        console.log('ModalTemplate::context', this.context)
    }

    prepareContext() {

        // Add general symbols and labels to be used in any modal
        this.context = {
            ...this.context,
            ansiOrIec: App.Project.IsAnsi ? 'ansi' : 'iec',
            breakerIcon: `${graphics.DEVICE_ICONS_PATH}/${graphics.ICON_FILENAMES.DEVICE.OPEN.BREAKER[App.Project.FormatId].HIGH}`,
            fuseIcon: `${graphics.DEVICE_ICONS_PATH}/${graphics.ICON_FILENAMES.DEVICE.OPEN.FUSE[App.Project.FormatId]}`,
            relayIcon: `${graphics.DEVICE_ICONS_PATH}/${graphics.ICON_FILENAMES.DEVICE.OPEN.RELAY[App.Project.FormatId]}`,
            switchIcon: `${graphics.DEVICE_ICONS_PATH}/${graphics.ICON_FILENAMES.DEVICE.OPEN.SWITCH[App.Project.FormatId]}`,
            twoWindingTransformerIcon: `${graphics.GRAPHICS_PATH}/${graphics.ICON_FILENAMES.MODAL.TRANS2W[App.Project.FormatId]}`,
            currencySign: App.Project.CurrencySign,
            temperatureSymbol: App.Project.TemperatureSymbol,
            lengthLabel: App.Project.LengthLabel,
            lowerCaseLengthLabel: App.Project.LengthLabel.toLowerCase(),
            abbreviatedLengthLabel: App.Project.AbbreviatedLengthLabel,
            unitLength: App.Project.UnitLength,
            perUnitLengthLabel: `/${App.Project.UnitLength}`,
            resistancePerUnitLengthLabel: `${constants.UNITS.OHMS}/${App.Project.UnitLength}`,
            unitArea: `${App.Project.AbbreviatedLengthLabel}\u00b2`
        }

        switch (this.modalName) {
            case constants.MODALS.UTILITY:
            case constants.MODALS.BUSBAR:
            case constants.MODALS.LOAD:
            case constants.MODALS.SOLAR:
            case constants.MODALS.WIND:
            case constants.MODALS.GENERATOR:
            case constants.MODALS.STORAGE:
            case constants.MODALS.DCON:
            case constants.MODALS.CABLE:
            case constants.MODALS.TRANS2W:

                // Add field option constants to the context
                const fields = Object.keys(constants.FIELD_OPTIONS)
                const fieldOptions = {}

                fields.forEach(item => {
                    const field = constants.FIELD_OPTIONS[item]
                    field.forEach(row => {
                        const storedValue = this.context.data.Details[constants.FIELD_NAMES[item]]
                        //console.log('constants.FIELD_NAMES[item]', constants.FIELD_NAMES[item])
                        if (typeof storedValue !== 'undefined') {
                            if (storedValue === row.value) {
                                row.selected = 'selected'
                                row.checked = 'checked'
                            } else {
                                row.selected = ''
                                row.checked = ''
                            }
                            //console.log(`FIELD_OPTIONS: storedValue=${storedValue}, row details: ${row.label}, ${row.value}, ${row.selected}`)
                        }
                    })
                    fieldOptions[item] = field
                })

                this.context.fieldOptions = fieldOptions
                
                this.context.units = {
                  voltageUnits: App.Project.VoltageUnits,
                  currentUnits: App.Project.CurrentUnits,
                  capacityUnits: App.Project.CapacityUnits
                }

                // Convert voltage, capacity, and current fields according to their preferred unit settings
                const unitFieldInfo = constants.UNIT_FIELDS[this.modalName]
                unitFieldInfo && Object.entries(unitFieldInfo).forEach(item => {
                    switch (item[0]) {
                        case constants.UNIT_TYPES.VOLTAGE:
                            item[1].forEach(field => {
                                const dataFieldName = this.getLastPartOfSplitString(field.dataField, '.')
                                const dataFieldValue = this.getObjectValueFromString(`context.data.${field.dataField}`, this)
                                this.context.meta.converted[dataFieldName] =
                                    utils.forms.getVoltageUnitsFieldValue(dataFieldValue, App.Project.VoltageUnits)
                                this.context.meta.converted[`${dataFieldName}UnitLabel`] = App.Project.VoltageUnits
                            })
                            break
                        case constants.UNIT_TYPES.CURRENT:
                            item[1].forEach(field => {
                                const dataFieldName = this.getLastPartOfSplitString(field.dataField, '.')
                                const dataFieldValue = this.getObjectValueFromString(`context.data.${field.dataField}`, this)
                                this.context.meta.converted[dataFieldName] =
                                    utils.forms.getCurrentUnitsFieldValue(dataFieldValue, App.Project.CurrentUnits)
                                this.context.meta.converted[`${dataFieldName}UnitLabel`] = App.Project.CurrentUnits
                            })
                            break
                        case constants.UNIT_TYPES.CAPACITY:
                            item[1].forEach(field => {
                                const dataFieldName = this.getLastPartOfSplitString(field.dataField, '.')
                                const dataFieldValue = this.getObjectValueFromString(`context.data.${field.dataField}`, this)
                                this.context.meta.converted[dataFieldName] =
                                    utils.forms.getCapacityUnitsFieldValue(dataFieldValue, App.Project.CapacityUnits)
                                this.context.meta.converted[`${dataFieldName}UnitLabel`] = App.Project.CapacityUnits 
                            })
                    }
                })

                // For branches, add From/To icon paths and FromDevice / ToDevice
                if (this.context.data.IsBranch) {
                    if (typeof graphics.ICON_FILENAMES.MODAL[this.context.data.FromNode.NodeType] === 'string') {
                        this.context.fromNodeIcon = graphics.ICON_FILENAMES.MODAL[this.context.data.FromNode.NodeType]
                    } else {
                        this.context.fromNodeIcon = graphics.ICON_FILENAMES.MODAL[this.context.data.FromNode.NodeType][App.Project.FormatId]
                    }

                    if (typeof graphics.ICON_FILENAMES.MODAL[this.context.data.ToNode.NodeType] === 'string') {
                        this.context.toNodeIcon = graphics.ICON_FILENAMES.MODAL[this.context.data.ToNode.NodeType]
                    } else {
                        this.context.toNodeIcon = graphics.ICON_FILENAMES.MODAL[this.context.data.ToNode.NodeType][App.Project.FormatId]
                    }

                    [
                        { device: 'fromDevice', deviceIdField: 'FromDeviceId' },
                        { device: 'toDevice', deviceIdField: 'ToDeviceId' }
                    ].forEach(item => {
                        const device = App.Project.OneLineDevices.find(x => x.DeviceId === this.context.data[item.deviceIdField])
                        if (device) {
                            device['deviceOpenChecked'] = device.DeviceOpen ? 'checked' : ''
                            device['deviceCloseChecked'] = !device.DeviceOpen ? 'checked' : ''
                            device['iconFilepath'] = device.getIconFilepath(this.context.data, device.DeviceOpen, false)
                            this.context.meta[item.device] = device
                        }
                    })
                }

                // TRANS2W has this additional context  
                if (this.modalName === constants.MODALS.TRANS2W) {
                    const details = this.context.data.Details
                    this.context.meta = { ...this.context.meta }
                    this.context.meta.TapPercentage = utils.forms.convertDecimalToPercentage(details.Tap)
                    this.context.meta.MinTapPercentage = utils.forms.convertDecimalToPercentage(details.MinTap)
                    this.context.meta.MaxTapPercentage = utils.forms.convertDecimalToPercentage(details.MaxTap)
                }

                // LOAD has this additional context
                else if (this.modalName === constants.MODALS.LOAD) {
                    if (this.context.data.Details.LoadShapeDate && this.context.data.Details.LoadShapeDate !== '')
                        this.context.meta.loadShapeDate = moment(this.context.data.Details.LoadShapeDate).format('LL')
                    else
                        this.context.meta.loadShapeDate = ''
                    
                    if (this.context.data.Details.LoadShapeResolution)
                        this.context.meta.loadShapeResolution = this.context.fieldOptions['LOAD_SHAPE_TIME_STEPS'].find(x => x.value === Number(this.context.data.Details.LoadShapeResolution)).label

                    if (this.context.data.Details.LoadShapeName === '')
                        this.context.meta.deleteLoadShapeButtonClass = 'display-none'
                    else
                        this.context.meta.deleteLoadShapeButtonClass = ''
                }

                // SOLAR has this additional context
                else if (this.modalName === constants.MODALS.SOLAR)
                    this.context.meta.currentUnits = App.Project.CurrentUnits

                // WIND has this additional context
                else if (this.modalName === constants.MODALS.WIND)
                    this.context.meta.currentUnits = App.Project.CurrentUnits

                // BUSBAR has this additional context
                else if (this.modalName === constants.MODALS.BUSBAR) {
                    if (this.context.data.Details.Existing)
                        this.context.fieldOptions['EXISTING'][1].selected = 'selected'
                    else
                        this.context.fieldOptions['EXISTING'][0].selected = 'selected'
                }

                break

            case constants.MODALS.FUSE:
            case constants.MODALS.RELAY:
            case constants.MODALS.BREAKER:
            case constants.MODALS.SWITCH:
                this.context.meta.statusOpenChecked = this.context.data.DeviceOpen ? 'checked' : ''
                this.context.meta.statusCloseChecked = this.context.data.DeviceOpen ? '' : 'checked'

                this.context.units = {
                  voltageUnits: App.Project.VoltageUnits,
                  currentUnits: App.Project.CurrentUnits,
                  capacityUnits: App.Project.CapacityUnits
                }

                // Convert voltage, capacity, and current fields according to their preferred unit settings
                const deviceUnitFieldInfo = constants.UNIT_FIELDS[this.modalName]
                deviceUnitFieldInfo && Object.entries(deviceUnitFieldInfo).forEach(item => {
                    switch (item[0]) {
                        case constants.UNIT_TYPES.VOLTAGE:
                            item[1].forEach(field => {
                                const dataFieldName = this.getLastPartOfSplitString(field.dataField, '.')
                                const dataFieldValue = this.getObjectValueFromString(`context.data.${field.dataField}`, this)
                                this.context.meta.converted[dataFieldName] =
                                    utils.forms.getVoltageUnitsFieldValue(dataFieldValue, App.Project.VoltageUnits)
                                this.context.meta.converted[`${dataFieldName}UnitLabel`] = App.Project.VoltageUnits
                            })
                            break
                        case constants.UNIT_TYPES.CURRENT:
                            item[1].forEach(field => {
                                const dataFieldName = this.getLastPartOfSplitString(field.dataField, '.')
                                const dataFieldValue = this.getObjectValueFromString(`context.data.${field.dataField}`, this)
                                this.context.meta.converted[dataFieldName] =
                                    utils.forms.getCurrentUnitsFieldValue(dataFieldValue, App.Project.CurrentUnits)
                                this.context.meta.converted[`${dataFieldName}UnitLabel`] = App.Project.CurrentUnits
                            })
                            break
                    }
                })
                break

            case constants.MODALS.ADD_BRANCH:
                const fromNodeTypes = [constants.NODE_TYPES.UTILITY, constants.NODE_TYPES.SOLAR, constants.NODE_TYPES.GENERATOR, constants.NODE_TYPES.WIND, constants.NODE_TYPES.BUSBAR]
                this.context.fromNodes = this.context.data.nodes.filter(node => fromNodeTypes.includes(node.NodeType)).toList()
                this.context.fromNodes.sort(this.alphaSort)
                this.context.fromNodes = this.context.fromNodes.toArray()

                const toNodeTypes = [constants.NODE_TYPES.BUSBAR, constants.NODE_TYPES.LOAD, constants.NODE_TYPES.STORAGE]
                this.context.toNodes = this.context.data.nodes.filter(node => toNodeTypes.includes(node.NodeType)).toList()
                this.context.toNodes.sort(this.alphaSort)
                this.context.toNodes = this.context.toNodes.toArray()
                this.context.modalTitle = constants.LABELS[this.context.data.branchType]
                break

            case constants.MODALS.SETTINGS:
                let annotations = {}
                const projectAnnotations = Array.from(this.context.data.project.Annotations)
                let unitFields = {}

                // Cable overage select field
                this.context.cableOveragePercentOptions = []
                constants.FIELD_OPTIONS['CABLE_OVERAGE_PERCENT'].forEach(item => {
                    this.context.cableOveragePercentOptions.push({
                        selected: Number(item.value) === App.Project.CableOveragePercent,
                        label: item.label,
                        value: item.value
                    })
                })

                for (let annotationName in constants.ANNOTATION_TYPES) {
                    if (projectAnnotations.includes(annotationName)) {
                        annotations[annotationName] = 'checked'
                    } else {
                        annotations[annotationName] = ''
                    }
                }

                constants.FIELD_OPTIONS.UNIT_FIELDS.forEach(item => {
                    if (this.context.data.project[item.field] === constants.FIELD_OPTIONS[item.name][0].value)
                        unitFields[item.field] = 'checked'
                    else
                        unitFields[item.field] = ''
                })

                this.context.annotations = annotations
                this.context.unitFields = unitFields

                // Voltage colors
                this.context.voltageColors1 = []
                this.context.voltageColors2 = []
                this.context.voltageColors3 = []
                this.context.voltageColors4 = []

                constants.FIELD_OPTIONS['VOLTAGE_COLORS'].forEach(item => {
                    const currColor = 
                    this.context.voltageColors1.push({
                        selected: item.value === App.Project.VoltageColor1,
                        label: item.label,
                        value: item.value,
                        class: item.class
                    })

                    this.context.voltageColors2.push({
                        selected: item.value === App.Project.VoltageColor2,
                        label: item.label,
                        value: item.value,
                        class: item.class
                    })

                    this.context.voltageColors3.push({
                        selected: item.value === App.Project.VoltageColor3,
                        label: item.label,
                        value: item.value,
                        class: item.class
                    })

                    this.context.voltageColors4.push({
                        selected: item.value === App.Project.VoltageColor4,
                        label: item.label,
                        value: item.value,
                        class: item.class
                    })
                })

                // Voltage levels
                this.context.voltages1 = []
                this.context.voltages2 = []
                this.context.voltages3 = []
                this.context.voltages4 = []

                const allVoltages = Array.from(App.Project.getAllVoltages())

                // Convert the raw voltages into objects for the Voltage option drop-downs
                allVoltages.forEach(rawVoltage => {
                    this.context.voltages1.push({
                        selected: rawVoltage === App.Project.Voltage1,
                        value: rawVoltage,
                        text: `${utils.forms.getVoltageUnitsFieldValue(rawVoltage, App.Project.VoltageUnits)} ${App.Project.VoltageUnits}`
                    })

                    this.context.voltages2.push({
                        selected: rawVoltage === App.Project.Voltage2,
                        value: rawVoltage,
                        text: `${utils.forms.getVoltageUnitsFieldValue(rawVoltage, App.Project.VoltageUnits)} ${App.Project.VoltageUnits}`
                    })

                    this.context.voltages3.push({
                        selected: rawVoltage === App.Project.Voltage3,
                        value: rawVoltage,
                        text: `${utils.forms.getVoltageUnitsFieldValue(rawVoltage, App.Project.VoltageUnits)} ${App.Project.VoltageUnits}`
                    })

                    this.context.voltages4.push({
                        selected: rawVoltage === App.Project.Voltage4,
                        value: rawVoltage,
                        text: `${utils.forms.getVoltageUnitsFieldValue(rawVoltage, App.Project.VoltageUnits)} ${App.Project.VoltageUnits}`
                    })
                })

                // Add in any voltages that are selected in the project, but missing in allVoltages
                if (App.Project.Voltage1 !== null && App.Project.Voltage1 > 0 && !allVoltages.includes(App.Project.Voltage1))
                    this.context.voltages1.push({
                        selected: true,
                        value: App.Project.Voltage1,
                        text: `${utils.forms.getVoltageUnitsFieldValue(App.Project.Voltage1, App.Project.VoltageUnits)} ${App.Project.VoltageUnits}`
                    })

                if (App.Project.Voltage2 !== null && App.Project.Voltage2 > 0 && !allVoltages.includes(App.Project.Voltage2))
                    this.context.voltages2.push({
                        selected: true,
                        value: App.Project.Voltage2,
                        text: `${utils.forms.getVoltageUnitsFieldValue(App.Project.Voltage2, App.Project.VoltageUnits)} ${App.Project.VoltageUnits}`
                    })

                if (App.Project.Voltage3 !== null && App.Project.Voltage3 > 0 && !allVoltages.includes(App.Project.Voltage3))
                    this.context.voltages3.push({
                        selected: true,
                        value: App.Project.Voltage3,
                        text: `${utils.forms.getVoltageUnitsFieldValue(App.Project.Voltage3, App.Project.VoltageUnits)} ${App.Project.VoltageUnits}`
                    })

                if (App.Project.Voltage4 !== null && App.Project.Voltage4 > 0 && !allVoltages.includes(App.Project.Voltage4))
                    this.context.voltages4.push({
                        selected: true,
                        value: App.Project.Voltage4,
                        text: `${utils.forms.getVoltageUnitsFieldValue(App.Project.Voltage4, App.Project.VoltageUnits)} ${App.Project.VoltageUnits}`
                    })

                this.context.meta.CreatedDate = utils.forms.convertUtcDateTimeToRelativeTime(App.Project.CreatedDate)
                this.context.meta.LastModifiedDate = utils.forms.convertUtcDateTimeToRelativeTime(App.Project.LastModifiedDate)
                break

            case constants.MODALS.POWER_FLOW_ANALYSIS_SETTINGS:
                this.context.meta.converted['dateGenerated'] = utils.forms.convertUtcDateTimeToRelativeTime(this.context.data.Analysis.DateGenerated)
                this.context.meta.settings = {}
                Object.entries(constants.ANALYSIS_OPTIONS).forEach(item => {
                    const option = this.context.data.Options.find(x => x.id === item[1])
                    const value = option ? option.value : ''
                    if (typeof value === 'boolean')
                        this.context.meta.settings[item[0]] = value ? 'checked' : ''
                    else
                        this.context.meta.settings[item[0]] = value
                });
              
                this.context.meta.selectFields = {};
                [
                  'BUS_UNDER_LOADED_COLOR', 'BUS_NORMAL_LOADED_COLOR', 'BUS_FULLY_LOADED_COLOR', 'BUS_OVER_LOADED_COLOR',
                  'BUS_UNDER_VOLTAGE_COLOR', 'BUS_NORMAL_VOLTAGE_COLOR', 'BUS_OVER_VOLTAGE_COLOR'
                ].forEach(option => {
                  this.context.meta.selectFields[option] = []
                  
                  constants.FIELD_OPTIONS.ANALYSIS_LOADED_COLORS.forEach(item => {
                    this.context.meta.selectFields[option].push({
                        selected: item.value === this.context.meta.settings[option],
                        label: item.label,
                        value: item.value,
                        class: item.class
                    })
                  })
                })
                break

            case constants.MODALS.SAVE_PROJECT:
                break

            case constants.MODALS.SEND_COPY_PROJECT:
                break

            case constants.MODALS.ANALYSES:
                this.context.data.completedAnalyses.forEach((item, i) => {
                    item.meta = {
                        downloadUrl: `${this.context.downloadUrl}${item.AnalysisId}`,
                        reportUrl: `${this.context.reportUrl}${item.AnalysisId}`,
                        converted: {
                            dateGenerated: utils.forms.convertUtcDateTimeToRelativeTime(item.DateGenerated),
                            dateGeneratedInEpochSeconds: utils.forms.convertUtcDateToEpochSeconds(item.DateGenerated)
                        }
                    }
                })
                break

            case constants.MODALS.ANALYSIS_DETAILS:
                const details = this.context.data.details
                const features = details.Features.split('|')
                details.meta = {
                    averageRating: details.AverageRating === null ? 'not rated' : details.AverageRating,
                    features
                }
                break

            case constants.MODALS.ANALYSES_OPTIONS:
            case constants.MODALS.ANALYSES_NEW:
                break

            case constants.MODALS.IMPORTABLE_GIS_PROJECTS:
                this.context.data.optimizationProjectsData.forEach((item, i) => {
                    item.meta = {
                        downloadUrl: `${this.context.downloadUrl}${item.OptimizationProjectId}`,
                        reportUrl: `${this.context.reportUrl}${item.OptimizationProjectId}`,
                        converted: {
                            CreatedDateInRelativeTime: utils.forms.convertUtcDateTimeToRelativeTime(item.CreatedDate),
                            CreatedDateInEpochSeconds: utils.forms.convertUtcDateToEpochSeconds(item.CreatedDate),
                            LastModifiedDateInRelativeTime: utils.forms.convertUtcDateTimeToRelativeTime(item.LastModifiedDate),
                            LastModifiedDateInEpochSeconds: utils.forms.convertUtcDateToEpochSeconds(item.LastModifiedDate)
                        }
                    }
                })
                break

            case constants.MODALS.IMPORTABLE_GIS_RESULTS:
                this.context.data.results.forEach((item, i) => {
                    item.meta = {
                        converted: {
                            CompletedDateInRelativeTime: utils.forms.convertUtcDateTimeToRelativeTime(item.CompletedDate),
                            CompletedDateInEpochSeconds: utils.forms.convertUtcDateToEpochSeconds(item.CompletedDate)
                        }
                    }
                })
                break

            case constants.MODALS.IMPORT_GIS_HOME:
                this.context.data.completedProfiles.forEach((item, i) => {
                    item.meta = {
                        converted: {
                            DayType: Number(item.DayType) < 100 ? Number(item.DayType) + 200 : Number(item.DayType) 
                        }
                    }
                })
                break

            case constants.MODALS.IMPORTABLE_GIS_RESULT:
            case constants.MODALS.IMPORT_GIS_VIEW_PROFILE:
            case constants.MODALS.IMPORT_GIS_DATE:
            case constants.MODALS.IMPORT_GIS_PROFILE_NAME:
                break

            case constants.MODALS.TOPOGRAPHY:
                break

            default:
                console.warn('ModalTemplate::prepareContext()', 'Did not prepare the context for modal named: ', this.modalName)
        }

        console.log('ModalTemplate.prepareContext()::this.context', this.context)
    }

    getObjectValueFromString(str, context) {
        return str.split('.').reduce((object, property) => { return object[property]}, context)
    }

    getLastPartOfSplitString(str, delimiter) {
        const parts = str.split(delimiter)
        return parts[parts.length - 1]
    }

    alphaSort(a, b) {
        if (a.Name.toLowerCase() < b.Name.toLowerCase())
            return -1
        if (a.Name.toLowerCase() > b.Name.toLowerCase())
            return 1
        return 0
    }

    execute(selector = null, showModal = true, fadeInPanel = false, isDeviceModal = false) {
        this.template = Handlebars.compile(this.source)
        const markupString = this.template(
            {...this.context},
            {allowProtoMethodsByDefault: true, allowProtoPropertiesByDefault: true}
        )
        const htmlFragment = document.createRange().createContextualFragment(markupString)
        
        if (selector)
            document.querySelector(selector).appendChild(htmlFragment)
        else {
            document.body.appendChild(htmlFragment)
            !isDeviceModal && initModal()
            isDeviceModal && initDeviceModal()
        }
        if (showModal)
            this.showModal()
        else if (fadeInPanel)
            this.fadeInPanel()
    }

    showModal() {
        document.getElementById(this.templateId).style.display = 'block'
        document.getElementById(this.templateId).classList.add('show')
    }

    fadeInPanel() {
        const panel = document.getElementById(this.templateId)
        document.getElementById(this.templateId).style.opacity = '0'
        document.getElementById(this.templateId).style.display = 'block'
        utils.fadeIn(`#${this.templateId}`, constants.TRANSITION_SPEEDS.MEDIUM, constants.TRANSITION_FRAME_COUNTS.STANDARD)
    }

    hideModal() {
        if (document.getElementById(this.templateId)) {
            document.getElementById(this.templateId).classList.remove('show')
            document.getElementById(this.templateId).style.display = 'none'
        }
    }

    destroyModal() {
        this.hideModal()
        constants.MODALS_BY_TYPE[this.modalName].forEach(modal => {
            const element = document.getElementById(modal)
            element && element.parentNode.removeChild(element)
        })
    }
}