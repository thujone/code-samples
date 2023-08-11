/****************************************************************************
 ** Balance of System GMaps control for the Map View.
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/

export default class BalanceOfSystemControl {
  constructor(topography) {
    this.title = 'Balance of System'
    this.topography = topography
    this.position = google.maps.ControlPosition.BOTTOM_LEFT
    this.interface = document.createElement('div')
    this.interface.className = 'balance-of-system-interface'
    this.interface.classList.add('control-interface')
    this.text = document.createElement('div')
    this.text.className = 'balance-of-system-text'
    this.text.classList.add('control-text')
    this.container = document.createElement('div')
    this.container.className = 'balance-of-system-container'
    this.container.classList.add('control-container')
    this.container.appendChild(this.interface)

    this.main()
  }

  main() {
    this.text.innerHTML = `
      <h4>${this.title}</h4>
      <dl>
        <div>
          <dt>Length</dt>
          <dd>432 ft</dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>$0</dd>
        </div>
      </dl>
    `
    this.interface.appendChild(this.text)
    this.topography.map.controls[this.position].push(this.container)
  }

}