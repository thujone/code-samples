/****************************************************************************
 ** Catalog sub-modals for nodes and branches in the Xendee One-Line
 ** diagramming app.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import 'bootstrap'
import numeral from 'numeral'
import App from '../one-line/app.js'
import constants from '../one-line/constants.js'
import messages from '../one-line/messages.js'
import utils from '../one-line/utils.js'
import { initCableModal } from '../one-line/modal-listeners/branches/cable.js'
import { initTwoWindingTransformerModal } from '../one-line/modal-listeners/branches/two-winding-transformer.js'
import { initUtilityModal } from './modal-listeners/nodes/utility.js'
import { initLoadModal } from './modal-listeners/nodes/load.js'
import { initGeneratorModal } from './modal-listeners/nodes/generator.js'
import Solar from './modal-listeners/nodes/solar.js'
import { initStorageModal } from './modal-listeners/nodes/storage.js'


export default class Catalog {
    constructor(app, device = null) {
        this.app = app
        this.device = device
        this.catalogTable = null
        this.catalogDataTable = null
        this.isDeviceCatalog = this.device !== null
        this.isElementCatalog = !this.isDeviceCatalog

        if (this.isElementCatalog) {
            this.element = this.app.SelectedProjectElement
            this.elementCategory = Object.keys(constants.NODE_TYPES).includes(this.element.NodeType) ?
                constants.ELEMENT_CATEGORIES.NODE : constants.ELEMENT_CATEGORIES.BRANCH
            this.elementType = this.elementCategory === constants.ELEMENT_CATEGORIES.NODE ? this.element.NodeType : this.element.BranchType


        // A device isn't an element, per se, but we'll duck-type it for the purpose of rendering catalogs
        } else if (this.isDeviceCatalog) {
            this.element = this.device
            this.elementCategory = constants.ELEMENT_CATEGORIES.DEVICE
            this.elementType = this.element.DeviceType
        }

        this.fadeOutAndUpdateCatalog = function(type, mine, xendee) {
            utils.fadeOut(constants.SELECTORS.DATATABLES_SCROLL, 150, 10, () => {
                this.updateCatalog(type, mine, xendee)
            })
        }
        this.fadeOutAndUpdateCatalogXendee
        this.fadeOutAndUpdateCatalogMine
        this.fadeOutAndUpdateCatalogBoth
    }

    addSaveAndMakeDefaultButtonListeners() {
        let saveAndMakeDefaultButton
        let saveWithoutDefaultButton

        // Yet another technique for dispensing with old event listeners
        if (this.isElementCatalog) {
            saveAndMakeDefaultButton = document.querySelector(`${constants.SELECTORS.SAVE_AND_MAKE_DEFAULT_BUTTON}`)
            saveWithoutDefaultButton = document.querySelector(`${constants.SELECTORS.SAVE_WITHOUT_DEFAULT_BUTTON}`)
            saveAndMakeDefaultButton.outerHTML = saveAndMakeDefaultButton.outerHTML
            saveWithoutDefaultButton.outerHTML = saveWithoutDefaultButton.outerHTML
            saveAndMakeDefaultButton = document.querySelector(`${constants.SELECTORS.SAVE_AND_MAKE_DEFAULT_BUTTON}`)
            saveWithoutDefaultButton = document.querySelector(`${constants.SELECTORS.SAVE_WITHOUT_DEFAULT_BUTTON}`)
        
        } else if (this.isDeviceCatalog) {
            saveAndMakeDefaultButton = document.querySelector(`${constants.SELECTORS.DEVICE_SAVE_AND_MAKE_DEFAULT_BUTTON}`)
            saveWithoutDefaultButton = document.querySelector(`${constants.SELECTORS.DEVICE_SAVE_WITHOUT_DEFAULT_BUTTON}`)
            saveAndMakeDefaultButton.outerHTML = saveAndMakeDefaultButton.outerHTML
            saveWithoutDefaultButton.outerHTML = saveWithoutDefaultButton.outerHTML
            saveAndMakeDefaultButton = document.querySelector(`${constants.SELECTORS.DEVICE_SAVE_AND_MAKE_DEFAULT_BUTTON}`)
            saveWithoutDefaultButton = document.querySelector(`${constants.SELECTORS.DEVICE_SAVE_WITHOUT_DEFAULT_BUTTON}`)
        }

        this.validateAndPostCatalogItemWithDefault = this.validateAndPostCatalogItem.bind(this, true)
        utils.addEvent(saveAndMakeDefaultButton, 'click', this.validateAndPostCatalogItemWithDefault)

        this.validateAndPostCatalogItemWithoutDefault = this.validateAndPostCatalogItem.bind(this, false)
        utils.addEvent(saveWithoutDefaultButton, 'click', this.validateAndPostCatalogItemWithoutDefault)
    }

    addCatalogButtonListener() {
        let catalogButton

        if (this.isElementCatalog && this.elementType !== constants.MODALS.DCON)
            catalogButton = document.querySelector(`#${this.app.modalTemplate.templateId} ${constants.SELECTORS.CATALOG_BUTTON}`)

        else if (this.isDeviceCatalog)
            catalogButton = document.querySelector(`${constants.SELECTORS.DEVICE_MODAL} ${constants.SELECTORS.DEVICE_CATALOG_BUTTON}`)

        catalogButton.addEventListener('click', () => {
            this.app.getCatalog(this.elementType)
        })
    }

    initializeSaveCatalogModal() {
        let elementId, requestProperties, formId

        if (this.elementCategory === constants.ELEMENT_CATEGORIES.NODE) {
            elementId = utils.forms.getTextFieldValue('node-id')
            requestProperties = this.app.getNodeRequestProperties(elementId)
            formId = constants.MODAL_FORM_IDS[this.elementType][0]

        } else if (this.elementCategory === constants.ELEMENT_CATEGORIES.BRANCH) {
            elementId = utils.forms.getTextFieldValue('branch-id')
            requestProperties = this.app.getBranchRequestProperties(elementId)
            formId = constants.MODAL_FORM_IDS[this.elementType][0]

        } else if (this.elementCategory === constants.ELEMENT_CATEGORIES.DEVICE) {
            elementId = utils.forms.getTextFieldValue('device-id')

            if (this.app.fromDevice && this.app.fromDevice.deviceCatalog)
                requestProperties = this.app.fromDevice.generateDeviceRequestBody().DeviceData
            else if (this.app.toDevice && this.app.toDevice.deviceCatalog)
                requestProperties = this.app.toDevice.generateDeviceRequestBody().DeviceData
            else if (this.app.locatorOverlay.device && this.app.locatorOverlay.device.deviceCatalog)
                requestProperties = this.app.locatorOverlay.device.generateDeviceRequestBody().DeviceData
            else
                requestProperties = this.app.device.generateDeviceRequestBody().DeviceData

            formId = constants.MODAL_FORM_IDS[this.elementType][0]
        }

        if (!this.app.isEquipmentNameUnique(requestProperties.Name, elementId)) {
            this.app.notification.showError(getMessage(messages.EQUIPMENT_NAME_NOT_UNIQUE, [requestProperties.Name]))
            return false
        }

        this.app.validator.validate(formId, () => {
            if (this.isElementCatalog)
                jQuery(constants.SELECTORS.SAVE_CATALOG_MODAL).modal('show')
            else if (this.isDeviceCatalog)
                jQuery(constants.SELECTORS.DEVICE_SAVE_CATALOG_MODAL).modal('show')


            if (this.elementCategory === constants.ELEMENT_CATEGORIES.NODE || this.elementCategory === constants.ELEMENT_CATEGORIES.BRANCH) {
                document.getElementById('sc-new-item-catalog-name').value = document.getElementById('name').value

                if (this.elementType !== constants.NODE_TYPES.UTILITY) {
                  if (document.getElementById('manufacturer').value)
                    document.getElementById('sc-manufacturer').value = document.getElementById('manufacturer').value
                  if (document.getElementById('part-number').value)
                    document.getElementById('sc-part-number').value = document.getElementById('part-number').value
                }
            
            } else if (this.elementCategory === constants.ELEMENT_CATEGORIES.DEVICE) {
                document.getElementById('device-sc-new-item-catalog-name').value = document.getElementById('device-name').value
                document.getElementById('device-sc-manufacturer').value = document.getElementById('device-manufacturer').value
                document.getElementById('device-sc-part-number').value = document.getElementById('device-part-number').value
            }
            
            // Add listeners to Save and Save + Make Default
            this.addSaveAndMakeDefaultButtonListeners()
        })
    }

    addSaveAndCatalogButtonListener() {
        let saveAndCatalogButton
        if (this.isElementCatalog && this.elementType !== constants.MODALS.DCON) {
            saveAndCatalogButton = document.querySelector(`#${this.app.modalTemplate.templateId} ${constants.SELECTORS.SAVE_AND_CATALOG_BUTTON}`)
            this.initializeElementSaveCatalogModal = this.initializeSaveCatalogModal.bind(this, this.elementType)
            utils.addEvent(saveAndCatalogButton, 'click', this.initializeElementSaveCatalogModal)

        } else if (this.isDeviceCatalog) {
            saveAndCatalogButton = document.querySelector(`${constants.SELECTORS.DEVICE_MODAL} ${constants.SELECTORS.DEVICE_SAVE_AND_CATALOG_BUTTON}`)
            this.initializeDeviceSaveCatalogModal = this.initializeSaveCatalogModal.bind(this, this.device.DeviceType)
            utils.addEvent(saveAndCatalogButton, 'click', this.initializeDeviceSaveCatalogModal)
        }
    }

    validateAndPostCatalogItem(isDefault) {
        const formId = constants.MODAL_FORM_IDS[this.elementType][2]
        this.app.validator.validate(formId, () => {
            this.app.getCatalogNameAvailable(
                this.elementType,
                isDefault,
                this.isElementCatalog ? utils.forms.getTextFieldValue('sc-new-item-catalog-name') : utils.forms.getTextFieldValue('device-sc-new-item-catalog-name'),
                (isDefault, response) => this.handleGetCatalogNameAvailableSuccess(isDefault, response)
            )
        })
    }

    updateCatalog(type, mine, xendee) {
        this.destroyCatalogDataTable()
        this.removeCatalogTable()
        this.app.getCatalog(type, mine, xendee, false)
    }

    handleGetCatalogSuccess(type, response, isDeviceCatalog) {
        this.catalogTable = isDeviceCatalog ? constants.SELECTORS.DEVICE_CATALOG_TABLE : constants.SELECTORS.CATALOG_TABLE
        const catalogModalSelector = isDeviceCatalog ? constants.SELECTORS.DEVICE_CATALOG_MODAL : constants.SELECTORS.CATALOG_MODAL
        this.renderCatalogTable(type, response, isDeviceCatalog)
        this.createCatalogDataTable(type, this.catalogTable, isDeviceCatalog)
        Array.from(document.querySelectorAll(catalogModalSelector)).forEach(item => {
            item.style.display = 'block'
            jQuery(`#${item.id}`).modal('show')
        })
        this.adjustCatalogTableColumnWidths(this.catalogTable)
        document.querySelector(constants.SELECTORS.DATATABLES_SCROLL).style.opacity = 1
    }

    handleGetCatalogNameAvailableSuccess(isDefault, response) {
        if (!response.data) {
            this.app.notification.showError(messages.CATALOG_NAME_UNAVAILABLE)
            return false

        } else {

            if (this.elementCategory === constants.ELEMENT_CATEGORIES.NODE) {
                const addToCatalogData = {
                    CatalogName: utils.forms.getTextFieldValue('sc-new-item-catalog-name'),
                    NumberOfPhases: utils.forms.getSelectFieldValue('sc-phases'),
                    Manufacturer: this.elementType !== constants.NODE_TYPES.UTILITY ? utils.forms.getTextFieldValue('sc-manufacturer') : null,
                    PartNumber: this.elementType !== constants.NODE_TYPES.UTILITY ? utils.forms.getTextFieldValue('sc-part-number') : null,
                    DefaultCatalogItem: isDefault
                }

                this.app.patchNode(utils.forms.getTextFieldValue('node-id'), addToCatalogData)

            } else if (this.elementCategory === constants.ELEMENT_CATEGORIES.BRANCH) {
                const addToCatalogData = {
                    CatalogName: utils.forms.getTextFieldValue('sc-new-item-catalog-name'),
                    NumberOfPhases: utils.forms.getSelectFieldValue('sc-phases'),
                    Manufacturer: this.elementType !== constants.NODE_TYPES.UTILITY ? utils.forms.getTextFieldValue('sc-manufacturer') : null,
                    PartNumber: this.elementType !== constants.NODE_TYPES.UTILITY ? utils.forms.getTextFieldValue('sc-part-number') : null,
                    DefaultCatalogItem: isDefault
                }
                this.app.patchBranch(utils.forms.getTextFieldValue('branch-id'), addToCatalogData)

            } else if (this.elementCategory === constants.ELEMENT_CATEGORIES.DEVICE) {
                const addToCatalogData = {
                    CatalogName: utils.forms.getTextFieldValue('device-sc-new-item-catalog-name'),
                    NumberOfPhases: utils.forms.getSelectFieldValue('device-sc-phases'),
                    Manufacturer: this.elementType !== constants.NODE_TYPES.UTILITY ? utils.forms.getTextFieldValue('device-sc-manufacturer') : null,
                    PartNumber: this.elementType !== constants.NODE_TYPES.UTILITY ? utils.forms.getTextFieldValue('device-sc-part-number') : null,
                    DefaultCatalogItem: isDefault
                }

                if (this.app.fromDevice && this.app.fromDevice.deviceCatalog)
                    this.app.fromDevice.patchDevice(addToCatalogData)
                else if (this.app.toDevice && this.app.toDevice.deviceCatalog)
                    this.app.toDevice.patchDevice(addToCatalogData)
                else if (this.app.locatorOverlay.device && this.app.locatorOverlay.device.deviceCatalog)
                    this.app.locatorOverlay.device.patchDevice(addToCatalogData)
                else
                    this.app.device.patchDevice(addToCatalogData)

            } else {
                console.error('Catalog.handleGetCatalogNameAvailableSuccess(): Did not patch node, branch, or device')
            }

            jQuery(`${constants.SELECTORS.SAVE_CATALOG_MODAL}, ${constants.SELECTORS.DEVICE_SAVE_CATALOG_MODAL}`).modal('hide')
        }
    }

    renderCatalogTable(type, response, isDeviceCatalog) {

        // Get the catalog template, execute it, and insert the generated <table> into the catalog modal
        const source = document.querySelector(constants.SELECTORS[`${type}_CATALOG_TABLE_TEMPLATE`]).innerHTML
        const template = Handlebars.compile(source)
        const catalogItems = response.data
        const context = {
            catalogItems
        }

        // Convert units for fields
        const convertedContext = this.applyCatalogUnitConversion(type, context)

        convertedContext.catalogItems.forEach((item, i) => {

            // Enums specific to CABLEs
            if (item.Details.CableMaterial) {
                const cableMaterialValue = item.Details.CableMaterial
                const cableMaterial = constants.FIELD_OPTIONS.CABLE_MATERIAL.find(x => x.value === cableMaterialValue) || ''
                item.converted['CableMaterial'] = cableMaterial.label
            }

            if (item.Details.InsulationType) {
                const insulationTypeValue = item.Details.InsulationType
                const insulationType = constants.FIELD_OPTIONS.INSULATION_TYPE.find(x => x.value === insulationTypeValue) || ''
                item.converted['InsulationType'] = insulationType.label
            }

            // Enums specific to LOAD
            if (item.Details.RatedPowerUnits) {
                const ratedPowerUnitsValue = item.Details.RatedPowerUnits
                const ratedPowerUnits = constants.FIELD_OPTIONS.RATED_POWER_UNITS.find(x => x.value === ratedPowerUnitsValue) || ''
                item.converted['RatedPowerUnits'] = ratedPowerUnits.label
            }

            // Enums specific to GENERATOR
            if (item.Details.FuelType) {
                const fuelTypeValue = item.Details.FuelType
                const fuelType = constants.FIELD_OPTIONS.FUEL_TYPE.find(x => x.value === fuelTypeValue) || ''
                item.converted['FuelType'] = fuelType.label
            }

            // Wind-specific values
            if (item.Details.WTGType) {
                const wtgType = constants.FIELD_OPTIONS.WTG_TYPE.find(x => x.value === item.Details.WTGType) || ''
                item.converted['WTGType'] = wtgType.label
            }

            if (Number(item.NumberOfPhases) === 0) {
                item.converted['NumberOfPhases'] = 3   // Hardcode to 3
            }

            // Calculations specific to UTILITYs
            if (type === constants.NODE_TYPES.UTILITY) {
                item['meta'] = {}
                item.converted.ThreePhaseShortCircuit = App.Project.CapacityUnits === constants.UNITS.MVA ?
                    `${numeral(item.converted.ThreePhaseShortCircuit).format(constants.FORMATS.MVA)} ${constants.UNITS.MVA}` :
                    `${numeral(item.converted.ThreePhaseShortCircuit).format(constants.FORMATS.kVA)} ${constants.UNITS.kVA}`
                item.meta['positiveResistance'] =
                    utils.forms.calculatePositiveResistance(item.Details.BaseMVA, item.Details.ThreePhaseShortCircuit, item.Details.XrRatioPos)
                item.meta['positiveReactance'] =
                    utils.forms.calculatePositiveReactance(item.Details.BaseMVA, item.Details.ThreePhaseShortCircuit, item.Details.XrRatioPos)
                item.meta['zeroResistance'] =
                    utils.forms.calculateZeroResistance(item.Details.BaseMVA, item.Details.ThreePhaseShortCircuit, item.Details.XrRatioZero)
                item.meta['zeroReactance'] =
                    utils.forms.calculateZeroReactance(item.Details.BaseMVA, item.Details.ThreePhaseShortCircuit, item.Details.XrRatioZero)
            }
        })

        const markupString = template(convertedContext)
        const htmlFragment = document.createRange().createContextualFragment(markupString)
        const catalogTableContainer = isDeviceCatalog ? constants.SELECTORS.DEVICE_CATALOG_TABLE_CONTAINER : constants.SELECTORS.CATALOG_TABLE_CONTAINER
        document.querySelector(catalogTableContainer).append(htmlFragment)
    }

    createCatalogDataTable(type, tableId, isDeviceCatalog) {
        this.catalogDataTable = jQuery(tableId).DataTable({
            select: { style: 'single' },
            paging: false,
            scrollCollapse: false,
            scrollY: '325px',
            scrollX: true,
            order: [
                [0, 'desc']
            ]
        })

        // Simulate clicking the first column header to execute the dataTables column styling
        const catalogTableWrapper = isDeviceCatalog ? constants.SELECTORS.DEVICE_CATALOG_TABLE_WRAPPER : constants.SELECTORS.CATALOG_TABLE_WRAPPER
        utils.simulateClick(document.querySelector(`${catalogTableWrapper} ${constants.SELECTORS.COLUMN_HEADERS}`))

    }

    adjustCatalogTableColumnWidths() {
        const columnHeaders = document.querySelectorAll(`${constants.SELECTORS.CATALOG_TABLE_WRAPPER} ${constants.SELECTORS.COLUMN_HEADERS}`)
        const firstRowCells = document.querySelectorAll(`${constants.SELECTORS.CATALOG_TABLE} ${constants.SELECTORS.FIRST_ROW_CELLS}`)

        const columnHeadersArr = Array.from(columnHeaders)
        const firstRowCellsArr = Array.from(firstRowCells)
        
        // For each column in the DataTables (headers and data are in different <table>s), look at the width of header and first-row cell.
        // Whichever is wider, apply that width to both header and first-row cell.

        // An empty row still has one <td> to say there is no data available, so check to make sure there is more than one cell
        if (firstRowCellsArr.length > 1) {
            columnHeadersArr.forEach((item, i) => {
                const headerWidth = item.offsetWidth
                const cellWidth = firstRowCellsArr[i].offsetWidth
                //console.log('App.adjustCatalogTableColumnWidths()::headerWidth', headerWidth, '::cellWidth', cellWidth)
                const widerWidth = headerWidth > cellWidth ? headerWidth : cellWidth
                item.style.width = widerWidth
                firstRowCellsArr[i].style.width = widerWidth
            })
        }
    }

    hideCatalogModal(type) {
        // Reset the radio filter field
        if (this.isElementCatalog) {
            document.querySelector(constants.SELECTORS.CATALOG_RADIAL_3).checked = true
            jQuery(constants.SELECTORS.CATALOG_MODAL).modal('hide')
       
        } else if (this.isDeviceCatalog) {
            document.querySelector(constants.SELECTORS.DEVICE_CATALOG_RADIAL_3).checked = true
            jQuery(constants.SELECTORS.DEVICE_CATALOG_MODAL).modal('hide')
        }

        this.destroyCatalogDataTable()
        this.removeCatalogButtonEventListeners()
        this.removeCatalogTable()
        
        switch(type) {
            case constants.MODALS.UTILITY:
                initUtilityModal(App.Project.CapacityUnits)
                break

            case constants.MODALS.BUSBAR:
                // No init script for busbars
                break

            case constants.MODALS.LOAD:
                initLoadModal(this.app)
                break

            case constants.MODALS.SOLAR:
                this.app.solar.initSolarModal()
                break

            case constants.MODALS.WIND:
                this.app.wind.initWindModal()
                break
            
            case constants.MODALS.GENERATOR:
                initGeneratorModal()
                break

            case constants.MODALS.STORAGE:
                initStorageModal()
              break

            case constants.MODALS.CABLE:
                initCableModal(this.app)
                break

            case constants.MODALS.TRANS2W:
                initTwoWindingTransformerModal()
                break

            case constants.MODALS.BREAKER:
            case constants.MODALS.FUSE:
            case constants.MODALS.RELAY:
            case constants.MODALS.SWITCH:
                break

            default:
                console.warn('Catalog.hideCatalogModal(): Did not run a modal init script')
        }
    }

    selectCatalogItem(type, isDefault = false) {
        if (!this.running) {
            const cells = document.querySelectorAll(`${constants.SELECTORS.CATALOG_MODAL_CLASS} ${constants.SELECTORS.SELECTED_ROW_CELLS}`)
            if (cells.length === 0) {
                this.app.notification.showError(messages.CATALOG_ROW_SELECTED)
                return false
            }

            const row = cells[0].parentNode

            switch(type) {
                case constants.MODALS.UTILITY:
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('base-mva', row.getAttribute('data-base-mva'))
                    document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('catalog-name', cells[0].innerText)
                    if (cells[1].innerText !== '')
                      document.getElementById('three-phase-short-circuit').value = Number(cells[1].innerText.split(' ')[0].replace(/,/g, ''))
                    this.setInputValue('xr-ratio-positive', cells[2].innerText)
                    this.setInputValue('xr-ratio-zero', cells[3].innerText)
                    if (cells[4].innerText !== '')
                      document.getElementById('resistance-plus').value = cells[4].innerText.split(' ')[0]
                    if (cells[5].innerText !== '')
                      document.getElementById('reactance-plus').value = cells[5].innerText.split(' ')[0]
                    if (cells[6].innerText !== '')
                      document.getElementById('resistance-zero').value = cells[6].innerText.split(' ')[0]
                    if (cells[7].innerText !== '')
                      document.getElementById('reactance-zero').value = cells[7].innerText.split(' ')[0]
                    this.setInputValue('voltage', row.getAttribute('data-voltage'))
                    this.setInputValue('voltage-angle', row.getAttribute('data-voltage-angle'))
                    this.setInputValue('line-ground-short-circuit', row.getAttribute('data-lg-short-circuit'))
                    this.setInputValue('operating-voltage', row.getAttribute('data-operating-voltage'))
                    break

                case constants.MODALS.BUSBAR:
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('manufacturer', cells[0].innerText)
                    this.setInputValue('sc-manufacturer', cells[0].innerText)
                    if (cells[1].innerText !== '')
                      document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('catalog-name', cells[1].innerText)
                    this.setInputValue('amp-rating', cells[2].innerText)
                    this.setInputValue('part-number', cells[3].innerText)
                    this.setInputValue('sc-part-number', cells[3].innerText)
                    this.setInputValue('infrastructure-capital-costs', row.getAttribute('data-cap-costs'))
                    this.setInputValue('annual-maintenance-costs', row.getAttribute('data-om-costs'))
                    this.setInputValue('lifetime', row.getAttribute('data-lifetime'))
                    break

                case constants.MODALS.LOAD:
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('manufacturer', cells[0].innerText)
                    this.setInputValue('sc-manufacturer', cells[0].innerText)
                    if (cells[1].innerText !== '')
                      document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('catalog-name', cells[1].innerText)
                    this.setInputValue('rated-voltage', cells[2].innerText)
                    if (cells[3].innerText !== '')
                      document.getElementById('rated-power').value = cells[3].innerText.split(' ')[0]
                    if (cells[3].innerText !== '') {
                      document.getElementById('rated-power-units').value = utils.forms.getEnumValue(
                          constants.FIELD_OPTIONS.RATED_POWER_UNITS,
                          cells[3].innerText.split(' ')[1]
                      )
                    }
                    this.setInputValue('power-factor', cells[4].innerText)
                    this.setInputValue('power-factor-type', row.getAttribute('data-power-factor-type'))
                    this.setInputValue('part-number', cells[5].innerText)
                    this.setInputValue('sc-part-number', cells[5].innerText)
                    break

                case constants.MODALS.SOLAR:
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('manufacturer', cells[0].innerText)
                    this.setInputValue('sc-manufacturer', cells[0].innerText)
                    this.setInputValue('catalog-name', cells[1].innerText)
                    document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('rated-power', cells[2].innerText)
                    this.setInputValue('pv-costs', cells[3].innerText)
                    this.setInputValue('part-number', cells[4].innerText)
                    this.setInputValue('sc-part-number', cells[4].innerText)
                    this.setInputValue('fault-x', row.getAttribute('data-fault-x'))
                    this.setInputValue('inverter-rating', row.getAttribute('data-inverter-rating'))
                    this.setInputValue('xr-ratio', row.getAttribute('data-xr-ratio'))
                    this.setInputValue('power-factor', row.getAttribute('data-power-factor'))
                    this.setInputValue('inverter-costs', row.getAttribute('data-inverter-costs'))
                    this.setInputValue('inverter-life', row.getAttribute('data-inverter-life'))
                    this.setInputValue('pv-life', row.getAttribute('data-pv-life'))
                    this.setInputValue('pv-installation-costs', row.getAttribute('data-pv-installation-costs'))
                    this.setInputValue('pv-maint-costs-per-kw-per-month', row.getAttribute('data-pv-maint-costs-per-kw-per-month'))
                    break

                case constants.MODALS.WIND:
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('manufacturer', cells[0].innerText)
                    this.setInputValue('sc-manufacturer', cells[0].innerText)
                    this.setInputValue('catalog-name', cells[1].innerText)
                    document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('rated-power', cells[3].innerText)
                    if (row.getAttribute('data-wtg-type'))
                      document.getElementById(`wtg-type-${row.getAttribute('data-wtg-type')}`).checked = true
                    this.setInputValue('part-number', cells[5].innerText)
                    this.setInputValue('sc-part-number', cells[5].innerText)
                    this.setInputValue('neg-seq-reactance', row.getAttribute('data-neg-seq-reactance'))
                    this.setInputValue('steady-state', row.getAttribute('data-steady-state'))
                    this.setInputValue('transient', row.getAttribute('data-transient'))
                    this.setInputValue('subtransient', row.getAttribute('data-subtransient'))
                    this.setInputValue('x0', row.getAttribute('data-x0'))
                    this.setInputValue('xr-ratio', row.getAttribute('data-xr-ratio'))
                    this.setInputValue('max-power-absorption', row.getAttribute('data-max-power-absorption'))
                    this.setInputValue('max-power-delivery', row.getAttribute('data-max-power-delivery'))
                    this.setInputValue('power-factor-full-load', row.getAttribute('data-power-factor-full-load'))
                    this.setInputValue('power-factor-correction', row.getAttribute('data-power-factor-correction'))
                    this.setInputValue('shunt-capacitor-stages', row.getAttribute('data-shunt-capacitor-stages'))
                    this.setInputValue('shunt-capacitor-rating', row.getAttribute('data-shunt-capacitor-rating'))
                    this.setInputValue('max-power-factor-over', row.getAttribute('data-max-power-factor-over'))
                    this.setInputValue('max-power-factor-under', row.getAttribute('data-max-power-factor-under'))
                    this.setInputValue('control-mode', row.getAttribute('data-control-mode'))
                    this.setInputValue('lifetime', row.getAttribute('data-lifetime'))
                    this.setInputValue('cost', row.getAttribute('data-cost'))
                    this.setInputValue('turbine-model', row.getAttribute('data-turbine-model'))
                    this.setInputValue('fixed-maint-cost', row.getAttribute('data-fixed-maint-cost'))
                    this.setInputValue('var-maint-cost', row.getAttribute('data-var-maint-cost'))
                    break

                case constants.MODALS.GENERATOR:
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('manufacturer', cells[0].innerText)
                    this.setInputValue('sc-manufacturer', cells[0].innerText)
                    this.setInputValue('catalog-name', cells[1].innerText)
                    document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('fuel-type', row.getAttribute('data-fuel-type'))
                    this.setInputValue('rated-power', cells[3].innerText)
                    this.setInputValue('rated-rpm', cells[4].innerText)
                    this.setInputValue('poles', cells[5].innerText)
                    this.setInputValue('part-number', cells[6].innerText)
                    this.setInputValue('sc-part-number', cells[6].innerText)
                    this.setInputValue('max-power-absorption', row.getAttribute('data-max-power-absorption'))
                    this.setInputValue('max-power-delivery', row.getAttribute('data-max-power-delivery'))
                    this.setInputValue('power-factor', row.getAttribute('data-power-factor'))
                    this.setInputValue('x-2', row.getAttribute('data-x-2'))
                    this.setInputValue('steady-state', row.getAttribute('data-steady-state'))
                    this.setInputValue('transient', row.getAttribute('data-transient'))
                    this.setInputValue('subtransient', row.getAttribute('data-subtransient'))
                    this.setInputValue('x0', row.getAttribute('data-x0'))
                    this.setInputValue('xr-ratio', row.getAttribute('data-xr-ratio'))
                    this.setInputValue('lifetime', row.getAttribute('data-lifetime'))
                    this.setInputValue('cost', row.getAttribute('data-cost'))
                    this.setInputValue('fixed-maintenance-costs', row.getAttribute('data-fixed-maint-cost'))
                    this.setInputValue('variable-maintenance-costs', row.getAttribute('data-var-maint-cost'))
                    break

                case constants.MODALS.STORAGE:
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('manufacturer', cells[0].innerText)
                    this.setInputValue('sc-manufacturer', cells[0].innerText)
                    this.setInputValue('catalog-name', cells[1].innerText)
                    document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('inverter-rated-power', cells[2].innerText)
                    this.setInputValue('inverter-power-factor', cells[3].innerText)
                    this.setInputValue('storage-rated-capacity', cells[4].innerText)
                    this.setInputValue('part-number', cells[5].innerText)
                    this.setInputValue('sc-part-number', cells[5].innerText)
                    this.setInputValue('fault-x', row.getAttribute('data-fault-x'))
                    this.setInputValue('losses-kvar', row.getAttribute('data-losses-kvar'))
                    this.setInputValue('idling-losses', row.getAttribute('data-idling-losses'))
                    this.setInputValue('max-voltage', row.getAttribute('data-max-voltage'))
                    this.setInputValue('min-voltage', row.getAttribute('data-min-voltage'))
                    this.setInputValue('power-factor-type', row.getAttribute('data-power-factor-type'))
                    if (row.getAttribute('data-storage-model') && Number(row.getAttribute('data-storage-model')) > 0)
                      document.getElementById(`storage-model-${row.getAttribute('data-storage-model')}`).checked = true
                    this.setInputValue('x-r', row.getAttribute('data-x-r'))
                    this.setInputValue('system-installation', row.getAttribute('data-system-installation'))
                    this.setInputValue('inverter-purchase', row.getAttribute('data-inverter-purchase'))
                    this.setInputValue('energy-modules-cost', row.getAttribute('data-energy-modules-cost'))
                    this.setInputValue('discrete-module-size', row.getAttribute('data-discrete-module-size'))
                    this.setInputValue('maintenance-cost', row.getAttribute('data-maintenance-cost'))
                    this.setInputValue('charging', row.getAttribute('data-charging'))
                    this.setInputValue('discharging', row.getAttribute('data-discharging'))
                    this.setInputValue('max-charge', row.getAttribute('data-max-charge'))
                    this.setInputValue('min-charge', row.getAttribute('data-min-charge'))
                    this.setInputValue('system-lifetime', row.getAttribute('data-system-lifetime'))
                    this.setInputValue('charging-c-rating', row.getAttribute('data-charging-c-rating'))
                    this.setInputValue('discharging-c-rating', row.getAttribute('data-discharging-c-rating'))
                    break

                case constants.MODALS.CABLE:
                    const numberOfCablesInParallel = utils.forms.getNumericFieldValue('number-of-cables-in-parallel')
                    const costPerUnitDistance = row.getAttribute('data-costs-per-unit-distance')
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    document.getElementById('reactance-pos').value = this.computeOppositionFlow('reactance-pos', row, numberOfCablesInParallel)
                    document.getElementById('reactance-zero').value = this.computeOppositionFlow('reactance-zero', row, numberOfCablesInParallel)
                    document.getElementById('resistance-pos').value = this.computeOppositionFlow('resistance-pos', row, numberOfCablesInParallel)
                    document.getElementById('resistance-zero').value = this.computeOppositionFlow('resistance-zero', row, numberOfCablesInParallel)
                    if (cells[4].innerText !== '') {
                        document.getElementById('ampacity').value = Number( ( Number( cells[4].innerText ) * numberOfCablesInParallel ).toFixed(6) )
                    }
                    if (costPerUnitDistance !== '') {
                        let cost = Number( ( Number( costPerUnitDistance ) * numberOfCablesInParallel ).toFixed(2) )
                        if (App.Project.IsAnsi) {
                            document.getElementById('costs-per-unit-distance').value = cost
                        } else {
                            document.getElementById('costs-per-unit-distance').value =
                                    numeral(cost / constants.THOUSAND_FT_TO_KM_FACTOR).format(constants.FORMATS.U2)
                       }
                    }
                    if (App.Project.IsAnsi) {
                        this.setInputValue('rated-temperature', row.getAttribute('data-rated-temperature'))
                    } else {
                        this.setInputValue(
                            'rated-temperature',
                            numeral(utils.forms.fahrenheitToCelsius( row.getAttribute('data-rated-temperature') )).format(constants.FORMATS.U0)
                        )
                    }
                    this.setInputValue('manufacturer', cells[0].innerText)
                    this.setInputValue('sc-manufacturer', cells[0].innerText)
                    document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('catalog-name', cells[1].innerText)
                    this.setInputValue('cable-size', cells[2].innerText)
                    this.setInputValue('voltage-rating', cells[3].innerText)
                    this.setInputValue('number-of-conductors', cells[6].innerText)
                    this.setInputValue('part-number', cells[8].innerText)
                    this.setInputValue('sc-part-number', cells[8].innerText)
                    if (cells[5].innerText !== '') {
                      document.getElementById('cable-material').value = utils.forms.getEnumValue(
                          constants.FIELD_OPTIONS.CABLE_MATERIAL,
                          cells[5].innerText
                      )
                    }
                    if (cells[7].innerText !== '') {
                      document.getElementById('insulation-type').value = utils.forms.getEnumValue(
                          constants.FIELD_OPTIONS.INSULATION_TYPE,
                          cells[7].innerText
                      )
                    }
                    this.setInputValue('life', row.getAttribute('data-lifetime'))
                    break

                case constants.MODALS.TRANS2W:
                    document.getElementById('new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('manufacturer', cells[0].innerText)
                    this.setInputValue('sc-manufacturer', cells[0].innerText)
                    document.getElementById('catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('catalog-name', cells[1].innerText)
                    this.setInputValue('part-number', cells[5].innerText)
                    this.setInputValue('sc-part-number', cells[5].innerText)
                    this.setInputValue('rating', cells[2].innerText)
                    this.setInputValue('impedance', cells[3].innerText)
                    this.setInputValue('xr-ratio', cells[4].innerText)
                    this.setInputValue('cost', row.getAttribute('data-cost'))
                    this.setInputValue('life', row.getAttribute('data-life'))
                    break
                
                case constants.MODALS.BREAKER:
                case constants.MODALS.SWITCH:
                    document.getElementById('device-new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('device-manufacturer', cells[0].innerText)
                    document.getElementById('device-catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('device-catalog-name', cells[1].innerText)
                    this.setInputValue('device-voltage-rating', cells[2].innerText)
                    this.setInputValue('device-amp-rating', cells[3].innerText)
                    this.setInputValue('device-interrupt-rating', cells[4].innerText)
                    this.setInputValue('device-trip-unit-type', cells[5].innerText)
                    this.setInputValue('device-frame-type', cells[6].innerText)
                    this.setInputValue('device-frame-size', cells[7].innerText)
                    this.setInputValue('device-model-number', cells[8].innerText)
                    this.setInputValue('device-part-number', cells[9].innerText)
                    break

                case constants.MODALS.FUSE:
                    document.getElementById('device-new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('device-manufacturer', cells[0].innerText)
                    document.getElementById('device-catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('device-catalog-name', cells[1].innerText)
                    this.setInputValue('device-voltage-rating', cells[2].innerText)
                    this.setInputValue('device-amp-rating', cells[3].innerText)
                    this.setInputValue('device-interrupt-rating', cells[4].innerText)
                    this.setInputValue('device-fuse-type', cells[5].innerText)
                    this.setInputValue('device-fuse-speed', cells[6].innerText)
                    this.setInputValue('device-fuse-class', cells[7].innerText)
                    this.setInputValue('device-model-number', cells[8].innerText)
                    this.setInputValue('device-part-number', cells[9].innerText)
                    break

                case constants.MODALS.RELAY:
                    document.getElementById('device-new-default-catalog-item-id').value = isDefault ? row.getAttribute('data-catalog-item-id') : ''
                    this.setInputValue('device-manufacturer', cells[0].innerText)
                    document.getElementById('device-catalog-name-label').innerText = cells[1].innerText
                    this.setInputValue('device-catalog-name', cells[1].innerText)
                    this.setInputValue('device-relay-type', cells[2].innerText)
                    this.setInputValue('device-model-number', cells[3].innerText)
                    this.setInputValue('device-part-number', cells[4].innerText)
                    break

                default:
            }
        }

        this.running = true
        setTimeout(() => {
            this.running = false
        }, 50)
        return true
    }

    setInputValue(fieldId, catalogValue) {
      let field = document.getElementById(fieldId)
      if (catalogValue !== '' && catalogValue !== null)
        field.value = catalogValue
    }

    computeOppositionFlow(formId, row, numberOfCablesInParallel) {
        const catalogValue = row.getAttribute(`data-${formId}`)
        if (catalogValue === null) {
            return ''
        } else {
            let resistanceValue = Number( ( Number( catalogValue ) * (1 / numberOfCablesInParallel) ).toFixed(6) )
            if (!App.Project.IsAnsi) {
                resistanceValue = Number( numeral(resistanceValue * constants.OHMS_PER_THOUSAND_FT_TO_OHMS_PER_KM_FACTOR).format(constants.FORMATS.U5) )
            }
            return resistanceValue
        }
    }

    destroyCatalogDataTable() {
        try {
            this.catalogDataTable.destroy()
        } catch (error) {
            //console.warn('App.destroyCatalogDataTable():', 'Did not destroy catalog datatable')
        }
    }

    clearCatalogDataTable() {
        this.catalogDataTable.clear().draw()
    }

    removeCatalogButtonEventListeners() {
        if (this.isElementCatalog) {
            utils.removeEvent(document.querySelector(constants.SELECTORS.CATALOG_RADIAL_1), 'click', this.fadeOutAndUpdateCatalogXendee)
            utils.removeEvent(document.querySelector(constants.SELECTORS.CATALOG_RADIAL_2), 'click', this.fadeOutAndUpdateCatalogMine)
            utils.removeEvent(document.querySelector(constants.SELECTORS.CATALOG_RADIAL_3), 'click', this.fadeOutAndUpdateCatalogBoth)
        
        } else if (this.isDeviceCatalog) {
            utils.removeEvent(document.querySelector(constants.SELECTORS.DEVICE_CATALOG_RADIAL_1), 'click', this.fadeOutAndUpdateCatalogXendee)
            utils.removeEvent(document.querySelector(constants.SELECTORS.DEVICE_CATALOG_RADIAL_2), 'click', this.fadeOutAndUpdateCatalogMine)
            utils.removeEvent(document.querySelector(constants.SELECTORS.DEVICE_CATALOG_RADIAL_3), 'click', this.fadeOutAndUpdateCatalogBoth)
        }
    }

    removeCatalogTable() {
        const catalogTableSelector = `${constants.SELECTORS.DEVICE_CATALOG_TABLE}, ${constants.SELECTORS.DEVICE_CATALOG_TABLE_WRAPPER}, ${constants.SELECTORS.CATALOG_TABLE}`
        const catalogTable = document.body.querySelector(catalogTableSelector)
        if (catalogTable) catalogTable.parentNode.removeChild(catalogTable)
    }

    initializeCatalogListeners(type) {
        this.addCatalogRadioButtonListeners(type)
        this.addCloseCatalogButtonListener(type)
        this.addSelectCatalogItemButtonListener(type)
    }

    addCatalogRadioButtonListeners(type) {
        this.fadeOutAndUpdateCatalogXendee = this.fadeOutAndUpdateCatalog.bind(this, type, false, true)
        this.fadeOutAndUpdateCatalogMine = this.fadeOutAndUpdateCatalog.bind(this, type, true, false)
        this.fadeOutAndUpdateCatalogBoth = this.fadeOutAndUpdateCatalog.bind(this, type, true, true)

        if (this.isElementCatalog) {
            utils.addEvent(document.querySelector(constants.SELECTORS.CATALOG_RADIAL_1), 'click', this.fadeOutAndUpdateCatalogXendee)
            utils.addEvent(document.querySelector(constants.SELECTORS.CATALOG_RADIAL_2), 'click', this.fadeOutAndUpdateCatalogMine)
            utils.addEvent(document.querySelector(constants.SELECTORS.CATALOG_RADIAL_3), 'click', this.fadeOutAndUpdateCatalogBoth)
        
        } else if (this.isDeviceCatalog) {
            utils.addEvent(document.querySelector(constants.SELECTORS.DEVICE_CATALOG_RADIAL_1), 'click', this.fadeOutAndUpdateCatalogXendee)
            utils.addEvent(document.querySelector(constants.SELECTORS.DEVICE_CATALOG_RADIAL_2), 'click', this.fadeOutAndUpdateCatalogMine)
            utils.addEvent(document.querySelector(constants.SELECTORS.DEVICE_CATALOG_RADIAL_3), 'click', this.fadeOutAndUpdateCatalogBoth)
        }
    }

    addCloseCatalogButtonListener(type) {
        const closeButtons = document.querySelectorAll(`${constants.SELECTORS.CLOSE_CATALOG_BUTTON}, ${constants.SELECTORS.DEVICE_CLOSE_CATALOG_BUTTON}`)
        for (const closeButton of closeButtons) {
            const hideCatalogModal = () => {
                this.hideCatalogModal(type)
                utils.removeEvent(closeButton, 'click', hideCatalogModal)
            }
            utils.addEvent(closeButton, 'click', hideCatalogModal)
        }
    }

    addSelectCatalogItemButtonListener(type) {
        const selectButtons = document.querySelectorAll(`${constants.SELECTORS.SELECT_CATALOG_BUTTON}, ${constants.SELECTORS.DEVICE_SELECT_CATALOG_BUTTON}`)
        for (const selectButton of selectButtons) {
            const selectCatalogItemAndHideModal = () => {
                if (this.selectCatalogItem(type, false)) {
                    this.hideCatalogModal(type)
                    utils.removeEvent(selectButton, 'click', selectCatalogItemAndHideModal)
                }
            }
            utils.addEvent(selectButton, 'click', selectCatalogItemAndHideModal)
        }

        const selectAndMakeDefaultButtons =
            document.querySelectorAll(`${constants.SELECTORS.SELECT_AND_MAKE_DEFAULT_BUTTON}, ${constants.SELECTORS.DEVICE_SELECT_AND_MAKE_DEFAULT_BUTTON}`)
        for (const selectAndMakeDefaultButton of selectAndMakeDefaultButtons) {
            const selectCatalogItemAndMakeDefaultAndHideModal = () => {
                if (this.selectCatalogItem(type, true)) {
                    this.hideCatalogModal(type)
                    utils.removeEvent(selectAndMakeDefaultButton, 'click', selectCatalogItemAndMakeDefaultAndHideModal)
                }
            }
            utils.addEvent(selectAndMakeDefaultButton, 'click', selectCatalogItemAndMakeDefaultAndHideModal)
        }
    }

    // Convert voltage, capacity, and current fields according to their preferred unit settings
    applyCatalogUnitConversion(catalogType, context) {
        const unitFieldInfo = constants.UNIT_FIELDS[catalogType]
        context.catalogItems.forEach((catalogItem, i) => {
            unitFieldInfo && Object.entries(unitFieldInfo).forEach(item => {
                const cItem = catalogItem
                switch (item[0]) {
                    case constants.UNIT_TYPES.VOLTAGE:
                        item[1].forEach(field => {
                            const ci = cItem
                            const objParts = field.dataField.split('.')
                            const dataFieldName = objParts[objParts.length - 1]
                            const dataFieldValue = objParts.length === 2 ? ci[objParts[0]][objParts[1]] : ci[objParts[0]]
                            ci.converted = ci.converted || {}
                            ci.converted[dataFieldName] =
                                utils.forms.getVoltageUnitsFieldValue(dataFieldValue, App.Project.VoltageUnits)
                        })
                        break
                    case constants.UNIT_TYPES.CURRENT:
                        item[1].forEach(field => {
                            const ci = cItem
                            const objParts = field.dataField.split('.')
                            const dataFieldName = objParts[objParts.length - 1]
                            const dataFieldValue = objParts.length === 2 ? ci[objParts[0]][objParts[1]] : ci[objParts[0]]
                            ci.converted = ci.converted || {}
                            ci.converted[dataFieldName] =
                                utils.forms.getCurrentUnitsFieldValue(dataFieldValue, App.Project.CurrentUnits)
                        })
                        break
                    case constants.UNIT_TYPES.CAPACITY:
                        item[1].forEach(field => {
                            const ci = cItem
                            const objParts = field.dataField.split('.')
                            const dataFieldName = objParts[objParts.length - 1]
                            const dataFieldValue = objParts.length === 2 ? ci[objParts[0]][objParts[1]] : ci[objParts[0]]
                            ci.converted = ci.converted || {}
                            ci.converted[dataFieldName] =
                                utils.forms.getCapacityUnitsFieldValue(dataFieldValue, App.Project.CapacityUnits)
                        })
                        break
                }
            })
        })
        context.unitTypes = {
            voltageUnits: App.Project.VoltageUnits,
            currentUnits: App.Project.CurrentUnits,
            capacityUnits: App.Project.CapacityUnits
        }
        console.log('Catalog.applyCatalogUnitConversion()::context', context)
        return context
    }
}
