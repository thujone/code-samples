/****************************************************************************
 ** Load Shape modal-on-modal for uploading / viewing 8760 files.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import App from './app.js'
import utils from './utils.js'
import constants from './constants.js'
import messages, { getMessage } from './messages.js'
import { initLoadModal } from './modal-listeners/nodes/load.js'

export default class LoadShape {
    constructor(loadNode, app) {
        this.app = app
        this.postLoadShapeDataUrl = `${constants.API_PATH}/${constants.RESOURCES.POST_LOAD_SHAPE_DETAILS}/${window.oneLineProjectId}`
        this.deleteLoadShapeDataUrl = `${constants.API_PATH}/${constants.RESOURCES.DELETE_LOAD_SHAPE_DETAILS}/${window.oneLineProjectId}`
        this.formData

        this._nodeId = loadNode.NodeId,
        this._name = loadNode.Details.LoadShapeName,
        this._year = 2019,
        this._month = 1,
        this._day = 1,
        this._resolution = 4
        this._units = constants.UNITS.kWh
        this._preservePeak = true
        this._loadShapeData = null

        this.initializeButtonListeners()
    }

    get nodeId() { return this._nodeId }
    get name() { return this._name }
    get year() { return this._year }
    get month() { return this._month }
    get day() { return this._day }
    get resolution() { return this._resolution }
    get units() { return this._units }
    get preservePeak() { return this._preservePeak }
    get loadShapeData() { return this._loadShapeData }

    get loadShapeDetails() {
      return {
        nodeId: this.nodeId,
        name: this.name,
        year: this.year,
        month: this.month,
        day: this.day,
        resolution: this.resolution,
        units: this.units,
        preservePeak: this.preservePeak,
        loadShapeData: this.loadShapeData
      }
    }

    set nodeId(value) { this._nodeId = value }
    set name(value) { this._name = value }
    set year(value) { this._year = value }
    set month(value) { this._month = value }
    set day(value) { this._day = value }
    set resolution(value) { this._resolution = value }
    set units(value) { this._units = value }
    set preservePeak(value) { this._preservePeak = value }
    set loadShapeData(value) { this._loadShapeData = value }

    initializeButtonListeners() {
      // Save button
      const uploadButton = document.getElementById(constants.SELECTORS.UPLOAD_LOAD_SHAPE_BUTTON)
      utils.addEvent(uploadButton, 'click', () => this.handleUploadButtonClick())

      const cancelLoadShapeButton = document.getElementById(constants.SELECTORS.CANCEL_LOAD_SHAPE_BUTTON)
      utils.addEvent(cancelLoadShapeButton, 'click', () => this.handleCancelLoadShapeButtonClick())

      // Cancel button
      const cancelButton = document.getElementById(constants.SELECTORS.IMPORTING_LOAD_SHAPE_CANCEL_BUTTON)
      utils.addEvent(cancelButton, 'click', () => this.handleCancelButtonClick())

      // Back button
      const backButton = document.getElementById(constants.SELECTORS.NREL_DATA_GO_TO_STEP_1)
      utils.addEvent(backButton, 'click', () => this.handleBackButtonClick())


      const deleteButton = document.getElementById(constants.SELECTORS.DELETE_LOAD_SHAPE_BUTTON)
      utils.addEvent(deleteButton, 'click', () => this.handleDeleteButtonClick())
    }

    handleUploadButtonClick() {
      this.processLoadShapeForm()
      this.generateLoadShapeRequest()
      this.postLoadShape()
    }

    handleCancelLoadShapeButtonClick() {
      jQuery(`#${constants.SELECTORS.ENTER_LOAD_SHAPE}`).modal('hide')
    }

    handleBackButtonClick() {
      this.resetCatalogOfShapesForm(true, true)
    }

    handleCancelButtonClick() {
      this.resetCatalogOfShapesForm(true, false)
    }

    handleDeleteButtonClick() {
      this.deleteLoadShape()
    }

    processLoadShapeForm() {
      this.nodeId = utils.forms.getTextFieldValue('node-id')
      this.year = Number(utils.forms.getSelectFieldValue('load-shape-year'))
      this.month = Number(utils.forms.getSelectFieldValue('load-shape-month'))
      this.day = Number(utils.forms.getSelectFieldValue('load-shape-day'))
      this.resolution = Number(utils.forms.getSelectFieldValue('load-shape-time-step'))
      this.units = this.determineVoltageUnits('load-voltage-units')
      this.preservePeak = this.determinePreservePeak('load-shape-preserve-peak')
      this.loadShapeData = document.getElementById('load-upload-file').files[0]
      this.name = this.loadShapeData && this.loadShapeData.name ? `File: ${this.loadShapeData.name}` : ''
    }

    determineVoltageUnits(value) {
      if (utils.forms.getCheckboxFieldValue(value) !== constants.UNITS.kWh)
        return constants.UNITS.kWh
      else return constants.UNITS.kW
    }

    determinePreservePeak(value) {
      if (this.units === constants.UNITS.kWh || utils.forms.getCheckboxFieldValue(value) !== "1")
        return false
      else return true
    }

    generateLoadShapeRequest() {
      this.formData = new FormData()
      this.formData.set('nodeId', this.nodeId)
      this.formData.set('name', this.name)
      this.formData.set('year', this.year)
      this.formData.set('month', this.month)
      this.formData.set('day', this.day)
      this.formData.set('resolution', this.resolution)
      this.formData.set('units', this.units)
      this.formData.set('preservePeak', this.preservePeak)
      this.formData.append('loadShapeData', this.loadShapeData)
    }

    postLoadShape() {
      for (const entry of this.formData.entries())
        console.log('LoadShape.postLoadShape()::formData', entry[0], entry[1])

      this.showSpinner()
      this.app.synchronousFetcher.post(this.postLoadShapeDataUrl, this.formData).then(response => {
        console.log('LoadShape.postLoadShape()::response', response)

        if (typeof response.data === 'string') {
          
          // Clean up string before trying to parse it
          response.data = utils.removeSpecialChars(response.data)
          response.data = JSON.parse(response.data)
        }

        if (response.data.success)
          this.onPostLoadShapeSuccess(response, false)
        else
          this.onPostLoadShapeError(response)

      }).catch(error => {
        this.onPostLoadShapeServerError(error)
      })
    }

    onPostLoadShapeSuccess(response, isNrel = false) {
      const displayDate = `${constants.MONTHS[this.month]} ${this.day}, ${this.year}`
      const loadShapeData = {
        loadShapeDate: isNrel ? null : displayDate,
        loadShapeName: this.name,
        loadShapePreservePeak: isNrel ? false : this.preservePeak,
        loadShapeResolution: isNrel ? null : this.resolution,
        loadShapeUnits: isNrel ? null : this.units,
        ratedPower: response.data.message,
        ratedPowerUnits: constants.UNITS.kW
      }

      this.app.SelectedProjectElement.updateLoadShapeData(loadShapeData)
      this.app.projectElementsChanged(true, false, false, false)

      this.resetCatalogOfShapesForm(true, false)

      document.getElementById(constants.SELECTORS.LOAD_SHAPE_TIME_STEP_READONLY).value = isNrel ? '' : utils.getFieldOptionLabelByValue(constants.FIELD_OPTIONS.LOAD_SHAPE_TIME_STEPS, this.resolution)
      document.getElementById(constants.SELECTORS.LOAD_SHAPE_START_DATE_READONLY).value = loadShapeData.loadShapeDate
      document.getElementById(constants.SELECTORS.LOAD_SHAPE_UNITS_READONLY).value = loadShapeData.loadShapeUnits
      document.getElementById(constants.SELECTORS.RATED_POWER).value = loadShapeData.ratedPower

      document.getElementById(constants.SELECTORS.DELETE_LOAD_SHAPE_BUTTON).classList.remove('display-none')
      utils.showInlineBlock(`#${constants.SELECTORS.DELETE_LOAD_SHAPE_BUTTON}`)

      if (!isNrel) {
        this.app.notification.showSuccess(getMessage(messages.UPLOAD_LOAD_SHAPE_SUCCESS, [this.name]))
        this.showReadOnlyFields()
      } else {
        this.app.notification.showSuccess(getMessage(messages.IMPORT_NREL_LOAD_SHAPE_SUCCESS, [this.name]))
        this.hideReadOnlyFields()
      }

      // Re-draw the thumbnail chart and anything else that's been updated
      initLoadModal(this.app)

      console.log('LoadShape.onPostLoadShapeSuccess()::this.app.SelectedProjectElement', this.app.SelectedProjectElement, 'loadShapeData', loadShapeData)
      this.hideSpinner()
      App.Project.updateLastModifiedDate()
    }

    onPostLoadShapeError(response) {
      this.app.notification.showError(response.data.message)
      this.hideSpinner()
    }

    onPostLoadShapeServerError(error) {
      this.app.notification.showError(messages.SERVER_ERROR)
      console.error(error)
      this.hideSpinner()
    }

    resetCatalogOfShapesForm(isNrel, isBackButton = false) {
      if (!isBackButton)
        jQuery(`#${constants.SELECTORS.ENTER_LOAD_SHAPE}`).modal('hide')

      document.getElementById(constants.SELECTORS.LOAD_SHAPE_READONLY).value = this.name
      document.getElementById(constants.SELECTORS.LOAD_SHAPE_START_DATE_READONLY).value = isNrel ? '' : displayDate
      document.getElementById(constants.SELECTORS.LOAD_SHAPE_UNITS_READONLY).value = isNrel ? '' : this.units
      document.getElementById(constants.SELECTORS.RATED_POWER_UNITS).selectedIndex = 0
      document.getElementById(constants.SELECTORS.BUILDING_TYPE).selectedIndex = 0
      document.getElementById(constants.SELECTORS.BUILDING_TYPE).value = ''
      document.getElementById(constants.SELECTORS.BUILDING_AGE).selectedIndex = 0
      document.getElementById(constants.SELECTORS.BUILDING_TYPE).value = ''
      document.getElementById(constants.SELECTORS.ANNUAL_ELECTRICITY_PURCHASES_MULTIPLIER).value = 1
      document.getElementById(constants.SELECTORS.NREL_LOAD_SHAPE_FORM).reset()
      document.getElementById(constants.SELECTORS.ENTER_LOAD_SHAPE_FORM).reset()
      jQuery(constants.SELECTORS.ENERGY_ENTRY_ERRORS).hide()
      jQuery(constants.SELECTORS.ENERGY_ENTRY_WARNINGS).hide()
      jQuery(constants.SELECTORS.LOAD_SHAPE_PREVIEW).hide()
      jQuery(constants.SELECTORS.SELECT_BUILDING_TYPE_AND_AGE).show()
      jQuery(constants.SELECTORS.NREL_ANNUAL_ELECTRICITY_PURCHASES_MULTIPLIER_ENTER_SINGLE).click()
    }

    showSpinner() {
      const uploadButton = document.getElementById(constants.SELECTORS.UPLOAD_LOAD_SHAPE_BUTTON)
      uploadButton.innerHTML = '<div style="width: 120px; height: 19px"><i class="fas fa-spinner fa-spin" /></div>'
    }

    hideSpinner() {
      setTimeout(() => {
        const uploadButton = document.getElementById(constants.SELECTORS.UPLOAD_LOAD_SHAPE_BUTTON)
        uploadButton.innerHTML = 'Upload Load Shape'
      }, 500)
    }

    showReadOnlyFields() {
      document.querySelector(constants.SELECTORS.LOAD_SHAPE_START_DATE_WRAPPER).style.display = 'block'
      document.querySelector(constants.SELECTORS.LOAD_SHAPE_UNITS_TIME_WRAPPER).style.display = 'flex'
    }

    hideReadOnlyFields() {
      utils.hide(`${constants.SELECTORS.LOAD_SHAPE_START_DATE_WRAPPER}, ${constants.SELECTORS.LOAD_SHAPE_UNITS_TIME_WRAPPER}`)
    }

    showSmallPeakChart() {
      utils.show(constants.SELECTORS.SMALL_PEAK_LOAD_CHART_WRAPPER)
    }

    hideSmallPeakChart() {
      utils.hide(constants.SELECTORS.SMALL_PEAK_LOAD_CHART_WRAPPER)
    }

    deleteLoadShape() {
      console.log('LoadShape.deleteLoadShape()::this.nodeId', this.nodeId)

      this.app.synchronousFetcher.delete(this.deleteLoadShapeDataUrl, { params: { nodeId: this.nodeId } }).then(response => {
        console.log('LoadShape.deleteLoadShape()::response', response)
        
        if (typeof response.data === 'string') {
          
          // Clean up string before trying to parse it
          response.data = utils.removeSpecialChars(response.data)
          response.data = JSON.parse(response.data)
        }

        if (response.data.success) {
          this.onDeleteLoadShapeSuccess(response)
        } else
          this.onDeleteLoadShapeError(response)

      }).catch(error => {
        this.onDeleteLoadShapeServerError(error)
      })
    }

    onDeleteLoadShapeSuccess(response) {
      const loadShapeData = {
        loadShapeDate: null,
        loadShapeName: '',
        loadShapePreservePeak: false,
        loadShapeResolution: null,
        loadShapeUnits: null
      }
      this.app.SelectedProjectElement.updateLoadShapeData(loadShapeData)
      this.app.projectElementsChanged(true, false, false, false)

      document.getElementById('load-shape-readonly').value = ''
      document.getElementById('load-shape-start-date-readonly').value = ''
      document.getElementById('load-shape-units-readonly').value = ''
      document.getElementById('load-shape-time-step-readonly').value = ''

      utils.hide(`#${constants.SELECTORS.DELETE_LOAD_SHAPE_BUTTON}`)
      this.hideSmallPeakChart()
      this.app.notification.showSuccess(messages.DELETE_LOAD_SHAPE_SUCCESS)
      App.Project.updateLastModifiedDate()
    }

    onDeleteLoadShapeError(response) {
      this.app.notification.showError(response.data.message)
    }

    onDeleteLoadShapeServerError(error) {
      this.app.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    }
}
