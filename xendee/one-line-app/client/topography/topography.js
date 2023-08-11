
/****************************************************************************
 ** 'Topography' map view panel displaying One Line nodes and elements using
 ** Google Maps API.
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/

import GoogleMapsApi from './google-maps-api.js'
import App from '../app.js'
import utils from '../utils.js'
import constants from '../constants.js'
import messages, { getMessage } from '../messages.js'
import ModalTemplate from '../modal-template.js'
import UnpositionedElementsControl from './unpositioned-elements-control.js'
import AddressFinderControl from './address-finder-control.js'
import BalanceOfSystemControl from './balance-of-system-control.js'

export default class Topography {
  constructor(app) {
    this.app = app
    this.apiKey = window.googleMapsApiKey
    this.googleMapsApi = new GoogleMapsApi(this.apiKey)
    this.mapContainer = document.getElementById(constants.SELECTORS.TOPOGRAPHIC_MAP)
    this.modalTemplate = null

    this.templateName = constants.TEMPLATE_NAMES.TOPOGRAPHY
    this.templateContext = {
      data: {
        modalName: constants.MODALS.TOPOGRAPHY
      }
    }

    this.map = null    // Instance of Google map class
    this.options = {
      zoom: 5,
      minZoom: 3,
      maxZoom: 20,
      center: {
        lat: 39.8283,  // Center of the U.S.
        lng: -98.5795
      },
      streetViewControl: false,
      tilt: 0,
      zoomControl: false,
      disableDoubleClickZoom: false
    }
    this.markerData = []
    this.markers = []
    this.positionableElements = []  // Duck-typed list of items that can be positioned (nodes + transformers)
    this.unpositionedElements = []  // Each positionableElement either has a 'marker' or is an 'unpositionedElement'
    this.unpositionedElementsControl
    this.addressFinderControl
    this.balanceOfSystemControl
    this.polylineData = []
    this.polylines = []  // Polylines represent project branches
    this.bounds = null   // The bounds determines how the map is centered and zoomed
    this.polylineStyles = {
      strokeColor: constants.POLYLINE_COLORS.CABLE,  // Default is CABLE
      strokeOpacity: 1,
      strokeWeight: 6
    }
    this.currentElement         // Current positionable element
    this.activeElement = null   // Active, selected element (i.e., marker or polyline).
    this.cableLengthsList = []  // Keeps track of the cable length(s) visible on the map view
    this.addDeleteKeyListener() // This delete key listener can be called from One Line mode in the LocatorOverlay
  }

  main() {
    // The Topography instance persists even when the map view modal is destroyed, so be sure to
    // re-init map markers and polylines and the Unpositioned Elements control.
    this.markerData = []
    this.markers = []
    this.positionableElements = []
    this.unpositionedElements = []
    this.polylineData = []
    this.polylines = []

    this.googleMapsApi.load().then(() => {
      this.options.mapTypeId = google.maps.MapTypeId.SATELLITE
      this.modalTemplate = new ModalTemplate(this.templateName, constants.MODAL_CATEGORIES.ACTION, this.templateContext)
      this.modalTemplate.prepareContext()
      this.modalTemplate.execute(constants.SELECTORS.TOPOGRAPHY_CONTAINER, false, false, false)
      this.addExitButtonListener()
      this.map = this.renderMap()
      this.renderMarkers()
      this.addDeselectElementsListener()
      this.polylineData = this.getAllPolylines()
      this.renderPolylines()
      this.renderUnpositionedElementsControl()
      this.renderAddressFinderControl()
      this.centerAndZoom()
      this.renderMarkerContextMenus()
      this.addZoomControlClickListeners()
      this.addZoomControlDisplayListeners()
      this.addZoomAndPanChangedListeners()
      utils.closeOpenWindows(
        constants.SELECTORS.GRAPH_OVERVIEW_COMPONENT,
        constants.SELECTORS.CLOSE_AERIAL_BUTTON,
        constants.SELECTORS.PRINT_OVERLAY,
        constants.SELECTORS.CLOSE_PRINT_OVERLAY_BUTTON_ID
      )
      this.updateMainMenu()
      this.updateCableLengths()
    })
  }

  getAllPolylines() {
    const transformerPolylines = Array.from(App.Project.OneLineBranches).filter(x => (
      x.BranchType === constants.BRANCH_TYPES.TRANS2W &&
      typeof x.Latitude === 'number' && typeof x.Longitude === 'number' &&
      typeof x.FromNode.Latitude === 'number' && typeof x.FromNode.Longitude === 'number' &&
      typeof x.ToNode.Latitude === 'number' && typeof x.ToNode.Longitude === 'number'
    )).map(x =>
      this.mapTransformerToPolylines(x)
    ).flat()

    const branchPolylines = Array.from(App.Project.OneLineBranches).filter(x => (
      x.BranchType !== constants.BRANCH_TYPES.TRANS2W &&
      typeof x.FromNode.Latitude === 'number' && typeof x.FromNode.Longitude === 'number' &&
      typeof x.ToNode.Latitude === 'number' && typeof x.ToNode.Longitude === 'number'
    )).map(x =>
      this.mapBranchToPolyline(x)
    )
    return [
      ...transformerPolylines,
      ...branchPolylines
    ]
  }

  getPolylinesContainingFlightPaths() {
    return this.getAllPolylines().filter(y => y.path !== null)
  }

  getPositionableElements() {
    const transformers = Array.from(App.Project.OneLineBranches).filter(item => item.BranchType === constants.BRANCH_TYPES.TRANS2W)
    transformers.forEach(item => {
      item.elementId = item.BranchId
      item.elementType = item.BranchType
    })
    const nodes = Array.from(App.Project.OneLineNodes)
    nodes.forEach(item => {
      item.elementId = item.NodeId
      item.elementType = item.NodeType
    })
    return [
      ...transformers,
      ...nodes
    ]
  }

  getCurrentPositionableElement(elementId, elementType) {
    if (elementType === constants.BRANCH_TYPES.TRANS2W) {
      return App.Project.getOneLineBranch(elementId)
    } else {
      return App.Project.getOneLineNode(elementId)
    }
  }

  addExitButtonListener() {
    const oneLineBackButton = document.getElementById(constants.SELECTORS.ONE_LINE_BUTTON)
    $(oneLineBackButton).click(() => {
      this.app.activateAppMode(constants.APP_MODES.MAIN)
    })
  }
  goBackToGraphView() {
    const oneLineBackButton = document.getElementById(constants.SELECTORS.ONE_LINE_BUTTON)
    const unpositionedDivs = document.querySelector(constants.SELECTORS.UNPOSITIONED_CONTAINER_DIV)

    this.restoreMainMenu()
    if (this.modalTemplate) this.modalTemplate.destroyModal()
    if (unpositionedDivs) unpositionedDivs.remove()
    $(oneLineBackButton).off()
  }

  renderMap() {
    this.bounds = new google.maps.LatLngBounds()
    return new google.maps.Map(document.getElementById(constants.SELECTORS.TOPOGRAPHIC_MAP), this.options)
  }

  renderMarkers() {
    this.positionableElements = this.getPositionableElements()

    this.markerData = this.positionableElements.map(x => {
      const marker = this.mapPositionableElementToMarker(x)
      this.addMarkerListeners(marker)
      return marker
    })

    this.markerData.forEach(item => {
      if (item.position.lat() === 0 || Number.isNaN(item.position.lat()) || item.position.lng() === 0 || Number.isNaN(item.position.lng())) {
        this.unpositionedElements.push(item)
      } else {
        this.markers.push(new google.maps.Marker(item))
      }
    })
    this.recalculateBounds()
    console.log('Topography.renderMarkers()::this.markers', this.markers)
  }

  placeMarker(node) {
    let marker = this.mapNodeToMarker(node)

    // This is the actual mechanism that adds the new marker to the map.
    this.markers.push(new google.maps.Marker(marker))

    // Now that the brand-new marker is officially a gmaps marker, find it in the markers array so we can highlight it
    marker = this.markers.find(x => x.elementId === marker.elementId)

    // Wait for the proverbial pin to drop before trying to select the newly-created marker
    setTimeout(() => {
      this.selectMarker(marker)
    }, 500)

    this.addMarkerListeners(marker)
    this.renderMarkerContextMenus()
  }

  updateMarkerLabel(element, isTransformer = false) {
    const elementId = isTransformer ? element.BranchId : element.NodeId
    const markerToUpdate = this.markers.find(item => item.elementId === element.elementId)
    const label = markerToUpdate.getLabel()

    label.text = element.Name
    label.className = `${constants.SELECTORS.MARKER_LABEL_ONELINE}`
    markerToUpdate.setLabel(label)
    markerToUpdate.setTitle(label.text)
  }

  recalculateBounds() {
    this.bounds = new google.maps.LatLngBounds()
    this.markers.forEach(item =>
      this.bounds.extend({
        lat: item.position.lat(),
        lng: item.position.lng()
      })
    )
  }

  addDeselectElementsListener() {
    this.map.addListener('click', () => {
      this.deselectElements()
      this.updateMarkerLabels()
    })
  }

  getMarkerDOMNode(title) {
    return document.querySelector(`#${constants.SELECTORS.TOPOGRAPHIC_MAP} [title='${title}']`)
  }

  selectMarker(marker) {
    this.activeElement = App.Project.getOneLineElement(marker.elementType, marker.elementId)
    const markerDOMNode = this.getMarkerDOMNode(this.activeElement.Name)
    const isTwoWindingTransformer = this.activeElement.elementType === constants.BRANCH_TYPES.TRANS2W

    this.deselectElements()

    // For TRANS2W, highlight both the polylines
    if (isTwoWindingTransformer) {

      // There should always be exactly two polylines per transformer
      this.polylines.filter(item =>
        item.branchId === this.activeElement.elementId && item.branchType === this.activeElement.elementType
      ).forEach(item =>
        item.setOptions(constants.SELECTED_POLYLINE_OPTIONS)
      )
    }

    // Change the marker border to show that it is selected.
    // Note, the markerDOMNode can be null if the user clicks the row in the LocatorOverlay but it's unpositioned in the map.
    if (markerDOMNode !== null) {
      markerDOMNode.classList.add(constants.SELECTORS.SELECTED_MAP_MARKER)
    }
  }

  // Selects the cable or direct connection polyline and makes it the `activeElement`.
  // In the case of a two-winding transformer, it will select both polylines connected to the transformer node
  selectPolyline(polyline) {
    this.activeElement = App.Project.getOneLineElement(polyline.branchType, polyline.branchId)
    this.app.SelectedProjectElement = App.Project.getOneLineBranch(polyline.branchId)
    const isTwoWindingTransformer = polyline.branchType === constants.BRANCH_TYPES.TRANS2W

    this.deselectElements()

    // For non-TRANS2W branches, add stroke styling to the active polyline
    if (!isTwoWindingTransformer) {
      polyline.setOptions(constants.SELECTED_POLYLINE_OPTIONS)

    // For TRANS2W, there are USUALLY two polylines, and we have to highlight both.
    // (The user clicks on one of the two.) But note that if a user clicks on the LocatorRow for a
    // partially-placed Transformer (meaning that its connected nodes haven't been placed yet),
    // then the Transformer has 0 polylines.
    } else if (isTwoWindingTransformer) {

      // Find the two polylines (or this gets skipped if there are zero polylines)
      this.polylines.filter(item =>
        item.branchId === this.activeElement.elementId && item.branchType === this.activeElement.elementType
      ).forEach(item =>
        item.setOptions(constants.SELECTED_POLYLINE_OPTIONS)
      )

      // A transformer also has a marker, so add a className to that DOM node to highlight it
      const markerDOMNode = this.getMarkerDOMNode(this.activeElement.Name)
      markerDOMNode.classList.add(constants.SELECTORS.SELECTED_MAP_MARKER)
    }

  }

  // Select a TRANS2W that does not have its polylines positioned on the map yet. So only the center node is selected.
  // This allows the user to delete it from the keyboard.
  selectPartiallyPlacedTransformer(oneLineBranch) {
    this.activeElement = App.Project.getOneLineElement(
      oneLineBranch.BranchType,
      oneLineBranch.BranchId
    )
    const markerDOMNode = this.getMarkerDOMNode(this.activeElement.Name)

    if (!!markerDOMNode) {
      this.deselectElements()
      markerDOMNode.classList.add(constants.SELECTORS.SELECTED_MAP_MARKER)
    }
  }

  deselectElements() {
    let previousSelectedMarker = document.querySelectorAll(`.${constants.SELECTORS.SELECTED_MAP_MARKER}`)
    let previousSelectedMarkerLabel = document.querySelectorAll(`.${constants.SELECTORS.SELECTED_MARKER}`)
    if (previousSelectedMarker) {
      previousSelectedMarker.forEach(className => className.classList.remove(constants.SELECTORS.SELECTED_MAP_MARKER))
    }
    if (previousSelectedMarkerLabel) {
      previousSelectedMarkerLabel.forEach(className => className.classList.remove(constants.SELECTORS.SELECTED_MARKER))
    }
    this.polylines.forEach(x => {
      x.setOptions({
        strokeColor: constants.POLYLINE_COLORS[x.branchType]
      })
    })
  }

  updateMarkerLabels() {
    this.markers.forEach(marker => {
      marker.setOptions({
        label: {
          text: marker.label.text,
          className: `${constants.SELECTORS.MARKER_LABEL_ONELINE}`
        }
      })
    })
  }

  mapNodeToMarker(element) {
    let positionableElement = element
    if (element.IsNode) {
      positionableElement.elementId = element.NodeId
      positionableElement.elementType = element.NodeType
    } else if (element.IsBranch) {
      positionableElement.elementId = element.BranchId
      positionableElement.elementType = element.BranchType
    }
    return this.mapPositionableElementToMarker(positionableElement)
  }

  mapPositionableElementToMarker(positionableElement) {
    const position = new google.maps.LatLng(positionableElement.Latitude, positionableElement.Longitude)
    const label = {
      text: `${positionableElement.Name}`,
      className: `${constants.SELECTORS.MARKER_LABEL_ONELINE}`
    }
    const url = positionableElement.elementType === constants.BRANCH_TYPES.TRANS2W ?
        `/img/one-line/topography/${positionableElement.elementType.toLowerCase()}-${App.Project.FormatId.toLowerCase()}.png?v=1` :
        `/img/one-line/topography/${positionableElement.elementType.toLowerCase()}.png?v=1`
    const icon = {
      url,
      labelOrigin: new google.maps.Point(19, 74),
      scaledSize: new google.maps.Size(38, 60)
    }
    return {
      elementId: positionableElement.elementId,
      elementType: positionableElement.elementType,
      map: this.map,
      title: `${positionableElement.Name}`,
      draggable: true,
      animation: google.maps.Animation.DROP,
      position,
      label,
      icon
    }
  }

  addMarkerListeners(marker) {
    google.maps.event.addListener(marker, 'dragstart', (event) => this.onMarkerDragStart(marker, event))
    google.maps.event.addListener(marker, 'dragend', (event) => this.onMarkerDragEnd(marker, event))
    google.maps.event.addListener(marker, 'click', (event) => this.onMarkerClick(marker, event))
    google.maps.event.addListener(marker, 'dblclick', (event) => this.onMarkerDblClick(marker, event))
  }

  onMarkerDragStart(marker, event) {
    this.currentElement = this.getCurrentPositionableElement(marker.elementId, marker.elementType)
    console.log('Topography.onMarkerDragStart()::this.currentElement', this.currentElement)
    this.currentIncomingBranches = this.currentElement.IncomingBranches
    this.currentOutgoingBranches = this.currentElement.OutgoingBranches
    this.removePolylines()
    this.deselectElements()
    this.updateMarkerLabels()
  }

  onMarkerDragEnd(marker, event) {
    this.activeElement = App.Project.getOneLineElement(marker.elementType, marker.elementId)
    console.log('Topography.onMarkerDragEnd()::marker', marker, '::lat', event.latLng.lat(), '::lng', event.latLng.lng())

    this.removePolylines()
    this.currentElement.Latitude = utils.formats.formatCoordinate(event.latLng.lat())
    this.currentElement.Longitude = utils.formats.formatCoordinate(event.latLng.lng())
    this.polylineData = Array.from(App.Project.OneLineBranches).map(x => this.mapBranchToPolyline(x))

    const polylinesToUpdate = this.updatePolylines(event)

    this.patchElementLatLng(
      marker,
      utils.formats.formatCoordinate(event.latLng.lat()),
      utils.formats.formatCoordinate(event.latLng.lng()),
      marker.elementType === constants.BRANCH_TYPES.TRANS2W ? true : false,
      polylinesToUpdate,
      () => {
        this.polylines.forEach(x => {
          if (x.branchId === marker.elementId && x.branchType === marker.elementType) {
            x.setOptions(constants.SELECTED_POLYLINE_OPTIONS)
          }
        })
      }
    )
  }

  onMarkerClick(marker, event) {
    console.log('Topography.onMarkerClick()::marker', marker)
    this.closeContextMenu()
    this.selectMarker(marker)

    // Mark the clicked marker as the new SelectedProjectElement
    if (Object.keys(constants.NODE_TYPES).includes(marker.elementType)) {
      this.app.SelectedProjectElement = App.Project.getOneLineNode(marker.elementId)
    } else {
      this.app.SelectedProjectElement = App.Project.getOneLineBranch(marker.elementId)
    }
  }

  onMarkerDblClick(marker, event) {
    console.log('Topography.onMarkerDblClick()::marker', marker)
    this.closeContextMenu()

    // Determine element type so we know whether to call showNodeModal() or showBranchModal()
    if (Object.keys(constants.NODE_TYPES).includes(marker.elementType)) {
      this.app.showNodeModal(marker.elementId)
    } else {
      this.app.showBranchModal(marker.elementId)
    }
  }

  renderMarkerContextMenus() {
    this.markers.forEach((item, i) => {
      google.maps.event.addListener(item, 'rightclick', ( marker => this.openContextMenu(marker) )( item ))
    })
  }

  addContextMenuRightClickListener(item) {
    google.maps.event.addListener(item, 'rightclick', ( marker => this.openContextMenu(marker) )( item ))
  }

  addContextMenuButtonListeners() {
    setTimeout(() => {
      jQuery('.edit-item-button').off('click contextmenu').on('click contextmenu', event => {
        let button = event.target
        if (event.target.tagName === 'I') {
          button = event.target.closest('button')
        }

        const elementType = button.getAttribute('data-type')
        const equipmentCategory = App.Project.getEquipmentCategory(elementType)
        const elementId = button.getAttribute('data-id')
        let element = null

        if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.NODE) {
          element = App.Project.getOneLineNode(elementId)
          this.app.showNodeModal(element.elementId)
        } else if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.BRANCH) {
          element = App.Project.getOneLineBranch(elementId)
          this.app.showBranchModal(element.BranchId)
        }
        this.closeContextMenu()
      })

      jQuery('.delete-item-button').off('click contextmenu').on('click contextmenu', event => {
        let button = event.target
        if (event.target.tagName === 'I') {
          button = event.target.closest('button')
        }

        const elementType = button.getAttribute('data-type')
        const equipmentCategory = App.Project.getEquipmentCategory(elementType)
        const elementId = button.getAttribute('data-id')
        let element = null

        if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.NODE) {
          element = App.Project.getOneLineNode(elementId)
          this.app.notification.showConfirm(messages.CONFIRM_DELETE_NODE(element.Name),
          () => {
            this.deselectElements()
            this.updateMarkerLabels()
            this.app.deleteNode(element)
          })
        } else if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.BRANCH) {
          element = App.Project.getOneLineBranch(elementId)
          this.app.notification.showConfirm(messages.CONFIRM_DELETE_BRANCH(element.Name),
          () => {
            this.deselectElements()
            this.updateMarkerLabels()
            this.app.deleteBranch(element)
          })
        }
        this.closeContextMenu()
      })
    }, 300)
  }

  openContextMenu(marker) {
    this.closeContextMenu()

    return () => {
      this.closeContextMenu()
      this.contextMenu = new google.maps.InfoWindow()
      this.contextMenu.setContent(
        getMessage(
          messages.CONTEXT_MENU_CONTENT,
          [
            marker.elementId,
            marker.title,
            marker.elementType
          ]
        )
      )
      this.contextMenu.open(this.map, marker)
      this.addContextMenuButtonListeners()
    }
  }

  openPolylineContextMenu(polyline, event) {
    this.closeContextMenu()

    return () => {
      this.closeContextMenu()
      console.log('event.latLng', event.latLng.lat(), event.latLng.lng())
      this.contextMenu = new google.maps.InfoWindow()
      this.contextMenu.setContent(
        getMessage(
          messages.CONTEXT_MENU_CONTENT,
          [
            polyline.branchId,
            polyline.title,
            polyline.branchType
          ]
        )
      )
      this.contextMenu.open({
        map: this.map,
        position: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        },
        shouldFocus: true
      })

      this.contextMenu.setPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      })

    }
  }

  closeContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.close()
    }
  }

  deleteItem(event) {
    const elementType = event.target.getAttribute('data-type')
    const equipmentCategory = App.Project.getEquipmentCategory(elementType)
    const elementId = event.target.getAttribute('data-id')
    let element = null

    if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.NODE) {
      element = App.Project.getOneLineNode(elementId)
      this.app.deleteNode(element)
    } else if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.BRANCH) {
      element = App.Project.getOneLineBranch(elementId)
      this.app.deleteBranch(element)
    }
  }

  editItem(event) {
    const elementType = event.target.getAttribute('data-type')
    const equipmentCategory = App.Project.getEquipmentCategory(elementType)
    const elementId = event.target.getAttribute('data-id')
    let element = null

    if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.NODE) {
      element = App.Project.getOneLineNode(elementId)
      this.app.showNodeModal(element)
    } else if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.BRANCH) {
      element = App.Project.getOneLineBranch(elementId)
      this.app.showBranchModal(element)
    }
  }

  deleteMarker(node) {
    const markerToDelete = this.markers.find(x => x.elementId === node.NodeId)

    // Remove from the markers list
    this.markers = this.markers.filter(x => x.elementId !== node.NodeId)

    // Remove the marker from the map
    markerToDelete.setMap(null)
  }

  deleteTransformerMarker(branch) {
    let markerToDelete = null

    if (branch) {
      markerToDelete = this.markers.find(x => x.elementId === branch.BranchId)
      this.markers = this.markers.filter(x => x.elementId !== branch.BranchId)
    }

    if (markerToDelete) {
      markerToDelete.setMap(null)
    } else {
      console.log(
        `Topography.deleteTransformerMarker(): Transformer marker could not be removed from the map because it has not been positioned yet.
        This can happen if the user deletes an unpositioned Transformer from the Locator.`
      )
    }
  }

  deletePolyline(branch) {
    this.polylineData = this.polylineData.filter(x => x.branchId !== branch.BranchId)
    this.removePolylines()
    this.renderPolylines()
  }

  deleteConnectedPolylines(node) {
    const connectedBranches = [
      ...Array.from(node.IncomingBranches),
      ...Array.from(node.OutgoingBranches)
    ]

    const connectedBranchIds = connectedBranches.map(x => x.BranchId)

    connectedBranches.forEach(item => {
      if (item.IsTransformer2W) {
        this.deleteTransformerMarker(item)
      }
    })

    // Remove the connected polyline(s), then brute re-render all map polylines
    this.polylineData = this.polylineData.filter(x => !connectedBranchIds.includes(x.branchId))
    this.removePolylines()
    this.renderPolylines()

  }

  updatePolylines(event) {
    const polylinesToUpdate = []
    let markerLat, markerLng

    // N.B.: Different events ('markercomplete' vs. 'dragend') have slightly different
    // properties structure for coordinates
    if (event.latLng) {
      markerLat = utils.formats.formatCoordinate(event.latLng.lat())
      markerLng = utils.formats.formatCoordinate(event.latLng.lng())
    } else if (event.position) {
      markerLat = utils.formats.formatCoordinate(event.position.lat())
      markerLng = utils.formats.formatCoordinate(event.position.lng())
    }

    // Preceding code maps a list of OneLineBranches to GMap Polylines.
    // A polyline with a path of null means it hasn't been placed on the map yet,
    // which means it's a branch with one or two unpositioned elements attached to it,
    // which means its cable length (if it's a cable) is 0.
    // Do not add it to the list of polylinesToUpdate.

    this.currentIncomingBranches && this.currentIncomingBranches.forEach(item => {
      const polyline = this.polylineData.find(x => x.branchId === item.BranchId)
      if (!!polyline && polyline.path !== null && polyline.path.length >= 2) {
        polyline.path[polyline.path.length - 1] = {
          lat: markerLat,
          lng: markerLng
        }
        polylinesToUpdate.push(polyline)
      }
    })

    this.currentOutgoingBranches && this.currentOutgoingBranches.forEach(item => {
      const polyline = this.polylineData.find(x => x.branchId === item.BranchId)
      if (!!polyline && polyline.path !== null && polyline.path.length >= 2) {
        polyline.path[0] = {
          lat: markerLat,
          lng: markerLng
        }
        polylinesToUpdate.push(polyline)
      }
    })

    return polylinesToUpdate
  }

  patchElementLatLng(marker, lat, lng, isTransformer = false, polylines = null, successCallback = null) {
    const branchList = polylines ? polylines.map(x => ({
      BranchId: x.branchId,
      FlightPath: x.path.map(y => ({
        Latitude: utils.formats.formatCoordinate(y.lat),
        Longitude: utils.formats.formatCoordinate(y.lng)
      }))
    })) : []

    const mapCables = (polylines ? polylines.filter(x =>
      ( App.Project.getOneLineBranch(x.branchId) ).IsCable
    ) : [])


    const oneLineCables = mapCables.map(x =>
      App.Project.getOneLineBranch(x.branchId)
    )

    this.cableLengthsList = oneLineCables.map(branch => {
      if (typeof App.Project.CableOveragePercent !== 'number') {
        console.error('Topography.patchElementLatLng: App.Project.CableOveragePercent is not a number!')
        return false
      }

      const computedCableLength = this.computeCableLength(branch, false)

      return {
        EquipmentId: branch.BranchId,
        OldValue: branch.Details.CableLength,
        NewValue: computedCableLength
      }
    })

    // Filter out cable lengths where the new value is the same as the persisted value,
    // then remove the unnecessary OldValue prop
    this.cableLengthsList = this.cableLengthsList.filter(x =>
      x.OldValue !== x.NewValue
    ).map(x => ({
      EquipmentId: x.EquipmentId,
      NewValue: x.NewValue
    }))

    const requestBody = {
      Node: {
        NodeId: marker.elementId,
        LatLon: {
          Latitude: utils.formats.formatCoordinate(lat),
          Longitude: utils.formats.formatCoordinate(lng)
        },
        IsTransformer: isTransformer
      },
      Branches: branchList
    }
    console.log('Topography.patchElementLatLng()::requestBody', requestBody)
    axios.patch(this.app.patchElementLatLngDataUrl, requestBody).then(response => {
      console.log('Topography.patchElementLatLng()::response', response)

      if (response.data.success) {
        this.onPatchElementLatLngSuccess(marker, requestBody, polylines, successCallback)
      } else {
        this.onPatchElementLatLngError(response, marker.title)
      }
    }).catch(error => {
      this.onPatchElementLatLngFailure(error)
    })
  }

  onPatchElementLatLngSuccess(marker, requestBody, polylines, successCallback) {
    if (this.cableLengthsList.length) this.patchBatchUpdateCableLengths(this.cableLengthsList)

    console.log(getMessage(messages.LOCATION_UPDATE_SUCCESS, [marker.title]))
    this.currentElement.Latitude = requestBody.Node.LatLon.Latitude
    this.currentElement.Longitude = requestBody.Node.LatLon.Longitude

    // Update connected branches in the local state
    if (polylines) {
      polylines.forEach((item, i) => {
        const connectedBranch = App.Project.getOneLineBranch(item.branchId)
        const computedLength = this.computeCableLength(connectedBranch, false)
        connectedBranch.Details.CableLength = computedLength

        // Flightpath must have at least 3 vertices. 2 vertices is the equivalent of a straight line.
        // If it has fewer than 3 vertices, then just set the FlightPath to an empty array.
        if (item.path.length > 2) {
          connectedBranch.FlightPath = item.path.map(x => ({ Latitude: Number(x.lat), Longitude: Number(x.lng) }))
        } else {
          connectedBranch.FlightPath = []
        }
      })
    }
    this.removePolylines()
    this.polylineData = this.getPolylinesContainingFlightPaths()
    this.renderPolylines()
    this.recalculateBounds()
    this.bounds.extend({ lat: Number(this.currentElement.Latitude), lng: Number(this.currentElement.Longitude) })
    this.renderMarkerContextMenus()
    App.Project.updateLastModifiedDate()
    this.app.projectInfo.updateProjectSidebar()
    this.selectMarker(marker)

    if (successCallback) {
      successCallback()
    }
  }

  onPatchElementLatLngError(response, title) {
    this.app.notification.showError(getMessage(messages.LOCATION_UPDATE_ERROR, [title]))
    console.error(response)
  }

  onPatchElementLatLngFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
  }

  // For a single branch, i.e., a branch that has a vertex added/changed/deleted
  patchBranchLatLng(polyline, polylineData, flightPath, shouldRedrawPolylines = true) {
    const oneLineBranch = App.Project.getOneLineBranch(polyline.branchId)
    if (oneLineBranch.IsCable) {
      const cable = oneLineBranch

      console.log('Topography.patchBranchLatLng(): old flightPath: ', cable.FlightPath, 'new flightPath: ', flightPath)

      cable.FlightPath = flightPath

      if (typeof App.Project.CableOveragePercent !== 'number') {
        console.error('Topography.patchBranchLatLng: App.Project.CableOveragePercent is not a number!')
        return false
      }

      const computedCableLength = this.computeCableLength(cable, false)

      this.cableLengthsList = [{
        EquipmentId: cable.BranchId,
        OldValue: cable.Details.CableLength,
        NewValue: computedCableLength
      }]

      // Filter out cable lengths where the new value is the same as the persisted value,
      // then remove the OldValue prop
      this.cableLengthsList = this.cableLengthsList.filter(x =>
        x.OldValue !== x.NewValue
      ).map(x => ({
        EquipmentId: x.EquipmentId,
        NewValue: x.NewValue
      }))

    } else {
      this.cableLengthsList = []
    }

    const requestBody = {
      Branches: [
        {
          BranchId: polylineData.branchId,
          FlightPath: flightPath
        }
      ]
    }
    console.log('Topography.patchBranchLatLng()::requestBody', requestBody)

    this.app.synchronousFetcher.patch(this.app.patchElementLatLngDataUrl, requestBody).then(response => {
      console.log('Topography.patchBranchLatLng()::response', response)

      if (response.data.success) {
        this.onPatchBranchLatLngSuccess(requestBody, response, polylineData.title, shouldRedrawPolylines)
      } else {
        this.onPatchBranchLatLngError(requestBody, response, polylineData.title)
      }
    }).catch(error => {
      this.onPatchBranchLatLngFailure(error)
    })
  }

  onPatchBranchLatLngSuccess(requestBody, response, title, shouldRedrawPolylines) {
    console.log(getMessage(messages.VERTICES_UPDATE_SUCCESS, [title]))

    if (this.cableLengthsList.length) this.patchBatchUpdateCableLengths(this.cableLengthsList)

    const patchedBranch = App.Project.getOneLineBranch(requestBody.Branches[0].BranchId)
    const computedLength = this.computeCableLength(patchedBranch, false)
    patchedBranch.Details.CableLength = computedLength
    patchedBranch.FlightPath = requestBody.Branches[0].FlightPath

    if (shouldRedrawPolylines) {
      this.polylineData = this.getAllPolylines()
      this.removePolylines()
      this.renderPolylines()
    }
    App.Project.updateLastModifiedDate()
    this.app.projectInfo.updateProjectSidebar()
  }

  onPatchBranchLatLngError(requestBody, response, title) {
    this.app.notification.showError(getMessage(messages.VERTICES_UPDATE_ERROR, [title]))
    console.error(response)
  }

  onPatchBranchLatLngFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
  }

  renderPolylines() {
    console.log('Topography.renderPolylines()::this.polylineData', this.polylineData)
    this.polylineData.forEach(item => {
      const polyline = new google.maps.Polyline(item)

      // This is the actual moment when each polyline is rendered
      this.polylines.push(polyline)

      this.addPolylineListeners(polyline, item)
    })
  }

  removePolylines() {
    this.polylines.forEach(item => {
      item.setMap(null)
    })
  }

  mapBranchToPolyline(branch) {
    return {
      branchId: branch.BranchId,
      className: branch.BranchId,
      branchType: branch.BranchType,
      title: branch.Name,
      path: this.getBranchPath(branch),
      editable: true,
      map: this.map,
      strokeColor: constants.POLYLINE_COLORS[branch.BranchType],
      strokeOpacity: this.polylineStyles.strokeOpacity,
      strokeWeight: this.polylineStyles.strokeWeight
    }
  }

  getBranchPath(branch) {
    if (
      branch.FlightPath &&
      branch.FlightPath.length === 0 &&
      !!branch.FromNode.Latitude &&
      !!branch.FromNode.Longitude &&
      !!branch.ToNode.Latitude &&
      !!branch.ToNode.Longitude
    ) {
      return [
        {
          lat: utils.formats.formatCoordinate(branch.FromNode.Latitude),
          lng: utils.formats.formatCoordinate(branch.FromNode.Longitude)
        },
        {
          lat: utils.formats.formatCoordinate(branch.ToNode.Latitude),
          lng: utils.formats.formatCoordinate(branch.ToNode.Longitude)
        }
      ]
    } else if (branch.FlightPath && branch.FlightPath.length > 0) {
      return branch.FlightPath.map(x => ({
        lat: utils.formats.formatCoordinate(x.Latitude),
        lng: utils.formats.formatCoordinate(x.Longitude)
      }))
    } else {
      return null
    }
  }

  mapTransformerToPolylines(transformer) {
    return [{
      branchId: transformer.BranchId,
      branchType: transformer.BranchType,
      title: transformer.Name,
      path: this.getTransformerPath(transformer, true),
      editable: false,
      map: this.map,
      strokeColor: constants.POLYLINE_COLORS.TRANS2W,
      strokeOpacity: this.polylineStyles.strokeOpacity,
      strokeWeight: this.polylineStyles.strokeWeight
    }, {
      branchId: transformer.BranchId,
      branchType: transformer.BranchType,
      title: transformer.Name,
      path: this.getTransformerPath(transformer, false),
      editable: false,
      map: this.map,
      strokeColor: constants.POLYLINE_COLORS.TRANS2W,
      strokeOpacity: this.polylineStyles.strokeOpacity,
      strokeWeight: this.polylineStyles.strokeWeight
    }]
  }

  getTransformerPath(transformer, isFromEdge) {
    if (
      !!transformer.FromNode.Latitude &&
      !!transformer.FromNode.Longitude &&
      !!transformer.ToNode.Latitude &&
      !!transformer.ToNode.Longitude
    ) {
      return [
        {
          // We're drawing either the From-to-Location edge, or else the Location-to-To edge
          lat: utils.formats.formatCoordinate(isFromEdge ? transformer.FromNode.Latitude : transformer.ToNode.Latitude),
          lng: utils.formats.formatCoordinate(isFromEdge ? transformer.FromNode.Longitude : transformer.ToNode.Longitude)
        },
        {
          lat: utils.formats.formatCoordinate(transformer.Latitude),
          lng: utils.formats.formatCoordinate(transformer.Longitude)
        }
      ]
    } else {
      return null
    }
  }

  addPolylineListeners(polyline, polylineData) {
    google.maps.event.addListener(polyline.getPath(), 'insert_at', () => this.handlePolylineEdit(polyline, polylineData))
    google.maps.event.addListener(polyline.getPath(), 'remove_at', () => this.handlePolylineEdit(polyline, polylineData))
    google.maps.event.addListener(polyline.getPath(), 'set_at', () => this.handlePolylineEdit(polyline, polylineData))

    google.maps.event.addListener(polyline, 'click', () => this.selectPolyline(polyline))
    google.maps.event.addListener(polyline, 'rightclick', (event) => {
      this.deleteVertex(event, polyline, polylineData)
      this.openPolylineContextMenu(polyline, event)(polyline)
      this.addContextMenuButtonListeners()
    })
    google.maps.event.addListener(polyline, 'dblclick', (event) => this.app.showBranchModal(polyline.branchId))
  }

  handlePolylineEdit(polyline, polylineData) {
    const flightPath = this.getFlightPath(polyline)
    this.patchBranchLatLng(polyline, polylineData, flightPath)
  }

  getFlightPath(polyline) {
    const verts = []

    for (let i = 0; i < polyline.getPath().getLength(); i++) {
      verts.push({
        Latitude: utils.formats.formatCoordinate(polyline.getPath().getAt(i).lat()),
        Longitude: utils.formats.formatCoordinate(polyline.getPath().getAt(i).lng())
      })
    }
    return verts
  }

  deleteVertex(event, polyline, polylineData) {
    const flightPath = this.getFlightPath(polyline)
    const vertexIndex = event.vertex
    const shouldRedrawPolylines = true

    // Ignore right-click on first and last points in a multi-segment line, and right-clicks on edges
    if (vertexIndex === undefined || vertexIndex === 0 || vertexIndex === polylineData.path.length - 1) return

    flightPath.splice(vertexIndex, 1)
    this.patchBranchLatLng(polyline, polylineData, flightPath, shouldRedrawPolylines)
  }

  renderUnpositionedElementsControl() {
    this.unpositionedElementsControl = new UnpositionedElementsControl(this)
  }

  renderAddressFinderControl() {
    this.addressFinderControl = new AddressFinderControl(this)
  }

  renderBalanceOfSystemControl() {
    this.balanceOfSystemControl = new BalanceOfSystemControl(this)
  }

  updateMainMenu() {
    utils.showElementBlock(constants.SELECTORS.ONE_LINE_BUTTON)
    utils.hideElementById(constants.SELECTORS.MAP_BUTTON)
    utils.showElementFlex(constants.SELECTORS.MAP_ZOOM_CONTROLS)
    utils.hideElementById(constants.SELECTORS.GRAPH_ZOOM_CONTROLS)

    // disable buttons
    utils.disableButton(constants.SELECTORS.AERIAL_BUTTON)
    utils.disableButton(constants.SELECTORS.PRINT_TOOLBAR_BUTTON)
  }

  restoreMainMenu() {
    utils.hideElementById(constants.SELECTORS.ONE_LINE_BUTTON)
    utils.showElementBlock(constants.SELECTORS.MAP_BUTTON)
    utils.hideElementById(constants.SELECTORS.MAP_ZOOM_CONTROLS)
    utils.showElementFlex(constants.SELECTORS.GRAPH_ZOOM_CONTROLS)

    // enable buttons
    utils.enableButton(constants.SELECTORS.AERIAL_BUTTON)
    utils.enableButton(constants.SELECTORS.PRINT_TOOLBAR_BUTTON)
  }

  centerAndZoom(address = null, callback = null) {
    const centerpoint = this.bounds.getCenter()

    // If there is no address and no real bounds (map is new), center it on the United States
    if (address === null && centerpoint.lat() === 0 && centerpoint.lng() === -180) {
      address = 'United States'
    }

    if (address !== null) {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode( { address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          this.map.setCenter(results[0].geometry.location)
          this.map.fitBounds(results[0].geometry.viewport)
          this.app.notification.showSuccess(messages.ADDRESS_FINDER_LOCATION_FOUND(results[0].formatted_address))
        } else {
          this.app.notification.showError(messages.ADDRESS_FINDER_LOCATION_NOT_FOUND(address))
          console.error(`Could not find location '${location}'`)
        }
      })

    } else {
      this.map.setCenter(this.bounds.getCenter())
      this.map.fitBounds(this.bounds)
    }

    callback && callback()
  }

  addZoomControlClickListeners() {
    document.getElementById(constants.SELECTORS.ZOOM_IN_MAP).addEventListener('click', () => {
      this.map.setZoom(this.map.getZoom() + 1)
      if (this.map.zoom >= this.map.maxZoom) utils.disableButton(constants.SELECTORS.ZOOM_IN_MAP)
      if (this.map.zoom > this.map.minZoom) utils.enableButton(constants.SELECTORS.ZOOM_OUT_MAP)
    })
    document.getElementById(constants.SELECTORS.CENTER_VIEW_MAP).addEventListener('click', () => {
      this.centerAndZoom()
      if (this.map.zoom > this.map.minZoom) utils.enableButton(constants.SELECTORS.ZOOM_OUT_MAP)
      if (this.map.zoom < this.map.maxZoom) utils.enableButton(constants.SELECTORS.ZOOM_IN_MAP)
    })
    document.getElementById(constants.SELECTORS.ZOOM_OUT_MAP).addEventListener('click', () => {
      this.map.setZoom(this.map.getZoom() - 1)
      if (this.map.zoom <= this.map.minZoom) utils.disableButton(constants.SELECTORS.ZOOM_OUT_MAP)
      if (this.map.zoom < this.map.maxZoom) utils.enableButton(constants.SELECTORS.ZOOM_IN_MAP)
    })
  }

  addZoomControlDisplayListeners() {
    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      if (this.map.zoom >= this.map.maxZoom) utils.disableButton(constants.SELECTORS.ZOOM_IN_MAP)
      if (this.map.zoom <= this.map.minZoom) utils.disableButton(constants.SELECTORS.ZOOM_OUT_MAP)
      if (this.map.zoom < this.map.maxZoom) utils.enableButton(constants.SELECTORS.ZOOM_IN_MAP)
      if (this.map.zoom > this.map.minZoom) utils.enableButton(constants.SELECTORS.ZOOM_OUT_MAP)
    })
  }

  addZoomAndPanChangedListeners() {
    ['center_changed', 'zoom_changed', 'bounds_changed', 'click', 'rightclick'].forEach(item => {
      this.map.addListener(item, () => {
        this.activeElement = null
        this.closeContextMenu()
      })
    })
  }

  isAnyModalOpen() {
    return !!document.querySelector('.modal.fade.show')
  }

  addDeleteKeyListener() {
    document.addEventListener('keydown', (event) => this.handleDeleteKeydown(event), false)
  }

  handleDeleteKeydown(event) {

    // In the event someone clicks a locatorOverlay item, we still want to capture a delete keypress and handle it
    // here, even if we're in OneLine mode and not Map mode.
    if (event.key === 'Delete') {
      if (!this.isAnyModalOpen()) {
        console.log('Topography.handleDeleteKeydown()::event.key', event.key, '  this.activeElement', this.activeElement, ' this.isAnyModalOpen()', this.isAnyModalOpen())

        const selectedElement = this.app.SelectedProjectElement

        // Just use the ContextMenu's delete functionality
        if (selectedElement === null) {
          console.log('Topography.handleDeleteKeydown(): this.activeElement is null... no delete prompt. Note: Devices are currently getting here, because devices use their own `selectedDevice` variable')

        } else if (selectedElement.IsNode) {
          this.app.contextMenu.currentProjectElement = selectedElement
          this.app.contextMenu.showDeleteNodePrompt()

        } else if (selectedElement.IsBranch) {
          this.app.contextMenu.currentProjectElement = selectedElement
          this.app.contextMenu.showDeleteBranchPrompt()

        }
      }
      else {
        console.log('Topography.handleDeleteKeydown(): Delete handler skipped!', ' event.key', event.key, '  this.activeElement', this.activeElement, ' this.isAnyModalOpen()', this.isAnyModalOpen())
      }
    }
  }

  computeCableLength(branch, ignoreOverrideSetting) {
    let computedCableLength

    if (ignoreOverrideSetting || branch.Details.ComputeCableLengths) {
      if (branch.FlightPath.length > 2) {
        computedCableLength = utils.forms.calculateCableSegmentLengths(
          branch.FlightPath,
          Number(App.Project.CableOveragePercent)
        )
      } else {
        // If any of the 4 required coordinates is missing, just return the default value of 100 for both ANSI and IEC
        if (branch.FromNode.Latitude === null || branch.FromNode.Longitude === null || branch.ToNode.Latitude === null || branch.ToNode.Longitude === null) {
          return 100
        }

        computedCableLength = utils.forms.calculateCableLength(
          branch.FromNode.Latitude,
          branch.FromNode.Longitude,
          branch.ToNode.Latitude,
          branch.ToNode.Longitude,
          Number(App.Project.CableOveragePercent)
        )
      }

      if (!App.Project.IsAnsi) {
        computedCableLength = utils.forms.convertFeetToMeters(computedCableLength)
        // Get rid of the mantissa
        computedCableLength = Number(numeral(computedCableLength).format(constants.FORMATS.U0))
      }

      return computedCableLength

    // Else if ComputeCableLengths is false, just return whatever value is already stored
    } else {
      return branch.Details.CableLength
    }
  }

  // This gets called whenever the user opens the Map View
  updateCableLengths() {
    const cables = Array.from(App.Project.OneLineBranches).filter(item => item.IsCable)
    this.cableLengthsList = cables.map(item => {
      const computedCableLength = this.computeCableLength(item, false)
      return ({
        EquipmentId: item.BranchId,
        OldValue: item.Details.CableLength,
        NewValue: computedCableLength
      })
    })

    this.cableLengthsList = this.cableLengthsList.filter(x =>

      // Only update the cable length if the difference between the old value and new is a few feet or more.
      // All the rounding off of polyline segment lengths can cause small math errors.
      // Also, filter out cable lengths of 0, which imply the cable isn't even rendered on the map.
      (Math.abs(x.OldValue - x.NewValue) > 3 && x.NewValue !== 0)

    ).map(x => ({
      EquipmentId: x.EquipmentId,
      NewValue: x.NewValue
    }))

    if (this.cableLengthsList.length > 0) this.patchBatchUpdateCableLengths()
  }

  patchBatchUpdateCableLengths() {
    const requestBody = this.cableLengthsList
    console.log('Topography.patchBatchUpdateCableLengths()::requestBody', requestBody)

    // Allow this request to fire simulataneously as the synchronousFetcher if need be.
    axios.patch(this.app.patchBatchUpdateCableLengthsUrl, requestBody).then(response => {
      console.log('Topography.patchBatchUpdateCableLengths()::response', response)

      if (response.data.success) {
        this.onPatchBatchUpdateCableLengthsSuccess(response, requestBody)
      } else {
        this.onPatchBatchUpdateCableLengthsError()
      }
    }).catch(error => {
      this.onPatchBatchUpdateCableLengthsFailure(error)
    })
  }

  onPatchBatchUpdateCableLengthsSuccess(response, requestBody) {
    const localCablesToUpdate = requestBody

    // Update the local state
    localCablesToUpdate.forEach(item => {
      const cable = App.Project.getOneLineBranch(item.EquipmentId)
      cable.Details.CableLength = Number(item.NewValue)
    })
    App.Project.updateLastModifiedDate()

    // Update the Project Information data in the project sidebar
    this.app.projectInfo.updateProjectSidebar()
  }

  onPatchBatchUpdateCableLengthsError() {
    console.error(response)
  }

  onPatchBatchUpdateCableLengthsFailure(error) {
    this.app.notification.showError(messages.SERVER_ERROR)
    console.error(error)
  }

}