/****************************************************************************
 ** Protective devices for branches, plus device detail modal-on-modals (MOMs)
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/

import utils from './utils.js'
import constants from './constants.js'
import messages, { getMessage } from './messages.js'
import ModalTemplate from './modal-template.js'
import Catalog from './catalog.js'
import OneLineDevice from './models/OneLineDevice.js'
import App from './app.js'

export default class Device {
    constructor(app, device, deviceType, branchSide) {
        this.app = app
        this.device = device   // For existing devices
        this.deviceType = deviceType
        this.branchSide = branchSide
        this.oneLineDevice
        this.branch = this.app.SelectedProjectElement || this.device.getAssociatedBranch()
        this.branchId = this.branch.BranchId
        this.branchType = this.branch.BranchType
        this.requestBody = null
        
        this.deviceRatedVoltage = branchSide === constants.BRANCH_SIDES.FROM ? this.branch.FromSourceIncomingVoltage : this.branch.getVoltageBeforeToDevice(true)
        if (this.deviceRatedVoltage === 0)
            this.deviceRatedVoltage = null;

        // POST device
        this.postDevicePath = `${constants.API_PATH}/${constants.RESOURCES.ADD_DEVICE}/${window.oneLineProjectId}`
        this.postDeviceRequestQueryString = (branchId, branchSide) => `branchId=${branchId}&side=${branchSide}`
        this.postDeviceUrl = null
        this.postDeviceRequestBody

        // PATCH device
        this.patchDeviceDataUrl = `${constants.API_PATH}/${constants.RESOURCES.UPDATE_DEVICE}/${window.oneLineProjectId}`

        // PATCH device state
        this.patchDeviceStateDataUrl = `${constants.API_PATH}/${constants.RESOURCES.UPDATE_DEVICE_STATE}/${window.oneLineProjectId}`
        this.patchDeviceStateQueryString = (deviceId, deviceOpen) => `deviceId=${deviceId}&deviceOpen=${deviceOpen}`

        // DELETE device
        this.deleteDeviceDataUrl = `${constants.API_PATH}/${constants.RESOURCES.DELETE_DEVICE}/${window.oneLineProjectId}`
    }

    postDevice() {
        this.showSpinner()
        this.postDeviceUrl = `${this.postDevicePath}?${this.postDeviceRequestQueryString(this.branchId, this.branchSide)}`
        this.postDeviceRequestBody = this.generateNewDeviceRequest()
        console.log('Device.postDevice()::this.postDeviceUrl', this.postDeviceUrl, '::requestBody', this.postDeviceRequestBody)

        axios.post(this.postDeviceUrl, this.postDeviceRequestBody).then(response => {
            console.log('Device.postDevice()::response', response)

            if (response.data.success)
                this.onPostDeviceSuccess(response)
            else
                this.onPostDeviceError(response)

        }).catch(error => {
            this.onPostDeviceFailure(error)
        })
    }

    onPostDeviceSuccess(response) {

        // Update device state
        this.oneLineDevice = new OneLineDevice(this.postDeviceRequestBody)
        this.oneLineDevice.DeviceId = response.data.message

        // Update branch state
        if (this.branchSide === constants.BRANCH_SIDES.FROM) {
            this.branch.FromDeviceId = this.oneLineDevice.DeviceId
            this.oneLineDevice.DeviceOpen = false
        } else if (this.branchSide === constants.BRANCH_SIDES.TO) {
            this.branch.ToDeviceId = this.oneLineDevice.DeviceId
            this.oneLineDevice.DeviceOpen = false
        }

        App.Project.addDevice(this.oneLineDevice)
        App.Project.updateLastModifiedDate()

        this.updateBranchDeviceFormFields()
        this.app.SelectedProjectElement = this.app.SelectedProjectElement

        this.branch.NeedsGraphUpdate = true

        this.app.projectElementsChanged(false, false, false, false)

        this.app.propertiesOverlay.renderTable(this.oneLineDevice)

        // Update the branch modal UI
        if (this.branchSide === constants.BRANCH_SIDES.FROM) {
            const fromConnectionTitles = document.body.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.CONNECTION_TITLE}`)
            const fromIcons = document.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.ICO_IMG}`)
            const fromRadioButtons = document.body.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.DEVICE_STATUS_CLOSE}`)

            Array.from(fromConnectionTitles).forEach(item => {
                item.setAttribute('data-device-type', this.oneLineDevice.DeviceType)
                this.app.addDeviceDetailsModalListeners(item)
            });

            [
                constants.SELECTORS.FROM_BREAKER_TITLE,
                constants.SELECTORS.FROM_FUSE_TITLE,
                constants.SELECTORS.FROM_RELAY_TITLE,
                constants.SELECTORS.FROM_SWITCH_TITLE
            ].forEach(item => {
                if (document.body.querySelector(item))
                    document.body.querySelector(item).innerHTML = this.oneLineDevice.Name
            })

            Array.from(fromRadioButtons).forEach(item => item.checked = true)
            Array.from(fromIcons).forEach(item =>
                item.src = this.oneLineDevice.getIconFilepath(this.branch, this.oneLineDevice.DeviceOpen, false)
            )

        } else if (this.branchSide === constants.BRANCH_SIDES.TO) {
            const toConnectionTitles = document.body.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.CONNECTION_TITLE}`)
            const toIcons = document.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.ICO_IMG}`)
            const toRadioButtons = document.body.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.DEVICE_STATUS_CLOSE}`)

            Array.from(toConnectionTitles).forEach(item => {
                item.setAttribute('data-device-type', this.oneLineDevice.DeviceType)
                this.app.addDeviceDetailsModalListeners(item)
            });

            [
                constants.SELECTORS.TO_BREAKER_TITLE,
                constants.SELECTORS.TO_FUSE_TITLE,
                constants.SELECTORS.TO_RELAY_TITLE,
                constants.SELECTORS.TO_SWITCH_TITLE
            ].forEach(item => {
                if (document.body.querySelector(item))
                    document.body.querySelector(item).innerHTML = this.oneLineDevice.Name
            })

            Array.from(toRadioButtons).forEach(item => item.checked = true)
            Array.from(toIcons).forEach(item =>
                item.src = this.oneLineDevice.getIconFilepath(this.branch, this.oneLineDevice.DeviceOpen, false)
            )
        }

        // Add a listener for removing the new device
        this.app.addRemoveDeviceListeners()
        this.app.addDeviceStateListeners()

        this.app.notification.showSuccess(getMessage(messages.ADD_DEVICE_SUCCESS, [this.postDeviceRequestBody.Name]))
        console.log('Device.onPostDeviceSuccess()::this.branch', this.branch)
        this.hideSpinner()
    }

    onPostDeviceError(response) {
        this.app.notification.showError(response.data.message)
        this.hideSpinner()
    }

    onPostDeviceFailure(error) {
        this.app.notification.showError(messages.SERVER_ERROR)
        console.error(error)
        this.hideSpinner()
    }

    deleteDevice(deviceId, branchSide, isBranchModalOpen = false) {
        this.deviceId = deviceId
        this.branchSide = branchSide

        console.log('Device.deleteDevice()::this.deviceId', this.deviceId, '::this.branchSide', this.branchSide)

        axios.delete(`${this.deleteDeviceDataUrl}?deviceId=${this.deviceId}`).then(response => {
            console.log('Device.deleteDevice()::response', response)

            if (typeof response.data === 'string') {

                // Clean up string before trying to parse it
                response.data = utils.removeSpecialChars(response.data)
                response.data = JSON.parse(response.data)
            }

            if (response.data.success) {
                this.onDeleteDeviceSuccess(response, isBranchModalOpen)
            } else
                this.onDeleteDeviceError(response)

        }).catch(error => {
            this.onDeleteDeviceServerError(error)
        })
    }

    onDeleteDeviceSuccess(response, isBranchModalOpen) {
        this.device = App.Project.getOneLineDevice(this.deviceId)
        App.Project.removeDevice(this.device)
        App.Project.updateLastModifiedDate()

        this.branch.NeedsGraphUpdate = true

        this.app.projectElementsChanged(false, false, true, false)

        this.app.propertiesOverlay.renderTable(this.device)

        if (this.branchSide === constants.BRANCH_SIDES.FROM) {
            this.branch.FromDeviceId = null
            this.app.fromDevice.deviceId = null
 
            if (isBranchModalOpen) {
                const fromIcons = document.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.ICO_IMG}`)
                Array.from(fromIcons).forEach(item => item.src = '')
            }

        } else if (this.branchSide === constants.BRANCH_SIDES.TO) {
            this.branch.ToDeviceId = null
            this.app.toDevice.deviceId = null

            if (isBranchModalOpen) {
               const toIcons = document.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.ICO_IMG}`)
                Array.from(toIcons).forEach(item => item.src = '')
            }
        }
        
        this.updateBranchDeviceFormFields(isBranchModalOpen)
        
        this.app.notification.showSuccess(response.data.message)
    }

    onDeleteDeviceError(response) {
        this.app.notification.showError(response.data.message)
    }

    onDeleteDeviceServerError(error) {
        this.app.notification.showError(messages.SERVER_ERROR)
        console.error(error)
    }

    showDeviceDetails(deviceId, branchSide) {
        this.deviceId = deviceId
        this.branchSide = branchSide
        this.device = App.Project.getOneLineDevice(this.deviceId)
        const templateName = constants.TEMPLATE_NAMES[this.device.DeviceType]
        const context = {
            data: this.device,
            branchSide: this.branchSide,
            deviceIconFilepath: this.device.getIconFilepath(this.branch, false, false)
        }

        this.modalTemplate = new ModalTemplate(templateName, constants.MODAL_CATEGORIES.DEVICE, context)
        this.modalTemplate.prepareContext()
        this.modalTemplate.execute(null, false, true, true)
        console.log('Device.showDeviceDetails()::context', context)

        this.deviceCatalog = new Catalog(this.app, this.device)
        this.deviceCatalog.addCatalogButtonListener()
        this.deviceCatalog.addSaveAndCatalogButtonListener()

        this.addDeviceDetailsButtonListeners()
    }

    addDeviceDetailsButtonListeners() {
        const destroyDeviceModalButtons = document.body.querySelectorAll(constants.SELECTORS.DESTROY_DEVICE_BUTTON)
        Array.from(destroyDeviceModalButtons).forEach(item => {
            utils.addEvent(item, 'click', () => this.destroyDeviceModal())
        })
        utils.addEvent(
            document.body.querySelector(constants.SELECTORS.SAVE_DEVICE_BUTTON),
            'click',
            () => this.patchDevice(null)
        )

        this.deviceCatalog.addSaveAndCatalogButtonListener()
    }

    patchDevice(addToCatalogData = null) {
        this.requestBody = this.generateDeviceRequestBody(addToCatalogData)

        // Make sure equipment name is unique
        if (!this.app.isEquipmentNameUnique(this.requestBody.DeviceData.Name, this.requestBody.DeviceData.DeviceId)) {
            this.app.notification.showError(getMessage(messages.EQUIPMENT_NAME_NOT_UNIQUE, [this.requestBody.DeviceData.Name]))
            return false
        }

        this.app.validator.validate(constants.MODAL_FORM_IDS[this.device.DeviceType][0], () => {
            console.log('Device.patchDevice()::this.requestBody', this.requestBody)

            this.app.synchronousFetcher.patch(this.patchDeviceDataUrl, this.requestBody).then(response => {
                console.log('Device.patchDevice()::response', response)

                if (response.data.success)
                    this.onPatchDeviceSuccess(response)
                else
                    this.onPatchDeviceError(response)

            }).catch(error => {
                this.onPatchDeviceFailure(error)
            })
        })
    }

    onPatchDeviceSuccess(response) {

        // Update device in project state
        this.device.updateData(this.requestBody.DeviceData)
        this.branch.NeedsGraphUpdate = true
        App.Project.updateLastModifiedDate()

        this.app.projectElementsChanged(false, false, false, false)

        this.app.locatorOverlay.highlightRow(this.device)
        this.app.propertiesOverlay.renderTable(this.device)

        // Update local state for default device and show the appropriate success toast
        if (this.requestBody.AddToCatalog && this.requestBody.AddToCatalog.DefaultCatalogItem) {

            // "Convert" a regular device into a "default device" and set it in the local state
            const defaultDeviceData = App.Project.mapDeviceToDefaultDevice(this.device.DeviceType, this.requestBody.DeviceData, this.requestBody.AddToCatalog)
            App.Project.updateDefaultDevice(null, defaultDeviceData)
            this.app.notification.showSuccess(getMessage(messages.ADD_DEFAULT_CATALOG_ITEM_SUCCESS, [this.requestBody.AddToCatalog.CatalogName]))

        } else if (this.requestBody.AddToCatalog) {
            this.app.notification.showSuccess(getMessage(messages.ADD_CATALOG_ITEM_SUCCESS, [this.requestBody.AddToCatalog.CatalogName]))

        } else if (this.requestBody.NewDefaultCatalogItemId !== null) {
            App.Project.updateDefaultDevice(this.requestBody.NewDefaultCatalogItemId, this.requestBody.DeviceData)
            this.app.notification.showSuccess(getMessage(messages.ADD_DEFAULT_CATALOG_ITEM_SUCCESS, [this.requestBody.DeviceData.Name]))
        }

        // Update device name, device status radio buttons, and device icon on parent form
        if (this.branchSide === constants.BRANCH_SIDES.FROM) {
            const fromConnectionTitles = document.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.CONNECTION_TITLE}`)
            const fromIcons = document.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.ICO_IMG}`)
            let fromRadioButtons = document.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.DEVICE_STATUS_CLOSE}`)

            Array.from(fromConnectionTitles).forEach(item => {
                document.getElementById(item.id).innerHTML = this.requestBody.DeviceData.Name
                this.app.addDeviceDetailsModalListeners(item)
            })

            if (this.requestBody.DeviceData.DeviceOpen)
                fromRadioButtons = document.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.DEVICE_STATUS_OPEN}`)
            
            Array.from(fromRadioButtons).forEach(item => item.checked = true)
            Array.from(fromIcons).forEach(item => item.src = this.device.getIconFilepath(this.branch, this.device.DeviceOpen, false))
        
        
        } else if (this.branchSide === constants.BRANCH_SIDES.TO) {
            const toConnectionTitles = document.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.CONNECTION_TITLE}`)
            const toIcons = document.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.ICO_IMG}`)
            let toRadioButtons = document.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.DEVICE_STATUS_CLOSE}`)

            Array.from(toConnectionTitles).forEach(item => {
                document.getElementById(item.id).innerHTML = this.requestBody.DeviceData.Name
                this.app.addDeviceDetailsModalListeners(item)
            })

            if (this.requestBody.DeviceData.DeviceOpen)
                toRadioButtons = document.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.DEVICE_STATUS_OPEN}`)

            Array.from(toRadioButtons).forEach(item => item.checked = true)
            Array.from(toIcons).forEach(item => item.src = this.device.getIconFilepath(this.branch, this.device.DeviceOpen, false))

        } else {
            console.error('Device.onPatchDeviceSuccess(): invalid branchSide value')
        }

        this.destroyDeviceModal()
        this.app.notification.showSuccess(response.data.message)
        App.Project.updateLastModifiedDate()
    }

    onPatchDeviceError(response) {
        this.app.notification.showError(response.data.message)
    }

    onPatchDeviceFailure(error) {
        this.app.notification.showError(messages.SERVER_ERROR)
        console.error(error)
    }

    destroyDeviceModal() {
        constants.MODALS_BY_TYPE[this.device.DeviceType].forEach(modal => {
            const element = document.getElementById(modal)
            element.parentNode.removeChild(element)
        })
        
        // Get rid of the locator's device instance. But preserve any branch's existing
        // ToDevice/FromDevice instances, because the devices continue to exist in the parent branch modal.
        // They'll get removed automatically when the parent branch modal is destroyed.
        if (this.app.locatorOverlay.device) this.app.locatorOverlay.device = null
        
        // Do nullify the catalog instance for this device details modal
        this.deviceCatalog = null
    }

    updateDeviceState(deviceId, deviceOpen) {
        this.deviceId = deviceId
        this.deviceOpen = deviceOpen

        const url = `${this.patchDeviceStateDataUrl}?${this.patchDeviceStateQueryString(this.deviceId, this.deviceOpen)}`
        console.log('Device.updateDeviceState()::url', url)

        this.app.synchronousFetcher.patch(url).then(response => {
            console.log('Device.updateDeviceState()::response', response)

            if (response.data.success) {
                this.onUpdateDeviceStatusSuccess()
            } else
                this.onUpdateDeviceStatusError(response)

        }).catch(error => {
            this.onUpdateDeviceStatusFailure(error)
        })
    }

    onUpdateDeviceStatusSuccess() {
        if (this.branchSide === constants.BRANCH_SIDES.FROM) {
            this.branch.FromDeviceId = this.deviceId
            this.app.fromDevice.device.DeviceOpen = this.deviceOpen === "true" ? true : false

        } else if (this.branchSide === constants.BRANCH_SIDES.TO) {
            this.branch.ToDeviceId = this.deviceId
            this.app.toDevice.device.DeviceOpen = this.deviceOpen === "true" ? true : false
        }

        this.branch.NeedsGraphUpdate = true
        this.app.projectElementsChanged(false, false, false, false)

        this.device = App.Project.getOneLineDevice(this.deviceId)
        this.app.notification.showSuccess(`Device status for <strong>${this.device.Name}</strong> changed to <strong>${this.device.DeviceOpen ? 'open' : 'closed'}</strong>`)
        App.Project.updateLastModifiedDate()
    }

    onUpdateDeviceStatusError(response) {
        this.app.notification.showError(response.data.message)
    }

    onUpdateDeviceStatusFailure(error) {
        this.app.notification.showError(messages.SERVER_ERROR)
        console.error(error)
    }

    updateBranchDeviceFormFields(isBranchModalOpen) {
        if (isBranchModalOpen) {
            document.querySelector(constants.SELECTORS.FROM_DEVICE_ID).value = this.branch.FromDeviceId

        if (this.branch.BranchType !== constants.BRANCH_TYPES.DCON)
            document.querySelector(constants.SELECTORS.TO_DEVICE_ID).value = this.branch.ToDeviceId
        }
    }

    generateNewDeviceRequest() {
        console.log('Device.generateNewDeviceRequest()::this.deviceType', this.deviceType)
        const defaultDevice = App.Project.getDefaultDevice(this.deviceType)
        console.log('Device.generateNewDeviceRequest()::defaultDevice', defaultDevice)

        let requestProperties = {
            DeviceId: null,
            DeviceType: this.deviceType,
            Name: this.app.getUniqueEquipmentName(this.deviceType),
            Description: '',
            CatalogName: `Default ${utils.capitalizeWords(constants.LABELS[this.deviceType])}`,
            Manufacturer: '',
            PartNumber: '',
            ModelNumber: '',
            DeviceOpen: false,
            Notes: ''
        }

        if (defaultDevice) {
            requestProperties = {
                ...requestProperties,
                ...defaultDevice
            }
        }

        let requestDetails

        switch (this.deviceType) {
            case constants.DEVICE_TYPES.BREAKER:
                requestDetails = {
                    AmpRating: null,
                    InterruptRating: null,
                    VoltageRating: this.deviceRatedVoltage,
                    FrameSize: '',
                    FrameType: '',
                    TripUnitType: ''
                }
                break

            case constants.DEVICE_TYPES.FUSE:
                requestDetails = {
                    AmpRating: null,
                    InterruptRating: null,
                    VoltageRating: this.deviceRatedVoltage,
                    FuseClass: '',
                    FuseSpeed: '',
                    FuseType: ''
                }
                break

            case constants.DEVICE_TYPES.RELAY:
                requestDetails = {
                    CTRatioNumerator: null,
                    CTRatioDenominator: null,
                    RelayType: '',
                    TapSetting: null,
                    TimeDial: null
                }
                break

            case constants.DEVICE_TYPES.SWITCH:
                requestDetails = {
                    AmpRating: null,
                    InterruptRating: null,
                    VoltageRating: this.deviceRatedVoltage,
                    FrameSize: '',
                    FrameType: '',
                    TripUnitType: ''
                }
                break
        }

        if (defaultDevice && defaultDevice.Details) {
            requestDetails = {
                ...requestDetails,
                ...defaultDevice.Details
            }
        }

        const requestBody = {
            ...requestProperties,
            Details: { ...requestDetails }
        }

        return requestBody
    }     

    generateDeviceRequestBody(addToCatalogData) {
        const requestProperties = {
            DeviceId: utils.forms.getHiddenFieldValue('device-id'),
            DeviceType: utils.forms.getHiddenFieldValue('device-type'),
            Name: utils.forms.getTextFieldValue('device-name'),
            Description: utils.forms.getTextFieldValue('device-description'),
            CatalogName: utils.forms.getTextFieldValue('device-catalog-name'),
            Manufacturer: utils.forms.getTextFieldValue('device-manufacturer'),
            PartNumber: utils.forms.getTextFieldValue('device-part-number'),
            ModelNumber: utils.forms.getTextFieldValue('device-model-number'),
            DeviceOpen: utils.forms.getRadioFieldValue('device-status-open-closed') === '1' ? true : false,
            Notes: utils.forms.getTextAreaFieldValue('device-notes'),
        }
        let requestDetails

        switch (this.deviceType) {
            case constants.DEVICE_TYPES.BREAKER:
            case constants.DEVICE_TYPES.SWITCH:
                requestDetails = {
                    AmpRating: utils.forms.getConvertedNumericFieldValue('device-amp-rating', constants.UNIT_TYPES.CURRENT, App.Project.CurrentUnits),
                    InterruptRating: utils.forms.getConvertedNumericFieldValue('device-interrupt-rating', constants.UNIT_TYPES.CURRENT, App.Project.CurrentUnits),
                    VoltageRating: utils.forms.getConvertedNumericFieldValue('device-voltage-rating', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
                    FrameSize: utils.forms.getTextFieldValue('device-frame-size'),
                    FrameType: utils.forms.getTextFieldValue('device-frame-type'),
                    TripUnitType: utils.forms.getTextFieldValue('device-trip-unit-type'),
                    Notes: null
                }
                break

            case constants.DEVICE_TYPES.FUSE:
                requestDetails = {
                    AmpRating: utils.forms.getConvertedNumericFieldValue('device-amp-rating', constants.UNIT_TYPES.CURRENT, App.Project.CurrentUnits),
                    InterruptRating: utils.forms.getConvertedNumericFieldValue('device-interrupt-rating', constants.UNIT_TYPES.CURRENT, App.Project.CurrentUnits),
                    VoltageRating: utils.forms.getConvertedNumericFieldValue('device-voltage-rating', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
                    FuseClass: utils.forms.getTextFieldValue('device-fuse-class'),
                    FuseSpeed: utils.forms.getTextFieldValue('device-fuse-speed'),
                    FuseType: utils.forms.getTextFieldValue('device-fuse-type'),
                    Notes: null
                }
                break

            case constants.DEVICE_TYPES.RELAY:
                requestDetails = {
                    CTRatioNumerator: utils.forms.getNumericFieldValue('device-ct-ratio-numerator'),
                    CTRatioDenominator: utils.forms.getNumericFieldValue('device-ct-ratio-denominator'),
                    RelayType:  utils.forms.getTextFieldValue('device-relay-type'),
                    TapSetting: utils.forms.getNumericFieldValue('device-tap-setting'),
                    TimeDial: utils.forms.getNumericFieldValue('device-time-dial'),
                    Notes: null
                }
                break
        }

        const requestBody = {
            DeviceData: {
                ...requestProperties,
                Details: { ...requestDetails }
            },
            NewDefaultCatalogItemId: utils.forms.getNullableTextFieldValue('device-new-default-catalog-item-id'),
            AddToCatalog: addToCatalogData
        }

        return requestBody
    }

    showSpinner() {

    }

    hideSpinner() {

    }
}
