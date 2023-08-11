/****************************************************************************
 ** Address Finder GMaps searchbox control for the Map View.
 **
 ** @license
 ** Copyright (c) 2021 Xendee Corporation. All rights reserved.
 ***************************************************************************/

export default class AddressFinderControl {
  constructor(topography) {
    this.title = 'Address Finder'
    this.topography = topography
    this.position = google.maps.ControlPosition.TOP_CENTER
    this.interface = document.createElement('div')
    this.interface.className = 'address-finder-interface'
    this.interface.classList.add('control-interface')
    this.text = document.createElement('div')
    this.text.className = 'address-finder-text'
    this.text.classList.add('control-text')
    this.container = document.createElement('div')
    this.container.className = 'address-finder-container'
    this.container.classList.add('control-container')
    this.container.appendChild(this.interface)

    this.addressFinderInput

    this.main()
  }

  main() {
    this.text.innerHTML = `
      <strong>${this.title}:</strong>
      <input id="address-finder-input" type="text" maxlength="250" placeholder="Type in an address and hit Enter...">
    `
    this.interface.appendChild(this.text)
    this.topography.map.controls[this.position].push(this.container)
    this.addressFinderInput = document.getElementById('address-finder-input')

    // Give a little time for the maps javascript to populate the page with controls, markers, etc
    // TODO: This is not good. This should be a promise instead...
    setTimeout(() => {
      const addressFinderInputNode = document.getElementById('address-finder-input')
      if (addressFinderInputNode !== null) {
        addressFinderInputNode.addEventListener('keydown', event => {
          if (event.key === "Enter" && addressFinderInputNode.value !== '') {
            addressFinderInputNode.disabled = true
            this.runSearch()

          } else if (event.key === "Escape") {
            this.clearInputField()
          }
        })
      }
    }, 3000)
  }

  runSearch() {
    this.topography.centerAndZoom(document.getElementById('address-finder-input').value, () => {
      this.clearInputField()
    })
  }

  clearInputField() {
    document.getElementById('address-finder-input').disabled = false
    document.getElementById('address-finder-input').value = ''
  }

}