/****************************************************************************
 ** Dispatch Shape modal-on-modal for uploading / viewing 8760 files for
 ** Generators, and for future Solar and Wind.
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import App from './app.js'
import utils from './utils.js'
import constants from './constants.js'
import messages, { getMessage } from './messages.js'
import { initGeneratorModal } from './modal-listeners/nodes/generator.js'

export default class DispatchShape {
    constructor(generatorNode, app) {
        this.app = app
        this.postDispatchShapeDataUrl = `${constants.API_PATH}/${constants.RESOURCES.POST_DISPATCH_SHAPE}/${window.oneLineProjectId}`
        this.deleteDispatchShapeDataUrl = `${constants.API_PATH}/${constants.RESOURCES.DELETE_DISPATCH_SHAPE}/${window.oneLineProjectId}`
        this.getDispatchChartDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_DISPATCH_SHAPE_CHART_DATA}/${window.oneLineProjectId}`
        this.formData

        this._nodeId = generatorNode.NodeId,
        this._nodeType = constants.NODE_TYPES.GENERATOR,
        this._name = generatorNode.Details.DispatchShapeName,
        this._year = 2019,
        this._month = 1,
        this._day = 1,
        this._resolution = 4
        this._units = constants.UNITS.kWh
        this._preservePeak = true
        this._dispatchShapeData = null

        this.initializeButtonListeners()
    }

    get nodeId() { return this._nodeId }
    get nodeType() { return this._nodeType }
    get name() { return this._name }
    get year() { return this._year }
    get month() { return this._month }
    get day() { return this._day }
    get resolution() { return this._resolution }
    get units() { return this._units }
    get preservePeak() { return this._preservePeak }
    get dispatchShapeData() { return this._dispatchShapeData }

    get dispatchShapeDetails() {
      return {
        nodeId: this.nodeId,
        nodeType: this.nodeType,
        name: this.name,
        year: this.year,
        month: this.month,
        day: this.day,
        resolution: this.resolution,
        units: this.units,
        preservePeak: this.preservePeak,
        dispatchShapeData: this.dispatchShapeData
      }
    }

    set nodeId(value) { this._nodeId = value }
    set nodeType(value) { this._nodeType = value }
    set name(value) { this._name = value }
    set year(value) { this._year = value }
    set month(value) { this._month = value }
    set day(value) { this._day = value }
    set resolution(value) { this._resolution = value }
    set units(value) { this._units = value }
    set preservePeak(value) { this._preservePeak = value }
    set dispatchShapeData(value) { this._dispatchShapeData = value }

    initializeButtonListeners() {
      const openModalButton = document.getElementById(constants.SELECTORS.OPEN_DISPATCH_MODAL_BUTTON)
      utils.addEvent(openModalButton, 'click', () => this.handleOpenModalButtonClick())

      const deleteButton = document.getElementById(constants.SELECTORS.DELETE_DISPATCH_BUTTON)
      utils.addEvent(deleteButton, 'click', () => this.handleDeleteButtonClick())

      const viewButton = document.getElementById(constants.SELECTORS.VIEW_DISPATCH_BUTTON)
      utils.addEvent(viewButton, 'click', () => this.handleViewButtonClick())

      if (this.name !== '') {
        deleteButton.style.display = 'inline'
        viewButton.style.display = 'inline'
      }

      const uploadButton = document.getElementById(constants.SELECTORS.UPLOAD_DISPATCH_BUTTON)
      utils.addEvent(uploadButton, 'click', () => this.handleUploadButtonClick())

      const cancelButton = document.getElementById(constants.SELECTORS.CANCEL_DISPATCH_BUTTON)
      utils.addEvent(cancelButton, 'click', () => this.handleCancelDispatchButtonClick())
    }

    handleOpenModalButtonClick() {
      jQuery(`#${constants.SELECTORS.ENTER_DISPATCH_SHAPE}`).modal('show')
    }

    handleUploadButtonClick() {
      this.processDispatchShapeForm()
      this.generateDispatchShapeRequest()
      this.postDispatchShape()
    }

    handleCancelDispatchButtonClick() {
      jQuery(`#${constants.SELECTORS.ENTER_DISPATCH_SHAPE}`).modal('hide')
    }

    handleBackButtonClick() {
      this.resetCatalogOfShapesForm(true, true)
    }

    handleDeleteButtonClick() {
      this.deleteDispatchShape()
    }

    handleViewButtonClick() {
      $('#dispatch-chart-full').modal('show')
      window.getFullDispatchChart('week')
    }

    processDispatchShapeForm() {
      this.nodeType = constants.NODE_TYPES.GENERATOR
      this.nodeId = utils.forms.getHiddenFieldValue('node-id')
      this.year = Number(utils.forms.getSelectFieldValue('dispatch-shape-year'))
      this.month = Number(utils.forms.getSelectFieldValue('dispatch-shape-month'))
      this.day = Number(utils.forms.getSelectFieldValue('dispatch-shape-day'))
      this.resolution = Number(utils.forms.getSelectFieldValue('dispatch-shape-time-step'))
      this.units = this.determineVoltageUnits('dispatch-voltage-units')
      this.preservePeak = this.determinePreservePeak('dispatch-shape-preserve-peak')
      this.dispatchShapeData = document.getElementById('dispatch-upload-file').files[0]
      this.name = this.dispatchShapeData && this.dispatchShapeData.name ? `${this.dispatchShapeData.name}` : ''
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

    generateDispatchShapeRequest() {
      this.formData = new FormData()
      this.formData.set('nodeId', this.nodeId)
      this.formData.set('nodeType', this.nodeType)
      this.formData.set('name', this.name)
      this.formData.set('year', this.year)
      this.formData.set('month', this.month)
      this.formData.set('day', this.day)
      this.formData.set('resolution', this.resolution)
      this.formData.set('units', this.units)
      this.formData.set('preservePeak', this.preservePeak)
      this.formData.append('dispatchShapeData', this.dispatchShapeData)
    }

    postDispatchShape() {
      for (const entry of this.formData.entries())
        console.log('DispatchShape.postDispatchShape()::formData', entry[0], entry[1])

      this.showSpinner()

      this.app.synchronousFetcher.post(this.postDispatchShapeDataUrl, this.formData).then(response => {
        console.log('DispatchShape.postDispatchShape()::response', response)

        if (response.data.success)
          this.onPostDispatchShapeSuccess(response)
        else
          this.onPostDispatchShapeError(response)

      }).catch(error => {
        this.onPostDispatchShapeServerError(error)
      })
    }

    onPostDispatchShapeSuccess(response) {
      const displayDate = `${constants.MONTHS[this.month]} ${this.day}, ${this.year}`
      const dispatchShapeData = {
        dispatchShapeDate: displayDate,
        dispatchShapeName: this.name,
        dispatchShapePreservePeak: this.preservePeak,
        dispatchShapeResolution: this.resolution,
        dispatchShapeUnits: this.units
      }

      this.app.SelectedProjectElement.updateDispatchShapeData(dispatchShapeData)
      this.app.projectElementsChanged(true, false, false, false)

      document.getElementById(constants.SELECTORS.DELETE_DISPATCH_BUTTON).classList.remove('display-none')
      utils.show(`#${constants.SELECTORS.DELETE_DISPATCH_BUTTON}`)
      utils.show(`#${constants.SELECTORS.VIEW_DISPATCH_BUTTON}`)
      jQuery(`#${constants.SELECTORS.ENTER_DISPATCH_SHAPE}`).modal('hide')
      document.getElementById(constants.SELECTORS.ENTER_DISPATCH_SHAPE_FORM).reset()

      this.app.notification.showSuccess(getMessage(messages.UPLOAD_DISPATCH_SHAPE_SUCCESS, [this.name]))

      initGeneratorModal(this.app)

      console.log('DispatchShape.onPostDispatchShapeSuccess()::this.app.SelectedProjectElement', this.app.SelectedProjectElement, 'dispatchShapeData', dispatchShapeData)
      this.hideSpinner()
      App.Project.updateLastModifiedDate()
    }

    onPostDispatchShapeError(response) {
      this.app.notification.showError(response.data.message)
      this.hideSpinner()
    }

    onPostDispatchShapeServerError(error) {
      this.app.notification.showError(error.message)
      console.error(error)
      this.hideSpinner()
    }

    showSpinner() {
      const uploadButton = document.getElementById(constants.SELECTORS.UPLOAD_DISPATCH_BUTTON)
      uploadButton.innerHTML = '<div style="width: 143px; height: 19px"><i class="fas fa-spinner fa-spin" /></div>'
    }

    hideSpinner() {
      setTimeout(() => {
        const uploadButton = document.getElementById(constants.SELECTORS.UPLOAD_DISPATCH_BUTTON)
        uploadButton.innerHTML = 'Upload Dispatch Shape'
      }, 500)
    }

    showReadOnlyFields() {
      document.querySelector(constants.SELECTORS.DISPATCH_SHAPE_START_DATE_WRAPPER).style.display = 'block'
      document.querySelector(constants.SELECTORS.DISPATCH_SHAPE_UNITS_TIME_WRAPPER).style.display = 'flex'
    }

    hideReadOnlyFields() {
      utils.hide(`${constants.SELECTORS.DISPATCH_SHAPE_START_DATE_WRAPPER}, ${constants.SELECTORS.DISPATCH_SHAPE_UNITS_TIME_WRAPPER}`)
    }

    deleteDispatchShape() {
      console.log('DispatchShape.deleteDispatchShape()::this.nodeId', this.nodeId)

      this.app.synchronousFetcher.delete(this.deleteDispatchShapeDataUrl, {
        params: {
          nodeId: this.nodeId,
          nodeType: this.nodeType
        }
      }).then(response => {
        console.log('DispatchShape.deleteDispatchShape()::response', response)

        if (response.data.success) {
          this.onDeleteDispatchShapeSuccess(response)
        } else
          this.onDeleteDispatchShapeError(response)

      }).catch(error => {
        this.onDeleteDispatchShapeServerError(error)
      })
    }

    onDeleteDispatchShapeSuccess(response) {
      const dispatchShapeData = {
        dispatchShapeDate: null,
        dispatchShapeName: '',
        dispatchShapePreservePeak: false,
        dispatchShapeResolution: null,
        dispatchShapeUnits: null
      }
      this.app.SelectedProjectElement.updateDispatchShapeData(dispatchShapeData)
      this.app.projectElementsChanged(true, false, false, false)

      utils.hide(`#${constants.SELECTORS.DELETE_DISPATCH_BUTTON}`)
      utils.hide(`#${constants.SELECTORS.VIEW_DISPATCH_BUTTON}`)
      this.app.notification.showSuccess(messages.DELETE_DISPATCH_SHAPE_SUCCESS)
      App.Project.updateLastModifiedDate()
    }

    onDeleteDispatchShapeError(response) {
      this.app.notification.showError(response.data.message)
    }

    onDeleteDispatchShapeServerError(error) {
      this.app.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    }
}
