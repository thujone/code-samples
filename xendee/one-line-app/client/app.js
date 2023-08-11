/****************************************************************************
 ** The Xendee One-Line diagramming app.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/

import axios from 'axios'

import {
  BridgeCrossingStyle,
  BridgeManager,
  GraphComponent,
  GraphObstacleProvider,
  ICommand
} from '../yfiles/lib/es-modules/yfiles.js'

import utils from './utils.js'
import constants from './constants.js'
import messages, { getMessage } from './messages.js'
import Notification from './notification.js'
import Validator from './validator.js'
import ModalTemplate from './modal-template.js'
import ContextMenu from './context-menu.js'
import Catalog from './catalog.js'
import LoadShape from './load-shape.js'
import DispatchShape from './dispatch-shape.js'
import Analyses from './analyses.js'
import BatchUpdateDTO from './dto/BatchUpdateDTO.js'
import Device from './device.js'
import UserInterface from './user-interface.js'
import ProjectInfo from './project-info.js'

// ###### yWorks graph-related classes #####
// Layout classes
import XendeeGraphLayoutCoordinator from './graphing/layout/XendeeGraphLayoutCoordinator.js'
import XendeeLayoutExecutor from './graphing/layout/XendeeLayoutExecutor.js'

// yWorks Graphing Infrastructure classes
import XendeeGraphEditorInputMode from './graphing/input/XendeeGraphEditorInputMode.js'
import XendeeAnalysisGraphEditorInputMode from './graphing/input/XendeeAnalysisGraphEditorInputMode.js'
import AerialOverview from './graphing/layout/AerialOverview.js'
import LocatorOverlay from './graphing/layout/LocatorOverlay.js'
import PropertiesOverlay from './graphing/layout/PropertiesOverlay.js'
import PrintingOverlay from './graphing/printing/PrintingOverlay.js'
import GraphState from './graphing/GraphState.js'

// #########################################
// Node and Branch classes
import OneLineProject from './models/OneLineProject.js'
import OneLineNode from './models/OneLineNode.js'
import OneLineBranch from './models/OneLineBranch.js'

// Analysis classes
import AnalysisDetails from './models/analytics/AnalysisDetails.js'

// Import GIS Results
import ImportGISResults from './import-gis-results.js'

// Modal classes
import { initUtilityModal } from './modal-listeners/nodes/utility.js'
import { initLoadModal } from './modal-listeners/nodes/load.js'
import { initBusbarModal } from './modal-listeners/nodes/busbar.js'
import { initDirectConnectionModal } from './modal-listeners/branches/direct-connection.js'
import { initCableModal } from './modal-listeners/branches/cable.js'
import { initTwoWindingTransformerModal } from './modal-listeners/branches/two-winding-transformer.js'
import { initAddBranchModal } from './modal-listeners/actions/add-branch.js'
import { initProjectSettingsModal } from './modal-listeners/actions/project-settings.js'
import { initGeneratorModal } from './modal-listeners/nodes/generator.js'
import { initStorageModal } from './modal-listeners/nodes/storage.js'
import Solar from './modal-listeners/nodes/solar.js'
import Wind from './modal-listeners/nodes/wind.js'

// Topographic Map View
import Topography from './topography/topography.js'

// Global instance for static property, App.Project
let _projectMain = null
let _projectAnalysis = null
let _analysisDetails = null
let _importGisResults = null

/**
 * "One-Line" diagramming app
 * */
export default class App {
  constructor() {
    this.getAllDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_GRAPH}/${window.oneLineProjectId}`
    this.getAnalysisDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_ANALYSIS}/${window.oneLineProjectId}?analysisId=`
    this.postNodeDataUrl = `${constants.API_PATH}/${constants.RESOURCES.ADD_NODE}/${window.oneLineProjectId}`
    this.patchNodeDataUrl = `${constants.API_PATH}/${constants.RESOURCES.UPDATE_NODE}/${window.oneLineProjectId}`
    this.deleteNodeDataUrl = `${constants.API_PATH}/${constants.RESOURCES.DELETE_NODE}/${window.oneLineProjectId}?nodeId=`
    this.batchUpdateRatedVoltage = `${constants.API_PATH}/${constants.RESOURCES.BATCH_UPDATE_NODE_RATED_VOLTAGE}/${window.oneLineProjectId}`
    this.batchUpdatePowerSourceVoltages = `${constants.API_PATH}/${constants.RESOURCES.BATCH_UPDATE_POWER_SOURCE_VOLTAGE}/${window.oneLineProjectId}`
    this.postBranchDataUrl = `${constants.API_PATH}/${constants.RESOURCES.ADD_BRANCH}/${window.oneLineProjectId}`
    this.patchBranchDataUrl = `${constants.API_PATH}/${constants.RESOURCES.UPDATE_BRANCH}/${window.oneLineProjectId}`
    this.deleteBranchDataUrl = `${constants.API_PATH}/${constants.RESOURCES.DELETE_BRANCH}/${window.oneLineProjectId}?branchId=`
    this.patchElementLatLngDataUrl = `${constants.API_PATH}/${constants.RESOURCES.UPDATE_LAT_LON}/${window.oneLineProjectId}`
    this.patchProjectSettingsDataUrl = `${constants.API_PATH}/${constants.RESOURCES.UPDATE_PROJECT_SETTINGS}/${window.oneLineProjectId}`
    this.postSaveProjectUrl = `${constants.API_PATH}/${constants.RESOURCES.POST_SAVE_PROJECT}/${window.oneLineProjectId}`
    this.getProjectSharingInfoUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_PROJECT_SHARING_INFO}/${window.oneLineProjectId}`
    this.postSendProjectUrl = `${constants.API_PATH}/${constants.RESOURCES.POST_SEND_PROJECT}/${window.oneLineProjectId}`
    this.getCatalogDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_CATALOG}/${window.oneLineProjectId}`
    this.getCatalogNameAvailableDataUrl = `${constants.API_PATH}/${constants.RESOURCES.GET_CATALOG_NAME_AVAILABLE}/${window.oneLineProjectId}`
    this.patchBatchUpdateCableLengthsUrl = `${constants.API_PATH}/${constants.RESOURCES.PATCH_BATCH_UPDATE_CABLE_LENGTHS}/${window.oneLineProjectId}`

    this.graphComponent = new GraphComponent('#graph-component')
    this.analysisGraphComponent = new GraphComponent('#analysis-graph-component')

    this.overviewComponent = null
    this.overviewGraphComponent = null

    this.synchronousFetcher = axios.create({})   // API fetch for synchronous requests
    this.pendingRequests = 0                     // Number of open requests
    this.pendingRequestName = null               // Name of the pending request 
    this.maxConcurrentRequests = 1               // Maximum number of open requests
    this.initialFetchData = {}                   // Store the initial GetGraph response
    this.modalTemplate = null                    // Instance for node details, edge details, and action dialogs
    this.contextMenu = null                      // Singleton class for context menu
    this.validator = new Validator()             // Instance for performing form validation on submit
    this.notification = new Notification()       // Instance for handling toasts and modal prompts
    this.loadShape                               // Instance for uploading and viewing load shapes
    this.dispatchShape                           // Instance for uploading generator dispatch shapes
    this.analyses                                // Instance for running project analyses and viewing reports
    this.printingOverlay                         // Instance for printing one-line and analysis graphs
    this.device                                  // Instance for adding a new protective device
    this.userInterface = new UserInterface(this) // Initialize for top navigation, sidebar toggles
    this.topography = new Topography(this)       // Initialize the map view

    this.graphEditorInputModeMain = null         // The graph editor input mode for the main window
    this.graphEditorInputModeAnalysis = null     // The graph editor input mode for the analysis window

    this.graphStateMain = new GraphState("main") // The graph state representing the main window
    this.graphStateAnalysis = null               // The graph state representing the analysis window - this is created when the user opts to view an analysis

    this.layoutCoordinator = new XendeeGraphLayoutCoordinator()
    this._selectedProjectElement = null          // The node or branch that's currently selected
    this._selectedDevice = null                  // The device that's currently selected
    this.nodeIdInClipboard = null                // The NodeId that has been "copied" and is in the clipboard

    this._appMode = constants.APP_MODES.MAIN     // Default "app mode" is the main diagram view

    this.main()
  }

  // Three "app modes": the main diagram, the analysis-mode diagram, and the map view
  get appMode() { return this._appMode }
  set appMode(appMode) { this._appMode = appMode }

  get isAppModeMain() { return this._appMode === constants.APP_MODES.MAIN }
  get isAppModeAnalysis() { return this._appMode === constants.APP_MODES.ANALYSIS }
  get isAppModeMap() { return this._appMode === constants.APP_MODES.MAP }

  main() {
    this.initializeRequestLimiter()
    this.initializeGraphMain()
    this.initializeGraphAnalysis()
    this.registerToolbarCommands()
    this.registerActionButtons()

    this.loadJson(this.getAllDataUrl).then(data => {
      console.log('App.main()::GetGraph', data)
      _projectMain = new OneLineProject(data, this)
      console.log('App.main()::_projectMain', _projectMain)

      this.instantiateContextMenu()

    }).catch(error => {
      this.notification.showError(messages.BAD_GRAPH_FETCH)

    }).finally(() => {
      this.projectInfo = new ProjectInfo(this)
      this.initializeOverlays()
      this.showLocator()
      this.showProperties()

      // Now that the Locator and Properties are ready, set the app mode to the main diagram view
      this.activateAppMode(this.appMode)

      this.projectElementsChanged(false, false, false, false)
      this.applyGraphLayout(false, false, false, false)

      document.getElementById('graph-container').classList.add('yworks-loaded')   // Unfreeze screen
      this.notification.showSuccess(getMessage(messages.PROJECT_LOADED, [App.Project.Name]))
    })
  }

  static get ShowingAnalysisOneLine() { return _analysisDetails !== null }

  static get Project() {
    return _analysisDetails !== null ? _projectAnalysis : _projectMain
  }

  static get AnalysisDetails() { return _analysisDetails }

  static get ImportGISResults() { return _importGisResults }

  get SelectedProjectElement() { return this._selectedProjectElement }
  set SelectedProjectElement(value) {
    // Select the project element in yWorks graph
    const item = GraphState.Current.Mapper.getModelItemToSelectFromGraphElementsDatabase(value)
    if (item !== null)
      this.updateGraphControlSelection(item)

    this._selectedProjectElement = value
  }

  get SelectedDevice() { return this._selectedDevice }
  set SelectedDevice(value) { this._selectedDevice = value }

  get GraphEditorInputMode() {
    return App.ShowingAnalysisOneLine ? this.graphEditorInputModeAnalysis : this.graphEditorInputModeMain
  }

  get GraphState() {
    const graphStateToUse = App.ShowingAnalysisOneLine ? this.graphStateAnalysis : this.graphStateMain

    if (!graphStateToUse.Initialized)
      graphStateToUse.initialize(this.VisibleGraphComponent.graph)

    GraphState.Current = graphStateToUse

    return graphStateToUse
  }

  get VisibleGraphComponent() {
    return App.ShowingAnalysisOneLine ? this.analysisGraphComponent : this.graphComponent
  }

  projectSettingsSaved() {
    this.projectElementsChanged(false, false, false, true)
  }

  projectElementsChanged(nodeAdded, branchAdded, suppressZoomToSelectedElements, projectSettingsSaved) {
    // Calculate voltage across the network
    App.Project.calculateVoltageAcrossNetwork()

    this.locatorOverlay.redrawTable()

    if (this.SelectedProjectElement)
      this.locatorOverlay.highlightRow(this.SelectedProjectElement)

    // Calculate the internal node connections across the network
    App.Project.setInternalNodeConnectionsAcrossNetwork()

    // If a branch was just added...
    if (branchAdded) {
      // Check to see if the rated voltage for any loads, storage, etc. need to be updated
      const ratedVoltageUpdatesToPerform = App.Project.updateRatedVoltageValuesAcrossNetwork()
      if (ratedVoltageUpdatesToPerform.length > 0)
        this.patchBatchUpdate(this.batchUpdateRatedVoltage, ratedVoltageUpdatesToPerform)
    }

    // Update the yWorks graph, if needed
    const modified = this.GraphState.update(App.Project)
    if (modified === constants.GRAPH_MODIFICATIONS.ELEMENTS_ADDED_OR_REMOVED || projectSettingsSaved) {
      // If we just added the a new node or branch, need to "reassign" SelectedProjectElement so that the selected node style can be applied
      // (this.SelectedProjectElement gets assigned in postBranch and postNode, but it is needed for zooming to the selected element on layout; 
      //  this "reassignment" is needed here because when it's initially assigned the actual graph element doesn't exist yet, so it can't be "selected")
      this.SelectedProjectElement = this.SelectedProjectElement
      const zoomToSelectedElements = !suppressZoomToSelectedElements
      this.applyGraphLayout(nodeAdded, zoomToSelectedElements, true, false)
    }

    this.VisibleGraphComponent.invalidate()
    this.VisibleGraphComponent.updateContentRect()
  }

  initializeRequestLimiter() {
    this.synchronousFetcher.interceptors.request.use(config => {
      return new Promise((resolve, reject) => {
        if (this.pendingRequests < this.maxConcurrentRequests && !this.layoutCoordinator.isPerformingLayout) {
          this.pendingRequests++
          console.log('initializeRequestLimiter()::request::pendingRequests', this.pendingRequests, 'this.layoutCoordinator.isPerformingLayout', this.layoutCoordinator.isPerformingLayout)
          resolve(config)
        } else {
          console.log('initializeRequestLimiter() NO-OP')
          if (this.pendingRequestName && this.pendingRequestName === constants.REQUEST_NAMES.POST_NODE)
            this.notification.showInfo(messages.MAX_REQUESTS_WITH_TYPE`node`)
          else
            this.notification.showInfo(messages.GENERIC_MAX_REQUESTS)
        }
      })
    })

    this.synchronousFetcher.interceptors.response.use(response => {
      this.pendingRequests--
      this.pendingRequestName = null
      console.log('initializeRequestLimiter()::resolve::pendingRequests', this.pendingRequests, 'this.layoutCoordinator.isPerformingLayout', this.layoutCoordinator.isPerformingLayout)
      return Promise.resolve(response)
    }, error => {
      this.pendingRequests = 0
      this.pendingRequestName = null
      console.log('initializeRequestLimiter()::reject::pendingRequests', this.pendingRequests, 'this.layoutCoordinator.isPerformingLayout', this.layoutCoordinator.isPerformingLayout)
      return Promise.reject(error)
    })
  }

  initializeGraphMain() {
    const bridgeManagerMain = new BridgeManager()
    bridgeManagerMain.canvasComponent = this.graphComponent
    bridgeManagerMain.addObstacleProvider(new GraphObstacleProvider())
    bridgeManagerMain.defaultBridgeCrossingStyle = BridgeCrossingStyle.RECTANGLE
    bridgeManagerMain.defaultBridgeHeight = 8
    bridgeManagerMain.defaultBridgeWidth = 18

    this.graphEditorInputModeMain = new XendeeGraphEditorInputMode(this)

    this.graphComponent.graph.undoEngineEnabled = false
    this.graphComponent.inputMode = this.graphEditorInputModeMain

    this.graphComponent.addCurrentItemChangedListener((sender, e) => {
      console.log('App.initializeGraphMain(): addCurrentItemChangedListener()::e.item', e.item)
      this.selectYWorksItemAndProjectElement()
    })

    this.graphComponent.inputMode.addItemClickedListener((sender, e) => {
      console.log('App.initializeGraphMain(): addItemClickedListener()::e.item', e.item)
      this.selectYWorksItemAndProjectElement()
      this.updateGraphControlSelection(e.item)
    })

    this.graphComponent.inputMode.addCanvasClickedListener((sender, e) => {
      console.log('App.initializeGraphMain(): addCanvasClickedListener()::e.item', e.item)
      this.SelectedProjectElement = null
      this.propertiesOverlay.emptyTable()   
    })

    this.graphComponent.inputMode.addItemDoubleClickedListener((sender, e) => {
      console.log('App.initializeGraphMain(): addItemDoubleClickedListener()::e.item', e.item)
      this.updateGraphControlSelection(e.item)
      this.editSelectedItem()
      e.handled = true    // Ensures that no further event is raised for items in the same location
    })

    // Fit and re-center any time the viewport size changes
    this.watchViewportSize()
  }

  selectYWorksItemAndProjectElement() {
    const yWorksSelectedItem = this.VisibleGraphComponent.currentItem
    if (yWorksSelectedItem !== null) {
      const correspondingProjectItem = GraphState.Current.Mapper.getProjectElementFromYWorksModelItem(yWorksSelectedItem)
      if (correspondingProjectItem !== null) {
        this.SelectedProjectElement = correspondingProjectItem
      }
    }
    console.log('App.selectYWorksItemAndProjectElement()::this.SelectedProjectElement', this.SelectedProjectElement)
    this.locatorOverlay.highlightRow(this.SelectedProjectElement)
    this.propertiesOverlay.renderTable(this.SelectedProjectElement)
  }

  initializeGraphAnalysis() {
    const bridgeManagerAnalysis = new BridgeManager()
    bridgeManagerAnalysis.canvasComponent = this.analysisGraphComponent
    bridgeManagerAnalysis.addObstacleProvider(new GraphObstacleProvider())
    bridgeManagerAnalysis.defaultBridgeCrossingStyle = BridgeCrossingStyle.RECTANGLE
    bridgeManagerAnalysis.defaultBridgeHeight = 8
    bridgeManagerAnalysis.defaultBridgeWidth = 18

    this.graphEditorInputModeAnalysis = new XendeeAnalysisGraphEditorInputMode(this)

    this.analysisGraphComponent.graph.undoEngineEnabled = false
    this.analysisGraphComponent.inputMode = this.graphEditorInputModeAnalysis

    this.analysisGraphComponent.addCurrentItemChangedListener((sender, e) => {
      console.log('App.graphEditorInputModeAnalysis(): addCurrentItemChangedListener::e.item', e.item)
      this.selectYWorksItemAndProjectElement()
    })

    this.analysisGraphComponent.inputMode.addItemClickedListener((sender, e) => {
      console.log('App.graphEditorInputModeAnalysis(): addItemClickedListener()::e.item', e.item)
      this.selectYWorksItemAndProjectElement()
      this.updateGraphControlSelection(e.item)
    })

    this.analysisGraphComponent.inputMode.addCanvasClickedListener((sender, e) => {
      console.log('App.graphEditorInputModeAnalysis(): addCanvasClickedListener():e.item', e.item)
      this.SelectedProjectElement = null
      this.propertiesOverlay.emptyTable()
    })

    this.analysisGraphComponent.inputMode.addItemDoubleClickedListener((sender, e) => {
      console.log('App.graphEditorInputModeAnalysis(): addItemDoubleClickedListener()::e.item', e.item)
      this.updateGraphControlSelection(e.item)
      e.handled = true    // Ensures that no further event is raised for items in the same location
    })

    // Fit and re-center any time the viewport size changes
    this.watchViewportSize()
  }

  initializeOverlays() {
    // Aerial Overview overlay
    this.aerialOverview = new AerialOverview(this.graphComponent)
    this.aerialOverview.update()

    // Locator Overlay
    this.locatorOverlay = new LocatorOverlay(this)

    // Properties Overlay
    this.propertiesOverlay = new PropertiesOverlay(this)

    // Printing Overlay
    this.printingOverlay = new PrintingOverlay(this)
  }

  updateGraphControlSelection(itemToSelect) {
    this.GraphEditorInputMode.clearSelection()

    if (itemToSelect !== null) {
      this.GraphEditorInputMode.setSelected(itemToSelect, true)
      this.VisibleGraphComponent.currentItem = itemToSelect
    }
  }

  editSelectedItem() {
    if (this.SelectedProjectElement !== null) {
      if (this.SelectedProjectElement.IsNode)
        this.showNodeModal()
      else if (this.SelectedProjectElement.IsBranch)
        this.showBranchModal()
    } else if (this.SelectedDevice !== null) {
      // Get the branch that contains this device & open the modal
      const branch = this.SelectedDevice.getAssociatedBranch()
      if (branch !== null) {
        this.SelectedProjectElement = branch
        this.showBranchModal()
      }
    }
  }

  instantiateContextMenu() {
    this.contextMenu = new ContextMenu(this)
    this.contextMenu.addContextMenuListeners(this.graphComponent)
  }

  activateAppMode(appMode, event = null) {
    this.appMode = appMode
    console.log('App.activateAppMode()::this.appMode', this.appMode)

    if (this.appMode === constants.APP_MODES.ANALYSIS) {
      this.topography.goBackToGraphView()
      document.getElementById(constants.SELECTORS.GRAPH_COMPONENT).style.display = 'none'
      document.getElementById(constants.SELECTORS.ANALYSIS_GRAPH_COMPONENT).style.display = 'block'
      document.getElementById(constants.SELECTORS.BACK_TO_ANALYSE_PROJECT_BUTTON).style.display = 'inline-block'
      document.getElementById(constants.SELECTORS.SAVE_PROJECT_BUTTON).style.display = 'none'
      document.getElementById(constants.SELECTORS.SEND_COPY_PROJECT_BUTTON).style.display = 'none'
      document.getElementById(constants.SELECTORS.MAP_BUTTON).style.display = 'none'
      document.getElementById(constants.SELECTORS.ANALYZE_PROJECT_BUTTON).style.display = 'none'
      document.getElementById(constants.SELECTORS.IMPORT_GIS_RESULT_BUTTON).style.display = 'none'
      document.getElementById(constants.SELECTORS.ADD_PROJECT_ELEMENTS_CONTAINER).style.display = 'none'
      
      this.showBackAnnotationGraph(event)

    } else if (this.appMode === constants.APP_MODES.MAIN) {
      this.topography.goBackToGraphView()
      document.getElementById(constants.SELECTORS.GRAPH_COMPONENT).style.display = 'block'
      document.getElementById(constants.SELECTORS.ANALYSIS_GRAPH_COMPONENT).style.display = 'none'
      document.getElementById(constants.SELECTORS.ANALYSIS_DETAILS_CONTAINER).style.display = 'none'
      document.getElementById(constants.SELECTORS.BACK_TO_ANALYSE_PROJECT_BUTTON).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(0)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(1)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(2)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(3)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(4)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SAVE_PROJECT_BUTTON).style.display = 'block'
      document.getElementById(constants.SELECTORS.SEND_COPY_PROJECT_BUTTON).style.display = 'block'
      document.getElementById(constants.SELECTORS.MAP_BUTTON).style.display = 'block'
      document.getElementById(constants.SELECTORS.ANALYZE_PROJECT_BUTTON).style.display = 'inline-block'
      document.getElementById(constants.SELECTORS.IMPORT_GIS_RESULT_BUTTON).style.display = 'inline-block'
      document.getElementById(constants.SELECTORS.ADD_PROJECT_ELEMENTS_CONTAINER).style.display = 'block'

      this.showMainGraph()
    
    } else if (this.appMode === constants.APP_MODES.MAP) {
      document.getElementById(constants.SELECTORS.SAVE_PROJECT_BUTTON).style.display = 'block'
      document.getElementById(constants.SELECTORS.SEND_COPY_PROJECT_BUTTON).style.display = 'block'
      document.getElementById(constants.SELECTORS.ANALYSIS_DETAILS_CONTAINER).style.display = 'none'
      document.getElementById(constants.SELECTORS.BACK_TO_ANALYSE_PROJECT_BUTTON).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(0)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(1)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(2)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(3)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(4)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SAVE_PROJECT_BUTTON).style.display = 'block'
      document.getElementById(constants.SELECTORS.SEND_COPY_PROJECT_BUTTON).style.display = 'block'
      document.getElementById(constants.SELECTORS.MAP_BUTTON).style.display = 'block'
      document.getElementById(constants.SELECTORS.ANALYZE_PROJECT_BUTTON).style.display = 'inline-block'
      document.getElementById(constants.SELECTORS.IMPORT_GIS_RESULT_BUTTON).style.display = 'inline-block'
      document.getElementById(constants.SELECTORS.ADD_PROJECT_ELEMENTS_CONTAINER).style.display = 'block'

      this.topography.main()

    } else {
      console.error('App.activateAppMode()::this.appMode', this.appMode)
    }
  }


  applyGraphLayout(nodeAdded, zoomToSelectedElements, includeBranchsNodesInZoom, centerOnDevice = false) {
    this.layoutCoordinator.layoutEngine.nodeToNodeDistance = XendeeGraphLayoutCoordinator.DEFAULT_NODE_TO_NODE_DISTANCE

    // If we are viewing the backline annotation for an analysis, we may need to adjust the nodeToNodeDistance setting
    if (_analysisDetails) {
      const nodeToEdgeDist = _analysisDetails.getNodeToNodeDistance()
      if (nodeToEdgeDist) {
        this.layoutCoordinator.layoutEngine.nodeToNodeDistance = nodeToEdgeDist
      }
    }

    this.layoutCoordinator.isPerformingLayout = true
    this.VisibleGraphComponent.inputMode.enabled = false
    this.VisibleGraphComponent.zoomToSelectedElements = []

    const layoutExecutor = new XendeeLayoutExecutor(this.VisibleGraphComponent, this.layoutCoordinator.layoutEngine)
    layoutExecutor.configureTableLayout = false
    layoutExecutor.duration = this.layoutCoordinator.determineLayoutDuration(nodeAdded)

    if (zoomToSelectedElements) {
      layoutExecutor.animateViewport = true
      this.VisibleGraphComponent.zoomToSelectedElements = this.getGraphElementsToZoomTo(includeBranchsNodesInZoom, centerOnDevice)
    }

    layoutExecutor.start()
      .then(() => {
        // Need to adjust the group node bounds since backloops in group nodes resizes them to ungodly proportions
        this.VisibleGraphComponent.graph.nodes.forEach(node => {
          this.VisibleGraphComponent.graph.adjustGroupNodeLayout(node)
        })

        this.layoutCoordinator.isPerformingLayout = false
        this.VisibleGraphComponent.inputMode.enabled = true
        if (this.layoutCoordinator.isFirstLayout) {
          this.VisibleGraphComponent.fitGraphBounds()
          this.layoutCoordinator.isFirstLayout = false
        }
      })
      .catch(error => {
        this.layoutCoordinator.isPerformingLayout = false
        this.VisibleGraphComponent.inputMode.enabled = true

        if (typeof window.reportError === 'function') {
          window.reportError(error)
          this.notification.showError(messages.BAD_LAYOUT)
        } else {
          throw error
        }
      })
  }

  getGraphElementsToZoomTo(includeBranchsNodesInZoom, centerOnDevice) {
    const itemsToZoomTo = []
    const selectedElement = !centerOnDevice ? this.SelectedProjectElement : this.SelectedDevice

    if (selectedElement) {
      const graphElementsDb = GraphState.Current.Mapper.getGraphElementsDatabaseFromProjectElement(selectedElement)

      if (graphElementsDb)
        graphElementsDb.Elements.forEach(item => itemsToZoomTo.push(item))

      // If the selected element is a branch and includeBranchsNodesInZoom === true, then include the To and From nodes in the zoom
      if (includeBranchsNodesInZoom && selectedElement.IsBranch) {
        const fromNodeGraphElementsDb = GraphState.Current.Mapper.getGraphElementsDatabaseFromProjectElement(selectedElement.FromNode)
        fromNodeGraphElementsDb.Elements.forEach(item => itemsToZoomTo.push(item))

        const toNodeGraphElementsDb = GraphState.Current.Mapper.getGraphElementsDatabaseFromProjectElement(selectedElement.ToNode)
        toNodeGraphElementsDb.Elements.forEach(item => itemsToZoomTo.push(item))

        // Else if the selected element is a device, include the branch and the FROM or TO node that is associated with it
      } else if (centerOnDevice) {
        const branch = selectedElement.getAssociatedBranch()
        const branchElementsDb = GraphState.Current.Mapper.getGraphElementsDatabaseFromProjectElement(branch)
        const branchSide = branch.getBranchSide(selectedElement.DeviceId)
        const node = branchSide === constants.BRANCH_SIDES.FROM ? branch.FromNode : branch.ToNode

        // Generally, the TO / FROM side node is the closest element to the device, so try to use the node to center the device.
        // The exception to this is a BUSBAR, that can be very wide and throw off the horizontal centering of the device.
        // So try to use the TO / FROM node to center. But if it's a BUSBAR, center on the device's branch instead.
        if (node.NodeType !== constants.NODE_TYPES.BUSBAR) {
          const nodeElementsDb = GraphState.Current.Mapper.getGraphElementsDatabaseFromProjectElement(node)
          nodeElementsDb.Elements.forEach(item => itemsToZoomTo.push(item))
        } else {
          branchElementsDb.Elements.forEach(item => itemsToZoomTo.push(item))
        }
      }
    }

    return itemsToZoomTo
  }

  watchViewportSize() {
    window.onresize = () => this.centerGraph()
  }

  copyNodeToClipboard(node) {
    this.nodeIdInClipboard = node.NodeId

    this.notification.showInfo(`Node <b>${node.Name}</b> copied to clipboard.`)
  }

  getClipboardNodeName() {
    if (this.nodeIdInClipboard !== null) {
      const nodeToPaste = App.Project.getOneLineNode(this.nodeIdInClipboard)
      return nodeToPaste ? nodeToPaste.Name : null
    } else
      return null
  }

  pasteNodeFromClipboard() {
    let nodeInClipboardFound = false

    // Make sure node still exists!
    if (this.nodeIdInClipboard !== null) {
      const nodeToPaste = App.Project.getOneLineNode(this.nodeIdInClipboard)

      if (nodeToPaste) {
        const newNode = new OneLineNode(nodeToPaste)
        newNode.Name = this.getUniqueEquipmentName(newNode.NodeType) // Get a unique name for the equipment

        // Create the node on the server
        this.executePostNode(newNode.toRequestBody())

        nodeInClipboardFound = true
      }
    }

    // If we didn't find the NodeId in the clipboard in the project, then take it out of the clipboard
    if (!this.nodeInClipboardFound)
      this.nodeIdInClipboard = null
  }

  centerGraph() {
    this.VisibleGraphComponent.fitGraphBounds()
  }

  loadJson(url) {
    // TODO: Use axios instead of fetch
    return fetch(url).then(response => response.json())
  }

  registerToolbarCommands() {
    document.getElementById(constants.SELECTORS.ZOOM_IN_ICON).addEventListener('click', event => {
      if (ICommand.INCREASE_ZOOM.canExecute(null, this.VisibleGraphComponent)) {
        ICommand.INCREASE_ZOOM.execute(null, this.VisibleGraphComponent)
      }
    })

    document.getElementById(constants.SELECTORS.ZOOM_OUT_ICON).addEventListener('click', event => {
      if (ICommand.DECREASE_ZOOM.canExecute(null, this.VisibleGraphComponent)) {
        ICommand.DECREASE_ZOOM.execute(null, this.VisibleGraphComponent)
      }
    })

    document.getElementById(constants.SELECTORS.FIT_GRAPH_BOUNDS_ICON).addEventListener('click', event => {
      if (ICommand.FIT_GRAPH_BOUNDS.canExecute(null, this.VisibleGraphComponent)) {
        ICommand.FIT_GRAPH_BOUNDS.execute(null, this.VisibleGraphComponent)
      }
    })

    document.getElementById(constants.SELECTORS.SETTINGS_BUTTON).addEventListener('click', event =>
      this.showActionModal(constants.MODALS.SETTINGS, null, null)
    )

    document.getElementById(constants.SELECTORS.SAVE_PROJECT_BUTTON).addEventListener('click', event =>
      this.showActionModal(constants.MODALS.SAVE_PROJECT, null, null)
    )

    document.getElementById(constants.SELECTORS.SEND_COPY_PROJECT_BUTTON).addEventListener('click', event =>
      this.getProjectSharingInfo(response => {
        const teammates = response.data
        this.showActionModal(constants.MODALS.SEND_COPY_PROJECT, null, teammates)
      })
    )

    document.getElementById(constants.SELECTORS.PRINT_TOOLBAR_BUTTON).addEventListener('click', event => {
      this.printingOverlay.run()
    })

    document.getElementById(constants.SELECTORS.AERIAL_BUTTON).addEventListener('click', event =>
      utils.toggleFade(constants.SELECTORS.GRAPH_OVERVIEW_COMPONENT)
    ) 

    document.getElementById(constants.SELECTORS.MAP_BUTTON).addEventListener('click', event => {
      this.activateAppMode(constants.APP_MODES.MAP)
    })

    utils.addEvent(document.getElementById(constants.SELECTORS.ANALYZE_PROJECT_BUTTON), 'click', event => {
      this.analyses = new Analyses(this)
      this.analyses.main()
    })
    
    utils.addEvent(document.getElementById(constants.SELECTORS.BACK_TO_ANALYSE_PROJECT_BUTTON), 'click', event => {
      this.analyses = new Analyses(this)
      this.analyses.main()
    })

    utils.addEvent(document.getElementById(constants.SELECTORS.IMPORT_GIS_RESULT_BUTTON), 'click', event => {
      this.importGisResults = new ImportGISResults(this)
      this.importGisResults.main()
    })

    for (let index = 0; index < 5; index++) {
      utils.addEvent(document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(index)), 'click', event => {
        this.reloadBackAnnotationGraph(index, true)
      })
    }
  }

  registerActionButtons() {
    utils.addEventListenerByClass(constants.SELECTORS.ADD_NODE_BUTTON, 'click', event => {
      let nodeType = event.target.getAttribute(constants.SELECTORS.DATA_NODE_TYPE)
      if (nodeType === null)
        nodeType = event.target.parentNode.getAttribute(constants.SELECTORS.DATA_NODE_TYPE)

      this.postNode(constants.MODALS[nodeType])
    })

    utils.addEventListenerByClass(constants.SELECTORS.ADD_BRANCH_BUTTON, 'click', event => {
      let branchType = event.target.getAttribute(constants.SELECTORS.DATA_BRANCH_TYPE)
      if (branchType === null)
        branchType = event.target.parentNode.getAttribute(constants.SELECTORS.DATA_BRANCH_TYPE)

      this.showActionModal(constants.MODALS.ADD_BRANCH, branchType)
    })
  }

  showNodeModal(nodeId = null) {
    if (nodeId !== null)
      this.SelectedProjectElement = App.Project.getOneLineNode(nodeId)

    if (this.SelectedProjectElement !== null && this.SelectedProjectElement.IsNode) {
      const templateName = constants.TEMPLATE_NAMES[this.SelectedProjectElement.NodeType]
      const defaultNode = null
      const context = {
        data: this.SelectedProjectElement,
        defaultNode
      }

      this.modalTemplate = new ModalTemplate(templateName, constants.MODAL_CATEGORIES.NODE, context)
      this.modalTemplate.prepareContext()
      this.modalTemplate.execute()

      this.catalog = new Catalog(this, null)
      this.addCloseButtonListeners()
      this.addSaveButtonListener(this.SelectedProjectElement.NodeType, this.SelectedProjectElement.NodeId)
      this.catalog.addCatalogButtonListener()
      this.catalog.addSaveAndCatalogButtonListener()
      this.scopeEnterKey()

      if (this.SelectedProjectElement.IsUtility) {
        initUtilityModal(App.Project.CapacityUnits)
      } else if (this.SelectedProjectElement.IsSolar) {
        this.solar = new Solar(this)
        this.solar.initSolarModal()
      } else if (this.SelectedProjectElement.IsWind) {
        this.wind = new Wind(this)
        this.wind.initWindModal()
      } else if (this.SelectedProjectElement.IsGenerator) {
        this.dispatchShape = new DispatchShape(context.data, this)
        initGeneratorModal()
      } else if (this.SelectedProjectElement.IsLoad) {
        this.loadShape = new LoadShape(context.data, this)
        initLoadModal(this)
      } else if (this.SelectedProjectElement.IsStorage) {
        initStorageModal(this)
      } else if (this.SelectedProjectElement.IsBusbar) {
        initBusbarModal(this)
      }
    }
  }

  showBranchModal(branchId = null) {

    if (document.getElementById(constants.SELECTORS.TOPOGRAPHIC_MODAL)) {
      this.topography.map.disableDoubleClickZoom = true
      setTimeout(() => this.topography.map.disableDoubleClickZoom = false, 100);
    }

    if (branchId !== null)
      this.SelectedProjectElement = App.Project.getOneLineBranch(branchId)

    if (this.SelectedProjectElement !== null && this.SelectedProjectElement.IsBranch) {
      const templateName = constants.TEMPLATE_NAMES[this.SelectedProjectElement.BranchType]
      const defaultBranch = App.Project.getDefaultBranch(this.SelectedProjectElement.BranchType)
      const context = {
        data: this.SelectedProjectElement,
        defaultBranch
      }

      this.modalTemplate = new ModalTemplate(templateName, constants.MODAL_CATEGORIES.BRANCH, context)
      this.modalTemplate.prepareContext()
      this.modalTemplate.execute()
      this.catalog = new Catalog(this, null)

      // Button listeners
      this.addCloseButtonListeners()
      this.addSaveButtonListener(this.SelectedProjectElement.BranchType, this.SelectedProjectElement.BranchId)

      // Protection device listeners
      this.addCreateDeviceListeners()
      this.addDeviceStateListeners()
      this.addRemoveDeviceListeners()
      this.addDeviceDetailsModalListeners()

      // Catalog button listeners
      if (!this.SelectedProjectElement.IsDirectConnection) {
        this.catalog.addCatalogButtonListener()
        this.catalog.addSaveAndCatalogButtonListener()
      }

      // Prevent <Enter> key from submitting the form (unless the Save button is focused)
      this.scopeEnterKey()

      if (this.SelectedProjectElement.IsDirectConnection)
        initDirectConnectionModal()
      else if (this.SelectedProjectElement.IsTransformer2W)
        initTwoWindingTransformerModal(false)
      else if (this.SelectedProjectElement.IsCable)
        initCableModal(this, false)
    }
  }

  showDeviceModal(device) {
    const branch = device.getAssociatedBranch()
    const branchSide = branch.getBranchSide(device.DeviceId)

    this.device = new Device(this, device, device.DeviceType, branchSide)
    this.device.showDeviceDetails(device.DeviceId, branchSide)
  }

  showActionModal(modalName, branchType, teammates = null) {
    const templateName = constants.TEMPLATE_NAMES[modalName]

    // If adding a branch, make sure there are sufficient available nodes
    if (templateName === constants.TEMPLATE_NAMES.ADD_BRANCH) {
      if (!App.Project.canAddBranch()) {
        this.notification.showImportantMessage(getMessage(messages.CANNOT_ADD_BRANCH_TOO_FEW_AVAILABLE_NODES, [branchType]))
        return
      }
    }

    const context = {
      data: {
        modalName,
        branchType,
        teammates,
        nodes: App.Project.OneLineNodes,
        project: App.Project
      }
    }

    this.modalTemplate = new ModalTemplate(templateName, constants.MODAL_CATEGORIES.ACTION, context)
    this.modalTemplate.prepareContext()
    console.log('App.renderActionModal::context', context)
    this.modalTemplate.execute()
    this.addCloseButtonListeners()
    this.scopeEnterKey()

    switch (templateName) {
      case constants.TEMPLATE_NAMES.ADD_BRANCH:
        initAddBranchModal()
        this.setNewBranch(branchType)
        this.updateConnectionFromAndToLists(this.SelectedProjectElement)
        this.addSaveButtonListener(constants.MODALS.ADD_BRANCH, null, branchType)
        this.addConnectionModalListeners()
        break

      case constants.TEMPLATE_NAMES.SETTINGS:
        initProjectSettingsModal()
        this.addSaveButtonListener(constants.MODALS.SETTINGS)
        break

      case constants.TEMPLATE_NAMES.SAVE_PROJECT:
        this.addSaveButtonListener(constants.MODALS.SAVE_PROJECT)
        break

      case constants.TEMPLATE_NAMES.SEND_COPY_PROJECT:
        this.addSaveButtonListener(constants.MODALS.SEND_COPY_PROJECT)
        break

      default:
        console.error('App.renderActionModal()', 'Could not init the modal', 'templateName: ', templateName)
    }
  }

  showLocator() {
    this.locatorOverlay.prepareContext()
    this.locatorOverlay.renderTable()
    this.locatorOverlay.initializeDataTable()
    this.locatorOverlay.initializeEventListeners()
  }

  showProperties() {
    this.propertiesOverlay.toggleFade()
    this.propertiesOverlay.renderTable(this.SelectedProjectElement)
  }

  showMainGraph() {
    _analysisDetails = null

    // Need to "touch" GraphState to set GraphState.Current
    const dummy = this.GraphState


    this.locatorOverlay.emptyTable()
    this.locatorOverlay.redrawTable()

    // De-select all graph elements
    this.deselectAllGraphElements()

    this.propertiesOverlay.renderTable(null)

    this.aerialOverview.destroy()
    this.aerialOverview = new AerialOverview(this.graphComponent)
    this.aerialOverview.update()

    this.centerGraph()
  }

  deselectAllGraphElements() {
    this._selectedProjectElement = null
    ICommand.DESELECT_ALL.execute(null, this.VisibleGraphComponent)
  }

  showBackAnnotationGraph(event) {
    const analysisId = event.target.closest('tr').getAttribute(constants.SELECTORS.DATA_ANALYSIS_ID)

    this.loadJson(`${this.getAnalysisDataUrl}${analysisId}`).then(data => {
      // Load the analysis details
      _analysisDetails = new AnalysisDetails(data)

      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(0)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(1)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(2)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(3)).style.display = 'none'
      document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(4)).style.display = 'none'

      if (_analysisDetails.Reports.length > 1) {
        for (let i = 0; i < _analysisDetails.Reports.length; i++) {
          const button = document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(i))
          button.style.display = 'inline-block'
          button.title = `View the backline annotation for ${_analysisDetails.Reports[i].Title}`
          button.innerHTML = `<i class="fal fa-network-wired"></i> ${_analysisDetails.Reports[i].Title}`
        }
      }

      this.reloadBackAnnotationGraph(0, false);

      console.log('showBackAnnotationGraph::data', data)

    }).catch(error => {
      this.notification.showError(messages.BAD_GRAPH_FETCH)
      console.error(error)

    }).finally(() => {
      // Remove the overlay showing Completed Analyses
      this.analyses.removeCompletedAnalyses()
    })
  }

  reloadBackAnnotationGraph(reportIndex, loadingSubanalysis) {
    _analysisDetails.ReportIndex = reportIndex

    for (let i = 0; i < _analysisDetails.Reports.length; i++) {
      const button = document.getElementById(constants.SELECTORS.SUBANALYSIS_BUTTON(i))
      if (i === reportIndex) {
        button.classList.add("selected")
      } else {
        button.classList.remove("selected")
      }
    }

    // Display the analysis details on screen
    const analysisDetails = _analysisDetails.getDetails()
    if (analysisDetails && analysisDetails.length > 0) {
      document.getElementById(constants.SELECTORS.ANALYSIS_DETAILS_CONTAINER).innerHTML = analysisDetails
      document.getElementById(constants.SELECTORS.ANALYSIS_DETAILS_CONTAINER).style.display = 'block'
    } else {
      document.getElementById(constants.SELECTORS.ANALYSIS_DETAILS_CONTAINER).style.display = 'none'
    }

    // Load the point-in-time one-line project data associated with the analysis
    _projectAnalysis = new OneLineProject(_analysisDetails.getProjectData())

    // Create a new GraphState for the analysis and clear state
    this.graphStateAnalysis = new GraphState('analysis')
    this.GraphState.Graph.clear()
    this._selectedProjectElement = null
    ICommand.DESELECT_ALL.execute(null, this.VisibleGraphComponent)

    // Render the analysis graph
    // If isFirstLayout is true, then the graph will be laid out and centered on screen.
    //  We want to do this if the user is opening a new analysis.
    //  If they are viewing a subanalysis then we do not want to zoom or recenter the backline annotation. Instead, leave them where they be.
    this.layoutCoordinator.isFirstLayout = !loadingSubanalysis

    // Suppress animation of the graph
    this.layoutCoordinator.bypassLayoutAnimation = true
    this.projectElementsChanged(false, false, true, false)
    this.applyGraphLayout(false, false, false, false)
    this.layoutCoordinator.bypassLayoutAnimation = false

    // Reload the Locator
    this.locatorOverlay.emptyTable()
    this.locatorOverlay.redrawTable()
    this.propertiesOverlay.renderTable(null)

    // Reload the Aeriel overview
    this.aerialOverview.destroy()
    this.aerialOverview = new AerialOverview(this.analysisGraphComponent)
    this.aerialOverview.update()
  }

  bindCommand(selector, command, target, parameter) {
    let element = document.getElementById(selector)
    if (arguments.length < 4) {
      parameter = null
      if (arguments.length < 3) {
        target = null
      }
    }
    if (!element) {
      return
    }
    command.addCanExecuteChangedListener(function (sender, e) {
      if (command.canExecute(parameter, target)) {
        element.removeAttribute('disabled')
      } else {
        element.setAttribute('disabled', 'disabled')
      }
    })

    element.addEventListener('click', function (e) {
      if (command.canExecute(parameter, target)) {
        command.execute(parameter, target)
      }
    })
  }

  // Only submit a form on [Enter] if the active HTML element is a <button>. Otherwise, [Enter] is a no-op.
  scopeEnterKey() {
    utils.addEventListenerByTag('form', 'keypress', (event) => {
      const key = event.charCode || event.keyCode || 0
      if (key === 13 && document.activeElement.tagName !== 'BUTTON') {
        event.preventDefault();
      }
    });
  }

  // Cancel button and close-icon
  addCloseButtonListeners() {
    const closeButtons = document.querySelectorAll(`#${this.modalTemplate.templateId} ${constants.SELECTORS.CLOSE_BUTTON}`)
    for (const closeButton of closeButtons) {
      closeButton.addEventListener('click', () => this.modalTemplate.destroyModal())
    }
  }

  addSaveButtonListener(modal, itemId = null, branchType = null) {
    const saveButton = document.querySelector(`#${this.modalTemplate.templateId} ${constants.SELECTORS.SAVE_BUTTON}`)
    switch (modal) {
      case constants.MODALS.UTILITY:
      case constants.MODALS.BUSBAR:
      case constants.MODALS.LOAD:
      case constants.MODALS.SOLAR:
      case constants.MODALS.WIND:
      case constants.MODALS.GENERATOR:
      case constants.MODALS.STORAGE:
        saveButton.addEventListener('click', () => {
          this.patchNode(itemId)
        })
        break
      case constants.MODALS.DCON:
      case constants.MODALS.CABLE:
      case constants.MODALS.TRANS2W:
        saveButton.addEventListener('click', () => {
          this.patchBranch(itemId)
        })
        break
      case constants.MODALS.ADD_BRANCH:
        saveButton.addEventListener('click', () => {
          this.postBranch(branchType)
        })
        break
      case constants.MODALS.SETTINGS:
        saveButton.addEventListener('click', () => {
          this.patchSettings()
        })
        break
      case constants.MODALS.SAVE_PROJECT:
        saveButton.addEventListener('click', () => {
          this.postSaveProject()
        })
        break
      case constants.MODALS.SEND_COPY_PROJECT:
        saveButton.addEventListener('click', () => {
          const sendToUserId = document.querySelector(constants.SELECTORS.SEND_COPY_TO_DROPDOWN).value
          const sendToMessage = document.querySelector(constants.SELECTORS.MESSAGE_TO_RECIPIENT_TEXTAREA).value
          if (sendToUserId === '')
            this.notification.showError(messages.SEND_COPY_TO_NO_RECIPIENT)
          else {
            document.querySelector(constants.SELECTORS.SEND_COPY_BUTTON).disabled = true
            this.postSendProject(sendToUserId, sendToMessage)
          }
        })
        break
      default:
        console.warn('No listener attached to Save button')
    }
  }

  addConnectionModalListeners() {

    // "From" item selection
    document.getElementById(constants.SELECTORS.RESULT_FROM).addEventListener('click', event => {
      this.newBranch.fromNodeId = event.target.getAttribute(constants.SELECTORS.DATA_NODE_ID)
      this.resetConnectionToList()
      this.updateConnectionToList()
    })

    // "From" filter
    document.getElementById(constants.SELECTORS.CONN_INPUT_FROM).addEventListener('keyup', event =>
      this.filterConnectionFromList(event)
    )

    // "From" clear
    document.getElementById(constants.SELECTORS.CLR_FROM).addEventListener('click', () => {
      this.newBranch.fromNodeId = null
      this.resetConnectionToList()
    })

    // "To" item selection
    document.getElementById(constants.SELECTORS.RESULT_TO).addEventListener('click', event => {
      this.newBranch.toNodeId = event.target.getAttribute(constants.SELECTORS.DATA_NODE_ID)
      this.resetConnectionFromList()
      this.updateConnectionFromList()
    })

    // "To" filter
    document.getElementById(constants.SELECTORS.CONN_INPUT_TO).addEventListener('keyup', event =>
      this.filterConnectionToList(event)
    )

    // "To" clear
    document.getElementById(constants.SELECTORS.CLR_TO).addEventListener('click', () => {
      this.newBranch.toNodeId = null
      this.resetConnectionFromList()
    })
  }

  filterConnectionFromList() {
    console.log('keyup', event.target.value)
    this.updateConnectionFromList()
  }

  filterConnectionToList() {
    console.log('keyup', event.target.value)
    this.updateConnectionToList()
  }

  updateConnectionFromAndToLists(selectedNode = null) {
    this.updateConnectionFromList()
    this.updateConnectionToList()

    // If the graph has a currently-selected node and it is available in either connection list, activate it
    if (selectedNode !== null) {

      // Exclude any items that might already be active
      const listItems =
        document.querySelectorAll(`${constants.SELECTORS.LI_NOT_SELECTED_ACTIVE}[data-node-id="${selectedNode.NodeId}"]`)

      // Find the first item that isn't hidden and activate it
      // Note: It's possible a BUSBAR will be available in both lists, but just assume they want
      // to activate the one in the From list.
      for (const listItem of listItems) {
        if (listItem.style.display !== 'none') {

          // Determine if selected list item is visible. If not, scroll down to it.
          const container = listItem.closest(constants.SELECTORS.ADD_CONNECTION_TABLE)
          const containerHeight = container.offsetHeight;
          const listItemHeight = listItem.clientHeight;
          const listItemOffset = listItem.offsetTop;

          if (containerHeight < listItemHeight + listItemOffset)
            container.scrollTop = listItemOffset

          listItem.classList.add(constants.SELECTORS.SELECTED_ACTIVE)
          utils.simulateClick(listItem)
          return
        }
      }
    }
  }

  updateConnectionFromList() {
    const nodes = App.Project.OneLineNodes
    const branchType = this.modalTemplate.context.data.branchType

    const filterTerm = document.querySelector('#conn-input-from').value
    console.log('App.updateConnectionFromList(): filterTerm: ', filterTerm)

    const toNode = this.newBranch.toNodeId == null ? null : App.Project.getOneLineNode(this.newBranch.toNodeId);
    console.log('App.updateConnectionFromList(): toNode: ', toNode)

    // Hide non-power-producers (e.g., LOADs) that aren't BUSBARs
    const itemsToHideByNodeType = nodes.filter(node =>
      !node.IsPowerProducer && node.NodeType !== constants.NODE_TYPES.BUSBAR
    )

    // Hide nodes that have maxed out their outgoing connections
    const itemsToHideByConnection = nodes.filter(node =>
      node.OutgoingBranches.size >= node.MaximumOutgoingBranches
    )

    // Hide items that don't match the filter string
    const itemsToHideByFilter = nodes.filter(node =>
      !node.Name.toLowerCase().includes(filterTerm.toLowerCase())
    )

    // Hide items that don't have a voltage/nominal voltage matching that of the selected ToNode (unless FromNode has 0 voltage - then show everything).
    // If ToNode is deselected or has voltage/nominal voltage of 0, don't hide any items.
    let itemsToHideByVoltage = []

    // For transformers on the from side... only hide those nodes that have no voltage, but otherwise do no other voltage filtering.
    if (branchType === constants.BRANCH_TYPES.TRANS2W) {
      itemsToHideByVoltage = nodes.filter(node => 
        !node.IsPowerProducer && 
        (node.LineToLineVoltageIrrespectiveOfOpenDevices === null || node.LineToLineVoltageIrrespectiveOfOpenDevices === 0)
      )
    } else {
      if (toNode !== null) {
        const toNodeNominalVoltage = toNode.LineToLineVoltageIrrespectiveOfOpenDevices
        if (toNodeNominalVoltage > 0) {
          itemsToHideByVoltage = nodes.filter(node => {
            return (
              (node.IsPowerProducer && node.Details.Voltage !== null && node.Details.Voltage !== 0 && node.Details.Voltage !== toNodeNominalVoltage) ||
              (!node.IsPowerProducer && node.LineToLineVoltageIrrespectiveOfOpenDevices !== null && node.LineToLineVoltageIrrespectiveOfOpenDevices !== 0  && node.LineToLineVoltageIrrespectiveOfOpenDevices !== toNodeNominalVoltage)
            )
          })
        }
      }
    }

    this.showAllConnectionFromList();

    [toNode, ...itemsToHideByNodeType, ...itemsToHideByConnection, ...itemsToHideByFilter, ...itemsToHideByVoltage].forEach(node => {
      if (!!node)
      {
        const listItem = document.querySelector(`#result-from li[data-node-id='${node.NodeId}']`)
        if (!!listItem)
        {
          listItem.style.display = 'none'
          if (listItem.classList.contains(constants.SELECTORS.SELECTED_ACTIVE))
          {
            listItem.classList.remove(constants.SELECTORS.SELECTED_ACTIVE)
            document.getElementById(constants.SELECTORS.CONN_FROM).innerText = ''
            this.newBranch.fromNodeId = null
          }
        }
      }
    })
  }

  updateConnectionToList() {
    const nodes = App.Project.OneLineNodes
    const branchType = this.modalTemplate.context.data.branchType

    const filterTerm = document.querySelector('#conn-input-to').value
    console.log('App.updateConnectionToList(): filterTerm: ', filterTerm)

    const fromNode = this.newBranch.fromNodeId == null ? null : App.Project.getOneLineNode(this.newBranch.fromNodeId);
    console.log('App.updateConnectionToList(): fromNode: ', fromNode)

    // Hide power-producers (e.g., UTILITYs)
    const itemsToHideByNodeType = nodes.filter(node => node.IsPowerProducer)

    // Hide nodes that have maxed out their incoming connections
    const itemsToHideByConnection = nodes.filter(node => {
      return node.IncomingBranches.size >= node.MaximumIncomingBranches
    })

    // Hide items that don't match the filter string
    const itemsToHideByFilter = nodes.filter(node =>
      !node.Name.toLowerCase().includes(filterTerm.toLowerCase())
    )

    // Hide items that don't have a nominal voltage matching that of the selected FromNode (unless FromNode has 0 voltage - then show everything).
    // If FromNode is deselected or if ToNode has voltage/nominal voltage of 0, don't hide any items.
    let itemsToHideByVoltage = []

    // Don't hide any items based on voltage if adding a transformer
    if (!constants.VOLTAGE_MODIFIER_BRANCHES.includes(branchType)) {
      if (fromNode !== null) {
        const fromNodeVoltage = fromNode.IsPowerProducer ? fromNode.Details.Voltage : fromNode.LineToLineVoltageIrrespectiveOfOpenDevices

        // This if statement bypasses hiding any ToList items based on voltage differences if the selected From node has 0 voltage (or null voltage)
        if (fromNodeVoltage !== 0 && fromNodeVoltage !== null) {
          itemsToHideByVoltage = nodes.filter(node => {
            return (
              node.LineToLineVoltageIrrespectiveOfOpenDevices > 0 &&
              node.LineToLineVoltageIrrespectiveOfOpenDevices !== fromNodeVoltage &&
              !node.IsPowerProducer
            )
          })
        }
      }
    }

    this.showAllConnectionToList();

    [fromNode, ...itemsToHideByNodeType, ...itemsToHideByConnection, ...itemsToHideByFilter, ...itemsToHideByVoltage].forEach(node => {
      if (!!node)
      {
        const listItem = document.querySelector(`#result-to li[data-node-id='${node.NodeId}']`)
        if (!!listItem)
        {
          listItem.style.display = 'none'
          if (listItem.classList.contains(constants.SELECTORS.SELECTED_ACTIVE))
          {
            listItem.classList.remove(constants.SELECTORS.SELECTED_ACTIVE)
            document.getElementById(constants.SELECTORS.CONN_TO).innerText = ''
            this.newBranch.toNodeId = null
          }
        }
      }
    })
  }

  showAllConnectionFromList() {
    document.querySelectorAll(constants.SELECTORS.RESULT_FROM_LI).forEach((item) => item.style.display = 'block')
  }

  showAllConnectionToList() {
    document.querySelectorAll(constants.SELECTORS.RESULT_TO_LI).forEach((item) => item.style.display = 'block')
  }

  resetConnectionFromList() {
    this.showAllConnectionFromList()

    // Re-hide nodes that are already connected or filtered out
    this.updateConnectionFromList()
  }

  resetConnectionToList() {
    this.showAllConnectionToList()

    // Re-hide nodes that are already connected or filtered out
    this.updateConnectionToList()
  }

  getDevice(deviceId) {
    return App.Project.getOneLineDevice(deviceId)
  }

  // Function called from context menu when user opts to delete a device
  deleteDevice(device, branchSide, isBranchModalOpen) {
    if (branchSide === constants.BRANCH_SIDES.FROM) {
      this.fromDevice = new Device(this, device, device.DeviceType, branchSide)
      this.fromDevice.deleteDevice(device.DeviceId, branchSide, isBranchModalOpen)

    } else if (branchSide === constants.BRANCH_SIDES.TO) {
      this.toDevice = new Device(this, device, device.DeviceType, branchSide)
      this.toDevice.deleteDevice(device.DeviceId, branchSide, isBranchModalOpen)
    }
  }

  // Function called from context menu when user opts to open or close a device
  updateDeviceState(device, branchSide, deviceOpen) {
    if (branchSide === constants.BRANCH_SIDES.FROM) {
      this.fromDevice = new Device(this, device, device.DeviceType, branchSide)
      this.fromDevice.updateDeviceState(device.DeviceId, deviceOpen.toString())

    } else if (branchSide === constants.BRANCH_SIDES.TO) {
      this.toDevice = new Device(this, device, device.DeviceType, branchSide)
      this.toDevice.updateDeviceState(device.DeviceId, deviceOpen.toString())
    }
  }

  // Protective devices
  addCreateDeviceListeners() {
    const branchType = this.SelectedProjectElement.BranchType
    const fromSelect = document.querySelector(`#${constants.MODAL_FORM_IDS[branchType][0]} ${constants.SELECTORS.FROM_PROTECTION_SELECT}`)
    utils.addEvent(fromSelect, 'change', (event) => this.handleDeviceSelect(event))

    if (branchType !== constants.BRANCH_TYPES.DCON) {
      const toSelect = document.querySelector(`#${constants.MODAL_FORM_IDS[branchType][0]} ${constants.SELECTORS.TO_PROTECTION_SELECT}`)
      utils.addEvent(toSelect, 'change', (event) => this.handleDeviceSelect(event))
    }
  }

  addDeviceStateListeners() {
    const branchType = this.SelectedProjectElement.BranchType
    const fromDeviceId = this.SelectedProjectElement.FromDeviceId

    if (fromDeviceId) {
      const fromRadioButtons = document.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.DEVICE_STATUS}`)
      const fromDevice = App.Project.getOneLineDevice(fromDeviceId)
      this.fromDevice = new Device(this, fromDevice, fromDevice.DeviceType, constants.BRANCH_SIDES.FROM)

      Array.from(fromRadioButtons).forEach(item => {
        const itemId = item.id
        const clonedItem = item.cloneNode()
        clonedItem.innerHTML = item.innerHTML
        const itemWrapper = item.parentNode
        item.remove()
        itemWrapper.append(clonedItem)
        const newItem = document.getElementById(itemId)
        newItem.addEventListener('click', (event) => {
          this.fromDevice.updateDeviceState(
            this.SelectedProjectElement.FromDeviceId,
            event.target.value
          )
        })
      })
    }

    if (branchType !== constants.BRANCH_TYPES.DCON) {
      const toDeviceId = this.SelectedProjectElement.ToDeviceId

      if (toDeviceId) {
        const toRadioButtons = document.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.DEVICE_STATUS}`)
        const toDevice = App.Project.getOneLineDevice(toDeviceId)
        this.toDevice = new Device(this, toDevice, toDevice.DeviceType, constants.BRANCH_SIDES.TO)

        Array.from(toRadioButtons).forEach(item => {
          const itemId = item.id
          const clonedItem = item.cloneNode()
          clonedItem.innerHTML = item.innerHTML
          const itemWrapper = item.parentNode
          item.remove()
          itemWrapper.append(clonedItem)
          const newItem = document.getElementById(itemId)
          newItem.addEventListener('click', (event) => {
            this.toDevice.updateDeviceState(
              this.SelectedProjectElement.ToDeviceId,
              event.target.value
            )
          })
        })
      }
    }
  }

  addRemoveDeviceListeners() {
    const branchType = this.SelectedProjectElement.BranchType
    const fromDeviceId = this.SelectedProjectElement.FromDeviceId

    if (fromDeviceId) {
      const fromRemoveLinks = document.querySelectorAll(constants.SELECTORS.FROM_REMOVE_LINKS)
      const fromDevice = App.Project.getOneLineDevice(fromDeviceId)
      this.fromDevice = new Device(this, fromDevice, fromDevice.DeviceType, constants.BRANCH_SIDES.FROM)

      Array.from(fromRemoveLinks).forEach(item => {
        const itemId = item.id
        const clonedItem = item.cloneNode()
        clonedItem.innerHTML = 'remove'
        const itemWrapper = item.parentNode
        item.remove()
        itemWrapper.append(clonedItem)
        const newItem = document.getElementById(itemId)
        newItem.addEventListener('click', () => {
          this.fromDevice.deleteDevice(this.SelectedProjectElement.FromDeviceId, constants.BRANCH_SIDES.FROM, true)
        })
      })
    }

    if (branchType !== constants.BRANCH_TYPES.DCON) {
      const toDeviceId = this.SelectedProjectElement.ToDeviceId

      if (toDeviceId) {
        const toRemoveLinks = document.querySelectorAll(constants.SELECTORS.TO_REMOVE_LINKS)
        const toDevice = App.Project.getOneLineDevice(toDeviceId)
        this.toDevice = new Device(this, toDevice, toDevice.DeviceType, constants.BRANCH_SIDES.TO)

        Array.from(toRemoveLinks).forEach(item => {
          const itemId = item.id
          const clonedItem = item.cloneNode()
          clonedItem.innerHTML = 'remove'
          const itemWrapper = item.parentNode
          item.remove()
          itemWrapper.append(clonedItem)
          const newItem = document.getElementById(itemId)
          newItem.addEventListener('click', () => {
            this.toDevice.deleteDevice(this.SelectedProjectElement.ToDeviceId, constants.BRANCH_SIDES.TO, true)
          })
        })
      }
    }

    if (this.SelectedProjectElement.IsDirectConnection)
      initDirectConnectionModal(true)
    else if (this.SelectedProjectElement.IsTransformer2W)
      initTwoWindingTransformerModal(true)
    else if (this.SelectedProjectElement.IsCable)
      initCableModal(this, true)
  }

  addDeviceDetailsModalListeners() {
    const branchType = this.SelectedProjectElement.BranchType
    const fromDeviceId = this.SelectedProjectElement.FromDeviceId

    if (fromDeviceId) {
      const fromEditLinks = document.querySelectorAll(`${constants.SELECTORS.FROM_PROTECTION} ${constants.SELECTORS.CONNECTION_TITLE}`)
      const fromDevice = App.Project.getOneLineDevice(fromDeviceId)
      this.fromDevice = new Device(this, fromDevice, fromDevice.DeviceType, constants.BRANCH_SIDES.FROM)

      Array.from(fromEditLinks).forEach(item => {
        const itemId = item.id
        const clonedItem = item.cloneNode()
        clonedItem.innerHTML = item.innerHTML
        const itemWrapper = item.parentNode
        item.remove()
        itemWrapper.append(clonedItem)
        const newItem = document.getElementById(itemId)
        newItem.addEventListener('click', () => this.fromDevice.showDeviceDetails(fromDeviceId, constants.BRANCH_SIDES.FROM))
      })
    }

    if (branchType !== constants.BRANCH_TYPES.DCON) {
      const toDeviceId = this.SelectedProjectElement.ToDeviceId

      if (toDeviceId) {
        const toEditLinks = document.querySelectorAll(`${constants.SELECTORS.TO_PROTECTION} ${constants.SELECTORS.CONNECTION_TITLE}`)
        const toDevice = App.Project.getOneLineDevice(toDeviceId)
        this.toDevice = new Device(this, toDevice, toDevice.DeviceType, constants.BRANCH_SIDES.TO)

        Array.from(toEditLinks).forEach(item => {
          const itemId = item.id
          const clonedItem = item.cloneNode()
          clonedItem.innerHTML = item.innerHTML
          const itemWrapper = item.parentNode
          item.remove()
          itemWrapper.append(clonedItem)
          const newItem = document.getElementById(itemId)
          newItem.addEventListener('click', () => this.toDevice.showDeviceDetails(toDeviceId, constants.BRANCH_SIDES.TO))
        })
      }
    }
  }

  handleDeviceSelect(event) {
    const deviceType = event.target.value
    const branchSide = event.target.id === constants.SELECTORS.FROM_PROTECTION_SELECT_BARE ? constants.BRANCH_SIDES.FROM : constants.BRANCH_SIDES.TO
    this.newDevice = new Device(this, null, deviceType, branchSide)
    this.newDevice.postDevice()
  }

  // Actions
  postNode(nodeType) {
    const requestProperties = this.getNewNodeProperties(nodeType)
    const requestDetails = this.getNewNodeDetails(nodeType)
    const requestBody = {
      ...requestProperties,
      Details: {
        ...requestDetails
      }
    }

    // If we're in the map view, get the coordinates for the center of the map and add it to the requestBody
    // for this new node.
    if (this.isAppModeMap) {
      const mapCenter = this.topography.map.getCenter()
      requestBody.Latitude = mapCenter.lat()
      requestBody.Longitude = mapCenter.lng()
    }

    this.executePostNode(requestBody)
  }

  executePostNode(requestBody) {
    console.log('executePostNode()::requestBody', requestBody)

    this.pendingRequestName = constants.REQUEST_NAMES.POST_NODE
    this.synchronousFetcher.post(this.postNodeDataUrl, requestBody).then(response => {
      console.log('postNode()::response', response)
      if (response.data.success) {
        requestBody.NodeId = response.data.message

        const newNode = new OneLineNode(requestBody)

        App.Project.addNode(newNode)
        App.Project.updateLastModifiedDate()

        // If we're in map view mode, immediately add the new marker to the center of the map
        if (this.isAppModeMap)
          this.topography.placeMarker(newNode)

        // Select the just-added node
        this.SelectedProjectElement = newNode

        // Now update the graph as necessary
        this.projectElementsChanged(true, false, false, false)

        // Update the Network Stats in the project sidebar
        this.projectInfo.updateProjectSidebar()

        this.propertiesOverlay.renderTable(this.SelectedProjectElement)

        this.notification.showSuccess(getMessage(messages.POST_NODE_SUCCESS, [requestBody.Name]))
      } else {
        this.notification.showError(response.data.message)
      }
    }).catch(error => {
      this.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  validateMaxMinCharge() {
    const maxCharge = document.getElementById('max-charge').value
    const minCharge = document.getElementById('min-charge').value
    if (maxCharge === '' || minCharge === '')
      return true   // Skip validation if either field is empty

    return (Number(maxCharge) >= Number(minCharge))
  }

  validateMaxMinVoltage() {
    const maxVoltage = document.getElementById('max-voltage').value
    const minVoltage = document.getElementById('min-voltage').value
    if (maxVoltage === '' || minVoltage === '')
      return true   // Skip validation if either field is empty
      
    return (Number(maxVoltage) >= Number(minVoltage))
  }

  patchNode(nodeId, addToCatalogData = null) {
    const requestProperties = this.getNodeRequestProperties(nodeId, addToCatalogData)
    const requestDetails = this.getRequestDetails()
    const nodeBeingEdited = this.SelectedProjectElement
    const formId = constants.MODAL_FORM_IDS[nodeBeingEdited.NodeType][0]

    if (!this.isEquipmentNameUnique(requestProperties.Name, nodeId)) {
      this.notification.showError(getMessage(messages.EQUIPMENT_NAME_NOT_UNIQUE, [requestProperties.Name]))
      return false
    }

    // For GENERATOR and WIND, make sure the X2 form value is <= to the Subtransient form value
    if (
      [constants.NODE_TYPES.GENERATOR, constants.NODE_TYPES.WIND].includes(requestProperties.NodeType) &&
      requestDetails.NegSeqReactance &&
      Number(requestDetails.NegSeqReactance) > Number(requestDetails.Subtransient)
    ) {
      this.notification.showError(messages.X2_VALIDATION_ERROR)
      return false
    }

    // For WIND, set certain field values to empty depending on 'wtg-type' value
    if (requestProperties.NodeType === constants.NODE_TYPES.WIND) {
      if ([1, 2].includes(requestDetails.WTGType)) {
        requestDetails.MaxPowerFactorOver = null
        requestDetails.MaxPowerFactorUnder = null
        requestDetails.ControlMode = 1
      } else if ([3, 4].includes(requestDetails.WTGType)) {
        requestDetails.PowerFactorFullLoad = null
        requestDetails.PowerFactorCorrection = null
        requestDetails.ShuntCapacitorStages = null
        requestDetails.ShuntCapacitorRating = null
      }
    }

    if (requestProperties.NodeType === constants.NODE_TYPES.STORAGE) {
      if (!this.validateMaxMinCharge()) {
        this.notification.showError(messages.VALIDATION_MAX_MIN_CHARGE)
        return false
      }

      if (!this.validateMaxMinVoltage()) {
        this.notification.showError(messages.VALIDATION_MAX_MIN_VOLTAGE)
        return false
      }
    }

    let voltageChanged = false
    if (nodeBeingEdited.IsPowerProducer)
      voltageChanged = nodeBeingEdited.Details.Voltage !== requestDetails.Voltage

    let connectionChanged = false
    if (nodeBeingEdited.NodeType === constants.NODE_TYPES.GENERATOR || nodeBeingEdited.NodeType === constants.NODE_TYPES.SOLAR)
      connectionChanged = nodeBeingEdited.Details.Connection !== requestDetails.Connection

    const hasNameChanged = nodeBeingEdited.Name !== requestProperties.Name

    this.validator.validate(formId, () => {
      const requestBody = {
        NodeData: {
          ...requestProperties,
          Details: {
            ...requestDetails
          }
        },
        BatchUpdates: null,
        NewDefaultCatalogItemId: utils.forms.getNullableTextFieldValue(constants.SELECTORS.NEW_DEFAULT_CATALOG_ITEM_ID),
        AddToCatalog: addToCatalogData
      }

      console.log('patchNode()::requestBody', requestBody)

      // Determine if we need to send along any batch updates to updated voltages
      if (voltageChanged || connectionChanged)
        requestBody.BatchUpdates = new BatchUpdateDTO()
      if (voltageChanged)
        requestBody.BatchUpdates.update(App.Project.updateVoltagesInNetwork(nodeId, requestDetails.Voltage, nodeId))
      if (connectionChanged)
        requestBody.BatchUpdates.update(App.Project.updateConnectionsInNetwork(nodeId, requestDetails.Connection, nodeId))

      // If we just modified the node in the clipboard then remove it from the clipboard
      // Reason: pasting a node copies the _current_ values - we don't want the user to think that pasting will copy the values
      // as of the time they placed the node onto the clipboard
      if (nodeId === this.nodeIdInClipboard)
        this.nodeIdInClipboard = null

      this.synchronousFetcher.patch(this.patchNodeDataUrl, requestBody).then(response => {
        console.log('patchNode()::response', response)
        if (response.data.success) {
          this.modalTemplate.destroyModal()
          nodeBeingEdited.updateData(requestBody.NodeData)

          // Update the google maps marker label if the map is open and if the name has been changed
          if (this.isAppModeMap && hasNameChanged)
            this.topography.updateMarkerLabel(nodeBeingEdited)

          App.Project.updateLastModifiedDate()

          this.updateConnectedFlightPaths(nodeBeingEdited)

          // Update local state for default node and show the appropriate success toast
          if (addToCatalogData && addToCatalogData.DefaultCatalogItem) {

            // "Convert" a regular node into a "default node" and set it in the local state
            const defaultNodeData = App.Project.mapNodeToDefaultNode(this.SelectedProjectElement.NodeType, requestBody.NodeData, requestBody.AddToCatalog)
            App.Project.updateDefaultNode(null, defaultNodeData)
            this.notification.showSuccess(getMessage(messages.ADD_DEFAULT_CATALOG_ITEM_SUCCESS, [addToCatalogData.CatalogName]))

          } else if (addToCatalogData) {
            this.notification.showSuccess(getMessage(messages.ADD_CATALOG_ITEM_SUCCESS, [addToCatalogData.CatalogName]))

          } else if (requestBody.NewDefaultCatalogItemId !== null) {
            App.Project.updateDefaultNode(requestBody.NewDefaultCatalogItemId, requestBody.NodeData)
            this.notification.showSuccess(getMessage(messages.ADD_DEFAULT_CATALOG_ITEM_SUCCESS, [requestBody.NodeData.Name]))
          }

          this.notification.showSuccess(response.data.message)

          if (requestBody.BatchUpdates !== null && requestBody.BatchUpdates.hasVoltageChangeUpdates())
            this.notification.showImportantMessage(messages.VOLTAGE_CHANGED_FROM_NODE_PROPERTY)

          if (requestBody.BatchUpdates !== null && requestBody.BatchUpdates.hasConnectionChanges())
            this.notification.showImportantMessage(messages.CONNECTION_CHANGED_FROM_NODE_PROPERTY)

          this.projectElementsChanged(true, false, false, false)
          //this.graphStateMain.update()
          this.propertiesOverlay.renderTable(this.SelectedProjectElement)

        } else {
          this.notification.showError(response.data.message)
        }
      }).catch(error => {
        this.notification.showError(messages.SERVER_ERROR)
        console.error(error)
      })

    }, (validationResult) => {

      // This is the optional callback for validation errors.
      // For Solar nodes, we want to make sure the side panel is popped open if any of its fields are invalid.
      if (nodeBeingEdited.NodeType === constants.NODE_TYPES.SOLAR) {
        const invalidFields = Object.entries(validationResult.fieldErrors).filter(x => !x[1].succeeded).map(y => y[0])
        const hasSidePanelError = !!invalidFields.find(x => this.validator.solarSidePanelFields.includes(x))
        hasSidePanelError && setTimeout(() => {
          utils.simulateClick(document.querySelector(constants.SELECTORS.PHASE_SWITCH_OPEN_SOLAR))
        }, constants.TRANSITION_SPEEDS.VERY_SLOW)

        // For Generator side panel validation errors
      } else if (nodeBeingEdited.NodeType === constants.NODE_TYPES.GENERATOR) {
        const invalidFields = Object.entries(validationResult.fieldErrors).filter(x => !x[1].succeeded).map(y => y[0])
        const hasSidePanelError = !!invalidFields.find(x => this.validator.generatorSidePanelFields.includes(x))
        hasSidePanelError && setTimeout(() => {
          utils.simulateClick(document.querySelector(constants.SELECTORS.PHASE_SWTCH_OPEN))
        }, constants.TRANSITION_SPEEDS.VERY_SLOW)
      }
    })
  }

  deleteNode(node) {
    const nodeId = node.NodeId
    const requestBody = { nodeId }

    console.log('deleteNode()::requestBody', requestBody)

    // If we just deleted the node in the clipboard then remove it from the clipboard
    if (nodeId === this.nodeIdInClipboard)
      this.nodeIdInClipboard = null

    this.synchronousFetcher.delete(`${this.deleteNodeDataUrl}${nodeId}`, requestBody).then(response => {
      console.log('deleteNode()::response', response)

      if (response.data.success) {

        // If the map view is open, delete the marker from the map
        if (this.isAppModeMap) {
          this.topography.deleteConnectedPolylines(node)
          this.topography.deleteMarker(node)
        }

        App.Project.removeNode(node)
        App.Project.updateLastModifiedDate()

        this.projectElementsChanged(false, false, true, false)

        // Update the Network Stats in the project sidebar
        this.projectInfo.updateProjectSidebar()
        
        this.propertiesOverlay.renderTable(this.SelectedProjectElement)
        this.notification.showSuccess(response.data.message)

      } else {
        this.notification.showError(response.data.message)
      }
    }).catch(error => {
      this.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  patchBatchUpdate(endpoint, batchUpdateCommands) {
    const requestBody = { batchUpdateCommands }

    console.log('patchBatchUpdate()::endpoint', endpoint)
    console.log('patchBatchUpdate()::requestBody', requestBody)

    axios.patch(endpoint, requestBody).then(response => {
      console.log('patchBatchUpdate()::response', response)

      if (response.data.success) {
        console.log('patchBatchUpdate()::response', response.data.success)
        App.Project.updateLastModifiedDate()
        this.propertiesOverlay.renderTable(this.SelectedProjectElement)

      } else {
        console.error('patchBatchUpdate()::response', response.data.message)
      }
    }).catch(error => {
      this.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  postBranch(branchType) {
    if (this.newBranch.fromNodeId === null || this.newBranch.toNodeId === null) {
      this.notification.showError(messages.MISSING_CONNECTION_SELECTION)
      return
    }

    const fromNode = App.Project.getOneLineNode(this.newBranch.fromNodeId)
    const toNode = App.Project.getOneLineNode(this.newBranch.toNodeId)

    // Ensure that internal connections of from and to nodes match (only do the check if this is NOT a voltage modifier)
    if (!constants.VOLTAGE_MODIFIER_BRANCHES.includes(branchType)) {
      const mismatchedConnections =
        fromNode.InternalConnection !== null &&
        toNode.InternalConnection !== null &&
        fromNode.InternalConnection !== toNode.InternalConnection

      if (mismatchedConnections) {
        this.notification.showError(getMessage(messages.MISMATCHED_CONNECTIONS, [fromNode, toNode]))
        return
      }
    }

    const requestProperties = this.getNewBranchProperties(
      constants.BRANCH_TYPES[branchType],
      this.newBranch.fromNodeId,
      this.newBranch.toNodeId
    )
    const requestDetails = this.getNewBranchDetails(constants.BRANCH_TYPES[branchType], toNode)
    const requestBody = {
      ...requestProperties,
      Details: {
        ...requestDetails
      }
    }

    // For Cables and Direct Connections: If both the FromNode and ToNode are positioned on the map,
    // then create a 2-member FlightPath for this branch
    if (
      this.isAppModeMap &&
      [constants.BRANCH_TYPES.CABLE, constants.BRANCH_TYPES.DCON].includes(requestBody.BranchType) &&
      fromNode.IsPositioned &&
      toNode.IsPositioned
    ) {
      requestBody.FlightPath = [
        {
          Latitude: fromNode.Latitude,
          Longitude: fromNode.Longitude
        },
        {
          Latitude: toNode.Latitude,
          Longitude: toNode.Longitude
        }
      ]
    }

    // For Two-Winding Transformers: Just grab the coordinates as if this were a node and store in the branch's
    // Latitude and Longitude properties. The transformer will be rendered regardless of whether the attached
    // nodes are positioned or not. If they are positioned, the connecting edge(s) will automatically be drawn.
    if (
      this.isAppModeMap &&
      requestBody.BranchType === constants.BRANCH_TYPES.TRANS2W &&
      fromNode.IsPositioned &&
      toNode.IsPositioned
    ) {
      requestBody.Latitude = (fromNode.Latitude + toNode.Latitude) / 2
      requestBody.Longitude = (fromNode.Longitude + toNode.Longitude) / 2
    }


    const branch = requestBody

    console.log('postBranch()::requestBody', requestBody)

    this.synchronousFetcher.post(this.postBranchDataUrl, requestBody).then(response => {
      console.log('postBranch()::response', response)
      if (response.data.success) {
        /*******************************************************************************************************************/
        /********************** CHECK FOR JUST-CONNECTED POWER SOURCES WITHOUT A VOLTAGE SPECIFIED *************************/
        /*******************************************************************************************************************/
        // If one side of the connection has no voltage AND contains a power producer, then we may need to update the Power Producer's voltage to match
        const fromNodeHasVoltage = fromNode.LineToLineVoltageIrrespectiveOfOpenDevices !== null && fromNode.LineToLineVoltageIrrespectiveOfOpenDevices !== 0
        const toNodeHasVoltage = toNode.LineToLineVoltageIrrespectiveOfOpenDevices !== null && toNode.LineToLineVoltageIrrespectiveOfOpenDevices !== 0

        if (fromNodeHasVoltage && !toNodeHasVoltage) {
          const toSidePowerProducerVoltageUpdatesToPerform = App.Project.updatePowerProducersWithZeroVoltageAcrossNetwork(toNode, fromNode.LineToLineVoltageIrrespectiveOfOpenDevices)
          if (toSidePowerProducerVoltageUpdatesToPerform.length > 0)
            this.patchBatchUpdate(this.batchUpdatePowerSourceVoltages, toSidePowerProducerVoltageUpdatesToPerform)
        } else if (!fromNodeHasVoltage && toNodeHasVoltage) {
          const fromSidePowerProducerVoltageUpdatesToPerform = App.Project.updatePowerProducersWithZeroVoltageAcrossNetwork(fromNode, toNode.LineToLineVoltageIrrespectiveOfOpenDevices)
          if (fromSidePowerProducerVoltageUpdatesToPerform.length > 0)
            this.patchBatchUpdate(this.batchUpdatePowerSourceVoltages, fromSidePowerProducerVoltageUpdatesToPerform)
        }
        /*******************************************************************************************************************/
        /*******************************************************************************************************************/

        branch.BranchId = response.data.message

        const myNewBranch = new OneLineBranch(requestBody)
        App.Project.addBranch(myNewBranch)
        App.Project.updateLastModifiedDate()

        if (this.isAppModeMap) {
          // If the new branch is TRANS2W, place it as if it were a node
          if (myNewBranch.BranchType === constants.BRANCH_TYPES.TRANS2W)
            this.topography.placeMarker(myNewBranch)

          // If the new branch is a cable, recalculate cable lengths
          else if (myNewBranch.BranchType === constants.BRANCH_TYPES.CABLE)
            this.topography.updateCableLengths()

          // Brute-render all the polylines
          this.topography.polylineData = this.topography.getAllPolylines()
          this.topography.removePolylines()
          this.topography.renderPolylines()

          // Make the new polyline the activeElement in the map
          this.topography.activeElement = myNewBranch
        }

        // Select the just-added branch
        this.SelectedProjectElement = myNewBranch
        this.newBranch = {}
        this.modalTemplate.destroyModal()
        this.notification.showSuccess(getMessage(messages.POST_BRANCH_SUCCESS, [requestBody.Name]))
        this.projectElementsChanged(false, true, false, false)

        // Update the Network Stats in the project sidebar
        this.projectInfo.updateProjectSidebar()

        this.propertiesOverlay.renderTable(this.SelectedProjectElement)

      } else {
        this.notification.showError(getMessage(messages.POST_BRANCH_ERROR, [response.data.message]))
      }
    }).catch(error => {
      this.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  patchBranch(branchId, addToCatalogData = null) {
    const requestProperties = this.getBranchRequestProperties(branchId)
    const requestDetails = this.getRequestDetails()
    const branchBeingEdited = this.SelectedProjectElement
    const formId = constants.MODAL_FORM_IDS[branchBeingEdited.BranchType][0]

    if (!this.isEquipmentNameUnique(requestProperties.Name, branchId)) {
      this.notification.showError(getMessage(messages.EQUIPMENT_NAME_NOT_UNIQUE, [requestProperties.Name]))
      return false
    }

    // If we are updating a voltage modifier, check to see if there were changes to the winding type or voltage on the secondary side
    let secondarySideVoltageChanged = false
    let secondaryWindingTypeChanged = false
    if (branchBeingEdited.IsVoltageModifier) {
      secondarySideVoltageChanged = branchBeingEdited.Details.SecondarySideVoltage !== requestDetails.SecondarySideVoltage
      secondaryWindingTypeChanged = branchBeingEdited.Details.SecondaryWindingType !== requestDetails.SecondaryWindingType
    }

    const hasTransformerNameChanged = branchBeingEdited.Name !== requestProperties.Name && branchBeingEdited.IsTransformer2W

    this.validator.validate(formId, () => {
      const requestBody = {
        BranchData: {
          ...requestProperties,
          Details: {
            ...requestDetails
          }
        },
        BatchUpdates: null,
        NewDefaultCatalogItemId: utils.forms.getNullableTextFieldValue(constants.SELECTORS.NEW_DEFAULT_CATALOG_ITEM_ID),
        AddToCatalog: addToCatalogData
      }

      // If we are updating a voltage modifier & there were changes to the secondary side's voltage or winding type, send along additional batch updates, if needed
      if (secondarySideVoltageChanged || secondaryWindingTypeChanged) {
        requestBody.BatchUpdates = new BatchUpdateDTO()

        if (secondarySideVoltageChanged)
          requestBody.BatchUpdates.update(App.Project.updateVoltagesInNetwork(branchBeingEdited.ToNodeId, requestDetails.SecondarySideVoltage, branchId))
        if (secondaryWindingTypeChanged)
          requestBody.BatchUpdates.update(App.Project.updateConnectionsInNetwork(branchBeingEdited.ToNodeId, requestDetails.SecondaryWindingType, branchId))
      }

      console.log('patchBranch()::requestBody', requestBody)

      this.synchronousFetcher.patch(this.patchBranchDataUrl, requestBody).then(response => {
        console.log('patchBranch()::response', response)
        if (response.data.success) {
          this.modalTemplate.destroyModal()
          branchBeingEdited.updateData(requestBody.BranchData)

          // Update the google maps marker label if the map is open and the branch is TRANS2W and if the name has been changed
          if (this.isAppModeMap && hasTransformerNameChanged)
            this.topography.updateMarkerLabel(branchBeingEdited, true)

          App.Project.updateLastModifiedDate()

          // Update local state for default branch and show the appropriate success toast
          if (addToCatalogData && addToCatalogData.DefaultCatalogItem) {

            // "Convert" a regular branch into a "default branch" and set it in the local state
            const defaultBranchData = App.Project.mapBranchToDefaultBranch(constants.BRANCH_TYPES.CABLE, requestBody.BranchData, requestBody.AddToCatalog)
            App.Project.updateDefaultBranch(null, defaultBranchData)
            this.notification.showSuccess(getMessage(messages.ADD_DEFAULT_CATALOG_ITEM_SUCCESS, [addToCatalogData.CatalogName]))

          } else if (addToCatalogData) {
            this.notification.showSuccess(getMessage(messages.ADD_CATALOG_ITEM_SUCCESS, [addToCatalogData.CatalogName]))

          } else if (requestBody.NewDefaultCatalogItemId !== null) {
            App.Project.updateDefaultBranch(requestBody.NewDefaultCatalogItemId, requestBody.BranchData)
            this.notification.showSuccess(getMessage(messages.ADD_DEFAULT_CATALOG_ITEM_SUCCESS, [requestBody.BranchData.CatalogName]))
          }

          // Show toast for successful patchBranch
          this.notification.showSuccess(response.data.message)

          if (requestBody.BatchUpdates !== null) {
            let batchUpdateMessage = '';

            if (requestBody.BatchUpdates.hasVoltageChangeUpdates())
              batchUpdateMessage = messages.VOLTAGE_CHANGED_FROM_BRANCH_PROPERTY

            if (requestBody.BatchUpdates.hasConnectionChanges()) {
              if (batchUpdateMessage.length > 0)
                batchUpdateMessage += '<br><br>'

              batchUpdateMessage += messages.CONNECTION_CHANGED_FROM_BRANCH_PROPERTY
            }

            if (batchUpdateMessage.length > 0)
              this.notification.showImportantMessage(batchUpdateMessage)
          }

          // Update the load's rated voltages across the network, if needed
          if (secondarySideVoltageChanged) {
            // Calculate voltage across the network - we need to do this before updating rated voltages so that they
            App.Project.calculateVoltageAcrossNetwork()

            const ratedVoltageUpdatesToPerform = App.Project.updateRatedVoltageValuesAcrossNetwork()
            if (ratedVoltageUpdatesToPerform.length > 0)
              this.patchBatchUpdate(this.batchUpdateRatedVoltage, ratedVoltageUpdatesToPerform)
          }

          this.projectElementsChanged(false, false, false, false)
          this.propertiesOverlay.renderTable(this.SelectedProjectElement)
          this.projectInfo.updateProjectSidebar()

        } else {
          this.notification.showError(response.data.message)
        }
      }).catch(error => {
        this.notification.showError(messages.SERVER_ERROR)
        console.error(error)
      })
    })
  }

  deleteBranch(branch, shouldNotifyUser = true) {
    const branchId = branch.BranchId
    const requestBody = { branchId }

    console.log('deleteBranch()::requestBody', requestBody)

    this.synchronousFetcher.delete(`${this.deleteBranchDataUrl}${branchId}`, requestBody).then(response => {
      console.log('deleteBranch()::response', response)
      if (response.data.success) {
        if (branch.FromDeviceId) {
          const fromDevice = App.Project.getOneLineDevice(branch.FromDeviceId)
        }

        if (branch.ToDeviceId) {
          const toDevice = App.Project.getOneLineDevice(branch.ToDeviceId)
        }

        // If the map view is open, delete the polyline from the map
        if (this.isAppModeMap) {
          this.topography.deletePolyline(branch)
          if (branch.IsTransformer2W)
            this.topography.deleteTransformerMarker(branch)
        }

        App.Project.removeBranch(branch)
        App.Project.updateLastModifiedDate()

        shouldNotifyUser && this.notification.showSuccess(response.data.message)

        // Update the Network Stats in the project sidebar
        this.projectInfo.updateProjectSidebar()

        this.projectElementsChanged(false, false, true, false)
        
        this.propertiesOverlay.renderTable(this.SelectedProjectElement)

      } else {
        this.notification.showError(response.data.message)
      }
    }).catch(error => {
      this.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  patchSettings() {
    this.validator.validate(constants.MODAL_FORM_IDS.SETTINGS[0], () => {
      const requestBody = this.getProjectSettingsRequestProperties()
      console.log('App.patchSettings()::requestBody', requestBody)

      this.oldCableOveragePercent = App.Project.CableOveragePercent
      this.newCableOveragePercent = requestBody.CableOveragePercent

      this.synchronousFetcher.patch(this.patchProjectSettingsDataUrl, requestBody).then(response => {
        console.log('App.patchSettings()::response', response)
        if (response.data.success) {

          // If the cable overage percentage has changed, update all the individual cable lengths
          if (this.oldCableOveragePercent !== this.newCableOveragePercent) {

            // `cableLengthsList` is an array of objects representing the requestBody for the
            // cable length batch update request
            this.topography.cableLengthsList = App.Project.generateCableLengthsRequestBody(
              this.oldCableOveragePercent,
              this.newCableOveragePercent
            )
            this.topography.patchBatchUpdateCableLengths()
          }

          App.Project.updateData(JSON.parse(response.config.data))
          App.Project.updateLastModifiedDate()

          // Update the Project Information data in the project sidebar
          this.projectInfo.updateProjectSidebar()

          this.modalTemplate.destroyModal()

          this.notification.showSuccess(messages.PROJECT_SETTINGS_SAVED)

          // "Refresh" the graph elements as there may have been changes in annotations, units, colors, etc.
          this.projectSettingsSaved()
          this.projectElementsChanged(true, true, false, false)
          this.propertiesOverlay.renderTable(this.SelectedProjectElement)

        } else {
          this.notification.showError(messages.PROJECT_SETTINGS_NOT_SAVED)
        }
      }).catch(error => {
        this.notification.showError(messages.SERVER_ERROR)
        console.error(error)
      })
    })
  }

  postSaveProject() {
    this.validator.validate(constants.MODAL_FORM_IDS.SAVE_PROJECT[0], () => {
      document.querySelector(constants.SELECTORS.SAVE_COPY_BUTTON).disabled = true

      const newProjectName = document.querySelector(`${constants.SELECTORS.SAVE_PROJECT_MAIN_FORM} ${constants.SELECTORS.NEW_PROJECT_NAME}`).value
      const encodedName = encodeURIComponent(newProjectName)
      const newProjectDescription = document.querySelector(`${constants.SELECTORS.SAVE_PROJECT_MAIN_FORM} ${constants.SELECTORS.NEW_PROJECT_DESCRIPTION}`).value
      const encodedDescription = encodeURIComponent(newProjectDescription)
      const queryString = `newName=${encodedName}&newDescription=${encodedDescription}`
      console.log('App.postSaveProject()::queryString', queryString)

      this.synchronousFetcher.post(`${this.postSaveProjectUrl}?${queryString}`, {}).then(response => {
        console.log('App.postSaveProject()::response', response)
        if (response.data.success)
          this.onPostSaveProjectSuccess(response)
        else
          this.onPostSaveProjectError(response)
      }).catch(error => {
        this.onPostSaveProjectFailure(error)
      })
    })
  }

  onPostSaveProjectSuccess(response) {
    const currentProjectName = App.Project.Name
    const newProjectName = document.querySelector(`${constants.SELECTORS.SAVE_PROJECT_MAIN_FORM} ${constants.SELECTORS.NEW_PROJECT_NAME}`).value
    const newProjectId = response.data.message
    const buttonsArr = [
      {
        label: 'Continue',
        classList: this.notification.successButtonClasses,
        callback: () => { window.location.href = `${constants.PROJECT_PATH}/${newProjectId}` }
      },
      {
        label: 'Cancel',
        classList: this.notification.secondaryButtonClasses,
        callback: null
      }
    ]
    this.modalTemplate.destroyModal()
    this.notification.showModalSuccess(getMessage(messages.SAVE_PROJECT_AS_SUCCESS, [currentProjectName, newProjectName]), buttonsArr)
    App.Project.updateLastModifiedDate()
  }

  onPostSaveProjectError(response) {
    this.notification.showError(response.data.message)
  }

  onPostSaveProjectFailure(error) {
    this.notification.showError(messages.SERVER_ERROR)
    console.error(error)
  }

  getProjectSharingInfo(successCallback) {
    this.synchronousFetcher.get(this.getProjectSharingInfoUrl).then(response => {
      console.log('ImportGisResults.getProjectSharingInfo()::response', response)

      if (response.status === 200) {
        successCallback(response)
      } else
        this.onGetProjectSharingInfoError(response)

      return response

    }).catch(error => {
      this.onGetProjectSharingInfoFailure(error)
      return error
    })
  }
  
  onGetProjectSharingInfoError(response) {
    this.notification.showError(response.data.message)
    return response
  }

  onGetProjectSharingInfoFailure(error) {
    this.notification.showError(messages.SERVER_ERROR)
    console.error(error)
    return error
  }

  postSendProject(sendToUserId, sendToMessage) {
    const requestData = {
      sendToUserId,
      sendToMessage
    }
    console.log('App.postSendProject()::requestData', requestData)
    this.synchronousFetcher.post(this.postSendProjectUrl, requestData).then(response => {
      console.log('App.postSendProject()::response', response)
      if (response.data.success)
        this.onPostSendProjectSuccess()
      else
        this.onPostSendProjectError(response)
    }).catch(error => {
      this.onPostSendProjectFailure(error)
    })
  }

  onPostSendProjectSuccess() {
    this.modalTemplate.destroyModal()
    this.notification.showSuccess(messages.SEND_COPY_TO_SUCCESS)
    App.Project.updateLastModifiedDate()
  }

  onPostSendProjectError(response) {
    this.notification.showError(response.data.message)
  }

  onPostSendProjectFailure(error) {
    this.notification.showError(messages.SERVER_ERROR)
    console.error(error)
  }

  updateConnectedFlightPaths(node) {
    if (!!node.Latitude && !!node.Longitude) {
      const incomingBranchesToEdit = Array.from(node.IncomingBranches).filter(x => x.FlightPath && x.FlightPath.length >= 2)
      const outgoingBranchesToEdit = Array.from(node.OutgoingBranches).filter(x => x.FlightPath && x.FlightPath.length >= 2)
      incomingBranchesToEdit.forEach(item => {
        item.FlightPath[item.FlightPath.length - 1] = { Latitude: node.Latitude, Longitude: node.Longitude }
      })
      outgoingBranchesToEdit.forEach(item => {
        item.FlightPath[0] = { Latitude: node.Latitude, Longitude: node.Longitude }
      })
      this.patchBranchListLatLng([...incomingBranchesToEdit, ...outgoingBranchesToEdit])
    }
  }

  // This is called when a user changes Lat/Lng in a node modal form and the connected branches' FlightPaths need to be modified
  patchBranchListLatLng(branchList) {
    if (!branchList.length) {
      return
    }

    const branchesArr = branchList.map(x => ({
      BranchId: x.BranchId,
      FlightPath: x.Flightpath
    }))
    const requestBody = {
      Branches: branchesArr
    }
    console.log('App.patchBranchListLatLng()::requestBody', requestBody)

    this.synchronousFetcher.patch(this.patchElementLatLngDataUrl, requestBody).then(response => {
      console.log('App.patchBranchListLatLng()::response', response)

      if (response.data.success) {
        this.onPatchBranchListLatLngSuccess(response)
      } else {
        this.onPatchBranchListLatLngError(response)
      }
    }).catch(error => {
      this.onPatchBranchListLatLngFailure(error)
    })
  }

  onPatchBranchListLatLngSuccess(response) {
    console.log(messages.ENDPOINT_VERTEX_UPDATE_SUCCESS)
    App.Project.updateLastModifiedDate()
  }

  onPatchBranchListLatLngError(response) {
    console.log(messages.ENDPOINT_VERTEX_UPDATE_ERROR)
    console.error(response)
  }

  onPatchBranchListLatLngFailure(error) {
    this.notification.showError(messages.SERVER_ERROR)
    console.error(error)
  }

  getCatalog(type, mine = true, xendee = true, initialize = true) {
    const getCatalogQueryString = `type=${type}&mine=${mine}&xendee=${xendee}`
    this.synchronousFetcher.get(`${this.getCatalogDataUrl}?${getCatalogQueryString}`).then(response => {
      console.log('App.getCatalog()::response', response)
      if (response.status === 200) {
        if (this.fromDevice && this.fromDevice.deviceCatalog) {
          this.fromDevice.deviceCatalog.handleGetCatalogSuccess(type, response, true)
          initialize && this.fromDevice.deviceCatalog.initializeCatalogListeners(type)
        } else if (this.toDevice && this.toDevice.deviceCatalog) {
          this.toDevice.deviceCatalog.handleGetCatalogSuccess(type, response, true)
          initialize && this.toDevice.deviceCatalog.initializeCatalogListeners(type)
        } else if (this.locatorOverlay.device && this.locatorOverlay.device.deviceCatalog) {
          this.locatorOverlay.device.deviceCatalog.handleGetCatalogSuccess(type, response, true)
          initialize && this.locatorOverlay.device.deviceCatalog.initializeCatalogListeners(type)
        } else if (this.device && this.device.deviceCatalog) {
          this.device.deviceCatalog.handleGetCatalogSuccess(type, response, true)
          initialize && this.device.deviceCatalog.initializeCatalogListeners(type)
        } else {
          this.catalog.handleGetCatalogSuccess(type, response, false)
          initialize && this.catalog.initializeCatalogListeners(type)
        }
      } else {
        this.notification.showError(messages.BAD_CATALOG_FETCH)
      }
    }).catch(error => {
      this.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  getCatalogNameAvailable(type, isDefault, name, callback) {
    const getCatalogNameAvailableQueryString = `type=${type}&name=${encodeURIComponent(name)}`
    axios.get(`${this.getCatalogNameAvailableDataUrl}?${getCatalogNameAvailableQueryString}`).then(response => {
      console.log('App.getCatalogNameAvailable()::response', response)
      if (response.status === 200) {
        callback(isDefault, response)
      } else {
        this.notification.showError(messages.SERVER_ERROR)
      }
    }).catch(error => {
      this.notification.showError(messages.SERVER_ERROR)
      console.error(error)
    })
  }

  getNodeRequestProperties(nodeId, addToCatalogData = null) {
    const nodeType = utils.forms.getTextFieldValue('node-type')
    return {
      NodeId: nodeId,
      NodeType: nodeType,
      Name: utils.forms.getTextFieldValue('name'),
      CatalogName: addToCatalogData === null ? utils.forms.getNullableTextFieldValue('catalog-name') : addToCatalogData.CatalogName,
      Description: utils.forms.getTextFieldValue('description'),
      Latitude: utils.forms.getCoordinateFieldValue('latitude'),
      Longitude: utils.forms.getCoordinateFieldValue('longitude'),
      Manufacturer: utils.forms.getTextFieldValue('sc-manufacturer'),
      PartNumber: utils.forms.getTextFieldValue('sc-part-number'),
      Phases: 'abc'
    }
  }

  getBranchRequestProperties(branchId) {
    const branchType = utils.forms.getTextFieldValue('branch-type')
    let latLngProps = {}
    let flightPathProp = {}
    // Only the Two-Winding Transformer has a lat/lng position (for branches)
    if (branchType === constants.BRANCH_TYPES.TRANS2W) {
      latLngProps = {
        Latitude: utils.forms.getNumericFieldValue('latitude'),
        Longitude: utils.forms.getNumericFieldValue('longitude')
      }
    }

    if (branchType === constants.BRANCH_TYPES.CABLE) {
      const branch = App.Project.getOneLineBranch(branchId)
      flightPathProp = {
        FlightPath: branch.FlightPath
      }
    }

    return {
      BranchId: branchId,
      ToNodeId: utils.forms.getTextFieldValue('to-node-id'),
      FromNodeId: utils.forms.getTextFieldValue('from-node-id'),
      BranchType: utils.forms.getTextFieldValue('branch-type'),
      Name: utils.forms.getTextFieldValue('name'),
      CatalogName: utils.forms.getNullableTextFieldValue('catalog-name'),
      Description: utils.forms.getTextFieldValue('description'),
      Phases: 'abc',
      Manufacturer: document.getElementById('sc-manufacturerer') !== null ? utils.forms.getTextFieldValue('sc-manufacturer') : '',
      PartNumber: document.getElementById('sc-part-number') !== null ? utils.forms.getTextFieldValue('sc-part-number') : '',
      ...latLngProps,
      ...flightPathProp
    }
  }

  getProjectSettingsRequestProperties() {
    return {
      Description: utils.forms.getTextFieldValue('description'),
      Annotations: utils.forms.getAnnotations(constants.FIELD_OPTIONS.PROJECT_ANNOTATIONS),
      CapacityUnits: utils.forms.getToggleFieldValue('capacity-units', constants.FIELD_OPTIONS.CAPACITY_UNITS),
      CurrentUnits: utils.forms.getToggleFieldValue('current-units', constants.FIELD_OPTIONS.CURRENT_UNITS),
      VoltageUnits: utils.forms.getToggleFieldValue('voltage-units', constants.FIELD_OPTIONS.VOLTAGE_UNITS),
      Voltage1: Number(utils.forms.getSelectFieldValue('voltage1')),
      VoltageColor1: utils.forms.getSelectFieldValue('color1'),
      Voltage2: Number(utils.forms.getSelectFieldValue('voltage2')),
      VoltageColor2: utils.forms.getSelectFieldValue('color2'),
      Voltage3: Number(utils.forms.getSelectFieldValue('voltage3')),
      VoltageColor3: utils.forms.getSelectFieldValue('color3'),
      Voltage4: Number(utils.forms.getSelectFieldValue('voltage4')),
      VoltageColor4: utils.forms.getSelectFieldValue('color4'),
      CableOveragePercent: utils.forms.getNumericSelectFieldValue('cable-overage-percent'),
      TypeId: App.Project.TypeId
    }
  }

  getRequestDetails() {
    switch (this.modalTemplate.templateId) {
      case constants.MODALS_BY_TYPE.UTILITY[0]:
        return {
          ThreePhaseShortCircuit: utils.forms.getConvertedNumericFieldValue('three-phase-short-circuit', constants.UNIT_TYPES.CAPACITY, App.Project.CapacityUnits),
          BaseMVA: utils.forms.getNumericFieldValue('base-mva'),
          LgShortCircuit: utils.forms.getConvertedNumericFieldValue('line-ground-short-circuit', constants.UNIT_TYPES.CAPACITY, App.Project.CapacityUnits),
          OperatingVoltage: utils.forms.getConvertedNumericFieldValue('operating-voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          Stiffness: utils.forms.getCheckboxFieldValue('stiffness') === '1',
          Voltage: utils.forms.getConvertedNumericFieldValue('voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          VoltageAngle: utils.forms.getNumericFieldValue('voltage-angle'),
          XrRatioPos: utils.forms.getNumericFieldValue('xr-ratio-positive'),
          XrRatioZero: utils.forms.getNumericFieldValue('xr-ratio-zero'),
          StandByServiceFee: null,
          Notes: null
        }
      case constants.MODALS_BY_TYPE.BUSBAR[0]:
        return {
          Age: utils.forms.getNumericFieldValue('age'),
          AmpRating: utils.forms.getConvertedNumericFieldValue('amp-rating', constants.UNIT_TYPES.CURRENT, App.Project.CurrentUnits),
          CapCosts: utils.forms.getNumericFieldValue('infrastructure-capital-costs'),
          Existing: utils.forms.getSelectFieldValue('existing') === "true",
          Lifetime: utils.forms.getNumericFieldValue('lifetime'),
          OMCosts: utils.forms.getNumericFieldValue('annual-maintenance-costs'),
          StandByServiceFee: null,
          Notes: null
        }
      case constants.MODALS_BY_TYPE.LOAD[0]:
        return {
          Connection: Number(utils.forms.getSelectFieldValue('connection')),
          IsEVLoad: utils.forms.getBooleanFieldValue('is-ev-load'),
          LoadModel: Number(utils.forms.getRadioFieldValue('load-model')),
          MinVoltagePerUnit: utils.forms.getNumericFieldValue('min-voltage-per-unit'),
          PowerFactor: utils.forms.getNumericFieldValue('power-factor'),
          PowerFactorType: Number(utils.forms.getSelectFieldValue('power-factor-type')),
          RatedPower: utils.forms.getNumericFieldValue('rated-power'),
          RatedPowerUnits: Number(utils.forms.getSelectFieldValue('rated-power-units')),
          RatedVoltage: utils.forms.getConvertedNumericFieldValue('rated-voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          Notes: null
        }
      case constants.MODALS_BY_TYPE.SOLAR[0]:
        return {
          CutInPower: utils.forms.getNumericFieldValue('cut-in-power'),
          CutOutPower: utils.forms.getNumericFieldValue('cut-out-power'),
          FaultX: utils.forms.getNumericFieldValue('fault-x'),
          InverterRating: utils.forms.getNumericFieldValue('inverter-rating'),
          PVSpace: utils.forms.getNumericFieldValue('pv-space'),
          PowerFactor: utils.forms.getNumericFieldValue('power-factor'),
          RatedPower: utils.forms.getNumericFieldValue('rated-power'),
          Stiffness: utils.forms.getCheckboxFieldValue('stiffness') === '1',
          ForceSeqPos: utils.forms.getCheckboxFieldValue('force-seq-pos') === '1',
          Voltage: utils.forms.getConvertedNumericFieldValue('voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          XrRatio: utils.forms.getNumericFieldValue('xr-ratio'),
          Connection: Number(utils.forms.getSelectFieldValue('connection')),
          Latitude: utils.forms.getNumericFieldValue('latitude'),
          Longitude: utils.forms.getNumericFieldValue('longitude'),
          PanelType: utils.forms.getNumericSelectFieldValue('panel-type'),
          Tilt: utils.forms.getNumericFieldValue('tilt'),
          ArrayType: utils.forms.getNumericSelectFieldValue('array-type'),
          SystemLosses: utils.forms.getNumericFieldValue('system-losses'),
          Azimuth: utils.forms.getNumericSelectFieldValue('azimuth'),
          InverterEfficiency: utils.forms.getNumericFieldValue('inverter-efficiency'),
          InverterCosts: utils.forms.getNumericFieldValue('inverter-costs'),
          InverterLife: utils.forms.getNumericFieldValue('inverter-life'),
          PVCosts: utils.forms.getNumericFieldValue('pv-costs'),
          PVLife: utils.forms.getNumericFieldValue('pv-life'),
          PVMaintCostsPerKWPerMonth: utils.forms.getNumericFieldValue('pv-maint-costs-per-kw-per-month'),
          PVInstallationCosts: utils.forms.getNumericFieldValue('pv-installation-costs'),
          Notes: null,
          NonLinearPurchasePrice: null,
          NonLinearPurchasePriceValues: null
        }
      case constants.MODALS_BY_TYPE.WIND[0]:
        return {
          Voltage: utils.forms.getConvertedNumericFieldValue('voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          RatedPower: utils.forms.getNumericFieldValue('rated-power'),
          WTGType: Number(utils.forms.getRadioFieldValue('wtg-type')),
          MaxPowerAbsorption: utils.forms.getNumericFieldValue('max-power-absorption'),
          MaxPowerDelivery: utils.forms.getNumericFieldValue('max-power-delivery'),
          NegSeqReactance: utils.forms.getNumericFieldValue('neg-seq-reactance'),
          SteadyState: utils.forms.getNumericFieldValue('steady-state'),
          Subtransient: utils.forms.getNumericFieldValue('subtransient'),
          X0: utils.forms.getNumericFieldValue('x0'),
          Transient: utils.forms.getNumericFieldValue('transient'),
          XrRatio: utils.forms.getNumericFieldValue('xr-ratio'),
          PowerFactorFullLoad: utils.forms.getNumericFieldValue('power-factor-full-load'),
          PowerFactorCorrection: utils.forms.getNumericFieldValue('power-factor-correction'),
          ShuntCapacitorStages: utils.forms.getNumericFieldValue('shunt-capacitor-stages'),
          ShuntCapacitorRating: utils.forms.getNumericFieldValue('shunt-capacitor-rating'),
          MaxPowerFactorOver: utils.forms.getNumericFieldValue('max-power-factor-over'),
          MaxPowerFactorUnder: utils.forms.getNumericFieldValue('max-power-factor-under'),
          ControlMode: utils.forms.getNumericSelectFieldValue('control-mode'),
          Lifetime: utils.forms.getNumericFieldValue('lifetime'),
          Cost: utils.forms.getNumericFieldValue('cost'),
          FixedMaintCost: utils.forms.getNumericFieldValue('fixed-maint-cost'),
          VarMaintCost: utils.forms.getNumericFieldValue('var-maint-cost'),
          HubHeight: utils.forms.getNumericFieldValue('hub-height'),
          GenShedding: utils.forms.getIsCheckboxChecked('gen-shedding'),
          TurbineModel: utils.forms.getTextFieldValue('turbine-model'),
          Notes: null,
          NonLinearPurchasePrice: null,
          NonLinearPurchasePriceValues: null
        }
      case constants.MODALS_BY_TYPE.GENERATOR[0]:
        return {
          Voltage: utils.forms.getConvertedNumericFieldValue('voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          FuelType: Number(utils.forms.getSelectFieldValue('fuel-type')),
          GeneratorModel: Number(utils.forms.getRadioFieldValue('power-model')),
          Poles: utils.forms.getNumericFieldValue('poles'),
          Connection: Number(utils.forms.getSelectFieldValue('connection')),
          MaxPowerAbsorption: utils.forms.getNumericFieldValue('max-power-absorption'),
          MaxPowerDelivery: utils.forms.getNumericFieldValue('max-power-delivery'),
          PowerFactor: utils.forms.getNumericFieldValue('power-factor'),
          RatedPower: utils.forms.getNumericFieldValue('rated-power'),
          RatedRPM: utils.forms.getNumericFieldValue('rated-rpm'),
          Reactance: utils.forms.getNumericFieldValue('reactance'),
          NegSeqReactance: utils.forms.getNumericFieldValue('x-2'),
          Resistance: utils.forms.getNumericFieldValue('resistance'),
          SteadyState: utils.forms.getNumericFieldValue('steady-state'),
          Transient: utils.forms.getNumericFieldValue('transient'),
          Subtransient: utils.forms.getNumericFieldValue('subtransient'),
          X0: utils.forms.getNumericFieldValue('x0'),
          XrRatio: utils.forms.getNumericFieldValue('xr-ratio'),
          Stiffness: utils.forms.getBooleanFieldValue('stiffness'),
          Cost: utils.forms.getNumericFieldValue('cost'),
          Lifetime: utils.forms.getNumericFieldValue('lifetime'),
          FixedMaintCost: utils.forms.getNumericFieldValue('fixed-maintenance-costs'),
          VarMaintCost: utils.forms.getNumericFieldValue('variable-maintenance-costs'),
          SprintCap: null,
          SprintHours: null,
          Efficiency: null,
          HTPRatio: null,
          NoxRate: null,
          NoxTreatCost: null,
          MaxRampUp: null,
          MaxRampDown: null,
          ActivationDemand: null,
          MinUpDownTime: null,
          MinLoad: null,
          Notes: null,
          NonLinearPurchasePrice: null,
          NonLinearPurchasePriceValues: null,
          NonLinearEfficiency: null,
          NonLinearEfficiencyValues: null,
          NonLinearHTP: null,
          NonLinearHTPValues: null,
          NonLinearTemperatureValues: null,
          CO2CaptureCost: null,
          CO2CaptureFact: null
        }
      case constants.MODALS_BY_TYPE.STORAGE[0]:
        return {
          StoredCharge: utils.forms.getNumericFieldValue('stored'),
          FaultX: utils.forms.getNumericFieldValue('fault-x'),
          ForceSeqPos: utils.forms.getBooleanFieldValue('force-seq-plus'),
          Connection: Number(utils.forms.getSelectFieldValue('connection')),
          IdlingLossesKVAR: utils.forms.getNumericFieldValue('losses-kvar'),
          IdlingLossesKW: utils.forms.getNumericFieldValue('idling-losses'),
          LimitCurrent: utils.forms.getBooleanFieldValue('limit-current'),
          MaxVoltagePU: utils.forms.getNumericFieldValue('max-voltage'),
          MinVoltagePU: utils.forms.getNumericFieldValue('min-voltage'),
          PowerFactor: utils.forms.getNumericFieldValue('inverter-power-factor'),
          PowerFactorType: Number(utils.forms.getSelectFieldValue('power-factor-type')),
          RatedPower: utils.forms.getNumericFieldValue('inverter-rated-power'),
          RatedVoltage: utils.forms.getConvertedNumericFieldValue('rated-voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          Resistance: utils.forms.getNumericFieldValue('resistance'),
          Reactance: utils.forms.getNumericFieldValue('reactance'),
          StorageModel: Number(utils.forms.getRadioFieldValue('storage-model')),
          StorageRatedCapacity: utils.forms.getNumericFieldValue('storage-rated-capacity'),
          StorageState: Number(utils.forms.getRadioFieldValue('storage-state')),
          XrRatio: utils.forms.getNumericFieldValue('x-r'),
          InstallationCost: utils.forms.getNumericFieldValue('system-installation'),
          InverterPurchaseCost: utils.forms.getNumericFieldValue('inverter-purchase'),
          EnergyModulesPerkWh: utils.forms.getNumericFieldValue('energy-modules-cost'),
          DiscreteSize: utils.forms.getNumericFieldValue('discrete-module-size'),
          MaintenanceCostPerkWhPerMonth: utils.forms.getNumericFieldValue('maintenance-cost'),
          ChargingEfficiency: utils.forms.getNumericFieldValue('charging'),
          DischargingEfficiency: utils.forms.getNumericFieldValue('discharging'),
          MaxStateOfCharge: utils.forms.getNumericFieldValue('max-charge'),
          MinStateOfCharge: utils.forms.getNumericFieldValue('min-charge'),
          SystemLifetime: utils.forms.getNumericFieldValue('system-lifetime'),
          MaxChargeRate: utils.forms.getNumericFieldValue('charging-c-rating'),
          MaxDischargeRate: utils.forms.getNumericFieldValue('discharging-c-rating'),
          MaxNumberOfCycles: null,
          MinNumberOfCycles: null,
          NonLinearPurchasePrice: null,
          NonLinearPurchasePriceValues: null,
          NonLinearTemperatureValues: null,
          Notes: null
        }
      case constants.MODALS_BY_TYPE.CABLE[0]:
        return {
          NumCablesInParallel: utils.forms.getTextFieldValue('number-of-cables-in-parallel'),
          NumConductors: utils.forms.getTextFieldValue('number-of-conductors'),
          Ampacity: utils.forms.getConvertedNumericFieldValue('ampacity', constants.UNIT_TYPES.CURRENT, App.Project.CurrentUnits),
          CableLength: utils.forms.getNumericFieldValue('cable-length'),
          ComputeCableLengths: utils.forms.getBooleanFieldValue('compute-cable-lengths'),
          CableMaterial: Number(utils.forms.getSelectFieldValue('cable-material')),  // copper | aluminum
          CableSize: utils.forms.getTextFieldValue('cable-size'),
          CapacitancePos: null,
          CapacitanceZero: null,
          CatalogName: utils.forms.getTextFieldValue('catalog-name'),
          InsulationType: Number(utils.forms.getSelectFieldValue('insulation-type')),  // '' | Bare | EPR | HDPE | HMWPE | PILC | PVC | RHH | THHN | THHW | TR-XLPE | XHHW | XLPE
          VoltageRating: utils.forms.getConvertedNumericFieldValue('voltage-rating', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          ResistancePos: utils.forms.getNumericFieldValue('resistance-pos'),
          ResistanceZero: utils.forms.getNumericFieldValue('resistance-zero'),
          RatedTemperature: utils.forms.getNumericFieldValue('rated-temperature'),
          ReactancePos: utils.forms.getNumericFieldValue('reactance-pos'),
          ReactanceZero: utils.forms.getNumericFieldValue('reactance-zero'),
          StandByServiceFee: null,
          CostsPerUnitDistance: utils.forms.getCurrencyFieldValue('costs-per-unit-distance'),
          Life: utils.forms.getNumericFieldValue('life'),
          Notes: null
        }
      case constants.MODALS_BY_TYPE.TRANS2W[0]:
        return {
          PrimarySideVoltage: utils.forms.getConvertedNumericFieldValue('primary-rated-voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          SecondarySideVoltage: utils.forms.getConvertedNumericFieldValue('secondary-rated-voltage', constants.UNIT_TYPES.VOLTAGE, App.Project.VoltageUnits),
          Rating: utils.forms.getConvertedNumericFieldValue('rating', constants.UNIT_TYPES.CAPACITY, App.Project.CapacityUnits),
          PrimaryWindingType: Number(utils.forms.getSelectFieldValue('primary-winding')),      // delta (default) | wye-ungrounded | wye-solidly | wye-impedance
          SecondaryWindingType: Number(utils.forms.getSelectFieldValue('secondary-winding')),  // delta | wye-ungrounded | wye-solidly (default) | wye-impedance
          PrimaryGroundingResistance: utils.forms.getNumericFieldValue('primary-grounding-resistance'),
          PrimaryGroundingReactance: utils.forms.getNumericFieldValue('primary-grounding-reactance'),
          SecondaryGroundingResistance: utils.forms.getNumericFieldValue('secondary-grounding-resistance'),
          SecondaryGroundingReactance: utils.forms.getNumericFieldValue('secondary-grounding-reactance'),
          Impedance: utils.forms.getNumericFieldValue('impedance'),
          XrRatio: utils.forms.getNumericFieldValue('xr-ratio'),
          CoolingFactor: utils.forms.getNumericFieldValue('cooling-factor'),
          CoolingClassCode: utils.forms.getTextFieldValue('cooling-class-code'),
          Tap: utils.forms.getDecimalFieldValue('tap'),
          TapSide: Number(utils.forms.getRadioFieldValue('tap-side')),
          NumberOfTaps: utils.forms.getNumericFieldValue('number-of-taps'),
          MaxTap: utils.forms.getDecimalFieldValue('max-tap'),
          MinTap: utils.forms.getDecimalFieldValue('min-tap'),
          Cost: utils.forms.getNumericFieldValue('cost'),
          Life: utils.forms.getNumericFieldValue('life'),
          Notes: null
        }
      case constants.MODALS_BY_TYPE.DCON[0]:
        return {}
      default:
        console.warn('Did not return any request details')
        return {}
    }
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

  setNewBranch(connectionType) {
    const uniqueName = this.getUniqueEquipmentName(connectionType)
    this.newBranch = { name: uniqueName, toNodeId: null, fromNodeId: null }
  }

  isEquipmentNameUnique(name, id) {
    const allNodes = App.Project.OneLineNodes
    for (let i = 0; i < allNodes.size; i++) {
      const currentNode = allNodes.get(i)
      if (currentNode.NodeId !== id && currentNode.Name.toLowerCase() === name.toLowerCase())
        return false
    }

    const allBranches = App.Project.OneLineBranches
    for (let i = 0; i < allBranches.size; i++) {
      const currentBranch = allBranches.get(i);
      if (currentBranch.BranchId !== id && currentBranch.Name.toLowerCase() === name.toLowerCase())
        return false
    }

    const allDevices = App.Project.OneLineDevices
    for (let i = 0; i < allDevices.size; i++) {
      const currentDevice = allDevices.get(i);
      if (currentDevice.DeviceId !== id && currentDevice.Name.toLowerCase() === name.toLowerCase())
        return false
    }

    return true
  }

  getUniqueEquipmentName(equipmentType) {
    let counter = 1
    let proposedName = constants.LABELS[equipmentType] + ' ' + counter.toString()

    while (!this.isEquipmentNameUnique(proposedName)) {
      counter++
      proposedName = constants.LABELS[equipmentType] + ' ' + counter.toString()
    }

    return proposedName
  }

  getNewNodeProperties(nodeType) {
    console.log('App.getNewNodeProperties()::nodeType', nodeType)
    const defaultNode = App.Project.getDefaultNode(nodeType)
    if (defaultNode) {
      return {
        ...defaultNode,
        NodeId: null,
        NodeType: nodeType,
        Name: this.getUniqueEquipmentName(nodeType),
        Phases: 'abc'
      }
    } else {
      return {
        NodeId: null,
        NodeType: nodeType,
        Name: this.getUniqueEquipmentName(nodeType),
        Description: '',
        CatalogName: nodeType ? `Default ${utils.capitalizeWords(constants.LABELS[nodeType])}` : '',
        Phases: 'abc',
        Manufacturer: '',
        PartNumber: '',
        X: null,
        Y: null,
        Latitude: null,
        Longitude: null
      }
    }
  }

  getNewNodeDetails(nodeType) {
    const defaultNode = App.Project.getDefaultNode(nodeType)

    switch (nodeType) {
      case constants.NODE_TYPES.UTILITY:
        let defaultUtility = {
          ThreePhaseShortCircuit: 100000,
          BaseMVA: 100,
          LgShortCircuit: 100000,
          OperatingVoltage: 12470,
          Stiffness: true,
          Voltage: 12470,
          VoltageAngle: 0,
          XrRatioPos: 5.25,
          XrRatioZero: 5.25,
          StandByServiceFee: null
        }

        if (defaultNode && defaultNode.Details) {
          defaultUtility = {
            ...defaultUtility,
            ...defaultNode.Details
          }
        }

        return defaultUtility

      case constants.NODE_TYPES.BUSBAR:
        let defaultBusbar = {
          AmpRating: null,
          OMCosts: null,
          CapCosts: null,
          Lifetime: 25,
          Age: null,
          Existing: false
        }

        if (defaultNode && defaultNode.Details) {
          defaultBusbar = {
            ...defaultBusbar,
            ...defaultNode.Details
          }
        }

        return defaultBusbar

      case constants.NODE_TYPES.LOAD:
        let defaultLoad = {
          Connection: constants.CONNECTIONS.WYE_SOLIDLY.value,  // wye-ungrounded | wye-solidly (default) | delta
          LoadModel: 1,            // constant KVA (default) | constant current | constant impedance | constant P quadratic Q | linear P quadratic Q
          MinVoltagePerUnit: 0.95,
          PowerFactor: 95,
          PowerFactorType: 1,      // lag (default) | lead
          RatedPower: null,
          RatedPowerUnits: 2,      // amps | kW (default)
          RatedVoltage: null,
          IsEVLoad: false,
          LoadShapeName: '',
          LoadShapeDate: null,
          LoadShapePreservePeak: null,
          LoadShapeResolution: null,
          LoadShapeUnits: ''
        }

        if (defaultNode && defaultNode.Details) {
          defaultLoad = {
            ...defaultLoad,
            ...defaultNode.Details
          }
        }

        return defaultLoad

      case constants.NODE_TYPES.SOLAR:
        let defaultSolar = {
          CutInPower: 10,
          CutOutPower: 10,
          FaultX: 4,
          InverterRating: null,
          PVSpace: 99999999,
          PowerFactor: 100,
          RatedPower: null,
          Stiffness: true,
          ForceSeqPos: true,
          Voltage: null,
          XrRatio: 0.03,
          Connection: constants.CONNECTIONS.WYE_SOLIDLY.value,
          PanelType: 1,
          Tilt: null,
          ArrayType: 1,
          SystemLosses: null,
          Azimuth: 180,
          InverterEfficiency: null,
          InverterCosts: null,
          InverterLife: null,
          PVCosts: null,
          PVLife: null,
          PVMaintCostsPerKWPerMonth: null,
          PVInstallationCosts: null
        }

        if (defaultNode && defaultNode.Details) {
          defaultSolar = {
            ...defaultSolar,
            ...defaultNode.Details
          }
        }

        return defaultSolar

      case constants.NODE_TYPES.WIND:
        let defaultWind = {
          Voltage: null,
          RatedPower: null,
          WTGType: 1,
          NegSeqReactance: null,
          SteadyState: null,
          Transient: null,
          Subtransient: null,
          X0: null,
          XrRatio: null,
          MaxPowerAbsorption: null,
          MaxPowerDelivery: null,
          PowerFactorFullLoad: null,
          PowerFactorCorrection: null,
          ShuntCapacitorStages: null,
          ShuntCapacitorRating: null,
          MaxPowerFactorOver: null,
          MaxPowerFactorUnder: null,
          ControlMode: null,
          Lifetime: 20,
          Cost: 300000,
          FixedMaintCost: 0,
          VarMaintCost: .015,
          HubHeight: 125,
          GenShedding: null,
          TurbineModel: null
        }

        if (defaultNode && defaultNode.Details) {
          defaultWind = {
            ...defaultWind,
            ...defaultNode.Details
          }
        }

        return defaultWind

      case constants.NODE_TYPES.STORAGE:
        let defaultStorage = {
          StoredCharge: 100,
          FaultX: 4,
          ForceSeqPos: false,
          Connection: constants.CONNECTIONS.WYE_SOLIDLY.value,
          IdlingLossesKVAR: 0,
          IdlingLossesKW: 1,
          LimitCurrent: false,
          MaxVoltagePU: 1.1,
          MinVoltagePU: 0.9,
          PowerFactor: null,
          PowerFactorType: 1,      // lag (default) | lead
          RatedPower: null,
          RatedVoltage: null,
          Resistance: null,
          Reactance: null,
          StorageModel: 1,         // constant kW @ PF (default) | constant admittance
          StorageRatedCapacity: null,
          StorageState: 1,          // idling (default) | charging | discharging
          XrRatio: 0.03,
          InstallationCost: null,
          InverterPurchaseCost: null,
          EnergyModulesPerkWh: null,
          DiscreteSize: null,
          MaintenanceCostPerkWhPerMonth: null,
          ChargingEfficiency: 90,
          DischargingEfficiency: 90,
          MaxStateOfCharge: 100,
          MinStateOfCharge: 5,
          SystemLifetime: null,
          MaxChargeRate: 0.3,
          MaxDischargeRate: 0.3
        }

        if (defaultNode && defaultNode.Details) {
          defaultStorage = {
            ...defaultStorage,
            ...defaultNode.Details
          }
        }

        return defaultStorage

      case constants.NODE_TYPES.GENERATOR:
        let defaultGenerator = {
          Voltage: null,
          GeneratorModel: 1,
          Poles: null,
          Connection: constants.CONNECTIONS.WYE_SOLIDLY.value,
          FuelType: 4,
          MaxPowerAbsorption: null,
          MaxPowerDelivery: null,
          PowerFactor: null,
          RatedPower: null,
          RatedRPM: null,
          Reactance: null,
          NegSeqReactance: null,
          Resistance: null,
          SteadyState: null,
          Transient: null,
          Subtransient: null,
          X0: null,
          XrRatio: null,
          Stiffness: true,
          Lifetime: null,
          Cost: null,
          FixedMaintCost: null,
          VarMaintCost: null,
          DispatchShapeName: '',
          DispatchShapeDate: null,
          DispatchShapeResolution: null,
          DispatchShapeUnits: '',
          DispatchShapePreservePeak: null
        }

        if (defaultNode && defaultNode.Details) {
          defaultGenerator = {
            ...defaultGenerator,
            ...defaultNode.Details
          }
        }

        return defaultGenerator

      default:
        console.warn('Did not return default new node properties')
        return {}
    }
  }

  getNewBranchProperties(branchType, fromNodeId, toNodeId) {
    const defaultBranch = App.Project.getDefaultBranch(branchType)

    let defaultProperties = {
      BranchId: '00000000-0000-0000-0000-000000000000',
      ToNodeId: toNodeId,
      FromNodeId: fromNodeId,
      ToDeviceId: null,
      FromDeviceId: null,
      BranchType: branchType,
      Name: this.getUniqueEquipmentName(branchType),
      Description: '',
      CatalogName: `Default ${utils.capitalizeWords(constants.LABELS[branchType])}`,
      Phases: 'abc',
      Manufacturer: '',
      PartNumber: '',
      Latitude: null,
      Longitude: null,
      FlightPath: []
    }

    if (defaultBranch) {
      defaultProperties = {
        ...defaultProperties,
        ...defaultBranch
      }
    }

    return defaultProperties
  }

  getNewBranchDetails(branchType, toNode) {
    const defaultBranch = App.Project.getDefaultBranch(branchType)

    switch (branchType) {
      case constants.BRANCH_TYPES.DCON:
        return {}
      case constants.BRANCH_TYPES.CABLE:
        let defaultCable = {
          NumCablesInParallel: 1,
          NumConductors: '',
          Ampacity: null,
          CableLength: 100,
          ComputeCableLengths: true,
          CableMaterial: constants.CABLE_MATERIAL.COPPER.value,      // copper (default) | aluminum
          CableSize: '',
          CapacitancePos: null,
          CapacitanceZero: null,
          Description: '',
          InsulationType: 2,     // '' | Bare | EPR (default) | HDPE | HMWPE | PILC | PVC | RHH | THHN | THHW | TR-XLPE | XHHW | XLPE
          VoltageRating: null,
          ResistancePos: null,
          ResistanceZero: null,
          RatedTemperature: null,
          ReactancePos: null,
          ReactanceZero: null,
          CostsPerUnitDistance: 0,
          Life: 99
        }

        if (defaultBranch && defaultBranch.Details) {
          defaultCable = {
            ...defaultCable,
            ...defaultBranch.Details
          }
        }

        return defaultCable

      case constants.BRANCH_TYPES.TRANS2W:
        // Base the transformer's SecondaryWindingType on the Internal Connection of the To Node
        //  If the To Node's internal connection is not set/unknown, then use wy-solidly
        const toNodeConnection = toNode.InternalConnection === null ? constants.CONNECTIONS.WYE_SOLIDLY.value : toNode.InternalConnection

        let defaultTrans2w = {
          PrimarySideVoltage: App.Project.getOneLineNode(this.newBranch.fromNodeId).LineToLineVoltage,
          SecondarySideVoltage: App.Project.getOneLineNode(this.newBranch.toNodeId).LineToLineVoltage,
          Rating: null,
          PrimaryWindingType: constants.CONNECTIONS.DELTA.value,  // delta (default) | wye-ungrounded | wye-solidly | wye-impedance
          SecondaryWindingType: toNodeConnection,                 // base the secondary winding off of the to node's internal connection
          PrimaryGroundingResistance: null,
          PrimaryGroundingReactance: null,
          SecondaryGroundingResistance: null,
          SecondaryGroundingReactance: null,
          Impedance: 1.5,
          XrRatio: 5.75,
          CoolingFactor: 1,
          CoolingClassCode: null,
          Tap: 1,
          TapSide: 1,
          NumberOfTaps: 32,
          MaxTap: 1.1,
          MinTap: 0.9,
          Cost: null,
          Life: null
        }

        if (defaultBranch && defaultBranch.Details) {
          defaultTrans2w = {
            ...defaultTrans2w,
            ...defaultBranch.Details
          }
        }

        return defaultTrans2w

      default:
        console.warn('Did not return default new branch details')
        return {}
    }
  }
}