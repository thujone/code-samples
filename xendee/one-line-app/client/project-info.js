/****************************************************************************
 ** Project Info and Network Stats sections of the Xendee One-Line app.
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import constants from './constants.js'
import messages from './messages.js'
import App from './app.js'

export default class ProjectInfo {
  constructor() {
    this.updateProjectSidebar()
  }

  updateProjectSidebar() {
    this.updateProjectInfoFields()
    this.updateNetworkStatsFields()
  }

  updateProjectInfoFields() {
    document.getElementById('project-info-name').innerHTML = App.Project.Name
    document.getElementById('project-info-type').innerHTML = App.Project.TypeLabel
    document.getElementById('project-info-format').innerHTML = App.Project.FormatId
    document.getElementById('project-info-currency-id').innerHTML = App.Project.CurrencyLabel
    document.getElementById('project-info-units').innerHTML = App.Project.UnitSystem
    document.getElementById('project-info-voltage-units').innerHTML = App.Project.VoltageUnitsLabel
    document.getElementById('project-info-currency-units').innerHTML = App.Project.CurrentUnitsLabel
    document.getElementById('project-info-capacity-units').innerHTML = App.Project.CapacityUnitsLabel
    document.getElementById('project-info-frequency').innerHTML = App.Project.FormattedFrequency
    document.getElementById('project-info-temperature').innerHTML = App.Project.TemperatureScaleAndSymbol
    document.getElementById('project-info-description').innerHTML = App.Project.Description
  }

  updateNetworkStatsFields() {
    document.getElementById('network-stats-symbol-total').innerHTML = App.Project.SymbolCount
    document.getElementById('network-stats-node-total').innerHTML = App.Project.NodeCount
    document.getElementById('network-stats-branch-total').innerHTML = App.Project.BranchCount
    document.getElementById('network-stats-sources').innerHTML = App.Project.PowerProducersCount
    document.getElementById('network-stats-loads').innerHTML = App.Project.LoadCount
    document.getElementById('network-stats-busbars').innerHTML = App.Project.BusbarCount
    document.getElementById('network-stats-cables').innerHTML = App.Project.CableCount
    document.getElementById('network-stats-transformers').innerHTML = App.Project.TransformerCount
    document.getElementById('network-cable-length').innerHTML = `${App.Project.CableLength} ${App.Project.AbbreviatedLengthLabel}`
    // XEN-2170 (hidden-economics): document.getElementById('network-cable-cost').innerHTML = `${constants.UNITS.DOLLARS}${App.Project.CableCost}`
  }
}