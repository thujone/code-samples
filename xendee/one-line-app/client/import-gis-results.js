/****************************************************************************
 ** Interface for Importing GIS Results for the One Line application.
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import numeral from 'numeral'
import palette from 'google-palette'
import pattern from 'patternomaly'
import bootstrap from 'bootstrap'
import Chart from 'chart.js/auto';
import App from './app.js'
import utils from './utils.js'
import constants from './constants.js'
import messages, { getMessage } from './messages.js'
import ModalTemplate from './modal-template.js'
import Glide, { Controls, Breakpoints } from '../vendor/glide-modular-esm-3.4.1.js'

export default class ImportGisResults {
  constructor(app) {
    this.app = app
    this.getCompletedProfilesUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_IMPORTED_GIS_PROJECT_PROFILES}/${window.oneLineProjectId}`
    this.deleteProjectProfileUrl = `${constants.API_PATH}/${constants.RESOURCES.DELETE_IMPORTED_GIS_PROJECT_PROFILE}/${window.oneLineProjectId}?oneLineOptimizationProjectImportProfileId=`
    this.getImportableGisProjectsUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_IMPORTABLE_GIS_PROJECTS}/${window.oneLineProjectId}`
    this.getImportableGisProjectsResultsUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_IMPORTABLE_GIS_PROJECT_RESULTS}/${window.oneLineProjectId}?optimizationProjectId=`
    this.getImportedGisProjectProfileUrl = profileId => `${constants.API_PATH}/${constants.RESOURCES.GET_IMPORTED_GIS_PROJECT_PROFILE}/${window.oneLineProjectId}?profileId=${profileId}`
    this.getImportableGisProjectResultDataUrl = (projectId, resultId) =>
      `${constants.API_PATH}/${constants.RESOURCES.GET_IMPORTABLE_GIS_PROJECT_RESULT_DATA}/${window.oneLineProjectId}?optimizationProjectId=${projectId}&optimizationProjectResultId=${resultId}`
    this.getDispatchDataUrl = (projectId, resultId, month, dayType) =>
      `${constants.API_PATH}/${constants.RESOURCES.GET_IMPORT_GIS_DISPATCH_DATA}/${window.oneLineProjectId}?optimizationProjectId=${projectId}&optimizationProjectResultId=${resultId}&month=${month}&dayType=${dayType}`
    this.postProfileDataUrl = `${constants.API_PATH}/${constants.RESOURCES.SAVE_IMPORTABLE_GIS_PROJECT_RESULTS_PROFILE}/${window.oneLineProjectId}`

    this.wizard = null                              // Wizard for new imports
    this.animationDuration = 500                    // Duration of gliding between wizard steps
    this.completedImportGisResultsTable = null
    this.availableGisResultsContext = []
    this.availableImportGisDataTable
    this.selectedProjectId = null                   // Keep track of which project is currently selected
    this.selectedProjectName = ''
    this.selectedResultId = null
    this.use8760Dispatch
    this.projectYear
    this.hasEmergencyDayType
    this.gisNodes = {}                              // The imported optimization result data
    this.apportionableEquipment = {}
    this.gisLoads = []
    this.gisEv= []
    this.gisWind = []
    this.gisGenerators = []
    this.gisStorage = []
    this.gisSolar = []
    this.oneLineLoads = App.Project.getNodesByType(constants.NODE_TYPES.LOAD).filter(x => !x.Details.IsEVLoad)
    this.oneLineEv = App.Project.getNodesByType(constants.NODE_TYPES.LOAD).filter(x => x.Details.IsEVLoad)
    this.oneLineWind = App.Project.getNodesByType(constants.NODE_TYPES.WIND)
    this.oneLineGenerators = App.Project.getNodesByType(constants.NODE_TYPES.GENERATOR)
    this.oneLineStorage = App.Project.getNodesByType(constants.NODE_TYPES.STORAGE)
    this.oneLineSolar = App.Project.getNodesByType(constants.NODE_TYPES.SOLAR)
    this.chartContainer
    this.dispatchChart = null                       // Electricity dispatch Chart.js instance
    this.monthDropdown
    this.monthDropdownLastChild
    this.dayTypeDropdown
    this.dayTypeDropdownLastChild
    this.hourDropdown
    this.hourDropdownLastChild
    this.profileData
    this.profileName
  }

  get projectTypeId() { return this._projectTypeId }
  set projectTypeId(value) { this._projectTypeId = value }

  main() {
    this.registerHandlebarsHelpers()
    this.getCompletedProfiles()
  }

  registerHandlebarsHelpers() {
    Handlebars.registerHelper('times', (n, block) => {
      let accumulator = ''

      for (var i = 0; i < n; ++i) {
          block.data.index = i
          block.data.first = i === 0
          block.data.last = i === (n - 1)
          block.data.position = i + 1
          accumulator += block.fn(this)
      }
      return accumulator
    })
  }

  getCompletedProfiles() {
    this.app.synchronousFetcher.get(this.getCompletedProfilesUrl).then(response => {
      console.log('ImportGisResults.getCompletedProfiles()::response', response)

      if (response.status === 200) {
        this.getCompletedProfilesSuccess(response)
      } else
        this.getCompletedProfilesError(response)

      return response

    }).catch(error => {
      this.getCompletedProfilesFailure(error)
      return error
    })
  }

  getCompletedProfilesError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  getCompletedProfilesFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }
  
  getCompletedProfilesSuccess(response) {
    const templateName = constants.TEMPLATE_NAMES.IMPORT_GIS_HOME_TEMPLATE
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const context = {
      data: {}
    }
    context.data.modalName = constants.MODALS.IMPORT_GIS_HOME
    context.data.completedProfiles = response.data

    this.completedProfilesModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.completedProfilesModalTemplate.prepareContext()
    console.log('Results.getCompletedProfilesSuccess::context', context)
    this.completedProfilesModalTemplate.execute()

    this.applyCompletedProfilesDataTable()
    this.addViewProfileLinkListeners()
    this.addDeleteProfileLinkListener()
    this.addCancelButtonListener()
    this.addBackToOneLineButtonListener()
    this.addNewGisImportButtonListener()

    this.app.printingOverlay.resetPrintOverlay()

    this.wizard = new Glide('.glide', { animationDuration: this.animationDuration }).mount({ Controls, Breakpoints })
    this.addWizardEventListener()
    this.hideWizardBullets()

    return response
  }

  applyCompletedProfilesDataTable() {
    this.completedProfilesTable = jQuery(constants.SELECTORS.COMPLETED_PROFILES_TABLE).DataTable({
      paging: false,
      searching: true,
      scrollCollapse: true,
      scrollY: '400px',
      scrollX: true,
      order: [
        [1, 'asc'],
        [2, 'asc'],
        [3, 'asc'],
        [4, 'asc'],
        [5, 'asc'],
        [6, 'asc']
      ],
      columnDefs: [
        { orderable: false, targets: [6] }
      ]
    })
    this.completedProfilesTable.columns.adjust().draw()
  }

  addViewProfileLinkListeners() {
    utils.addEventListenerByClass(constants.SELECTORS.VIEW_PROFILE_LINK, 'click', (event) => {
      const profileId = event.target.closest('tr').getAttribute('data-profile-id')
      this.getProfile(profileId, (response) => {
        this.viewProfile(response)
      })
    })
  }

  getProfile(profileId, successCallback) {
    this.app.synchronousFetcher.get(`${this.getImportedGisProjectProfileUrl(profileId)}`).then(response => {
      console.log('ImportGisResults.getProfile()::response', response)
      if (response.status === 200)
        successCallback(response)
      else
        this.onGetProfileError(response)
    }).catch(error => {
        this.onGetProfileFailure(error)
    })
  }

  onGetProfileError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetProfileFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  viewProfile(response) {
    const templateName = constants.TEMPLATE_NAMES.IMPORT_GIS_VIEW_PROFILE_TEMPLATE
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const allocation = response.data.Allocation

    const loadNodes = Array.from(allocation.filter(x => x.NodeType === constants.NODE_TYPES.LOAD))
      .sort((x, y) => (x.GISTechName > y.GISTechName) ? -1 : 1)
    loadNodes.forEach(x => x.isDeleted = App.Project.getOneLineNodeByName(x.OneLineNodeName) === null ? true : false)
    loadNodes.forEach((x, i) => {
      if (i === 0 || (i >= 1 && x.GISTechName !== loadNodes[i - 1].GISTechName))
        x.isNewGroupMarker = true
      else
        x.isNewGroupMarker = false
    })

    // Group load nodes by GIS Name
    let loadNodeGroups = []
    const loadNodeGisNames = [...new Set(loadNodes.map(x => x.GISTechName))]
    loadNodeGisNames.forEach((item, i) => {
      loadNodeGroups.push({
        groupName: item,
        groupAllocations: loadNodes.filter(x => x.GISTechName === item)
      })
    })

    const evNodes = Array.from(allocation.filter(x => x.NodeType === constants.NODE_TYPES.EV))
      .sort((x, y) => (x.GISTechName > y.GISTechName) ? -1 : 1)
    evNodes.forEach(x => x.isDeleted = App.Project.getOneLineNodeByName(x.OneLineNodeName) === null ? true : false)
    evNodes.forEach((x, i) => {
      if (i === 0 || (i >= 1 && x.GISTechName !== evNodes[i - 1].GISTechName))
        x.isNewGroupMarker = true
      else
        x.isNewGroupMarker = false
    })

    // Group load nodes by GIS Name
    let evNodeGroups = []
    const evNodeGisNames = [...new Set(evNodes.map(x => x.GISTechName))]
    evNodeGisNames.forEach((item, i) => {
      evNodeGroups.push({
        groupName: item,
        groupAllocations: evNodes.filter(x => x.GISTechName === item)
      })
    })

    const storageNodes = Array.from(allocation.filter(x => x.NodeType === constants.NODE_TYPES.STORAGE))
      .sort((x, y) => (x.GISTechName > y.GISTechName) ? -1 : 1)
    storageNodes.forEach(x => x.isDeleted = App.Project.getOneLineNodeByName(x.OneLineNodeName) === null ? true : false)
    storageNodes.forEach((x, i) => {
      if (i === 0 || (i >= 1 && x.GISTechName !== storageNodes[i - 1].GISTechName))
        x.isNewGroupMarker = true
      else
        x.isNewGroupMarker = false
    })

    // Group storage nodes by GIS Name
    let storageNodeGroups = []
    const storageNodeGisNames = [...new Set(storageNodes.map(x => x.GISTechName))]
    storageNodeGisNames.forEach((item, i) => {
      storageNodeGroups.push({
        groupName: item,
        groupAllocations: storageNodes.filter(x => x.GISTechName === item)
      })
    })

    const solarNodes = Array.from(allocation.filter(x => x.NodeType === constants.NODE_TYPES.SOLAR))
      .sort((x, y) => (x.GISTechName > y.GISTechName) ? -1 : 1)
    solarNodes.forEach(x => x.isDeleted = App.Project.getOneLineNodeByName(x.OneLineNodeName) === null ? true : false)
    solarNodes.forEach((x, i) => {
      if (i === 0 || (i >= 1 && x.GISTechName !== solarNodes[i - 1].GISTechName))
        x.isNewGroupMarker = true
      else
        x.isNewGroupMarker = false
    })

    // Group solar nodes by GIS Name
    let solarNodeGroups = []
    const solarNodeGisNames = [...new Set(solarNodes.map(x => x.GISTechName))]
    solarNodeGisNames.forEach((item, i) => {
      solarNodeGroups.push({
        groupName: item,
        groupAllocations: solarNodes.filter(x => x.GISTechName === item),
      })
    })

    const windNodes = Array.from(allocation.filter(x => x.NodeType === constants.NODE_TYPES.WIND))
      .sort((x, y) => (x.GISTechName > y.GISTechName) ? -1 : 1)
    windNodes.forEach(x => x.isDeleted = App.Project.getOneLineNodeByName(x.OneLineNodeName) === null ? true : false)
    windNodes.forEach((x, i) => {
      if (i === 0 || (i >= 1 && x.GISTechName !== windNodes[i - 1].GISTechName))
        x.isNewGroupMarker = true
      else
        x.isNewGroupMarker = false
    })

    const generatorNodes = Array.from(allocation.filter(x => x.NodeType === constants.NODE_TYPES.GENERATOR))
      .sort((x, y) => (x.GISTechName > y.GISTechName) ? -1 : 1)
    generatorNodes.forEach(x => x.isDeleted = App.Project.getOneLineNodeByName(x.OneLineNodeName) === null ? true : false)
    generatorNodes.forEach((x, i) => {
      if (i === 0 || (i >= 1 && x.GISTechName !== generatorNodes[i - 1].GISTechName))
        x.isNewGroupMarker = true
      else
        x.isNewGroupMarker = false
    })

    const context = {
      data: {
        loadNodeGroups,
        evNodeGroups,
        storageNodeGroups,
        solarNodeGroups,
        windNodes,
        generatorNodes,
        modalName: constants.MODALS.IMPORT_GIS_VIEW_PROFILE,
        profile: response.data
      }
    }

    this.viewProfileModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.viewProfileModalTemplate.prepareContext()
    this.viewProfileModalTemplate.execute(constants.SELECTORS.IMPORT_GIS_VIEW_PROFILE_PANEL, false)

    this.addViewProfilePreviousButtonListener()
    this.wizard.go('>>')
    this.hideWizardBullets()
    this.addBackToOneLineButtonListener()
  }

  addViewProfilePreviousButtonListener() {
    const viewProfilePreviousButton = document.querySelector(constants.SELECTORS.VIEW_PROFILE_PREVIOUS_BUTTON)
    utils.addEvent(viewProfilePreviousButton, 'click', (event) => {
      event.preventDefault()
      utils.emptyInnerHTML(constants.SELECTORS.IMPORT_GIS_VIEW_PROFILE_PANEL)
      this.wizard.go('<<')
    })
  }

  addDeleteProfileLinkListener() {
    utils.addEventListenerByClass(constants.SELECTORS.DELETE_PROFILE_LINK, 'click', (event) => {
      const profileRow = event.target.closest('tr')
      const profileCellValues = Array.from(profileRow.querySelectorAll('td')).map(x => x.innerText)
      const profileName = `${profileCellValues[0]}: ${profileCellValues[1]} (${profileCellValues[2]} ${profileCellValues[3]} ${profileCellValues[4]})`
      
      this.showDeleteProfilePrompt(profileName, event)
    })
  }

  showDeleteProfilePrompt(profileName, event) {
    this.app.notification.showConfirm(
      getMessage(messages.CONFIRM_DELETE_GIS_IMPORT_PROFILE, [profileName]),
      () => this.deleteProfile(event),
      () => {}
    )
  }

  deleteProfile(event) {
    const profileId = event.target.closest('tr').getAttribute('data-profile-id')
    const profileName = event.target.closest('tr').getAttribute('data-profile-name')
    const requestBody = { oneLineOptimizationProjectImportProfileId: profileId }

    this.app.synchronousFetcher.delete(`${this.deleteProjectProfileUrl}${profileId}`, requestBody).then(response => {
      console.log('deleteProfile()::response', response)

      if (response.data.success) {
        this.onDeleteProfileSuccess(profileId, profileName)
      } else {
        this.app.notification.showError(response.data.message)
      }
    }).catch(error => {
      this.app.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  onDeleteProfileSuccess(profileId, profileName) {
    this.completedProfilesTable.row(document.querySelector(`tr[data-profile-id="${profileId}"]`)).remove().draw(false)
    this.app.notification.showSuccess(`<strong>${profileName}</strong> was deleted.`)
    App.Project.updateLastModifiedDate()
  }

  addNewGisImportButtonListener() {
    const newGisImportButton = document.querySelector(constants.SELECTORS.NEW_GIS_IMPORT_BUTTON)
    utils.addEvent(newGisImportButton, 'click', () => {
      const hasExistingLoad = this.checkForExistingLoad()
      hasExistingLoad && this.getImportableGisProjects()
    })
  }

  addBackToOneLineButtonListener() {
    const backToOneLineButtons = Array.from(document.querySelectorAll(constants.SELECTORS.IMPORT_GIS_BACK_TO_ONE_LINE_BUTTON))
    backToOneLineButtons.forEach(item => {
      utils.addEvent(item, 'click', () => {
        this.app.activateAppMode(constants.APP_MODES.MAIN)
        $('.close').click()
      })
    })
  }

  addWizardEventListener() {
    this.wizard.on('run', () => {
      if (this.wizard.index === 0) {
        this.hideWizardBullets()
        this.completedImportGisResultsTable && this.completedImportGisResultsTable.destroy()
        utils.emptyInnerHTML(
          constants.SELECTORS.IMPORT_GIS_NEW_CONTENT,
          constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_PANEL,
          constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_NEW_PANEL,
          constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_OPTIONS_PANEL,
          constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_OPTIONS_PANEL,
          constants.SELECTORS.IMPORT_GIS_VIEW_PROFILE_PANEL
        )
      }
      else this.showWizardBullets()
    })
  }

  showWizardBullets() {
    utils.show(constants.SELECTORS.GLIDE_BULLETS)
    utils.show(constants.SELECTORS.STEP_LABELS)
    utils.show(constants.SELECTORS.ADD_NEW_IMPORTABLE_GIS_PROJECTS_HEADER)
  }

  hideWizardBullets() {
    utils.hide(constants.SELECTORS.GLIDE_BULLETS)
    utils.hide(constants.SELECTORS.STEP_LABELS)
    utils.hide(constants.SELECTORS.ADD_NEW_IMPORTABLE_GIS_PROJECTS_HEADER)
  }

  checkForExistingLoad() {
    if (this.oneLineLoads.length === 0 && this.oneLineEv.length === 0) {
      this.app.notification.showError(messages.MISSING_LOAD)
      return false
    }
    return true
  }

  getImportableGisProjects() {
    this.app.synchronousFetcher.get(this.getImportableGisProjectsUrl).then(response => {
      console.log('ImportGisResults.getImportableGisProjects()::response', response)
      
      if (response.status === 200) {
        this.onGetImportableGisProjectsSuccess(response)
      } else
        this.onGetImportableGisProjectsError(response)

      return response

    }).catch(error => {
      this.onGetImportableGisProjectsFailure(error)
      return error
    })
  }

  onGetImportableGisProjectsError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetImportableGisProjectsFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }
  
  onGetImportableGisProjectsSuccess(response) {
    const templateName = constants.TEMPLATE_NAMES.IMPORTABLE_GIS_PROJECTS_TEMPLATE
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const context = {
      data: {
        modalName: constants.MODALS.IMPORTABLE_GIS_PROJECTS,
        optimizationProjectsData: response.data
      }
    }

    document.getElementById('importable-gis-projects-new-panel').innerHTML = ''
    this.importableGisProjectsModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.importableGisProjectsModalTemplate.prepareContext()

    console.log('ImportGisResults.onGetImportableGisProjectsSuccess::context', context)

    this.importableGisProjectsModalTemplate.execute(constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_PANEL, false)
    this.applyImportGisResultsTable()
    this.addProjectClickListener()
    this.addBackToOneLineButtonListener()
    this.addNewBackButtonListener()
    this.app.printingOverlay.resetPrintOverlay()

    utils.show(constants.SELECTORS.GLIDE_BULLETS)
    this.wizard.go('>')

    return response
  }

  applyImportGisResultsTable() {
    this.completedImportGisResultsTable = jQuery(constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_TABLE).DataTable({
      paging: false,
      searching: true,
      scrollCollapse: true,
      scrollY: '280px',
      scrollX: true,
      order: [
        [3, 'desc'] // Last Modified Date
      ],
      columnDefs: [
        { orderable: false, targets: [0] }
      ]
    })
    this.completedImportGisResultsTable.columns.adjust().draw()
  }

  addProjectClickListener() {
      const gisResultsList = document.querySelectorAll(constants.SELECTORS.GIS_PROJECTS_LIST_TR)
      Array.from(gisResultsList).forEach(project => {
          utils.addEvent(project, 'click', () => this.getAvailableGisResults(project, project.dataset.projectName))
      })
  }

  getAvailableGisResults(response, responseProjectName) {
    this.selectedProjectId = response.dataset.projectId
    this.selectedProjectName = response.dataset.projectName
    this.app.synchronousFetcher.get(`${this.getImportableGisProjectsResultsUrl}${this.selectedProjectId}`).then(response => {
      console.log('ImportGisResults.getAvailableGisResults()::response', response)
      if (response.status === 200)
        this.onGetAvailableGisResultsSuccess(response, responseProjectName)
      else
        this.onGetAvailableGisResultsError(response)
    }).catch(error => {
      this.onGetAvailableGisResultsFailure(error) 
    })
  }

  onGetAvailableGisResultsError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetAvailableGisResultsFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  onGetAvailableGisResultsSuccess(response) {
    const templateName = constants.TEMPLATE_NAMES.IMPORTABLE_GIS_PROJECTS
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const context = {
      data: {
        modalName: constants.MODALS.IMPORTABLE_GIS_RESULTS,
        results: response.data,
        projectName: this.selectedProjectName,
        projectId: this.selectedProjectId
      }
    }

    this.availableGisResultsModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.availableGisResultsModalTemplate.prepareContext()
    console.log('ImportGisResults.onGetAvailableGisResultsSuccess::context', context)
    this.availableGisResultsModalTemplate.execute(constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_NEW_PANEL, false)
    this.applyAvailableGisResultsDataTable()
    this.addBackToOneLineButtonListener()
    this.addCancelButtonListener()
    this.addPreviousButtonListener()
    this.addResultClickListener()

    utils.show(constants.SELECTORS.GLIDE_BULLETS)
    this.wizard.go('>')
    return response
  }

  applyAvailableGisResultsDataTable() {
    this.availableGisResultsDataTable = jQuery(constants.SELECTORS.IMPORTABLE_GIS_PROJECT_RESULTS_TABLE).DataTable({
      paging: false,
      searching: true,
      scrollCollapse: true,
      scrollY: '350px',
      scrollX: true,
      order: [
        [0, 'desc'] // Result #
      ],
      columnDefs: [
        // { orderable: false, targets: [0] }
      ],
      select: {
        // style: 'single'
      }
    })
    this.availableGisResultsDataTable.columns.adjust().draw()
  }

  addResultClickListener() {
    const GisResultsList = document.querySelectorAll(constants.SELECTORS.GIS_RESULTS_LIST_TR)
    Array.from(GisResultsList).forEach((item) => {
      utils.addEvent(item, 'click', () => this.showMappingForm(item))
    });
  }

  showMappingForm(result) {
    const templateName = constants.TEMPLATE_NAMES.IMPORTABLE_GIS_RESULT_TEMPLATE
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const {resultName, resultId} = result.dataset

    this.getGisResultNodes(resultId, (response) => {
      this.apportionableEquipment = {}
      this.gisNodes = {}
      this.use8760Dispatch = response.data.Use8760Dispatch
      this.projectYear = response.data.ProjectYear
      this.hasEmergencyDayType = response.data.HasEmergencyDayType

      // TODO: REMOVE (TESTING ONLY)
      //response.data.DataItems = response.data.DataItems.filter(x => x.NodeType !== 'STORAGE')

      response.data.DataItems.forEach(x => {
        this.gisNodes[x.NodeType] = {
          Name: x.Name,
          Capacity: x.Capacity,
          Count: x.Count,
          Units: x.Units
        }
      })

      this.gisWind = []
      response.data.DataItems.filter(x => x.NodeType === constants.NODE_TYPES.WIND).forEach((y, index) => {
        this.gisWind.push(
          {
            Name: y.Name,
            Capacity: y.Capacity,
            Count: y.Count,
            Units: y.Units,
            Index: index
          }
        )
      })

      // Stuff an array of empty strings into the data so that Handlebars can easily generate the dropdown
      // of # of units for each One-Line Wind Turbine.
      this.gisWind.forEach(item => {
        item.countArr = []
        for (let i = 0; i <= item.Count; i++) {
          item.countArr.push('')
        }
      })

      this.gisGenerators = []
      response.data.DataItems.filter(x => x.NodeType === constants.NODE_TYPES.GENERATOR).forEach((y, index) => {
        this.gisGenerators.push(
          {
            Name: y.Name,
            Capacity: y.Capacity,
            Count: y.Count,
            Units: y.Units,
            Index: index
          }
        )
      })

      // Stuff an array of empty strings into the data so that Handlebars can easily generate the dropdown
      // of # of units for each One-Line generator.
      this.gisGenerators.forEach(item => {
        item.countArr = []
        for (let i = 0; i <= item.Count; i++) {
          item.countArr.push('')
        }
      })

      this.gisLoads = []
      response.data.DataItems.filter(x => x.NodeType === constants.NODE_TYPES.LOAD).forEach((y, index) => {
        this.gisLoads.push(
          {
            Name: y.Name,
            Capacity: y.Capacity,
            Count: y.Count,
            Units: y.Units,
            Index: index
          }
        )
      })

      this.gisEv = []
      response.data.DataItems.filter(x => x.NodeType === constants.NODE_TYPES.EV).forEach((y, index) => {
        this.gisEv.push(
          {
            Name: y.Name,
            Capacity: y.Capacity,
            Count: y.Count,
            Units: y.Units,
            Index: index
          }
        )
      })

      this.gisStorage = []
      response.data.DataItems.filter(x => x.NodeType === constants.NODE_TYPES.STORAGE).forEach((y, index) => {
        this.gisStorage.push(
          {
            Name: y.Name,
            Capacity: y.Capacity,
            Count: y.Count,
            Units: y.Units,
            Index: index
          }
        )
      })

      this.gisSolar = []
      response.data.DataItems.filter(x => x.NodeType === constants.NODE_TYPES.SOLAR).forEach((y, index) => {
        this.gisSolar.push(
          {
            Name: y.Name,
            Capacity: y.Capacity,
            Count: y.Count,
            Units: y.Units,
            Index: index
          }
        )
      })

      Object.values(constants.APPORTIONABLE_TYPES).forEach((item) => {
        if (item === constants.NODE_TYPES.LOAD) {
          this.apportionableEquipment.LOAD = App.Project.getNodesByType(constants.NODE_TYPES.LOAD).filter(x => !x.Details.IsEVLoad)
        } else if (item === constants.NODE_TYPES.EV) {
          this.apportionableEquipment.EV = App.Project.getNodesByType(constants.NODE_TYPES.LOAD).filter(x => x.Details.IsEVLoad)
        } else {
          this.apportionableEquipment[item] = App.Project.getNodesByType(constants.NODE_TYPES[item])
        }
      })

      const context = {
        data: {
          resultId,
          resultName,
          gisWind: this.gisWind,
          oneLineWind: this.oneLineWind,
          oneLineGenerators: this.oneLineGenerators,
          gisGenerators: this.gisGenerators,
          gisLoads: this.gisLoads,
          gisEv: this.gisEv,
          gisStorage: this.gisStorage,
          gisSolar: this.gisSolar,
          gisNodes: this.gisNodes,
          apportionableEquipment: this.apportionableEquipment,
          modalName: constants.MODALS.IMPORTABLE_GIS_RESULT
        }
      }
      context.data.apportionableEquipment = this.apportionableEquipment

      this.mappingFormModalTemplate = new ModalTemplate(templateName, templateType, context)
      this.mappingFormModalTemplate.prepareContext()
      this.mappingFormModalTemplate.execute(constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_OPTIONS_PANEL, false)

      this.addCancelButtonListener()
      this.addBackButtonListener()
      this.wizard.go('>')
      this.applyMappingRules()
      utils.defeatEnterKey(constants.SELECTORS.ALLOCATION_INPUT_NAME)
    })
  }

  getGisResultNodes(resultId, successCallback) {
    this.selectedResultId = resultId
    this.app.synchronousFetcher.get(`${this.getImportableGisProjectResultDataUrl(this.selectedProjectId, resultId)}`).then(response => {
      console.log('Results.getGisResultNodes()::response', response)
      if (response.status === 200)
        successCallback(response)
      else
        this.onGetAvailableGisResultsError(response)
    }).catch(error => {
        this.onGetAvailableGisResultsFailure(error)
    })
  }

  onGetGisResultNodesError(response) {
    this.app.notification.showError(response.data.message)
    return response
  }

  onGetGisResultNodesFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  // Cancel / Previous window listeners
  addCancelButtonListener() {
    const closeButtons = document.querySelectorAll(`#${constants.MODALS_BY_TYPE.IMPORT_GIS_HOME[0]} ${constants.SELECTORS.CLOSE_BUTTON}`)
    for (const closeButton of closeButtons) {
        closeButton.addEventListener('click', () => this.completedProfilesModalTemplate.destroyModal())
    }
  }

  addNewBackButtonListener() {
    const backButton = document.querySelector(constants.SELECTORS.IMPORT_GIS_NEW_BACK_BUTTON)
    backButton.addEventListener('click', () => {
      document.querySelector(constants.SELECTORS.IMPORT_GIS_NEW_CONTENT).remove()
      this.wizard.go('<')
      backButton.outerHTML = backButton.outerHTML
    })
  }

  addPreviousButtonListener() {
    const cancelImportGisButton = document.querySelector(constants.SELECTORS.IMPORTABLE_GIS_PROJECT_PREVIOUS)
    utils.addEvent(cancelImportGisButton, 'click', (event) => {
      event.preventDefault()
      this.selectedAnalyticProviderAnalyticId = null
      utils.destroyListeners(constants.SELECTORS.GIS_RESULTS_LIST_TR)
      document.getElementById('importable-gis-projects-results').outerHTML = ''
      this.wizard.go('<')

    })
  }

  addBackButtonListener() {
    const backResultsButton = document.querySelector(`${constants.SELECTORS.IMPORTABLE_GIS_PROJECT_RESULTS_PREVIOUS}`)
    utils.addEvent(backResultsButton, 'click', (event) => {
      event.preventDefault()
      document.querySelector(constants.SELECTORS.IMPORTABLE_GIS_PROJECTS_RESULT_OPTIONS).outerHTML = ''
      this.wizard.go('<')
      this.selectedAnalyticProviderAnalyticId = null
    })
  }

  applyMappingRules() {
    const allocationInputs = Array.from(document.querySelectorAll(constants.SELECTORS.ALLOCATION_INPUT))
    const allFields = [
        ...allocationInputs
    ]

    console.log('this.apportionableEquipment', this.apportionableEquipment)
    console.log('this.gisNodes', this.gisNodes)


    // 1. If the GIS Node (Load/Storage/Solar/Wind) exists but there are zero One-Line Apportionable Nodes of that type,
    //    show a fatal error saying the user needs to add a One-Line node of that type.
    //    FOR TESTING: Just comment out this entire rule if you want to continue testing the rest of the rules.

    const missingNodeType = Object.values(constants.APPORTIONABLE_TYPES).find(item =>
      !!this.gisNodes[item] && Array.isArray(this.apportionableEquipment[item]) && this.apportionableEquipment[item].length === 0
    )

    if (missingNodeType) {
      this.app.notification.showError(messages.MISSING_ONE_LINE_NODE(missingNodeType))
      document.getElementById(constants.SELECTORS.SAVE_MAPPING_BUTTON).style.display = 'none'
      allFields.forEach(item => item.setAttribute('disabled', true))
      return
    }


    // 2. If the number of GIS Generators is greater than the number of One-Line Generators,
    //    show a fatal error saying there must be at least as many One-Line as there are GIS. (Disable One-Line Generator dropdown fields.)
    //    FOR TESTING: Just comment out this entire rule if you want to continue testing the rest of the rules.

    if (this.gisGenerators.length > this.oneLineGenerators.length) {
      this.app.notification.showError(messages.TOO_FEW_ONE_LINE_GENERATORS(this.gisGenerators.length, this.oneLineGenerators.length))
      document.getElementById(constants.SELECTORS.SAVE_MAPPING_BUTTON).style.display = 'none' 
      allFields.forEach(item => item.setAttribute('disabled', true))
      return
    }

    // 2A. Same check as above, but for Load.
    if (this.gisLoads.length > this.oneLineLoads.length) {
      this.app.notification.showError(messages.TOO_FEW_ONE_LINE_LOADS(this.gisLoads.length, this.oneLineLoads.length))
      document.getElementById(constants.SELECTORS.SAVE_MAPPING_BUTTON).style.display = 'none' 
      allFields.forEach(item => item.setAttribute('disabled', true))
      return
    }

    // 2B. Same check as above, but for EV.
    if (this.gisEv.length > this.oneLineEv.length) {
      this.app.notification.showError(messages.TOO_FEW_ONE_LINE_EV(this.gisEv.length, this.oneLineEv.length))
      document.getElementById(constants.SELECTORS.SAVE_MAPPING_BUTTON).style.display = 'none' 
      allFields.forEach(item => item.setAttribute('disabled', true))
      return
    }

    // 2C. Same check as above, but for Storage.
    if (this.gisStorage.length > this.oneLineStorage.length) {
      this.app.notification.showError(messages.TOO_FEW_ONE_LINE_STORAGE(this.gisStorage.length, this.oneLineStorage.length))
      document.getElementById(constants.SELECTORS.SAVE_MAPPING_BUTTON).style.display = 'none' 
      allFields.forEach(item => item.setAttribute('disabled', true))
      return
    }

    // 2D. Same check as above, but for Solar.
    if (this.gisSolar.length > this.oneLineSolar.length) {
      this.app.notification.showError(messages.TOO_FEW_ONE_LINE_SOLAR(this.gisSolar.length, this.oneLineSolar.length))
      document.getElementById(constants.SELECTORS.SAVE_MAPPING_BUTTON).style.display = 'none' 
      allFields.forEach(item => item.setAttribute('disabled', true))
      return
    }

    // 2E. Same check as above, but for Wind.
    if (this.gisWind.length > this.oneLineWind.length) {
      this.app.notification.showError(messages.TOO_FEW_ONE_LINE_WIND(this.gisWind.length, this.oneLineWind.length))
      document.getElementById(constants.SELECTORS.SAVE_MAPPING_BUTTON).style.display = 'none' 
      allFields.forEach(item => item.setAttribute('disabled', true))
      return
    }

    // 3. If the GIS Node (Load/Storage/Solar/Wind) is missing but the One-Line Apportionable Node(s) exist(s),
    //    don't show an error (maybe show a warning?), but hide the Allocation % / # of Turbines field(s).
    Object.values(constants.APPORTIONABLE_TYPES).forEach(item => {
      if (!this.gisNodes[item] && Array.isArray(this.apportionableEquipment[item]) && this.apportionableEquipment[item].length >= 1) {
        const inputs = document.querySelectorAll(`${constants.SELECTORS.MAPPING_TABLE} .${item.toLowerCase()}-input`)
        inputs.forEach(item => item.setAttribute('disabled', true))
      }
    })


    // 4. If there is exactly one GIS Node (Load/Storage/Solar) and one One-Line Apportionable Node,
    //    put '100' in the text field and disable it. (For Wind, put the total turbine count)
    Object.values(constants.APPORTIONABLE_TYPES).forEach(item => {
      if (!!this.gisNodes[item] && Array.isArray(this.apportionableEquipment[item]) && this.apportionableEquipment[item].length === 1) {
        const input = document.querySelector(`${constants.SELECTORS.MAPPING_TABLE} .${item.toLowerCase()}-input`)
        if (item === constants.NODE_TYPES.WIND)
          input.value = document.querySelector(constants.SELECTORS.WIND_HIDDEN_COUNT_INPUT).value
        else
          input.value = '100'
        input.setAttribute('disabled', true)
      }
    })


    // 5. If there is exactly one GIS Generator and one One-Line Generator, automatically select the One-Line Generator in the dropdown.
    if (this.gisGenerators.length === 1 && this.oneLineGenerators.length === 1) {
      const generatorInput = document.querySelector(constants.SELECTORS.GENERATOR_INPUT)
      generatorInput.value = generatorInput.options[generatorInput.options.length - 1].value
      generatorInput.setAttribute('disabled', true)
    }

    // 5A. Same as above, but for Wind
    if (this.gisWind.length === 1 && this.oneLineWind.length === 1) {
      const windInput = document.querySelector(constants.SELECTORS.WIND_INPUT)
      windInput.value = windInput.options[windInput.options.length - 1].value
      windInput.setAttribute('disabled', true)
    }


    // 6 (continued) & 7. If there is one GIS Node (Load/Storage/Solar/Wind) and multiple One-Line Apportionable Nodes,
    //    add logic to the Allocation % fields to make sure they add up to exactly 100%. (Show errors onSubmit.)
    document.getElementById(constants.SELECTORS.SAVE_MAPPING_BUTTON).addEventListener('click', (event) => {
      let hasError = false

      // 7 onsubmit for Load / Storage / Solar / Wind:
      Object.values(constants.APPORTIONABLE_TYPES).forEach(item => {
        if (!!this.gisNodes[item] && Array.isArray(this.apportionableEquipment[item]) && this.apportionableEquipment[item].length > 1) {

          if (item === constants.NODE_TYPES.STORAGE) {
            let availableNodes = this.oneLineStorage; // Each one-line node can be used only once
            this.gisStorage.forEach(battery => {
              if (!hasError) {
                const inputs = Array.from(document.querySelectorAll(`.allocation-input[data-gis-node-name='${battery.Name}']`)).filter(x => Number(x.value) > 0)
                const inputValues = inputs.map(x => Number(x.value))
                const usedInputNames = inputs.map(x => x.getAttribute('data-one-line-node-name'))
                const usedNodeIds = inputs.map(x => x.getAttribute('data-one-line-node-id'))
                let total = inputs.length > 0 ? Array.from(inputValues).reduce((accumulator, currentValue) => accumulator + currentValue) : 0

                usedNodeIds.forEach((usedNodeId, i) => {
                  const usedOneLineNode = availableNodes.find(x => x.NodeId === usedNodeId)
                  if (!usedOneLineNode) {
                    const unavailableEquipmentName = usedInputNames[i]
                    this.app.notification.showError(messages.ONE_LINE_STORAGE_ALREADY_USED(unavailableEquipmentName))
                    hasError = true
                  }
                  availableNodes = availableNodes.filter(x => !(x.NodeId === usedNodeId))
                })

                if (total !== 100) {
                  this.app.notification.showError(messages.TOTAL_ALLOCATION_PERCENTAGES_MULTINODE(item, battery.Name))
                  hasError = true
                }

                if (inputValues.find(x => !Number.isInteger(x))) {
                  this.app.notification.showError(messages.ALLOCATION_WHOLE_NUMBERS_ONLY(item))
                  hasError = true
                }
              }
            })
          
          } else if (item === constants.NODE_TYPES.SOLAR) {
            let availableNodes = this.oneLineSolar; // Each one-line node can be used only once
            this.gisSolar.forEach(solar => {
              if (!hasError) {
                const inputs = Array.from(document.querySelectorAll(`.allocation-input[data-gis-node-name='${solar.Name}']`)).filter(x => Number(x.value) > 0)
                const inputValues = inputs.map(x => Number(x.value))
                const usedInputNames = inputs.map(x => x.getAttribute('data-one-line-node-name'))
                const usedNodeIds = inputs.map(x => x.getAttribute('data-one-line-node-id'))
                let total = inputs.length > 0 ? Array.from(inputValues).reduce((accumulator, currentValue) => accumulator + currentValue) : 0

                usedNodeIds.forEach((usedNodeId, i) => {
                  const usedOneLineNode = availableNodes.find(x => x.NodeId === usedNodeId)
                  if (!usedOneLineNode) {
                    const unavailableEquipmentName = usedInputNames[i]
                    this.app.notification.showError(messages.ONE_LINE_SOLAR_ALREADY_USED(unavailableEquipmentName))
                    hasError = true
                  }
                  availableNodes = availableNodes.filter(x => !(x.NodeId === usedNodeId))
                })

                if (total !== 100) {
                  this.app.notification.showError(messages.TOTAL_ALLOCATION_PERCENTAGES_MULTINODE(item, solar.Name))
                  hasError = true
                }

                if (inputValues.find(x => !Number.isInteger(x))) {
                  this.app.notification.showError(messages.ALLOCATION_WHOLE_NUMBERS_ONLY(item))
                  hasError = true
                }

              }
            })

          } else if (item === constants.NODE_TYPES.LOAD) {
            let availableNodes = this.oneLineLoads; // Each one-line node can be used only once
            this.gisLoads.forEach(load => {
              if (!hasError) {
                const inputs = Array.from(document.querySelectorAll(`.allocation-input[data-gis-node-name='${load.Name}']`)).filter(x => Number(x.value) > 0)
                const inputValues = inputs.map(x => Number(x.value))
                const usedInputNames = inputs.map(x => x.getAttribute('data-one-line-node-name'))
                const usedNodeIds = inputs.map(x => x.getAttribute('data-one-line-node-id'))
                let total = inputs.length > 0 ? Array.from(inputValues).reduce((accumulator, currentValue) => accumulator + currentValue) : 0

                usedNodeIds.forEach((usedNodeId, i) => {
                  const usedOneLineNode = availableNodes.find(x => x.NodeId === usedNodeId)
                  if (!usedOneLineNode) {
                    const unavailableEquipmentName = usedInputNames[i]
                    this.app.notification.showError(messages.ONE_LINE_LOAD_ALREADY_USED(unavailableEquipmentName))
                    hasError = true
                  }
                  availableNodes = availableNodes.filter(x => !(x.NodeId === usedNodeId))
                })

                if (total !== 100) {
                  this.app.notification.showError(messages.TOTAL_ALLOCATION_PERCENTAGES_MULTINODE(item, load.Name))
                  hasError = true
                }

                if (inputValues.find(x => !Number.isInteger(x))) {
                  this.app.notification.showError(messages.ALLOCATION_WHOLE_NUMBERS_ONLY(item))
                  hasError = true
                }

              }
            })
          
          } else if (item === constants.NODE_TYPES.EV) {
            let availableNodes = this.oneLineEv; // Each one-line node can be used only once
            this.gisEv.forEach(ev => {
              if (!hasError) {
                const inputs = Array.from(document.querySelectorAll(`.allocation-input[data-gis-node-name='${ev.Name}']`)).filter(x => Number(x.value) > 0)
                const inputValues = inputs.map(x => Number(x.value))
                const usedInputNames = inputs.map(x => x.getAttribute('data-one-line-node-name'))
                const usedNodeIds = inputs.map(x => x.getAttribute('data-one-line-node-id'))
                let total = inputs.length > 0 ? Array.from(inputValues).reduce((accumulator, currentValue) => accumulator + currentValue) : 0

                usedNodeIds.forEach((usedNodeId, i) => {
                  const usedOneLineNode = availableNodes.find(x => x.NodeId === usedNodeId)
                  if (!usedOneLineNode) {
                    const unavailableEquipmentName = usedInputNames[i]
                    this.app.notification.showError(messages.ONE_LINE_EV_ALREADY_USED(unavailableEquipmentName))
                    hasError = true
                  }
                  availableNodes = availableNodes.filter(x => !(x.NodeId === usedNodeId))
                })

                if (total !== 100) {
                  this.app.notification.showError(messages.TOTAL_ALLOCATION_PERCENTAGES_MULTINODE(item, ev.Name))
                  hasError = true
                }

                if (inputValues.find(x => !Number.isInteger(x))) {
                  this.app.notification.showError(messages.ALLOCATION_WHOLE_NUMBERS_ONLY(item))
                  hasError = true
                }

              }
            })

          } else {
            const inputs = Array.from(document.querySelectorAll(`${constants.SELECTORS.MAPPING_TABLE} .${item.toLowerCase()}-input`))
            const inputValues = inputs.map(x => Number(x.value));
            let total = inputValues.reduce((accumulator, currentValue) => accumulator + currentValue)

            if (item !== constants.NODE_TYPES.WIND && total !== 100) {
              this.app.notification.showError(messages.TOTAL_ALLOCATION_PERCENTAGES(item))
              hasError = true
            }

            if (inputValues.find(x => !Number.isInteger(x))) {
              this.app.notification.showError(messages.ALLOCATION_WHOLE_NUMBERS_ONLY(item))
              hasError = true
            }
          }
        }
      })
      if (hasError) return;

      // 7 onsubmit for Generators:
      let availableNodes = this.oneLineGenerators; // Each one-line node can be used only once
      this.gisGenerators.forEach(generator => {
        if (!hasError) {
          const inputs = Array.from(document.querySelectorAll(`.allocation-input[data-gis-node-name='${generator.Name}']`)).filter(x => Number(x.value) > 0)
          const inputValues = inputs.map(x => Number(x.value))
          const usedInputNames = inputs.map(x => x.getAttribute('data-one-line-node-name'))
          const usedNodeIds = inputs.map(x => x.getAttribute('data-one-line-node-id'))
          const total = inputs.length > 0 ? Array.from(inputValues).reduce((accumulator, currentValue) => accumulator + currentValue) : 0

          // Make sure each one-line node is not used more than once
          usedNodeIds.forEach((usedNodeId, i) => {
            const usedOneLineNode = availableNodes.find(x => x.NodeId === usedNodeId)
            if (!usedOneLineNode) {
              const unavailableEquipmentName = usedInputNames[i]
              this.app.notification.showError(messages.ONE_LINE_GENERATOR_ALREADY_USED(unavailableEquipmentName))
              hasError = true
            }
            availableNodes = availableNodes.filter(x => !(x.NodeId === usedNodeId))
          })

          // One-Line '# of Units' total must be equal to the count of the GIS generator getting imported
          if (total !== Number(generator.Count)) {
            this.app.notification.showError(messages.GENERATOR_ALLOCATION_TOTAL(generator.Name, generator.Count))
            hasError = true
          }
        }
      })

      // 7A - same as above, but for Wind
      availableNodes = this.oneLineWind; // Each one-line node can be used only once
      this.gisWind.forEach(wind => {
        if (!hasError) {
          const inputs = Array.from(document.querySelectorAll(`.allocation-input[data-gis-node-name='${wind.Name}']`)).filter(x => Number(x.value) > 0)
          const inputValues = inputs.map(x => Number(x.value))
          const usedInputNames = inputs.map(x => x.getAttribute('data-one-line-node-name'))
          const usedNodeIds = inputs.map(x => x.getAttribute('data-one-line-node-id'))
          const total = inputs.length > 0 ? Array.from(inputValues).reduce((accumulator, currentValue) => accumulator + currentValue) : 0

          // Make sure each one-line node is not used more than once
          usedNodeIds.forEach((usedNodeId, i) => {
            const usedOneLineNode = availableNodes.find(x => x.NodeId === usedNodeId)
            if (!usedOneLineNode) {
              const unavailableEquipmentName = usedInputNames[i]
              this.app.notification.showError(messages.ONE_LINE_WIND_ALREADY_USED(unavailableEquipmentName))
              hasError = true
            }
            availableNodes = availableNodes.filter(x => !(x.NodeId === usedNodeId))
          })

          // One-Line '# of Units' total must be equal to the count of the GIS wind getting imported
          if (total !== Number(wind.Count)) {
            this.app.notification.showError(messages.WIND_ALLOCATION_TOTAL(wind.Name, wind.Count))
            hasError = true
          }
        }
      })
      
      if (hasError) return;
      this.showDateForm()
      this.wizard.go('>')
    })
  }

  showDateForm() {
    const templateName = constants.TEMPLATE_NAMES.IMPORT_GIS_DATE
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const context = {
      data: {
        modalName: constants.MODALS.IMPORT_GIS_DATE,
        projectId: this.selectedProjectId,
        projectName: this.selectedProjectName,
        use8760Dispatch: this.use8760Dispatch,
        projectYear: this.projectYear,
        hasEmergencyDayType: this.hasEmergencyDayType
      }
    }

    this.importGisDateModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.importGisDateModalTemplate.prepareContext()
    console.log('GisResults.importGisDateModalTemplate::context', context)
    this.importGisDateModalTemplate.execute(constants.SELECTORS.IMPORT_GIS_DATE_PANEL, false)
    this.renderDispatchChart()
    this.addRowActionListeners()

    this.updateDateRowButtonVisibility()

    this.addDropdownListeners()

    this.addBackToOneLineButtonListener()
    this.addDateFormPreviousButtonListener()
    this.addDateFormNextButtonListener()
  }

  addRowActionListeners(context = null) {
    let addDateRowButton 
    let removeDateRowButton
    if (context === null) {
      addDateRowButton = document.querySelector(constants.SELECTORS.ADD_DATE_ROW_BUTTON)
      removeDateRowButton = document.querySelector(constants.SELECTORS.REMOVE_DATE_ROW_BUTTON)
    } else {
      addDateRowButton = Element.prototype.querySelector.call(context, constants.SELECTORS.ADD_DATE_ROW_BUTTON)
      removeDateRowButton = Element.prototype.querySelector.call(context, constants.SELECTORS.REMOVE_DATE_ROW_BUTTON)
    }

    // Scrub each button clean of any previous click event handlers.
    // Achieved here by cloning the button node and replacing the original button node in the DOM
    const clonedAddDateRowButton = addDateRowButton.cloneNode(true)
    addDateRowButton.parentNode.replaceChild(clonedAddDateRowButton, addDateRowButton)
    const clonedRemoveDateRowButton = removeDateRowButton.cloneNode(true)
    removeDateRowButton.parentNode.replaceChild(clonedRemoveDateRowButton, removeDateRowButton)

    if (context === null) {
      addDateRowButton = document.querySelector(constants.SELECTORS.ADD_DATE_ROW_BUTTON)
      removeDateRowButton = document.querySelector(constants.SELECTORS.REMOVE_DATE_ROW_BUTTON)
    } else {
      addDateRowButton = Element.prototype.querySelector.call(context, constants.SELECTORS.ADD_DATE_ROW_BUTTON)
      removeDateRowButton = Element.prototype.querySelector.call(context, constants.SELECTORS.REMOVE_DATE_ROW_BUTTON)
    }

    utils.addEvent(addDateRowButton, 'click', (event) => {
      this.addDateRow(addDateRowButton, event)
    })

    utils.addEvent(removeDateRowButton, 'click', (event) => {
      this.removeDateRow(removeDateRowButton, event)
    })
  }
  
  validateDateRow() {
    let dateRows = document.querySelectorAll(constants.SELECTORS.DATE_ROW)
    const lastDateRow = dateRows[dateRows.length - 1]

    if (lastDateRow.querySelector(constants.SELECTORS.HOUR_DROPDOWN).value === '') {
      this.app.notification.showError(messages.MISSING_DATE_ROW_HOUR)
      return false
    }

    // Store the last row's dropdown selections for date-row validation and to pre-populate the new row
    const lastDateRowMonthDropdownValue = lastDateRow.querySelector(constants.SELECTORS.MONTH_DROPDOWN).value
    const lastDateRowDayTypeDropdownValue = lastDateRow.querySelector(constants.SELECTORS.DAY_TYPE_DROPDOWN).value
    const lastDateRowHourDropdownValue = lastDateRow.querySelector(constants.SELECTORS.HOUR_DROPDOWN).value

    // Check to make sure the last row is not a duplicate of any previous rows
    const monthsArr = Array.from(document.querySelectorAll(constants.SELECTORS.MONTH_DROPDOWN))
        .map(item => item.value)
        .filter((item, i) => i < dateRows.length - 1)  // Filter out the last row
    
    const dayTypesArr = Array.from(document.querySelectorAll(constants.SELECTORS.DAY_TYPE_DROPDOWN))
        .map(item => item.value)
        .filter((item, i) => i < dateRows.length - 1)
    
    const hoursArr = Array.from(document.querySelectorAll(constants.SELECTORS.HOUR_DROPDOWN))
        .map(item => item.value)
        .filter((item, i) => i < dateRows.length - 1)

    // Check for duplicate date row
    if (!!monthsArr.length) {
      const duplicateRow = monthsArr.find((item, i) => {
        if (
          (item === lastDateRowMonthDropdownValue) &&
          (dayTypesArr[i] === lastDateRowDayTypeDropdownValue) &&
          (hoursArr[i] === lastDateRowHourDropdownValue)
        )
          return true
        else
          return false
      })

      if (duplicateRow && duplicateRow.length) {
        this.app.notification.showError(messages.DUPLICATE_DATE_ROW)
        return false
      }
    }

    // Validation checks have passed
    return true
  }

  addDateRow(addDateRowButton, event) {
    const currentDateRow = event.target.closest('.date-row')
    console.log('addDateRow() called for event.target: ', event.target)

    if (!this.validateDateRow()) return;  // no-op

    const clonedDateRow = currentDateRow.cloneNode(true)
    let dateRows = document.querySelectorAll(constants.SELECTORS.DATE_ROW)
    const lastDateRow = dateRows[dateRows.length - 1]

    // Store the last row's dropdown selections to pre-populate the new row
    const lastDateRowMonthDropdownValue = lastDateRow.querySelector(constants.SELECTORS.MONTH_DROPDOWN).value
    const lastDateRowDayTypeDropdownValue = lastDateRow.querySelector(constants.SELECTORS.DAY_TYPE_DROPDOWN).value
    const lastDateRowHourDropdownValue = lastDateRow.querySelector(constants.SELECTORS.HOUR_DROPDOWN).value

    let dateRowParent = document.querySelector(constants.SELECTORS.DATE_ROWS)
    dateRowParent.appendChild(clonedDateRow)
    dateRows = document.querySelectorAll(constants.SELECTORS.DATE_ROW)
    
    const newDateRow = dateRows[dateRows.length - 1]
    let newMonthDropdown = newDateRow.querySelector(constants.SELECTORS.MONTH_DROPDOWN)
    let newDayTypeDropdown = newDateRow.querySelector(constants.SELECTORS.DAY_TYPE_DROPDOWN)

    // Scrub any existing listeners before applying new onchange behavior
    // Clone each dropdown in the row and replace the original dropdown with the cloned version, which has no event listeners.
    const clonedNewMonthDropdown = newMonthDropdown.cloneNode(true)
    const clonedNewDayTypeDropdown = newDayTypeDropdown.cloneNode(true)
    newMonthDropdown.parentNode.replaceChild(clonedNewMonthDropdown, newMonthDropdown)
    newDayTypeDropdown.parentNode.replaceChild(clonedNewDayTypeDropdown, newDayTypeDropdown)
    newMonthDropdown = newDateRow.querySelector(constants.SELECTORS.MONTH_DROPDOWN)
    newDayTypeDropdown = newDateRow.querySelector(constants.SELECTORS.DAY_TYPE_DROPDOWN)

    // Pre-populate the new row with the previous row's month and dayType
    newMonthDropdown.value = lastDateRowMonthDropdownValue
    newDayTypeDropdown.value = lastDateRowDayTypeDropdownValue

    // Pass the new row as the context for fetching the new chart, based on values in the new row's dropdowns
    this.getDispatchData(null, newDateRow)
    
    utils.addEvent(newMonthDropdown, 'change', (event) => this.getDispatchData(event))
    utils.addEvent(newDayTypeDropdown, 'change', (event) => this.getDispatchData(event))
    
    this.addRowActionListeners(newDateRow)
    this.updateDateRowButtonVisibility()
    this.disableDateRow(lastDateRow)

    addDateRowButton.outerHTML = addDateRowButton.outerHTML
    addDateRowButton.remove()
  }

  disableDateRow(row) {
      Array.from(row.querySelectorAll('select')).forEach(item => item.setAttribute('disabled', true))
  }

  enableLastDateRow() {
      const dateRows = document.querySelectorAll(constants.SELECTORS.DATE_ROW)
      const lastRow = dateRows[dateRows.length - 1]
      const lastDateRowButton = lastRow.querySelector('.add-date-row-button')

      Array.from(lastRow.querySelectorAll('select')).forEach(item => item.removeAttribute('disabled'))
      Array.from(lastRow).forEach(item => item.removeAttribute('disabled'))

      this.addRowActionListeners(lastRow)
  }

  updateDateRowButtonVisibility() {
      // Only the final row should ever have the Add button visible.
      // For previous rows, the Add button should be hidden, not removed.
      // This allows the Add button on old rows to remain working if the user deletes newer rows
      const allAddRowButtons = document.querySelectorAll(constants.SELECTORS.ADD_DATE_ROW_BUTTON)
      Array.from(allAddRowButtons).forEach((item, i) => {
        if (i < allAddRowButtons.length - 1)
          item.style.visibility = 'hidden'
        else
          item.style.visibility = 'visible'
      })


      const allRemoveRowButtons = document.querySelectorAll(constants.SELECTORS.REMOVE_DATE_ROW_BUTTON)
      Array.from(allRemoveRowButtons).forEach((item, i) => {
        if (i === 0 && allRemoveRowButtons.length === 1)
          item.style.visibility = 'hidden'
        else
          item.style.visibility = 'visible'
      })

  }

  removeDateRow(removeDateRowButton,  event) {
    const rowCount = document.querySelectorAll(constants.SELECTORS.DATE_ROW)
    const dateRowToDelete = event.target.closest(constants.SELECTORS.DATE_ROW)

    if (rowCount && rowCount.length === 1) {
      console.warn('ImportGISResults.removeDateRow(): Cannot remove the only row')
      return
    }

    dateRowToDelete.remove()
    const dateRows = document.querySelectorAll(constants.SELECTORS.DATE_ROW)
    const defaultDateRow = dateRows[dateRows.length - 1]
    this.getDispatchData()
    this.addRowActionListeners(defaultDateRow)
    this.enableLastDateRow()
    this.updateDateRowButtonVisibility()

    removeDateRowButton.outerHTML = removeDateRowButton.outerHTML
    removeDateRowButton.remove()
  }

  renderDispatchChart() {

    const dispatchCanvas = document.getElementById(constants.SELECTORS.DISPATCH_CANVAS)
    this.dispatchChart = new Chart(dispatchCanvas, {
      type: 'bar',
      data: null,
      options: {
        plugins: {
          legend: false,
          title: {
            display: true,
            text: 'Electricity Dispatch',
            font: {
              size: 14
            },
            color: '#3e3e3e'
          },
          tooltip: {
            mode: 'index',
            filter: (tooltipItem, index, tooltipItems, data) => {
              // Hide 0 value entries from the tooltip
              return Number(tooltipItem.parsed.y) !== 0;
            },
            callbacks: {
              label: (tooltipItem) => {
                return `${tooltipItem.dataset.label}: ${numeral(tooltipItem.parsed.y).format('0,0.[000]')}`;
              }
          }
          }
        },
        responsive: true,
        scales: {
          'x-axis-0': {
            stacked: true,
            id: 'x-axis-0',
            title: {
              display: true,
              text: 'Hour',
              font: {
                size: 14
              },
            },
            ticks: {
              font: {
                size: 14
              },
            }
          },
          'y-axis-0': {
            type: 'linear',
            position: 'left',
            id: 'y-axis-0',
            title: {
              display: true,
              text: 'kW',
              font: {
                size: 14
              },
            },
            ticks: {
              callback: (tick, index, ticks) => this.formatYAxis(tick, index, ticks),
              font: {
                size: 14
              },
            }
          },
          'y-axis-1': {
            type: 'linear',
            stacked: false,
            position: 'right',
            id: 'y-axis-1',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'State of Charge of Batteries (kWh)',
              font: {
                size: 14
              },
            },
            ticks: {
              callback: (tick, index, ticks) => this.formatYAxis(tick, index, ticks),
              font: {
                size: 14
              },
            }
          }
        }
      }
    });
    this.getDispatchData()
  }

  generateLegendColumns(chart) {
    let markup = [];
    ['y-axis-0', 'y-axis-1'].forEach(item => {
      markup.push(`
        <div class="col-6 px-1">
          <table class="table chart-legend">
            <tbody>
              ${this.generateLegendEntry(chart.data.datasets, item)}
            </tbody>
          </table>
        </div>
      `)
    })
    return markup.join('')
  }

  generateLegendEntry(datasets, yAxis) {
    let entry = []
    datasets.forEach((dataset) => {
      if (dataset.yAxisID === yAxis)
        if (dataset.type === 'line') {
          if (dataset.borderDash)
            entry.push(`
              <tr>
                <td><div class="line-swatch" style="background: repeating-linear-gradient(90deg,${dataset.backgroundColor},${dataset.backgroundColor} 6px,#ffffff 7px,#ffffff 11px)">&nbsp;</div></td>
                <td class="text-left">${dataset.label}</td>
              </tr>
            `)
          else
            entry.push(`
              <tr>
                <td><div class="line-swatch" style="background-color: ${dataset.backgroundColor}">&nbsp;</div></td>
                <td class="text-left">${dataset.label}</td>
              </tr>
            `)
        } else if (dataset.pattern === 'diagonal')
          entry.push(`
            <tr>
              <td>
                <div class="hatched-bar-swatch" style="background: repeating-linear-gradient(
                  45deg,
                  ${dataset.baseBackgroundColor},
                  ${dataset.baseBackgroundColor} 6px, #fff 6px, #fff 7px
                )">&nbsp;</div>
              </td>
              <td class="text-left">${dataset.label}</td>
            </tr>
          `)
        else if (dataset.pattern === 'disc')
          entry.push(`
            <tr>
              <td>
                <div class="disc-bar-swatch" style="background-color: ${dataset.baseBackgroundColor}">&nbsp;</div>
              </td>
              <td class="text-left">${dataset.label}</td>
            </tr>
          `)
        else
          entry.push(`
            <tr>
              <td><div class="bar-swatch" style="background-color: ${dataset.backgroundColor}">&nbsp;</div></td>
              <td class="text-left">${dataset.label}</td>
            </tr>
          `)
    })
    return entry.join('')
  }

  formatYAxis(tick, index, ticks) {
    return numeral(tick).format('0,0.[000]');
  }

  getDispatchData(event = null, dateRow = null) {
    if (event && event.target && (event.target.name === 'month-dropdown' || event.target.name === 'day-type-dropdown')) {
      const context = event.target.closest('.date-row')
      this.monthDropdown = context.querySelector(constants.SELECTORS.MONTH_DROPDOWN)
      this.dayTypeDropdown = context.querySelector(constants.SELECTORS.DAY_TYPE_DROPDOWN)
      this.hourDropdown = context.querySelector(constants.SELECTORS.HOUR_DROPDOWN)
    } else if (dateRow) {
      const context = dateRow
      this.monthDropdown = context.querySelector(constants.SELECTORS.MONTH_DROPDOWN)
      this.dayTypeDropdown = context.querySelector(constants.SELECTORS.DAY_TYPE_DROPDOWN)
      this.hourDropdown = context.querySelector(constants.SELECTORS.HOUR_DROPDOWN)
    } else {
      this.monthDropdown = document.querySelector(constants.SELECTORS.MONTH_DROPDOWN)
      this.dayTypeDropdown = document.querySelector(constants.SELECTORS.DAY_TYPE_DROPDOWN)
      this.hourDropdown = document.querySelector(constants.SELECTORS.HOUR_DROPDOWN)
    }

    this.chartContainer = document.getElementById(constants.SELECTORS.DISPATCH_CHART_CONTAINER)
    this.chartContainer.style.display = 'block'

    this.app.synchronousFetcher.get(
      this.getDispatchDataUrl(
        this.selectedProjectId,
        this.selectedResultId,
        this.monthDropdown.value,
        this.dayTypeDropdown.value
      )
    ).then(response => {
      console.log('ImportGisResults.getDispatchData()::response', response)
      if (response !== null)
        this.onGetDispatchDataSuccess(response)
      else
        this.onGetDispatchDataError(response)
    }).catch(error => {
      this.onGetDispatchDataFailure(error) 
    })
  }

  onGetDispatchDataSuccess(response) {
    let hasRightYAxisData = false
    const leftYAxis = this.dispatchChart.options.scales['y-axis-0']
    const rightYAxis = this.dispatchChart.options.scales['y-axis-1']
    let cumulativeDataCount = 0
    let datasets = response.data.chartData.datasets

    if (datasets.length > 0) {
      const dispatchPalette = palette('mpn65', datasets.length)

      datasets.forEach((item, i) => {

        if (item.backgroundColor === '' && item.borderColor === '')
          item.borderColor = item.backgroundColor = `#${dispatchPalette[i]}`
        
        else if (item.pattern)
          item.borderColor = item.backgroundColor = pattern.draw(item.pattern, item.backgroundColor, 'white', 10)

        if (!hasRightYAxisData && item.yAxisID === 'y-axis-1')
          hasRightYAxisData = true

        if (item.isCumulativeData)
          cumulativeDataCount++

        if (item.type === 'line')
          item.fill = false
      })

      if (typeof this.dispatchChart.options.scales['y-axis-1'] !== 'undefined')
        rightYAxis.display = hasRightYAxisData


      leftYAxis.ticks = {
        ...leftYAxis.ticks,
        min: response.data.yScale[0],
        max: response.data.yScale[1],
        cachedmin: response.data.yScale[0],
        cachedmax: response.data.yScale[1]
      }

      if (hasRightYAxisData) {
        rightYAxis.ticks = {
          ...rightYAxis.ticks,
          min: response.data.yScale[2],
          max: response.data.yScale[3],
          cachedmin: response.data.yScale[2],
          cachedmax: response.data.yScale[3]
        }
      }
    }

    this.dispatchChart.data = response.data.chartData
    this.dispatchChart.update()

    document.getElementById(constants.SELECTORS.DISPATCH_CHART_STACKED_NOTE).style.display = cumulativeDataCount > 1 ? 'block' : 'hidden'
    document.getElementById(constants.SELECTORS.DISPATCH_CHART_LEGEND).innerHTML = this.generateLegendColumns(this.dispatchChart)
  }

  onGetDispatchDataError(response) {
    this.app.notification.showError(messages.BAD_DISPATCH_DATE)
    this.chartContainer.style.display = 'none'
    return response
  }

  onGetDispatchDataFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    this.chartContainer.style.display = 'none'
    console.error(error)
    return error
  }

  addDropdownListeners() {
    utils.addEvent(this.monthDropdown, 'change', () => this.getDispatchData())
    utils.addEvent(this.dayTypeDropdown, 'change', () => this.getDispatchData())
  }

  addDateFormPreviousButtonListener() {
    const importGisDatePreviousButton = document.querySelector(constants.SELECTORS.IMPORT_GIS_DATE_PREVIOUS_BUTTON)
    utils.addEvent(importGisDatePreviousButton, 'click', (event) => {
      event.preventDefault()
      this.wizard.go('<')
      document.querySelector(constants.SELECTORS.IMPORT_GIS_DATE_MODAL).outerHTML = ''
    })
  }

  addDateFormNextButtonListener() {
    const importGisDateNextButton = document.querySelector(constants.SELECTORS.IMPORT_GIS_DATE_NEXT_BUTTON)

    utils.addEvent(importGisDateNextButton, 'click', (event) => {
      event.preventDefault()
      if (!this.validateDateRow()) return;  // no-op
      
      // Save dateRows into three separate arrays
      this.monthDropdownValues = Array.from(document.querySelectorAll('.month-dropdown')).map(x => Number(x.value))
      this.dayTypeDropdownValues = Array.from(document.querySelectorAll('.day-type-dropdown')).map(x => Number(x.value))
      this.hourDropdownValues = Array.from(document.querySelectorAll('.hour-dropdown')).map(x => Number(x.value))
      
      this.showProfileNameForm()
    })
  }

  showProfileNameForm() {
    const templateName = constants.TEMPLATE_NAMES.IMPORT_GIS_PROFILE_NAME
    const templateType = constants.MODAL_CATEGORIES.ACTION
    const context = {
      data: {
        modalName: constants.MODALS.IMPORT_GIS_PROFILE_NAME
      }
    }

    utils.emptyInnerHTML(constants.SELECTORS.IMPORT_GIS_PROFILE_NAME_PANEL)
    this.profileNameModalTemplate = new ModalTemplate(templateName, templateType, context)
    this.profileNameModalTemplate.prepareContext()

    console.log('ImportGisResults.showProfileNameForm::context', context)

    this.profileNameModalTemplate.execute(constants.SELECTORS.IMPORT_GIS_PROFILE_NAME_PANEL, false)
    this.addProfileNameSaveButtonListener()
    this.addProfileNamePreviousButtonListener()

    this.wizard.go('>')
    utils.defeatEnterKey(constants.SELECTORS.PROFILE_NAME_CONTROL)
  }

  addProfileNameSaveButtonListener() {
    const viewProfileSaveButton = document.querySelector(constants.SELECTORS.IMPORT_GIS_PROFILE_NAME_SAVE_BUTTON)

    utils.addEvent(viewProfileSaveButton, 'click', (event) => {
      event.preventDefault()
      this.profileName = document.querySelector(constants.SELECTORS.PROFILE_NAME_INPUT).value.trim()
      this.validateProfileName(() => {
        this.saveProfile()
      })
    })
  }

  addProfileNamePreviousButtonListener() {
    const viewProfilePreviousButton = document.querySelector(constants.SELECTORS.IMPORT_GIS_PROFILE_NAME_PREVIOUS_BUTTON)

    utils.addEvent(viewProfilePreviousButton, 'click', (event) => {
      event.preventDefault()
      this.wizard.go('<')
    })
  }

  validateProfileName(successCallback) {
    if (this.profileName === '') {
      this.app.notification.showError(messages.PROFILE_NAME_IS_REQUIRED)
      document.querySelector(constants.SELECTORS.PROFILE_NAME_INPUT).focus()
      return;
    } else if (this.profileName.length > 120) {
      this.app.notification.showError(messages.PROFILE_NAME_TOO_LONG)
      document.querySelector(constants.SELECTORS.PROFILE_NAME_INPUT).focus().select()
      return;
    }

    successCallback && successCallback()
  }

  saveProfile() {
    const profileData = this.gatherProfileData()

    console.log('ImportGisResults.saveProfile()::profileData', profileData)
    this.app.synchronousFetcher.post(this.postProfileDataUrl, profileData).then(response => {
      console.log('ImportGisResults.saveProfile()::response', response)
      if (response.data.success)
        this.onSaveProfileSuccess(response)
      else
        this.onSaveProfileError(response)
    }).catch(error => {
      this.onSaveProfileFailure(error)
    })
  }

  onSaveProfileSuccess() {
    this.app.notification.showImportantMessage(messages.IMPORT_PROFILE_SAVED, () => {
      utils.destroyListeners(constants.SELECTORS.GIS_RESULTS_LIST_TR)
      this.removeCompletedProfiles()
      this.getCompletedProfiles()
      this.wizard.go('<<')
      App.Project.updateLastModifiedDate()
    })
  }

  onSaveProfileError(response) {
    this.app.notification.showError(messages.BAD_DISPATCH_DATE)
    return response
  }

  onSaveProfileFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  removeCompletedProfiles() {
    document.querySelector(constants.SELECTORS.IMPORT_GIS_HOME_MODAL).remove()
  }

  gatherProfileData() {
    const allocationPercentages = Array.from(document.querySelectorAll(constants.SELECTORS.ALLOCATION_INPUT)).map(x => x.value)
    const oneLineNames = Array.from(document.querySelectorAll(constants.SELECTORS.ONE_LINE_NAME)).map(x => x.value)
    const oneLineNodeTypes = Array.from(document.querySelectorAll(constants.SELECTORS.ONE_LINE_NODETYPE)).map(x => x.nodeName === 'SELECT' ? x.options[x.selectedIndex].getAttribute('data-nodetype') : x.value)
    let gisNames = [];

    // Build up the 'gisNames' array. It must have the same length as the 'allocationPercentages' and 'oneLineName' arrays.
    [...Object.values(constants.APPORTIONABLE_TYPES)].forEach(nodeType => {

      if (nodeType === constants.NODE_TYPES.STORAGE) {
        const storageGisNames = Array.from(document.querySelectorAll(constants.SELECTORS.STORAGE_INPUT))
          .map(x => x.getAttribute('data-gis-node-name')
        )
        gisNames = [
          ...gisNames,
          ...storageGisNames
        ]

      } else if (nodeType === constants.NODE_TYPES.SOLAR) {
        const solarGisNames = Array.from(document.querySelectorAll(constants.SELECTORS.SOLAR_INPUT))
          .map(x => x.getAttribute('data-gis-node-name')
        )
        gisNames = [
          ...gisNames,
          ...solarGisNames
        ]

      } else if (nodeType === constants.NODE_TYPES.LOAD) {
        const loadGisNames = Array.from(document.querySelectorAll(constants.SELECTORS.LOAD_INPUT))
          .map(x => x.getAttribute('data-gis-node-name')
        )
        gisNames = [
          ...gisNames,
          ...loadGisNames
        ]

      } else if (nodeType === constants.NODE_TYPES.EV) {
        const evGisNames = Array.from(document.querySelectorAll(constants.SELECTORS.EV_INPUT))
          .map(x => x.getAttribute('data-gis-node-name')
        )
        gisNames = [
          ...gisNames,
          ...evGisNames
        ]

      } else {
        const oneLineNodes = document.getElementsByClassName(`${nodeType.toLowerCase()}-input`)
        const nodeTypeCount = oneLineNodes ? oneLineNodes.length : 0

        if (nodeTypeCount) {
          const gisName = document.querySelector(`.${nodeType.toLowerCase()}-${constants.SELECTORS.HIDDEN_INPUT}`).value
          let i = 1
          do {
            gisNames.push(gisName)
            i++
          } while (i <= nodeTypeCount)
        }
      }
    })

    const windGisNames = Array.from(document.querySelectorAll(constants.SELECTORS.WIND_INPUT))
      .map(x => x.getAttribute('data-gis-node-name')
    )

    const generatorGisNames = Array.from(document.querySelectorAll(constants.SELECTORS.GENERATOR_INPUT))
      .map(x => x.getAttribute('data-gis-node-name')
    )

    gisNames = [
      ...gisNames,
      ...windGisNames,
      ...generatorGisNames
    ]

    let dates = []
    this.monthDropdownValues.forEach((item, i) => {
      dates.push({
        MonthNumber: item,
        DayType: this.dayTypeDropdownValues[i],
        HourValue: this.hourDropdownValues[i]
      })
    })

    let allocations = allocationPercentages.map((item, i) => (
      {
        OneLineNodeName: oneLineNames[i],
        GISTechName: gisNames[i],
        NodeType: oneLineNodeTypes[i],
        AllocationPercentage: Number(item)
      }
    ))

    console.table(allocations)

    return {
      OptimizationProjectId: this.selectedProjectId,
      OptimizationProjectResultId: this.selectedResultId,
      Name: this.profileName,
      Dates: dates,
      Allocation: allocations
    }
  }
}
