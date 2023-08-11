import {
    List
} from '../../yfiles/lib/es-modules/yfiles.js'

import constants from '../constants.js'

export default class OneLineNode {
    constructor(nodeDto) {
        this._nodeId = nodeDto.NodeId
        this._nodeType = nodeDto.NodeType
        this._catalogName = nodeDto.CatalogName
        this._name = nodeDto.Name
        this._description = nodeDto.Description
        this._latitude = nodeDto.Latitude
        this._longitude = nodeDto.Longitude
        this._manufacturer = nodeDto.Manufacturer
        this._partNumber = nodeDto.PartNumber
        this._phases = nodeDto.Phases
        this._units = nodeDto.Units
        this._x = nodeDto.X
        this._y = nodeDto.Y
        this._details = nodeDto.Details

        this._needsGraphUpdate = true

        this._lineToLineVoltage = 0
        this._lineToLineVoltageIrrespectiveOfOpenDevices = 0

        this._incomingBranches = new List()
        this._outgoingBranches = new List()

        this._internalConnection = null
    }

    get NeedsGraphUpdate() { return this._needsGraphUpdate }
    set NeedsGraphUpdate(value) { this._needsGraphUpdate = value }

    get IsNode() { return true }
    get IsBranch() { return false }
    get IsDevice() { return false }
    get EquipmentCategory() { return constants.EQUIPMENT_CATEGORIES.NODE }

    // TODO: ConnectedTo property

    get IsConnected() {
        return this.IncomingBranches.size > 0 || this.OutgoingBranches.size > 0
    }
    get IsDisconnected() {
        return !this.IsConnected
    }

    get LineToLineVoltageIrrespectiveOfOpenDevices() {
        return this._lineToLineVoltageIrrespectiveOfOpenDevices
    }
    set LineToLineVoltageIrrespectiveOfOpenDevices(value) {
        if (value < 0)
            throw new Error(`Invalid LineToLineVoltageIrrespectiveOfOpenDevices value: ${value}. Voltage must be non-negative`)

        if (this._lineToLineVoltageIrrespectiveOfOpenDevices !== value) {
            this._lineToLineVoltageIrrespectiveOfOpenDevices = value
            this.NeedsGraphUpdate = true
        }
    }

    get InternalConnection() { return this._internalConnection }
    set InternalConnection(value) {
        const intValue = parseInt(value)

        // Internal connection must be one of the valid connection types
        if (value !== null &&
            intValue !== constants.CONNECTIONS.DELTA.value && 
            intValue !== constants.CONNECTIONS.WYE_UNGROUNDED.value && 
            intValue !== constants.CONNECTIONS.WYE_SOLIDLY.value && 
            intValue !== constants.CONNECTIONS.WYE_IMPEDANCE.value)
            throw new Error(`Invalid InternalConnection value: ${value}.`)

        this._internalConnection = value
    }

    assignInternalConnectionBasedOnNodeType(currentConnectionValue) {
        if (this.IsUtility || this.IsWind)
            this.InternalConnection = constants.CONNECTIONS.WYE_SOLIDLY.value
        else if (this.IsBusbar)
            this.InternalConnection = currentConnectionValue
        else if (this.IsLoad || this.IsSolar || this.IsGenerator || this.IsStorage)
            this.InternalConnection = this.Details.Connection
        else
            throw new Error(`OneLineNode::assignInternalConnection() - unknown NodeType ${this.NodeType}`)
    }

    get LineToLineVoltage() {
        return this._lineToLineVoltage
    }
    set LineToLineVoltage(value) {
        if (value < 0)
            throw new Error(`Invalid LineToLineVoltage value: ${value}. Voltage must be non-negative`)

        if (this._lineToLineVoltage !== value) {
            this._lineToLineVoltage = value
            this.NeedsGraphUpdate = true
        }
    }

    get Name() { return this._name }
    set Name(value) { this._name = value }

    get NodeId() { return this._nodeId }
    get NodeType() { return this._nodeType }
    get CatalogName() { return this._catalogName }
    get Description() { return this._description }
    
    get Latitude() { return this._latitude }
    set Latitude(value) {
        this._latitude = value
    }

    get Longitude() { return this._longitude }
    set Longitude(value) {
        this._longitude = value
    }

    get IsPositioned() {
        return (
            typeof this._latitude === 'number' && 
            this._latitude >= -90 &&
            this._latitude <= 90 &&
            typeof this._longitude === 'number' &&
            this._longitude >= -180 &&
            this._longitude <= 180
        )
    }

    get Manufacturer() { return this._manufacturer }
    get PartNumber() { return this._partNumber }
    get Units() { return this._units }
    get Phases() { return this._phases }
    get X() { return this._x }
    get Y() { return this._y }
    get Details() { return this._details }

    get IsUtility() { return this.NodeType === constants.NODE_TYPES.UTILITY }
    get IsBusbar() { return this.NodeType === constants.NODE_TYPES.BUSBAR }
    get IsLoad() { return this.NodeType === constants.NODE_TYPES.LOAD }
    get IsSolar() { return this.NodeType === constants.NODE_TYPES.SOLAR }
    get IsWind() { return this.NodeType === constants.NODE_TYPES.WIND }
    get IsGenerator() { return this.NodeType === constants.NODE_TYPES.GENERATOR }
    get IsStorage() { return this.NodeType === constants.NODE_TYPES.STORAGE }

    get IncomingBranches() { return this._incomingBranches }
    get OutgoingBranches() { return this._outgoingBranches }

    get IsPowerProducer() {
        return constants.POWER_PRODUCER_NODES.includes(this.NodeType)
    }

    get MaximumIncomingBranches() {
        switch (this.NodeType) {
            case constants.NODE_TYPES.BUSBAR:
                return Number.MAX_SAFE_INTEGER

            case constants.NODE_TYPES.LOAD:
            case constants.NODE_TYPES.STORAGE:
                return 1

            default:
               return 0
        }
    }

    get MaximumOutgoingBranches() {
        switch (this.NodeType) {
            case constants.NODE_TYPES.UTILITY:
            case constants.NODE_TYPES.SOLAR:
            case constants.NODE_TYPES.WIND:
            case constants.NODE_TYPES.GENERATOR:
                return 1

            case constants.NODE_TYPES.BUSBAR:
                return Number.MAX_SAFE_INTEGER

            default:
                return 0
        }
    }

    // Updates the _oneLineNode universal properties (Name, Description, etc.) as well as the NodeType-specific properties in Details
    updateData(data) {
        this._name = data.Name
        this._catalogName = data.CatalogName
        this._description = data.Description
        this._latitude = data.Latitude
        this._longitude = data.Longitude
        this._manufacturer = data.Manufacturer
        this._partNumber = data.PartNumber
        this._phases = data.Phases
        this._x = data.X
        this._y = data.Y

        this._details = {
            ...this._details,
            ...data.Details
        }

        this.NeedsGraphUpdate = true
    }

    // Updates just the Load Shape details of a LOAD
    updateLoadShapeData(loadShapeData) {
        this._details = {
            ...this._details,
            LoadShapeDate: loadShapeData.loadShapeDate,
            LoadShapeName: loadShapeData.loadShapeName,
            LoadShapePreservePeak: loadShapeData.loadShapePreservePeak,
            LoadShapeResolution: loadShapeData.loadShapeResolution,
            LoadShapeUnits: loadShapeData.loadShapeUnits,
            RatedPower: loadShapeData.ratedPower,
            RatedPowerUnits: loadShapeData.ratedPowerUnits
        }
    }

    // Updates just the Dispatch Shape details of a GENERATOR
    updateDispatchShapeData(dispatchShapeData) {
        this._details = {
            ...this._details,
            DispatchShapeDate: dispatchShapeData.dispatchShapeDate,
            DispatchShapeName: dispatchShapeData.dispatchShapeName,
            DispatchShapePreservePeak: dispatchShapeData.dispatchShapePreservePeak,
            DispatchShapeResolution: dispatchShapeData.dispatchShapeResolution,
            DispatchShapeUnits: dispatchShapeData.dispatchShapeUnits
        }
    }

    // Generates a request body to send to the server
    toRequestBody() {
        return {
            NodeId: this.NodeId,
            NodeType: this.NodeType,
            Name: this.Name,
            CatalogName: this.CatalogName,
            Description: this.Description,
            Latitude: this.Latitude,
            Longitude: this.Longitude,
            Manufacturer: this.Manufacturer,
            PartNumber: this.PartNumber,
            Phases: this.Phases,
            X: this.X,
            Y: this.Y,
            Details: this.Details
        }
    }

    resetVoltage() {
        this.LineToLineVoltage = 0
        this.LineToLineVoltageIrrespectiveOfOpenDevices = 0
    }
}