/****************************************************************************
 ** Unpositioned Elements control for the Map View.
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/

import App from '../app.js'
import constants from '../constants.js'
import graphics from '../graphics.js'

export default class UnpositionedElementsControl {
  constructor(topography) {
    this.title = 'Unpositioned Elements'
    this.topography = topography
    this.position = google.maps.ControlPosition.BOTTOM_LEFT
    this.drawingManager
    this.container = document.createElement('div')
    // this.interface = document.createElement('div')
    this.text = document.createElement('div')
    this.activeListItem
    this.activeMarkerData

    this.main()
  }

  main() {
    this.text.innerHTML = `
      <h4 class="sidebar-title">${this.title}</h4>
      <p><strong>Note:</strong> Some elements do not have locations specified. To set the element location,
      click on the element name in the list below, then click the spot on the map where you would like to position it.
      This will update its latitude and longitude coordinates in One-Line.</p>
      <ul>${this.generateElementsList()}</ul>
      <div id="${constants.SELECTORS.MARKER_POSITION}"></div>
    `
    document.getElementById(constants.SELECTORS.UNPOSITIONED_CONTAINER).appendChild(this.text)
    // this.interface.appendChild(this.text)
    this.topography.map.controls[this.position].push(this.container)
    this.initializeDrawingManager()
    this.initializeElementList()
    if (this.topography.unpositionedElements.length === 0) this.hideControl()
  }

  initializeDrawingManager() {
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingModes: [google.maps.drawing.OverlayType.MARKER]
      }
    })

    google.maps.event.addListener(this.drawingManager, 'markercomplete', (marker) => {
      this.topography.currentElement.Latitude = marker.getPosition().lat()
      this.topography.currentElement.Longitude = marker.getPosition().lng()
      this.topography.currentIncomingBranches = this.topography.currentElement.IncomingBranches
      this.topography.currentOutgoingBranches = this.topography.currentElement.OutgoingBranches

      // Whenever a new marker is dropped on the map, determine if it has any cables attached to it,
      // because we need to calculate the cable lengths dynamically
      this.topography.polylineData = this.topography.getAllPolylines()
      const polylinesToUpdate = this.topography.updatePolylines(marker)

      // Unpositioned element about to be dropped on the map
      this.topography.patchElementLatLng(
        marker,
        this.topography.currentElement.Latitude,
        this.topography.currentElement.Longitude,
        marker.elementType === constants.BRANCH_TYPES.TRANS2W,
        polylinesToUpdate
      )

      this.topography.markers.push(marker)
      this.topography.removePolylines()
      this.topography.renderPolylines()
      setTimeout(() => {
        this.topography.selectMarker(marker)
      }, 500)
      this.deactivateListItem()

      // Remove item from unpositioned elements list
      this.topography.unpositionedElements = this.topography.unpositionedElements.filter(x => x.elementId !== marker.elementId)

      // If all items have been placed, hide the Unpositioned Elements control
      if (this.topography.unpositionedElements.length === 0) {
        this.hideControl()
      }
    })
  }

  initializeElementList() {
    setTimeout( () => {
      document.querySelectorAll(constants.SELECTORS.UNPOSITIONED_ELEMENTS_LIST_ITEM).forEach(item => {
        item.addEventListener('click', (event) => this.handleListItemClick(event))
      })
      if (this.topography.unpositionedElements.length)
        this.showControl()
    }, 1500)
  }

  handleListItemClick(event) {
    const isTargetActive = event.target.classList.contains('active')
    document.querySelectorAll(constants.SELECTORS.UNPOSITIONED_ELEMENTS_LIST_ITEM).forEach(item => {
      item.classList.remove('active')
    })
    if (!isTargetActive) {
      this.activateListItem(event)
    } else {
      this.deactivateListItem(false)
    }
  }

  activateListItem() {
    const elementId = event.target.getAttribute('data-element-id')
    const elementType = event.target.getAttribute('data-element-type')
    this.topography.currentElement = this.topography.getCurrentPositionableElement(elementId, elementType)
    this.activeListItem = event.target
    this.activeListItem.classList.add('active')
    this.activeMarkerData = this.topography.unpositionedElements.find(x => x.elementId === this.topography.currentElement.elementId)
    this.drawingManager.setMap(this.topography.map)
    this.drawingManager.setDrawingMode('marker')
    this.drawingManager.setOptions({
      markerOptions: this.activeMarkerData
    })

    // This is a hacky way of hiding the Drawing Manager control, which allows the user to toggle between drawing mode and view mode.
    // The drawing mode is controlled programatically, and we don't want the user toggling between modes.
    setTimeout(() => {
      const drawingManagerControl = document.querySelector('[title="Stop drawing"]').closest('.gmnoprint')
      drawingManagerControl.style.zIndex = '-1'
    }, 10)
  }

  deactivateListItem(permanently = true) {
    this.activeListItem.classList.remove('active')
    if (permanently) {
      this.activeListItem.classList.add('positioned')
      this.activeListItem.classList.remove('unpositioned-elements-list-item')
      this.activeListItem.outerHTML = this.activeListItem.outerHTML
    }
    this.activeListItem = null
    this.activeMarkerData = null
    this.drawingManager.setMap(null)
  }

  generateElementsList() {
    return this.topography.unpositionedElements.map(x =>
      `<li class="unpositioned-elements-list-item" data-element-id="${x.elementId}" data-element-type="${x.elementType}">
        <img src="${graphics.getEquipmentIcon(x.elementType)}" alt="${x.label.text}" />
        ${x.label.text}
      </li>`
    ).join('')
  }

  showControl() {
    document.querySelector(`#${constants.SELECTORS.UNPOSITIONED_CONTAINER}`).style.display = 'block'
  }

  hideControl() {
    document.querySelector(`#${constants.SELECTORS.UNPOSITIONED_CONTAINER}`).style.display = 'none'
  }
}