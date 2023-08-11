import {
  List
} from '../../yfiles/lib/es-modules/yfiles.js'
import App from '../app.js'
import constants from '../constants.js'
import graphics from '../graphics.js'

export default class OneLineDevice {
  constructor(deviceDto) {
    this._deviceId = deviceDto.DeviceId
    this._deviceType = deviceDto.DeviceType
    this._name = deviceDto.Name
    this._description = deviceDto.Description
    this._catalogName = deviceDto.CatalogName
    this._manufacturer = deviceDto.Manufacturer
    this._partNumber = deviceDto.PartNumber
    this._modelNumber = deviceDto.ModelNumber
    this._deviceOpen = deviceDto.DeviceOpen
    this._notes = deviceDto.Notes
    this._details = deviceDto.Details

    this._needsGraphUpdate = true
  }

  get NeedsGraphUpdate() { return this._needsGraphUpdate }
  set NeedsGraphUpdate(value) { this._needsGraphUpdate = value }

  get IsNode() { return false }
  get IsBranch() { return false }
  get IsDevice() { return true }
  get EquipmentCategory() { return constants.EQUIPMENT_CATEGORIES.DEVICE }

  get IsBreaker() { return this.DeviceType === constants.DEVICE_TYPES.BREAKER }
  get IsFuse() { return this.DeviceType === constants.DEVICE_TYPES.FUSE }
  get IsRelay() { return this.DeviceType === constants.DEVICE_TYPES.RELAY }
  get IsSwitch() { return this.DeviceType === constants.DEVICE_TYPES.SWITCH }

  get Name() { return this._name }
  set Name(value) { this._name = value }

  get DeviceId() { return this._deviceId }
  set DeviceId(value) { this._deviceId = value }

  get DeviceType() { return this._deviceType }
  set DeviceType(value) { this._deviceType = value }

  get Description() { return this._description }
  set Description(value) { this._description = value}

  get CatalogName() { return this._catalogName }
  set CatalogName(value) { this._catalogName = value}

  get Manufacturer() { return this._manufacturer }
  set Manufacturer(value) { return this._manufacturer = value}

  get PartNumber() { return this._partNumber }
  set PartNumber(value) { return this._partNumber = value}

  get ModelNumber() { return this._modelNumber }
  set ModelNumber(value) { return this._modelNumber = value}

  get DeviceOpen() { return this._deviceOpen }
  set DeviceOpen(value) { return this._deviceOpen = value}

  get Notes() { return this._notes }
  set Notes(value) { return this._notes = value}

  get Details() { return this._details }
  set Details(value) { return this._details = value}

  getIconFilepath(branch, deviceOpen = false, forLocator = false) {
    const ansiOrIec = App.Project.IsAnsi ? 'ANSI' : 'IEC'
    const branchSide = branch.getBranchSide(this.DeviceId)
    const deviceState = deviceOpen ? constants.DEVICE_STATES.OPEN : constants.DEVICE_STATES.CLOSE
    const graphicsSet = forLocator ? graphics.ICON_FILENAMES.LOCATOR.DEVICE : graphics.ICON_FILENAMES.DEVICE

    switch (this.DeviceType) {
      case constants.DEVICE_TYPES.BREAKER:
        const voltage = branchSide === constants.BRANCH_SIDES.FROM ? branch.FromSourceIncomingVoltage : branch.getVoltageBeforeToDevice(true)
        if (voltage >= constants.MINIMUM_VOLTAGE_FOR_HIGH_VOLTAGE_BREAKER)
          return `${graphics.DEVICE_ICONS_PATH}/${graphicsSet[deviceState][this.DeviceType][ansiOrIec].HIGH}`
        else
          return `${graphics.DEVICE_ICONS_PATH}/${graphicsSet[deviceState][this.DeviceType][ansiOrIec].LOW}`

      case constants.DEVICE_TYPES.FUSE:
      case constants.DEVICE_TYPES.RELAY:
      case constants.DEVICE_TYPES.SWITCH:
        console.log(`${graphics.DEVICE_ICONS_PATH}/${graphicsSet[deviceState][this.DeviceType][ansiOrIec]}`)
        return `${graphics.DEVICE_ICONS_PATH}/${graphicsSet[deviceState][this.DeviceType][ansiOrIec]}`

      default:
        console.error('OneLineDevice.getIconFilepath(): DeviceType not specified', 'branch:', branch, 'this.DeviceType:', this.DeviceType)
    }
  }

  getAssociatedBranch() {
    return App.Project.OneLineBranches.find(branch =>
      [branch.FromDeviceId, branch.ToDeviceId].includes(this.DeviceId)
    )
  }

  // Updates the OneLineDevice common properties as well as device-type details
  updateData(data) {
    this._deviceId = data.DeviceId
    this._deviceType = data.DeviceType
    this._name = data.Name
    this._description = data.Description
    this._catalogName = data.CatalogName
    this._manufacturer = data.Manufacturer
    this._partNumber = data.PartNumber
    this._modelNumber = data.ModelNumber
    this._deviceOpen = data.DeviceOpen
    this._notes = data.Notes
    this._details = data.Details
  }

  // Generates a request body to send to the server
  generateRequestBody() {
    return {
      DeviceId: this.DeviceId,
      DeviceType: this.DeviceType,
      Name: this.Name,
      Description: this.Description,
      CatalogName: this.CatalogName,
      Manufacturer: this.Manufacturer,
      PartNumber: this.PartNumber,
      ModelNumber: this.ModelNumber,
      DeviceOpen: this.DeviceOpen,
      Notes: this.Notes,
      Details: this.Details
    }
  }
}