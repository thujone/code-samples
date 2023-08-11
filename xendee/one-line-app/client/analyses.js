/****************************************************************************
 ** Interface for running and viewing analyses for the One Line application.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import App from '../one-line/app.js'
import ImportGisResults from './import-gis-results.js'
import utils from './utils.js'
import constants from './constants.js'
import messages, { getMessage } from './messages.js'
import ModalTemplate from './modal-template.js'
import Glide, { Controls, Breakpoints } from '../vendor/glide-modular-esm-3.4.1.js'

export default class Analyses {
  constructor(app) {
    this.app = app
    this.getCompletedAnalysesDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_COMPLETED_ANALYSES}/${window.oneLineProjectId}`
    this.postRenameStudyUrl = (analysisId, newStudyName) =>
        `${constants.API_PATH}/${constants.RESOURCES.POST_RENAME_ANALYSIS}/${window.oneLineProjectId}?analysisId=${analysisId}&newStudyName=${newStudyName}`
    this.getAvailableAnalysesDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_AVAILABLE_ANALYSES}?projectTypeId=`
    this.getEconomicProfilesUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_IMPORTED_GIS_PROJECT_PROFILES}/${window.oneLineProjectId}`
    this.postRunAnalysisDataUrl = `${constants.API_PATH}/${constants.RESOURCES.POST_RUN_ANALYSIS}/${window.oneLineProjectId}`
    this.getAnalysisReportDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_ANALYSIS_REPORT}/${window.oneLineProjectId}?analysisId=`
    this.getDownloadAnalysisResultsDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_DOWNLOAD_ANALYSIS_RESULTS}/${window.oneLineProjectId}?analysisId=`
    this.patchAnalysisSettingsDataUrl = `${constants.API_PATH}/${constants.RESOURCES.UPDATE_ANALYSIS_SETTINGS}/${window.oneLineProjectId}?analysisId=`
    this.deleteAnalysisUrl = `${constants.API_PATH}/${constants.RESOURCES.DELETE_ANALYSIS}/${window.oneLineProjectId}?analysisId=`

    this.wizard = null                              // Wizard for new analyses
    this.currentAnalysisId = null                   // Analysis ID of the currently-selected row in the Completed Analyses table
    this.currentDownloadUrl = null
    this.currentStudyName = null
    this.animationDuration = 500
    this.completedAnalysesDataTable = null
    this.availableAnalysesContext = []
    this.availableAnalysesDataTable
    this.selectedAnalyticProviderAnalyticId = null  // Keep track of which analysis engine is currently selected
    this.runAnalysisDataTable
    this.runAnalysisData                            // POST request data for RunAnalysis
    this.runAnalysisChecked = false
    this.runAnalysisErrors = null
    this.analysisCatalogDataTable
    this.analysisShortCircuitFaultLocationsDataTable
    this.settingsRequestBody = null
    this.selectedEconomicProfiles = []
    this.isShortCircuitAnalysis
    this.selectedSwingBus = null
    this.selectedFaultLocation = null
  }

  get projectTypeId() { return this._projectTypeId }
  set projectTypeId(value) { this._projectTypeId = value }

  main() {
    this.getCompletedAnalyses()
  }

  getCompletedAnalyses() {
    this.app.synchronousFetcher.get(this.getCompletedAnalysesDataUrl).then(response => {
      console.log('Analyses.getCompletedAnalyses()::response', response)
      
      if (response.status === 200) {
        this.onGetCompletedAnalysesSuccess(response)
      } else
        this.onGetCompletedAnalysesError(response)

      return response

    }).catch(error => {
      this.onGetCompletedAnalysesFailure(error)
      return error
    })
  }

  removeCompletedAnalyses() {
    document.getElementById(constants.SELECTORS.ANALYSES_HOME_MODAL).remove()
  }

  onGetCompletedAnalysesSuccess(response) {
    const templateName = constants.TEMPLATE_NAMES.ANALYSES_HOME
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const context = {
      data: {}
    }
    context.data.modalName = constants.MODALS.ANALYSES
    context.data.completedAnalyses = response.data
    context.reportUrl = this.getAnalysisReportDataUrl
    context.settingsUrl = this.getAnalysisSettingsDataUrl
    context.downloadUrl = this.getDownloadAnalysisResultsDataUrl

    // Do not show Settings icon for Short Circuit analyses
    context.data.completedAnalyses.forEach(elem => elem.ShowSettingsIcon = elem.AnalysisTypeId !== constants.ANALYTICS.SHORT_CIRCUIT_ANSI && elem.AnalysisTypeId !== constants.ANALYTICS.SHORT_CIRCUIT_CLASSICAL)

    this.completedAnalysesModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.completedAnalysesModalTemplate.prepareContext()
    console.log('Analyses.onGetCompletedAnalysesSuccess::context', context)
    this.completedAnalysesModalTemplate.execute()

    this.applyCompletedAnalysesDataTable()
    this.addCancelButtonListener()
    this.addNewAnalysisButtonListener()
    this.addBackToOneLineButtonListener()
    this.addDownloadReportLinkListeners()
    this.addAnalysisSettingsLinkListeners()
    this.addBackAnnotationLinkListeners()
    this.addDownloadDataLinkListeners()
    this.addDeleteAnalysisLinkListeners()
    this.addStudyRenamingListeners()

    this.app.printingOverlay.resetPrintOverlay()

    this.wizard = new Glide('.glide', { animationDuration: this.animationDuration }).mount({ Controls, Breakpoints })
    this.addWizardEventListener()
    this.hideWizardBullets()

    return response
  }

  onGetCompletedAnalysesError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetCompletedAnalysesFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  getEconomicProfiles(successCallback) {
    this.app.synchronousFetcher.get(this.getEconomicProfilesUrl).then(response => {
      console.log('ImportGisResults.getEconomicProfiles()::response', response)

      if (response.status === 200) {
        successCallback(response)
      } else
        this.getEconomicProfilesError(response)

      return response

    }).catch(error => {
      this.getEconomicProfilesFailure(error)
      return error
    })
  }

  getEconomicProfilesError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  getEconomicProfilesFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  addWizardEventListener() {
    this.wizard.on('run', () => {
      if (this.wizard.index === 0) {
        this.hideWizardBullets()
        this.availableAnalysesDataTable.destroy()
        utils.emptyInnerHTML(
          constants.SELECTORS.ANALYSES_NEW_PANEL,
          constants.SELECTORS.ANALYSIS_OPTIONS_PANEL,
          `${constants.SELECTORS.ANALYSIS_ERROR_PANEL} ${constants.SELECTORS.ERROR_GRID_BODY}`
        )
      }
      else this.showWizardBullets()
    })
  }
  
  hideWizardBullets() {
    utils.hide(constants.SELECTORS.GLIDE_BULLETS)
    utils.hide(constants.SELECTORS.STEP_LABELS)
    utils.hide(constants.SELECTORS.ADD_NEW_ANALYSIS_HEADER)
  }

  showWizardBullets() {
    utils.show(constants.SELECTORS.GLIDE_BULLETS)
    utils.show(constants.SELECTORS.STEP_LABELS)
    utils.show(constants.SELECTORS.ADD_NEW_ANALYSIS_HEADER)
  }

  applyCompletedAnalysesDataTable() {
    if (!this.completedAnalysesDataTable) {
      this.completedAnalysesDataTable = jQuery(constants.SELECTORS.COMPLETED_ANALYSES_TABLE).DataTable({
        paging: false,
        searching: false,
        scrollCollapse: true,
        scrollY: "280px",
        scrollX: true,
        order: [
          [6, "desc"]
        ],
        columnDefs: [
          { orderable: false, targets: [0, 1, 2, 3] }
        ]
      })
      this.completedAnalysesDataTable.columns.adjust().draw()
    }
  }

  addCancelButtonListener() {
    const closeButtons = document.querySelectorAll(`#${constants.MODALS_BY_TYPE.ANALYSES[0]} ${constants.SELECTORS.CLOSE_BUTTON}`)
    for (const closeButton of closeButtons) {
        closeButton.addEventListener('click', () => this.completedAnalysesModalTemplate.destroyModal())
    }
  }

  addDownloadReportLinkListeners() {
    utils.addEventListenerByClass(constants.SELECTORS.DOWNLOAD_REPORT_LINK, 'click', (event) => {
      this.getReport(event)
    })
  }

  addAnalysisSettingsLinkListeners() {
    utils.addEventListenerByClass(constants.SELECTORS.ANALYSIS_SETTINGS_LINK, 'click', (event) => {
      this.getAnalysisSettings(event)
    })
  }

  addBackAnnotationLinkListeners() {
    utils.addEventListenerByClass(constants.SELECTORS.BACK_ANNOTATION_LINK, 'click', (event) => {
      this.app.activateAppMode(constants.APP_MODES.ANALYSIS, event)
    })
  }

  addDownloadDataLinkListeners() {
    utils.addEventListenerByClass(constants.SELECTORS.DOWNLOAD_DATA_LINK, 'click', (event) => {
      this.getReportData(event)
    })
  }


  addDeleteAnalysisLinkListeners() {
    utils.addEventListenerByClass(constants.SELECTORS.DELETE_ANALYSIS_LINK, 'click', (event) => {
      const analysisRow = event.target.closest('tr')
      const analysisCellValues = Array.from(analysisRow.querySelectorAll('td')).map(x => x.innerText)
      const analysisName = analysisCellValues[4]
      
      this.showDeleteAnalysisPrompt(analysisName, event)
    })
  }

  addStudyRenamingListeners() {
    utils.addEventListenerByClass(constants.SELECTORS.STUDY_NAME_TEXT_CLASSNAME, 'click', event => {
      
      // Cancel out any open study name fields before opening this form field
      Array.from(document.querySelectorAll(constants.SELECTORS.STUDY_NAME_CANCEL_BUTTON)).forEach(item => {
        
        const thisRow = item.closest('tr')
        const targetedRow = event.target.closest('tr')

        if (thisRow !== targetedRow)
          utils.simulateClick(item)

      })
      const row = event.target.closest('tr')
      const studyNameCell = row.querySelector(constants.SELECTORS.STUDY_NAME_CELL)
      const studyNameText = studyNameCell.querySelector(constants.SELECTORS.STUDY_NAME_TEXT)
      const studyNameInputGroup = studyNameCell.querySelector(constants.SELECTORS.STUDY_NAME_INPUT_GROUP)

      studyNameText.style.display = 'none'
      studyNameInputGroup.style.display = 'flex'
      $(constants.SELECTORS.STUDY_NAME_INPUT, row).focus().select()
    })

    // Capture <Enter> key to submit the form
    utils.addEventListenerByClass(constants.SELECTORS.STUDY_NAME_INPUT_CLASSNAME, 'keydown', event => {
      const row = event.target.closest('tr')
      const studyNameSubmitButton = row.querySelector(constants.SELECTORS.STUDY_NAME_SUBMIT_BUTTON)
      const studyNameCancelButton = row.querySelector(constants.SELECTORS.STUDY_NAME_CANCEL_BUTTON)
      if (event.key === "Enter")
        utils.simulateClick(studyNameSubmitButton)
      else if (event.key === "Escape")
        utils.simulateClick(studyNameCancelButton)
    })

    utils.addEventListenerByClass(constants.SELECTORS.STUDY_NAME_CANCEL_BUTTON_CLASSNAME, 'click', event => {
      const row = event.target.closest('tr')
      const studyNameCell = row.querySelector(constants.SELECTORS.STUDY_NAME_CELL)
      const studyNameText = studyNameCell.querySelector(constants.SELECTORS.STUDY_NAME_TEXT)
      const studyNameInputGroup = studyNameCell.querySelector(constants.SELECTORS.STUDY_NAME_INPUT_GROUP)
      const studyNameInput = studyNameCell.querySelector(constants.SELECTORS.STUDY_NAME_INPUT)
      
      studyNameInput.value = studyNameInput.getAttribute(constants.SELECTORS.DATA_SAVED_VALUE)
      this.resetRenameStudy(studyNameText, studyNameInputGroup)
    })

    utils.addEventListenerByClass(constants.SELECTORS.STUDY_NAME_SUBMIT_BUTTON_CLASSNAME, 'click', event => {
      const row = event.target.closest('tr')
      const studyNameCell = row.querySelector(constants.SELECTORS.STUDY_NAME_CELL)
      const studyNameText = studyNameCell.querySelector(constants.SELECTORS.STUDY_NAME_TEXT)
      const studyNameInputGroup = studyNameCell.querySelector(constants.SELECTORS.STUDY_NAME_INPUT_GROUP)
      const studyNameInput = studyNameCell.querySelector(constants.SELECTORS.STUDY_NAME_INPUT)

      if (studyNameInput.value === '' || studyNameInput.value === studyNameInput.getAttribute(constants.SELECTORS.DATA_SAVED_VALUE))
        this.resetRenameStudy(studyNameText, studyNameInputGroup)
      else if (studyNameInput.value.length > 250)
        this.app.notification.showError(messages.ANALYSES_STUDY_NAME_TOO_LONG)
      else {
        const analysisId = event.target.closest('tr').getAttribute(constants.SELECTORS.DATA_ANALYSIS_ID)
        const encodedStudyName = encodeURIComponent(studyNameInput.value)
        this.postRenameStudy(analysisId, encodedStudyName, () => {
          studyNameInput.setAttribute(constants.SELECTORS.DATA_SAVED_VALUE, studyNameInput.value)
          studyNameInput.value = studyNameInput.getAttribute(constants.SELECTORS.DATA_SAVED_VALUE)
          studyNameText.innerText = studyNameInput.value
      
          this.resetRenameStudy(studyNameText, studyNameInputGroup)
        })
      }
    })
  }

  resetRenameStudy(studyNameText, studyNameInputGroup) {
    studyNameText.style.display = 'block'
    studyNameInputGroup.style.display = 'none'
  }

  postRenameStudy(analysisId, studyName, successCallback) {
    const requestUrl = this.postRenameStudyUrl(analysisId, studyName)
    console.log('Analyses.postRenameStudy()::request', requestUrl)

    this.app.synchronousFetcher.post(requestUrl).then(response => {
      console.log('Analyses.postRenameStudy()::response', response)
      if (response.data.success)
        successCallback()
      else
        this.onPostRenameStudyError(response)
    }).catch(error => {
      this.onPostRenameStudyFailure(error)
    })
  }

  onPostRenameStudyError(response) {
    this.app.notification.showError(response.data.message)
  }

  onPostRenameStudyFailure(error) {
    console.error('Analyses.onPostRenameStudyFailure()::error', error)
    this.app.notification.showError(messages.SERVER_ERROR)
  }


  showDeleteAnalysisPrompt(analysisName, event) {
    this.app.notification.showConfirm(
      getMessage(messages.CONFIRM_DELETE_ANALYSIS, [analysisName]),
      () => this.deleteAnalysis(event),
      () => {}
    )
  }

  deleteAnalysis(event) {
    const analysisId = event.target.closest('tr').getAttribute('data-analysis-id')
    const analysisName = event.target.closest('tr').getAttribute('data-study-name')

    this.app.synchronousFetcher.delete(`${this.deleteAnalysisUrl}${analysisId}`).then(response => {
      console.log('deleteAnalysis()::response', response)

      if (response.status === 200 && response.data.success) {
        this.onDeleteAnalysisSuccess(analysisId, analysisName)
      } else {
        this.app.notification.showError(response.data.message)
      }
    }).catch(error => {
      this.app.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  onDeleteAnalysisSuccess(analysisId, analysisName) {
    this.completedAnalysesDataTable.row(document.querySelector(`tr[data-analysis-id="${analysisId}"]`)).remove().draw(false)
    this.app.notification.showSuccess(`<strong>${analysisName}</strong> was deleted.`)
    App.Project.updateLastModifiedDate()
  }

  addNewAnalysisButtonListener() {
    const newAnalysisButton = document.querySelector(constants.SELECTORS.NEW_ANALYSIS_BUTTON)
    utils.addEvent(newAnalysisButton, 'click', () => this.getAvailableAnalyses())
  }

  addBackToOneLineButtonListener() {
    // There are two "back" buttons for the Analyses modal: the "Back to One Line" button and the modal close icon
    // Both need to trigger this event handler in order to activate the MAIN app mode.
    const backToOneLineButtons = document.querySelectorAll(constants.SELECTORS.ANALYSIS_BACK_TO_ONE_LINE_BUTTON)
    for (const button of backToOneLineButtons) {
      utils.addEvent(button, 'click', () => {
        this.app.activateAppMode(constants.APP_MODES.MAIN)
      })
    }
  }

  getAnalysisSettings() {
    this.currentAnalysisId = event.target.closest('tr').getAttribute('data-analysis-id')

    this.app.synchronousFetcher.get(`${this.app.getAnalysisDataUrl}${this.currentAnalysisId}`).then(response => {
      console.log('Analyses.getAnalysisSettings()::response', response)

      if (response.status === 200)
        this.onGetAnalysisSettingsSuccess(response)
      else
        this.onGetAnalysisSettingsError(response)

    }).catch(error => {
      this.onGetAnalysisSettingsFailure(error)
    })
  }

  onGetAnalysisSettingsSuccess(response) {
    const templateName = constants.TEMPLATE_NAMES.POWER_FLOW_ANALYSIS_SETTINGS
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const context = {
      data: {
        modalName: constants.MODALS.POWER_FLOW_ANALYSIS_SETTINGS,
        ...response.data
      }
    }

    this.analysisSettingsTemplate = new ModalTemplate(templateName, templateType, context)
    this.analysisSettingsTemplate.prepareContext()
    this.analysisSettingsTemplate.execute(null, true, true, false)

    this.initializeSaveSettingsButton()
    this.initializeCloseSettingsButtons()
    return response
  }

  onGetAnalysisSettingsError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetAnalysisSettingsFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }
  
  initializeSaveSettingsButton() {
    const saveButton = document.querySelector(`${constants.SELECTORS.POWER_FLOW_ANALYSIS_SETTINGS_MODAL} ${constants.SELECTORS.SAVE_BUTTON}`)
    utils.addEvent(saveButton, 'click', () => this.submitAnalysisSettingsForm())
  }

  initializeCloseSettingsButtons() {
    utils.addEventListenerByClass(constants.SELECTORS.DESTROY_BUTTON, 'click', () => {
      this.analysisSettingsTemplate.destroyModal()
    })
  }

  submitAnalysisSettingsForm() {
    this.settingsRequestBody = this.generateAnalysisSettingsRequest()
    console.log('Analyses.submitAnalysisSettingsForm()::this.settingsRequestBody', this.settingsRequestBody)
    this.patchAnalysisSettings()
  }

  getReport(event) {
    this.app.notification.showProgressMessage(`<p><i class="fas fa-spinner fa-spin fa-lg" aria-hidden="true"></i><div class="text-center">Preparing report... One moment...</div></p>`)
    this.currentReportUrl = event.target.closest('td').getAttribute('data-report-url')
    this.currentStudyName = event.target.closest('tr').getAttribute('data-study-name')

    this.app.synchronousFetcher({
      url: `${this.currentReportUrl}`,
      method: 'GET',
      responseType: 'blob'
    }).then(response => {
      console.log('Analyses.getReport()::response', response)
      if (response.status === 200)
        this.onGetReportSuccess(response)
      else
        this.onGetReportError(response)
    }).catch(error =>
      this.onGetReportFailure(error)
    )
  }

  onGetReportSuccess(response) {
    setTimeout(() => {
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${this.currentStudyName}.pdf`)
      utils.simulateClick(document.querySelector('.noty_close_button'))
      link.click()
      window.URL.revokeObjectURL(blob)
    }, 1000)
  }

  onGetReportError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetReportFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  getReportData(event) {
    this.app.notification.showProgressMessage(`<p><i class="fas fa-spinner fa-spin fa-lg" aria-hidden="true"></i><div class="text-center">Preparing download... One moment...</div></p>`)
    this.currentDownloadUrl = event.target.closest('td').getAttribute('data-download-url')
    this.currentStudyName = event.target.closest('tr').getAttribute('data-study-name')

    this.app.synchronousFetcher({
      url: `${this.currentDownloadUrl}`,
      method: 'GET',
      responseType: 'blob'
    }).then(response => {
      console.log('Analyses.getReport()::response', response)
      if (response.status === 200)
        this.onGetReportDataSuccess(response)
      else
        this.onGetReportDataError(response)
    }).catch(error =>
      this.onGetReportDataFailure(error)
    )
  }

  onGetReportDataSuccess(response) {
    setTimeout(() => {
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${this.currentStudyName}.zip`)
      utils.simulateClick(document.querySelector('.noty_close_button'))
      link.click()
      window.URL.revokeObjectURL(blob)
    }, 1500)
  }

  onGetReportDataError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetReportDataFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  generateAnalysisSettingsRequest() {
    return [
      { id: constants.ANALYSIS_OPTIONS.BUS_UNDER_LOADED_UPPERBOUND, value: utils.forms.getHiddenFieldValue('under-loaded-upperbound') },
      { id: constants.ANALYSIS_OPTIONS.BUS_UNDER_LOADED_COLOR, value: this.getHexColorOrDefault('under-loaded') },
      { id: constants.ANALYSIS_OPTIONS.BUS_NORMAL_LOADED_UPPERBOUND, value: utils.forms.getHiddenFieldValue('normal-loaded-upperbound') },
      { id: constants.ANALYSIS_OPTIONS.BUS_NORMAL_LOADED_COLOR, value: this.getHexColorOrDefault('normal') },
      { id: constants.ANALYSIS_OPTIONS.BUS_FULLY_LOADED_UPPERBOUND, value: utils.forms.getHiddenFieldValue('fully-loaded-upperbound') },
      { id: constants.ANALYSIS_OPTIONS.BUS_FULLY_LOADED_COLOR, value: this.getHexColorOrDefault('fully-loaded') },
      { id: constants.ANALYSIS_OPTIONS.BUS_OVER_LOADED_COLOR, value: this.getHexColorOrDefault('over-loaded') },
      { id: constants.ANALYSIS_OPTIONS.BUS_UNDER_VOLTAGE_UPPERBOUND, value: utils.forms.getHiddenFieldValue('under-voltage-upperbound') },
      { id: constants.ANALYSIS_OPTIONS.BUS_UNDER_VOLTAGE_COLOR, value: this.getHexColorOrDefault('under-voltage') },
      { id: constants.ANALYSIS_OPTIONS.BUS_NORMAL_VOLTAGE_UPPERBOUND, value: utils.forms.getHiddenFieldValue('normal-voltage-upperbound') },
      { id: constants.ANALYSIS_OPTIONS.BUS_NORMAL_VOLTAGE_COLOR, value: this.getHexColorOrDefault('normal-voltage') },
      { id: constants.ANALYSIS_OPTIONS.BUS_OVER_VOLTAGE_COLOR, value: this.getHexColorOrDefault('over-voltage') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_NAME, value: utils.forms.getBooleanFieldValue('annotation-name') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_DESCRIPTION, value: utils.forms.getBooleanFieldValue('annotation-description') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_CATALOG_NAME, value: utils.forms.getBooleanFieldValue('annotation-catalog-name') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_VOLTAGE, value: utils.forms.getBooleanFieldValue('annotation-nominal-voltage') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_PERCENT_LOADED, value: utils.forms.getBooleanFieldValue('annotation-percent-loaded') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_PERCENT_VOLTAGE_DROP, value: utils.forms.getBooleanFieldValue('annotation-percent-voltage-drop') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_CALC_CURRENT, value: utils.forms.getBooleanFieldValue('annotation-current') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_CALC_VOLTAGE, value: utils.forms.getBooleanFieldValue('annotation-voltage') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_RATED_POWER, value: utils.forms.getBooleanFieldValue('annotation-rated-power') },
      { id: constants.ANALYSIS_OPTIONS.ANNOTATE_PU, value: utils.forms.getBooleanFieldValue('annotation-voltage-pu') }
    ]
  }

  getHexColorOrDefault(formField) {
    return utils.forms.getSelectFieldValue(formField) || '000000' // Server wants a default of black
  }

  patchAnalysisSettings() {
    this.app.synchronousFetcher.patch(`${this.patchAnalysisSettingsDataUrl}${this.currentAnalysisId}`, this.settingsRequestBody).then(response => {
      console.log('Analyses.getAvailableAnalyses()::response', response)
      if (response.data.success)
        this.onPatchAnalysisSettingsSuccess(response)
      else
        this.onPatchAnalysisSettingsError(response)

    }).catch(error => {
      this.onPatchAnalysisSettingsFailure(error)
    })
  }

  onPatchAnalysisSettingsSuccess(response) {
    this.app.activateAppMode(constants.APP_MODES.MAIN)
    this.analysisSettingsTemplate.destroyModal()

    this.app.projectElementsChanged(false, false, false, false)

    App.Project.updateLastModifiedDate()
    this.app.notification.showSuccess(messages.SAVE_ANALYSIS_SETTINGS_SUCCESS)
  }

  onPatchAnalysisSettingsError(response) {
    this.app.notification.showError(messages.SAVE_ANALYSIS_SETTINGS_ERROR)
  }

  onPatchAnalysisSettingsFailure(error) {
    this.app.notification.showError(messages.SAVE_ANALYSIS_SETTINGS_ERROR)
    console.error(error)
  }

  getAvailableAnalyses() {
    this.app.synchronousFetcher.get(`${this.getAvailableAnalysesDataUrl}${constants.PROJECT_TYPE_IDS.INDUSTRIAL_BALANCED}`).then(response => {
      console.log('Analyses.getAvailableAnalyses()::response', response)
      
      if (response.status === 200)
        this.onGetAvailableAnalysesSuccess(response, false)
      else
        this.onGetAvailableAnalysesError(response)

    }).catch(error => {
      this.onGetAvailableAnalysesFailure(error)
    })
  }

  onGetAvailableAnalysesSuccess(response) {
    const templateName = constants.TEMPLATE_NAMES.ANALYSES_NEW
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const context = {
      data: {
        modalName: constants.MODALS.ANALYSES_NEW,
        availableAnalyses: response.data
      }
    }

    this.newAnalysisModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.newAnalysisModalTemplate.prepareContext()
    console.log('Analyses.onGetAvailableAnalysesSuccess::context', context)
    this.availableAnalysesContext = context.data.availableAnalyses
    this.newAnalysisModalTemplate.execute(constants.SELECTORS.ANALYSES_NEW_PANEL, false)
    this.selectedAnalyticProviderAnalyticId = null
    this.applyAvailableAnalysesDataTable()
    this.initializeRowListener()
    this.addSelectOptionsButtonListener()
    this.addCancelButtonListener()
    this.addCancelAnalysisButtonListener()
    utils.show(constants.SELECTORS.GLIDE_BULLETS)
    this.wizard.go('>')

    // If there is only one type of analysis available, select it automatically for the user
    if (response.data.length === 1)
      jQuery('#available-analyses-table tbody tr:first-of-type').click().addClass('selected')
    
    return response
  }

  onGetAvailableAnalysesError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetAvailableAnalysesFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  applyAvailableAnalysesDataTable() {
    this.availableAnalysesDataTable = jQuery(constants.SELECTORS.AVAILABLE_ANALYSES_TABLE).DataTable({
      paging: false,
      searching: false,
      scrollCollapse: true,
      scrollY: "350px",
      scrollX: true,
      order: [
        [0, "asc"]
      ],
      select: {
        style: 'single'
      }
    })
    this.availableAnalysesDataTable.columns.adjust().draw()
  }

  initializeRowListener() {
    utils.delegateEvent('tbody tr', 'click', (mouseEvent) => {
      const tableRow = mouseEvent.target.closest('tr')
      const id = tableRow.getAttribute(constants.SELECTORS.DATA_ANALYTIC_PROVIDER_ANALYTIC_ID)
      if (this.selectedAnalyticProviderAnalyticId === id) {
       this.selectedAnalyticProviderAnalyticId = null
       this.hideAvailableAnalysisDetails()
      } else {
       this.selectedAnalyticProviderAnalyticId = id
       this.showAvailableAnalysisDetails()
     }
    }, constants.SELECTORS.AVAILABLE_ANALYSES_TABLE)
  }

  hideAvailableAnalysisDetails() {
   const detailsContainer = document.querySelector(constants.SELECTORS.AVAILABLE_ANALYSIS_DETAILS)
   detailsContainer.innerHTML = ''
  }

  showAvailableAnalysisDetails() {
    const detailsContainer = document.querySelector(constants.SELECTORS.AVAILABLE_ANALYSIS_DETAILS)
    const templateName = constants.TEMPLATE_NAMES.ANALYSIS_DETAILS
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const selectedAnalysisDetails =
        this.availableAnalysesContext.find(x => x.AnalyticProviderAnalyticId === Number(this.selectedAnalyticProviderAnalyticId))
    const context = {
      data: {
        modalName: constants.MODALS.ANALYSIS_DETAILS,
        details: selectedAnalysisDetails
      }
    }
    
    this.analysisDetailsModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.analysisDetailsModalTemplate.prepareContext()

    console.log('Analyses.showAvailableAnalysisDetails()::context', context)
    detailsContainer.innerHTML = ''
    this.analysisDetailsModalTemplate.execute(constants.SELECTORS.AVAILABLE_ANALYSIS_DETAILS, false, true)

    this.addSelectOptionsButtonListener()
  }

  addSelectOptionsButtonListener() {
    const selectOptionsButtonWrapper = document.getElementById(constants.SELECTORS.SELECT_OPTIONS_BUTTON_WRAPPER)
    let selectOptionsButton = document.querySelector(constants.SELECTORS.SELECT_OPTIONS_BUTTON)

    selectOptionsButtonWrapper.innerHTML = selectOptionsButtonWrapper.innerHTML
    selectOptionsButton = document.querySelector(constants.SELECTORS.SELECT_OPTIONS_BUTTON)
    selectOptionsButton.addEventListener('click', this.renderAndGoToAnalysisOptions.bind(this))
  }

  renderAndGoToAnalysisOptions(event) {
    event.preventDefault()
    if (this.selectedAnalyticProviderAnalyticId === null)
      this.app.notification.showImportantMessage(messages.ANALYSES_MISSING_ENGINE)
    else {
      this.getEconomicProfiles((response) => {
        this.economicProfiles = response.data.sort((x, y) => {
          // Alpha-sort profiles by profile name. Prioritize profiles with names.
          if (x.Name === null && y.Name === null)
            return 0
          else if (x.Name !== null && y.Name === null)
            return -1
          else if (x.Name === null && y.Name !== null)
            return 1
          else if (x.Name < y.Name)
            return -1
          else if (x.Name > y.Name)
            return 1
          else
            return 0
        })
        this.renderAnalysisOptions()
        this.wizard.go('>')
      })
    }
  }

  addCancelAnalysisButtonListener() {
    const cancelAnalysisButton = document.querySelector(constants.SELECTORS.CANCEL_ANALYSIS_BUTTON)
    utils.addEvent(cancelAnalysisButton, 'click', (event) => {
      event.preventDefault()
      this.selectedAnalyticProviderAnalyticId = null
      this.wizard.go('<')
    })
  }

  renderAnalysisOptions() {
    const templateName = constants.TEMPLATE_NAMES.ANALYSES_OPTIONS
    const templateType = constants.MODAL_CATEGORIES.ACTION
    this.isShortCircuitAnalysis = Number(this.selectedAnalyticProviderAnalyticId) === constants.ANALYTICS.SHORT_CIRCUIT_ANSI || Number(this.selectedAnalyticProviderAnalyticId) === constants.ANALYTICS.SHORT_CIRCUIT_CLASSICAL

    // XEN-1034: Only consider power producers that have an outgoing branch and there is juice flowing out of the outgoing branch
    const powerProducersWithJuice = App.Project.getPowerProducers().filter(item => item.OutgoingBranches !== null && item.OutgoingBranches.size > 0 && item.OutgoingBranches.first().getVoltageAfterFromDevice() > 0).toArray()

    const powerProducers = powerProducersWithJuice.map(item => {
      item.meta = {
        nodeType: constants.LABELS[item.NodeType],
        converted: {
          voltage: utils.formatUnitValue(item.Details.Voltage, constants.UNITS.V, true),
          threePhaseShortCircuit: utils.formatUnitValue(item.Details.ThreePhaseShortCircuit, constants.UNITS.kVA, true)
        }
      }
      return item
    })

    if (powerProducers.size === 0) {
      this.app.notification.showError('There are no power-producing nodes that are contributing energy to the network.<br /><br />Please add and connect one or more sucn nodes, or ensure that any existing power-producing nodes are: connected; do not have an opened device; and have a non-zero voltage.')
    }

    // Determine applicable Fault Locations for use in Short-Circuit analysis
    let faultLocations = []
    if (this.isShortCircuitAnalysis) {
      const possibleFaultLocations = App.Project.OneLineNodes.filter(n => !n.IsPowerProducer && n.LineToLineVoltage > 0).toArray()
      faultLocations = possibleFaultLocations.map(item => {
        item.meta = {
          nodeType: constants.LABELS[item.NodeType],
          converted: {
            voltage: utils.formatUnitValue(item.LineToLineVoltage, constants.UNITS.V, true)
          }
        }
        return item
      })

      if (faultLocations.size === 0) {
        this.app.notification.showError('There are no nodes that can be used as the fault location. Faults must occur at a non-power-producing node with known voltage.<br /><br />Please add and connect one or more sucn nodes, or ensure that any existing nodes are: connected; do not have an opened device; and have a non-zero voltage.')
      }
    }

    const context = {
      data: {
        modalName: constants.MODALS.ANALYSES_OPTIONS,
        powerProducers,
        faultLocations,
        isShortCircuitAnalysis: this.isShortCircuitAnalysis,
        analysisType: document.getElementById(constants.SELECTORS.ANALYSIS_TITLE).innerText,
        economicProfiles: this.economicProfiles
      }
    }

    this.analysesOptionsModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.analysesOptionsModalTemplate.prepareContext()
    this.analysesOptionsModalTemplate.execute(constants.SELECTORS.ANALYSIS_OPTIONS_PANEL, false)
    this.applyAnalysisCatalogDataTable()
    this.updateStudyName()

    if (this.isShortCircuitAnalysis) {
      this.applyShortCircuitFaultLocationsTable()
      this.addSelectFaultLocationRowListener()
      this.addSelectFaultLocationDropDownListener()
      this.addSelectFaultTypeDropDownListener()

      // If there's only one fault location, simulate a click on the row
      if (context.data.faultLocations.length === 1) {
        utils.simulateClick(document.querySelector(`${constants.SELECTORS.ANALYSIS_SHORT_CIRCUIT_FAULT_LOCATIONS_TABLE} ${constants.SELECTORS.FIRST_ROW_FIRST_CELL}`))
      }
    }

    this.addCancelOptionsButtonListener()
    this.addCloseOptionsButtonListener()
    this.addSelectCatalogRowListener()
    this.addRunButtonListener()

    // If there's only one power producer, simulate a click on the row
    // If there are multiple power producers, don't select any -- unless there is a single UTILITY in that group
    if (context.data.powerProducers.length === 1) {
      utils.simulateClick(document.querySelector(`${constants.SELECTORS.ANALYSIS_CATALOG_TABLE} ${constants.SELECTORS.FIRST_ROW_FIRST_CELL}`))
    } else {
      const utilities = context.data.powerProducers.filter(x => x.NodeType === constants.NODE_TYPES.UTILITY)
      if (utilities.length === 1) {
        utils.simulateClick(document.querySelector(`[data-catalog-node-id="${utilities[0].NodeId}"] td:nth-child(1)`))
      }
    }
  }

  applyAnalysisCatalogDataTable() {
    this.analysisCatalogDataTable = jQuery(constants.SELECTORS.ANALYSIS_CATALOG_TABLE).DataTable({
      paging: false,
      searching: false,
      scrollCollapse: true,
      scrollY: '500px',
      scrollX: true,
      order: [
        [0, 'asc']
      ],
      select: {
        style: 'single'
      },
      destroy: true
    })
    this.analysisCatalogDataTable.columns.adjust().draw()
  }

  applyShortCircuitFaultLocationsTable() {
    this.analysisShortCircuitFaultLocationsDataTable = jQuery(constants.SELECTORS.ANALYSIS_SHORT_CIRCUIT_FAULT_LOCATIONS_TABLE).DataTable({
      paging: false,
      searching: false,
      scrollCollapse: true,
      scrollY: '500px',
      scrollX: true,
      order: [
        [0, 'asc']
      ],
      select: {
        style: 'single'
      },
      destroy: true
    })
    this.analysisShortCircuitFaultLocationsDataTable.columns.adjust().draw()
  }

  addCancelOptionsButtonListener() {
    const cancelButtons = document.querySelectorAll(constants.SELECTORS.CANCEL_ANALYSIS_OPTIONS_BUTTON)
    for (const cancelButton of cancelButtons) {
      const cancelAnalysisOptionsPanel = () => {
        setTimeout(() => {
          this.analysisCatalogDataTable && this.analysisCatalogDataTable.destroy()
          this.analysisShortCircuitFaultLocationsDataTable && this.analysisShortCircuitFaultLocationsDataTable.destroy()
          utils.emptyInnerHTML(constants.SELECTORS.ANALYSIS_OPTIONS_PANEL)
          delete this.analysisCatalogDataTable
          delete this.analysisShortCircuitFaultLocationsDataTable
          utils.removeEvent(cancelButton, 'click', cancelAnalysisOptionsPanel)
        }, this.animationDuration)
        this.wizard.go('<<')
      }
      utils.addEvent(cancelButton, 'click', cancelAnalysisOptionsPanel)
    }
  }

  addCloseOptionsButtonListener() {
    const closeButtons = document.querySelectorAll(constants.SELECTORS.DESTROY_ANALYSIS_OPTIONS_BUTTON)
    for (const closeButton of closeButtons) {
      const destroyAnalysisOptionsPanel = () => {
        this.wizard.go('<')
        this.analysisCatalogDataTable && this.analysisCatalogDataTable.destroy()
        this.analysisShortCircuitFaultLocationsDataTable && this.analysisShortCircuitFaultLocationsDataTable.destroy()
        utils.emptyInnerHTML(constants.SELECTORS.ANALYSIS_OPTIONS_PANEL)
        delete this.analysisCatalogDataTable
        delete this.analysisShortCircuitFaultLocationsDataTable
        utils.removeEvent(closeButton, 'click', destroyAnalysisOptionsPanel)
      }
      utils.addEvent(closeButton, 'click', destroyAnalysisOptionsPanel)
    }
    this.addSelectOptionsButtonListener()
  }

  getEquipmentNameFromSelectedRow(row) {
    return row === null ? "" : row.firstElementChild.innerText
  }

  addSelectCatalogRowListener() {
    const rows = document.querySelectorAll(`${constants.SELECTORS.ANALYSIS_CATALOG_TABLE} tbody tr`)
    for (const row of rows) {
      const setRunState = () => {
        if (this.selectedSwingBus === row) {
          this.selectedSwingBus = null
        } else {
          this.selectedSwingBus = row
        }

        document.getElementById(constants.SELECTORS.EQUIPMENT_NAME).innerText = this.getEquipmentNameFromSelectedRow(this.selectedSwingBus)
        
        this.setRunState()
      }
      utils.addEvent(row, 'click', setRunState)
    }
  }

 addSelectFaultLocationRowListener() {
   const rows = document.querySelectorAll(`${constants.SELECTORS.ANALYSIS_SHORT_CIRCUIT_FAULT_LOCATIONS_TABLE} tbody tr`)
   for (const row of rows) {
     const setRunState = () => {
       if (this.selectedFaultLocation === row) {
         this.selectedFaultLocation = null
       } else {
         this.selectedFaultLocation = row
       }

       document.getElementById(constants.SELECTORS.FAULT_LOCATION_NAME).innerText = this.getEquipmentNameFromSelectedRow(this.selectedFaultLocation)

       this.populateFaultTypeOptions()
       this.setRunState()
     }
     utils.addEvent(row, 'click', setRunState)
   }
 }

 addSelectFaultLocationDropDownListener() {
   // Add event handler for Fault Location drop-down
   const ddl = document.getElementById(constants.SELECTORS.ANALYSIS_FAULT_LOCATION_NAME)
   if (ddl) {
     utils.addEvent(ddl, 'change', (event) => {
       const faultAllBuses = this.getFaultAllLocations()

       // Set display property of containers
       Array.from(document.getElementsByClassName(constants.SELECTORS.ANALYSIS_FAULT_ALL_CONTAINER_CLASSNAME)).forEach(elem => elem.style.display = faultAllBuses ? 'block' : 'none')
       Array.from(document.getElementsByClassName(constants.SELECTORS.ANALYSIS_FAULT_SINGLE_CONTAINER_CLASSNAME)).forEach(elem => elem.style.display = faultAllBuses ? 'none' : 'block')

       this.populateFaultTypeOptions()
       this.faultTypeDropDownChanged()
       this.setRunState()
     })
   }
 }

 addSelectFaultTypeDropDownListener() {
   // Add event handler for Fault Type drop-down
   const ddl = document.getElementById(constants.SELECTORS.ANALYSIS_FAULT_TYPE_NAME)
   if (ddl) {
     utils.addEvent(ddl, 'change', (event) => { this.faultTypeDropDownChanged() })
   }
 }

 faultTypeDropDownChanged() {
    const phaseToFaultOptions = this.getPhaseToFaultOptions()
    if (phaseToFaultOptions.length === 0) {
      document.getElementById(constants.SELECTORS.ANALYSIS_PHASES_TO_FAULT_CONTAINER).style.display = 'none'
    } else {
      document.getElementById(constants.SELECTORS.ANALYSIS_PHASES_TO_FAULT_CONTAINER).style.display = 'block'
      this.populatePhaseToFaultOptions()
    }
    this.setRunState()
 }

 getGisProfileCheckboxValues() {
   return Array.from(document.querySelectorAll(constants.SELECTORS.GIS_PROFILE_CHECKBOX)).filter(x => x.checked).map(y => y.value)
 }

 populateFaultTypeOptions() {
   const ddl = document.getElementById(constants.SELECTORS.ANALYSIS_FAULT_TYPE_NAME)

   const faultTypeOptions = []
   if (this.getFaultAllLocations()) {
     faultTypeOptions.push(constants.SHORT_CIRCUIT.FAULTS.THREE_PHASE_BOLTED)
     faultTypeOptions.push(constants.SHORT_CIRCUIT.FAULTS.LINE_LINE)
     faultTypeOptions.push(constants.SHORT_CIRCUIT.FAULTS.LINE_TO_GROUND)
   } else {
     faultTypeOptions.push(constants.SHORT_CIRCUIT.FAULTS.THREE_PHASE_BOLTED)
     faultTypeOptions.push(constants.SHORT_CIRCUIT.FAULTS.THREE_PHASE_UNGROUNDED)
     faultTypeOptions.push(constants.SHORT_CIRCUIT.FAULTS.THREE_PHASE_MESHED)
     faultTypeOptions.push(constants.SHORT_CIRCUIT.FAULTS.LINE_LINE)
     faultTypeOptions.push(constants.SHORT_CIRCUIT.FAULTS.LINE_TO_GROUND)
   }

   this.populateDropDownRememberingSelectedValue(ddl, faultTypeOptions)
 }

 getPhaseToFaultOptions() {
   const faultAllBuses = this.getFaultAllLocations()
   const phasesToFaultOptions = []

   if (!faultAllBuses) {
     const faultType = this.getFaultType()

     switch (faultType) {
       case constants.SHORT_CIRCUIT.FAULTS.TWO_LINE_GROUND.VALUE:
       case constants.SHORT_CIRCUIT.FAULTS.LINE_LINE.VALUE:
         phasesToFaultOptions.push(constants.SHORT_CIRCUIT.PHASES.AB)
         phasesToFaultOptions.push(constants.SHORT_CIRCUIT.PHASES.BC)
         phasesToFaultOptions.push(constants.SHORT_CIRCUIT.PHASES.CA)
         break

       case constants.SHORT_CIRCUIT.FAULTS.LINE_TO_GROUND.VALUE:
         phasesToFaultOptions.push(constants.SHORT_CIRCUIT.PHASES.A)
         phasesToFaultOptions.push(constants.SHORT_CIRCUIT.PHASES.B)
         phasesToFaultOptions.push(constants.SHORT_CIRCUIT.PHASES.C)
         break
     }
   }

   return phasesToFaultOptions
 }

  populatePhaseToFaultOptions() {
    const ddl = document.getElementById(constants.SELECTORS.ANALYSIS_PHASES_TO_FAULT_NAME)
    this.populateDropDownRememberingSelectedValue(ddl, this.getPhaseToFaultOptions())
  }

  populateDropDownRememberingSelectedValue(ddl, options) {
    const currentValue = ddl.value

    while (ddl.options.length > 0) {
      ddl.remove(0)
    }

    const chooseOneOpt = document.createElement('option')
    chooseOneOpt.innerHTML = '-- Choose One --'
    chooseOneOpt.value = '-1'
    ddl.appendChild(chooseOneOpt)

    options.forEach(opt => {
      const elem = document.createElement('option')
      elem.innerHTML = opt.TEXT
      elem.value = opt.VALUE

      if (opt.VALUE === currentValue) {
        elem.selected = true
      }

      ddl.appendChild(elem)
    })
  }

  addRunButtonListener() {
    const runButton = document.querySelector(constants.SELECTORS.RUN_ANALYSIS_BUTTON)
    const postRunAnalysis = () => {
      this.setRunState()
      this.validateRunState(() => {
        this.wizard.go('>>')
        utils.showBlockingSpinner()
        this.postRunAnalysis()
      })
    }
    utils.addEvent(runButton, 'click', postRunAnalysis)
  }

  validateRunState(successCallback) {
    // Validation common to all analyses
    if (this.selectedSwingBus === null) {
      this.app.notification.showError(messages.ANALYSES_MISSING_SWING_BUS)
      return
    } else if (!this.runAnalysisData.StudyName) {
      this.app.notification.showError(messages.ANALYSES_MISSING_STUDY_NAME)
      return
    }
    // Short-circuit-specific validation
    if (this.isShortCircuitAnalysis) {
     const faultAllBuses = this.getFaultAllLocations()
     if (!faultAllBuses && this.selectedFaultLocation === null) {
       this.app.notification.showError(messages.ANALYSES_MISSING_FAULT_LOCATION_BUS)
       return
     }
     const faultType = this.getFaultType()
     if (faultType === '-1') {
       this.app.notification.showError(messages.ANALYSES_MISSING_FAULT_TYPE)
       return
     }
     const phaseToFaultOptions = this.getPhaseToFaultOptions()
     const phaseToFault = this.getPhaseToFault()
     if (phaseToFaultOptions.length !== 0 && phaseToFault === '-1') {
       this.app.notification.showError(messages.ANALYSES_MISSING_PHASE_TO_FAULT)
       return
     }
    }
    successCallback()
  }

  updateStudyName() {
    document.getElementById(constants.SELECTORS.STUDY_NAME).value = `${document.getElementById(constants.SELECTORS.ANALYSIS_TITLE).innerText} study`
  }

  setRunState() {
    const selectedAnalysisRow = document.querySelector(`${constants.SELECTORS.AVAILABLE_ANALYSES_TABLE} tr.selected`)
    this.selectedEconomicProfiles = this.getGisProfileCheckboxValues()

    this.runAnalysisData = {
      AnalyticTypeId: Number(selectedAnalysisRow.getAttribute(constants.SELECTORS.DATA_ANALYTIC_PROVIDER_ANALYTIC_ID)),
      StudyName: document.getElementById(constants.SELECTORS.STUDY_NAME).value,
      StudyNotes: document.getElementById(constants.SELECTORS.STUDY_NOTES).value || null,
      StudyData: this.getStudyData(),
      GisResultProfiles: this.selectedEconomicProfiles
    }

    if (this.runAnalysisChecked) {
      this.runAnalysisData.RunWithWarnings = true
    } else {
      this.runAnalysisData.RunWithWarnings = false
    }

    console.table(this.runAnalysisData)
  }

  /// Munges together the state needed to send in the StudyData parameter. This state varies based on the type of analysis.
  getStudyData() {
    const data = []

    // Always send in the selected Swing Bus as the first parameter
    data.push(this.selectedSwingBus === null ? '' : this.getEquipmentNameFromSelectedRow(this.selectedSwingBus))

    // If this is a Short-Circuit Analysis, gather remaining data
    if (this.isShortCircuitAnalysis) {
      const faultAllBuses = this.getFaultAllLocations()
      data.push(faultAllBuses || this.selectedFaultLocation === null ? '' : this.getEquipmentNameFromSelectedRow(this.selectedFaultLocation))
      data.push(this.getFaultType())
      data.push(this.getPhaseToFault())
      data.push(faultAllBuses.toString())
      data.push(this.getFixedXR().toString())
    }

    return data.join('|')
  }

  /// Returns true if this is a short-circuit analysis and the Fault Location drop-down list is set to All Buses; false otherwise
  getFaultAllLocations() {
    if (!this.isShortCircuitAnalysis) {
      return false
    } else {
      const ddl = document.getElementById(constants.SELECTORS.ANALYSIS_FAULT_LOCATION_NAME)
      return ddl && ddl.value === 'true'
    }
  }

  /// Returns true if this is a short-circuit analysis and the Fixed X/R drop-down list is set to Yes; false otherwise
  getFixedXR() {
    if (!this.isShortCircuitAnalysis) {
      return false
    } else {
      const ddl = document.getElementById(constants.SELECTORS.ANALYSIS_FIXED_XR_NAME)
      return ddl && ddl.value === 'true'
    }
  }

  /// Returns the selected Fault Type. If this is not a short-circuit analysis or if the user has not selected a fault type, this returns '-1'
  getFaultType() {
    if (!this.isShortCircuitAnalysis) {
      return '-1'
    } else {
      const ddl = document.getElementById(constants.SELECTORS.ANALYSIS_FAULT_TYPE_NAME)
      return ddl.value === null ? '-1' : ddl.value
    }
  }

  /// Returns the selected Phase to Fault. If this is not a short-circuit analysis or if the user has not selected a fault type, this returns '-1'
  getPhaseToFault() {
    if (!this.isShortCircuitAnalysis) {
      return '-1'
    } else {
      const ddl = document.getElementById(constants.SELECTORS.ANALYSIS_PHASES_TO_FAULT_NAME)
      const container = document.getElementById(constants.SELECTORS.ANALYSIS_PHASES_TO_FAULT_CONTAINER)
      return (container.style.display === 'none' || ddl.value === null) ? '-1' : ddl.value
    }
  }

  // For testing only
  // getDummyRunAnalysisResponse() {
  //   return {
  //     "Results": [
  //       {
  //         "OneLineProjectAnalysisId": "426ed8d0-54d8-436c-b1ee-6133f04af9ed",
  //         "GisResultProfileId": -1,
  //         "GisResultProfileDescription": "Current network settings",
  //         "Errors": [
  //           'Load 1 does not have the proper hydrospanner.',
  //           'Wind Alpha is lacking the proper carbonite. Go back and fix it or else.',
  //           'The network has too many flux capacitors, and the length of this message is annoyingly long.'
  //         ]
  //       },
  //       {
  //         "OneLineProjectAnalysisId": "90dd41a3-4d3a-4501-b921-a232cae210be",
  //         "GisResultProfileId": 30,
  //         "GisResultProfileDescription": "Exec Summary Testing - Optimization #10 - January - Week - H16",
  //         "Errors": []
  //       },
  //       {
  //         "OneLineProjectAnalysisId": "e84eb7a9-1507-4971-94f1-a13fb18f8096",
  //         "GisResultProfileId": 37,
  //         "GisResultProfileDescription": "New GIS Project - Optimization #10 - January - Week - H11",
  //         "Errors": [
  //           'Short message 1.',
  //           'Brevity is the soul of wit.'
  //         ]
  //       },
  //       {
  //         "OneLineProjectAnalysisId": "90dd41a3-4d3a-4501-b921-a232cae210be",
  //         "GisResultProfileId": 33,
  //         "GisResultProfileDescription": "Reading Rainbow - Optimization #24 - December - Week - H02",
  //         "Errors": []
  //       }
  //     ],
  //     "AnalysisValidationResults": []
  //   }
  // }

  postRunAnalysis() {
    console.log('Analyses.postRunAnalysis()::request', this.runAnalysisData)

    this.app.synchronousFetcher.post(this.postRunAnalysisDataUrl, this.runAnalysisData).then(response => {
      console.log('Analyses.postRunAnalysis()::response', response)
      setTimeout(() => {
        if (response.data)
          this.onPostRunAnalysisSuccess(response)

          // For testing only
          //this.onPostRunAnalysisSuccess(this.getDummyRunAnalysisResponse())

        else
          this.onPostRunAnalysisError(response)
        utils.hideBlockingSpinner()
      }, 1000)
    }).catch(error => {
      this.onPostRunAnalysisFailure(error)
    })
  }
  
  onPostRunAnalysisSuccess(response) {

    // Warnings and/or errors to display in a grid for one or more analyses
    if (response.data.AnalysisValidationResults.length > 0) {
      this.runAnalysisErrors = response.data.AnalysisValidationResults
      this.runAnalysisChecked = true
      this.renderAnalysisErrors()
      this.addFixLinkListeners()

      // Ensure no event listeners stack up in the button row
      document.querySelector(constants.SELECTORS.ANALYSES_ERRORS_CONTENT_BUTTON_ROW).innerHTML =
          document.querySelector(constants.SELECTORS.ANALYSES_ERRORS_CONTENT_BUTTON_ROW).innerHTML
      this.addCancelOptionsButtonListener()
      this.addDestroyErrorGridButtonListener()
      this.addRunAgainButtonListener()
      this.wizard.go('>>')

    // At least some analyses (if not all) ran OK
    } else if (response.data.Results.length > 0) {
      const results = response.data.Results

      this.wizard.go('>>')
      this.completedAnalysesDataTable.destroy()
      this.completedAnalysesDataTable = null

      this.resetAndShowCompletedAnalyses()

      // If any of the analyses has runtime Errors, display a message template that lists both successes and errors
      if (!!results.find(x => x.Errors.length > 0)) {
        this.app.notification.showWideImportantMessage(this.getRuntimeErrorMessage(results))
      } else {
        this.app.notification.showSuccess(messages.ANALYSES_RUNTIME_SUCCESS_MESSAGE)
      }

    } else {
      console.error('Analyses.onPostRunAnalysisSuccess():', 'Response looks incorrect')
    }

    console.log('Analyses.onPostRunAnalysisSuccess()::response', response)
  }

  resetAndShowCompletedAnalyses() {
    this.removeCompletedAnalyses()
    this.getCompletedAnalyses()
    this.wizard.go('<<')
    this.runAnalysisChecked = false
    App.Project.updateLastModifiedDate()
  }

  getRuntimeErrorMessage(results) {
    // Determine which analyses are good and which have runtime errors
    const goodAnalyses = results.filter(x => x.Errors.length === 0)
    const badAnalyses = results.filter(x => x.Errors.length > 0)

    return `${this.makeGoodAnalysesMessageSection(goodAnalyses)} ${this.makeBadAnalysesMessageSection(badAnalyses)}`
  }

  makeGoodAnalysesMessageSection(goodAnalyses) {
    // if (!Array.isArray(goodAnalyses))
    //   goodAnalyses = [goodAnalyses]

    return `
        The following analyses ran successfully:
        <br>
        <br>
        <ul class="good-analysis-list">
          ${goodAnalyses.map(x => `<li>${x.GisResultProfileDescription}</li>`).join(' ')}
        </ul>
    `
  }

  makeBadAnalysesMessageSection(badAnalyses) {
    // if (!Array.isArray(badAnalyses))
    //   badAnalyses = [badAnalyses]

    let messageHeader = `
        The following analyses failed due to runtime errors:
        <br>
        <br>
    `
    let messageBody = []

    badAnalyses.forEach(x => {
      let errors = ''
      x.Errors.forEach(item => 
        errors += `<li>${item}</li> `
      )
      messageBody.push(`
        <ul class="bad-analysis-list">
          <li>
            ${x.GisResultProfileDescription}
            <br>
            <ol class="bad-analysis-error-list">
              ${errors}
            </ol>
          </li>
        </ul>
      `)
    })
    return `${messageHeader} ${messageBody.join(' ')}`
  }

  renderAnalysisErrors() {

    this.runAnalysisChecked = false

    // Remove any existing table rows
    Array.from(
      document.querySelectorAll('.general-warning-row, .general-error-row, .warning-row, .error-row')
    ).forEach(x => x.remove())

    if (this.runAnalysisErrors.length > 0) {

      // Generate table rows
      this.errorMarkup = this.runAnalysisErrors.map((item, i) => {
        let tableRow
        if (item.IsWarning && item.AssociatedProjectElementId === null) {
          tableRow = `
            <tr class="general-warning-row">
              <td class="icon-cell"><i class="fal fa-exclamation-circle fa-2x"></i></td>
              <td>${item.Message}</td>
              <td></td>
            </tr>
          `
        } else if (!item.IsWarning && item.AssociatedProjectElementId === null) {
          tableRow = `
            <tr class="general-error-row">
              <td class="icon-cell"><i class="fal fa-skull-crossbones fa-2x"></i></td>
              <td>${item.Message}</td>
              <td></td>
            </tr>
          `
        } else if (item.IsWarning) {
          tableRow = `
            <tr class="warning-row" data-equipment-id="${item.AssociatedProjectElementId}">
              <td class="icon-cell"><i class="fal fa-exclamation-circle fa-2x"></i></td>
              <td>${item.Message}</td>
              <td><a class="fix-link" href="javascript:;" tooltip="Fix">Fix</a></td>
            </tr>
          `
        } else if (!item.IsWarning) {
          tableRow = `
            <tr class="error-row" data-equipment-id="${item.AssociatedProjectElementId}">
              <td class="icon-cell"><i class="fal fa-skull-crossbones fa-2x"></i></td>
              <td>${item.Message}</td>
              <td><a class="fix-link" href="javascript:;" tooltip="Fix">Fix</a></td>
            </tr>
          `
        }
        return tableRow
      })

      // Append rows to error-grid table
      document.querySelector(`#analysis-errors-panel ${constants.SELECTORS.ERROR_GRID_BODY}`).innerHTML = this.errorMarkup.join("\n")

      // Show table and label and the appropriate Run button text
      utils.show('.table-title, .error-grid')

      // Determine if there were only warnings reported...
      let onlyWarnings = this.runAnalysisErrors.every(entry => entry.IsWarning)

      if (onlyWarnings) {
        // Flag that the analysis has been validated and can be run despite warnings
        this.runAnalysisChecked = true
        document.querySelector(constants.SELECTORS.RUN_AGAIN_BUTTON).innerText = 'Run Despite Warnings'
      } else {
        document.querySelector(constants.SELECTORS.RUN_AGAIN_BUTTON).innerText = 'Run Again'
      }

      document.querySelector(constants.SELECTORS.RUN_AGAIN_BUTTON).style.display = 'inline'

    } else {
      console.log('Analyses.renderAnalysisErrors()', 'No errors or warnings to render')
    }
  }

  addFixLinkListeners() {
    utils.addEventListenerByClass('fix-link', 'click', (event) => {
      const equipmentId = event.target.closest('tr').getAttribute('data-equipment-id')

      // Pop open the right branch/node modal
      const oneLineEquipmentItem = App.Project.getOneLineNode(equipmentId) || App.Project.getOneLineBranch(equipmentId)
      this.app.SelectedProjectElement = oneLineEquipmentItem
      this.app.editSelectedItem()
      utils.simulateClick(document.querySelector('.modal.fade.show .loadMore'))

      // Delete error grid rows that have this equipment ID
      this.deleteErrorGridRows(equipmentId)
      this.hideEmptyTable()
    })
  }

  addDestroyErrorGridButtonListener() {
    const destroyErrorGridButton = document.querySelector(constants.SELECTORS.DESTROY_ERROR_GRID_BUTTON)
    const destroyErrorGridEntries = () => {
      this.wizard.go('<')
      setTimeout(() => {
        utils.emptyInnerHTML(constants.SELECTORS.ERROR_GRID_BODY)
        utils.removeEvent(destroyErrorGridButton, 'click', destroyErrorGridEntries)
      }, 500)
    }
    utils.addEvent(destroyErrorGridButton, 'click', destroyErrorGridEntries)
  }

  addRunAgainButtonListener() {
    const runButton = document.querySelector(constants.SELECTORS.RUN_AGAIN_BUTTON)
    const postRunAnalysis = () => {
      this.setRunState()
      this.validateRunState(() => {
        utils.showBlockingSpinner()
        this.postRunAnalysis()
      })
    }
    runButton.removeEventListener('click', postRunAnalysis)
    runButton.addEventListener('click', postRunAnalysis, { once: true })
  }

  deleteErrorGridRows(equipmentId)  {
    const rowsToDelete = document.querySelectorAll(`[data-equipment-id="${equipmentId}"]`)
    Array.from(rowsToDelete).forEach(row => {
      utils.fadeOut(row, 250, 10, () => {
        row.remove()
      })
    })
  }
  
  hideEmptyTable() {
    if (document.querySelectorAll(`${constants.SELECTORS.ERROR_GRID_BODY} tr`).length === 0) {
      utils.hide(constants.SELECTORS.ERROR_GRID)
    }
  }

  onPostRunAnalysisError(response) {
    this.app.notification.showError(response.data.message)
  }

  onPostRunAnalysisFailure(error) {
    console.error('Analyses.onPostRunAnalysisFailure()::error', error)
    this.app.notification.showError(messages.SERVER_ERROR)
  }
}
