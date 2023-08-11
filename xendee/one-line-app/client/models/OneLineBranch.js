import App from '../app.js'
import constants from '../constants.js'

export default class OneLineBranch {
  constructor(branchDto) {
    this._branchId = branchDto.BranchId
    this._fromNodeId = branchDto.FromNodeId
    this._toNodeId = branchDto.ToNodeId
    this._fromDeviceId = branchDto.FromDeviceId
    this._toDeviceId = branchDto.ToDeviceId
    this._branchType = branchDto.BranchType
    this._name = branchDto.Name
    this._catalogName = branchDto.CatalogName
    this._description = branchDto.Description
    this._latitude = branchDto.Latitude
    this._longitude = branchDto.Longitude
    this._manufacturer = branchDto.Manufacturer
    this._partNumber = branchDto.PartNumber
    this._flightPath = branchDto.FlightPath
    this._phases = branchDto.Phases
    this._details = branchDto.Details

    this._needsGraphUpdate = true

    this._fromNode = null
    this._toNode = null

    this._fromSourceIncomingVoltage = 0
  }

  get NeedsGraphUpdate() { return this._needsGraphUpdate }
  set NeedsGraphUpdate(value) { this._needsGraphUpdate = value }

  get IsNode() { return false }
  get IsBranch() { return true }
  get IsDevice() { return false }
  get EquipmentCategory() { return constants.EQUIPMENT_CATEGORIES.BRANCH }


  get FromNode() { return this._fromNode }
  set FromNode(value) { this._fromNode = value }

  get ToNode() { return this._toNode }
  set ToNode(value) { this._toNode = value }

  get FromDeviceId() { return this._fromDeviceId }
  set FromDeviceId(value) { this._fromDeviceId = value }

  get ToDeviceId() { return this._toDeviceId }
  set ToDeviceId(value) { this._toDeviceId = value }

  get FromSourceIncomingVoltage() {
    return this._fromSourceIncomingVoltage
  }
  set FromSourceIncomingVoltage(value) {
    if (value < 0)
      throw new Error(`Invalid voltage value: ${value}. Voltage must be non-negative`)

    if (this._fromSourceIncomingVoltage !== value) {
      this._fromSourceIncomingVoltage = value
      this.NeedsGraphUpdate = true
    }
  }

  get BranchId() { return this._branchId }
  get FromNodeId() { return this._fromNodeId }
  get ToNodeId() { return this._toNodeId }
  get BranchType() { return this._branchType }
  get CatalogName() { return this._catalogName }
  get Name() { return this._name }
  get Description() { return this._description }
  
  get Latitude() { return this._latitude }
  set Latitude(value) { this._latitude = value }

  get Longitude() { return this._longitude }
  set Longitude(value) { this._longitude = value }
  
  
  get Manufacturer() { return this._manufacturer }
  get PartNumber() { return this._partNumber }

  get FlightPath() { return this._flightPath }
  set FlightPath(value) {
    this._flightPath = value
  }
  
  get Phases() { return this._phases }
  get Details() { return this._details }

  get IsCable() { return this.BranchType === constants.BRANCH_TYPES.CABLE }
  get IsDirectConnection() { return this.BranchType === constants.BRANCH_TYPES.DCON }
  get IsTransformer2W() { return this.BranchType === constants.BRANCH_TYPES.TRANS2W }

  get IsVoltageModifier() {
    return constants.VOLTAGE_MODIFIER_BRANCHES.includes(this.BranchType)
  }

  /// Returns true if the branch has no open protective devices
  get CanTraverse() {
    let fromSideStopped = false, toSideStopped = false

    if (this.FromDeviceId !== null) {
      const fromDevice = App.Project.getOneLineDevice(this.FromDeviceId)
      fromSideStopped = fromDevice && fromDevice.DeviceOpen
    }

    if (this.ToDeviceId !== null) {
      const toDevice = App.Project.getOneLineDevice(this.ToDeviceId)
      toSideStopped = toDevice && toDevice.DeviceOpen
    }

    return !fromSideStopped && !toSideStopped
  }

  /* 
   * Returns the voltage leaving the branch. 
   *  If this is a Transformer, then the voltage leaving is the SecondarySideVoltage.
   *  Otherwise the voltage is the same as the incoming voltage
   */
  getOutgoingVoltage() {
    if (this.BranchType === constants.BRANCH_TYPES.TRANS2W) {
      return this.Details.SecondarySideVoltage
    } else
      return this.FromSourceIncomingVoltage
  }

  getVoltageAfterFromDevice(ignoreDeviceOpenCloseState = false) {
    if (ignoreDeviceOpenCloseState || this.FromDeviceId == null)
      return this.FromSourceIncomingVoltage

    // We have a device... can we traverse?
    const fromDevice = App.Project.getOneLineDevice(this.FromDeviceId)
    return fromDevice && fromDevice.DeviceOpen ? 0 : this.FromSourceIncomingVoltage
  }

  getVoltageBeforeToDevice(ignoreDeviceOpenCloseState = false) {
    if (this.BranchType === constants.BRANCH_TYPES.TRANS2W) {
      const v = this.Details.SecondarySideVoltage
      if (v === null || v === 0 || this.getVoltageAfterFromDevice(ignoreDeviceOpenCloseState) === 0)
        return 0
      else
        return v
    } else
      return this.getVoltageAfterFromDevice(ignoreDeviceOpenCloseState)
  }

  getVoltageAfterToDevice(ignoreDeviceOpenCloseState = false) {
    if (ignoreDeviceOpenCloseState || this.ToDeviceId == null)
      return this.getVoltageBeforeToDevice(ignoreDeviceOpenCloseState)

    const toDevice = App.Project.getOneLineDevice(this.ToDeviceId)
    return toDevice && toDevice.DeviceOpen ? 0 : this.getVoltageBeforeToDevice(ignoreDeviceOpenCloseState)
  }

  clearIncomingVoltage() {
    this.FromSourceIncomingVoltage = 0
  }

  isFromDevice(deviceId) {
    return this.FromDeviceId === deviceId
  }

  isToDevice(deviceId) {
    return this.ToDeviceId === deviceId
  }

  getBranchSide(deviceId) {
    if (this.isFromDevice(deviceId))
      return constants.BRANCH_SIDES.FROM
    else if (this.isToDevice(deviceId))
      return constants.BRANCH_SIDES.TO
    else
      return null
  }

  /* Updates the _oneLineBranch universal properties (Name, Description, etc.) as well as the BranchType-specific properties in Details */
  updateData(data) {
    this._name = data.Name
    this._catalogName = data.CatalogName
    this._description = data.Description
    this._latitude = data.Latitude
    this._longitude = data.Longitude
    this._manufacturer = data.Manufacturer
    this._partNumber = data.PartNumber
    this._flightPath = data.FlightPath
    this._phases = data.Phases

    this._details = {
      ...this._details,
      ...data.Details
    }

    this.NeedsGraphUpdate = true
  }
}