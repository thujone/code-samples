import {
    List
} from '../../yfiles/lib/es-modules/yfiles.js'

import OneLineNode from './OneLineNode.js'
import OneLineBranch from './OneLineBranch.js'
import OneLineDevice from './OneLineDevice.js'

import BatchUpdateDTO from '../dto/BatchUpdateDTO.js'

import constants from '../constants.js'
import utils from '../utils.js'

export default class OneLineProject {
    constructor(projectDto, app) {
        this.app = app

        this._oneLineNodes = new List()
        this._oneLineBranches = new List()
        this._oneLineDevices = new List()
        this._storageProfile = projectDto.StorageProfile
        this._defaultNodes = new List(projectDto.DefaultNodes)
        this._defaultBranches = new List(projectDto.DefaultBranches)
        this._defaultDevices = new List(projectDto.DefaultDevices)

        this._name = projectDto.Project.Name
        this._description = projectDto.Project.Description
        this._typeId = projectDto.Project.TypeId
        this._createdDate = projectDto.Project.CreatedDate
        this._lastModifiedDate = projectDto.Project.LastModifiedDate
        this._projectYear = projectDto.Project.ProjectYear
        this._annotations = new List(projectDto.Project.Annotations)
        this._cableOveragePercent = projectDto.Project.CableOveragePercent
        this._formatId = projectDto.Project.FormatId
        this._frequency = projectDto.Project.Frequency
        this._currencyId = projectDto.Project.CurrencyId
        this._capacityUnits = projectDto.Project.CapacityUnits
        this._currentUnits = projectDto.Project.CurrentUnits
        this._voltageUnits = projectDto.Project.VoltageUnits
        this._voltage1 = projectDto.Project.Voltage1
        this._voltageColor1 = projectDto.Project.VoltageColor1
        this._voltage2 = projectDto.Project.Voltage2
        this._voltageColor2 = projectDto.Project.VoltageColor2
        this._voltage3 = projectDto.Project.Voltage3
        this._voltageColor3 = projectDto.Project.VoltageColor3
        this._voltage4 = projectDto.Project.Voltage4
        this._voltageColor4 = projectDto.Project.VoltageColor4
        this._linkedOptimizationProjectId = projectDto.LinkedOptimizationProjectId
        this._linkedOptimizationProjectResultId = projectDto.LinkedOptimizationProjectResultId

        projectDto.Nodes.forEach(node => {
            this._oneLineNodes.add(new OneLineNode(node))
        })

        projectDto.Branches.forEach(branch => {
            this._oneLineBranches.add(new OneLineBranch(branch))
        })

        projectDto.Devices.forEach(device => {
            this._oneLineDevices.add(new OneLineDevice(device))
        })

        // Wire up nodes & branches
        this.OneLineNodes.forEach(node => {
            const outBranches = this.OneLineBranches.filter(branch => branch.FromNodeId === node.NodeId)
            outBranches.forEach(branch => {
                node.OutgoingBranches.add(branch)
                branch.FromNode = node
            })

            const inBranches = this.OneLineBranches.filter(branch => branch.ToNodeId === node.NodeId)
            inBranches.forEach(branch => {
                node.IncomingBranches.add(branch)
                branch.ToNode = node
            })
        })
    }

    addNode(node) {
        this.OneLineNodes.add(node)
    }

    removeNode(node) {
        // First remove all branches attached to this node

        // NOTE: Here we use Array.from to clone the OutgoingBranches and IncomingBranches lists.
        // This needs to be done because the removeBranch function, which is called here, removes the branch from the OutgoingBranches / IncomingBranches list.
        // Removing from a list while enumerating it creates problems. (In .NET you'll get an exception if you do this, but I guess JavaScript is a little more "whatever dude.")
        Array.from(node.OutgoingBranches).forEach(branch => this.removeBranch(branch))
        Array.from(node.IncomingBranches).forEach(branch => this.removeBranch(branch))

        // Now remove the node
        this.OneLineNodes.remove(node)
    }

    addBranch(branch) {
        const fromNode = this.getOneLineNode(branch.FromNodeId)
        const toNode = this.getOneLineNode(branch.ToNodeId)

        fromNode.OutgoingBranches.add(branch)
        toNode.IncomingBranches.add(branch)

        fromNode.NeedsGraphUpdate = true
        toNode.NeedsGraphUpdate = true

        branch.FromNode = fromNode
        branch.ToNode = toNode

        this.OneLineBranches.add(branch)
    }

    removeBranch(branch) {
        if (branch.FromDeviceId) {
            const fromDevice = this.getOneLineDevice(branch.FromDeviceId)
            this.removeDevice(fromDevice)
            console.log('OneLineProject.removeBranch()::branch.FromDeviceId', branch.FromDeviceId)
        }

        if (branch.ToDeviceId) {
            const toDevice = this.getOneLineDevice(branch.ToDeviceId)
            this.removeDevice(toDevice)
            console.log('OneLineProject.removeBranch()::branch.ToDeviceId', branch.ToDeviceId)
        }

        if (branch.FromNode !== null) {
            branch.FromNode.NeedsGraphUpdate = true
            branch.FromNode.OutgoingBranches.remove(branch)
        }

        if (branch.ToNode !== null) {
            branch.ToNode.NeedsGraphUpdate = true
            branch.ToNode.IncomingBranches.remove(branch)
        }

        this.OneLineBranches.remove(branch)
    }

    addDevice(device) {
        this.OneLineDevices.add(device)
    }

    removeDevice(device) {
        this.OneLineDevices.remove(device)
    }

    get Annotations() { return this._annotations }
    get Name() { return this._name }
    get Description() { return this._description }
    get TypeId() { return this._typeId }
    get FormatId() { return this._formatId }
    get CurrencyId() { return this._currencyId }
    
    get CableOveragePercent() { return this._cableOveragePercent }
    set CableOveragePercent(value) { this._cableOveragePercent = value }

    get Frequency() { return this._frequency }
    get OneLineNodes() { return this._oneLineNodes }
    get OneLineBranches() { return this._oneLineBranches }
    get OneLineDevices() { return this._oneLineDevices }
    get StorageProfile() { return this._storageProfile }
    set StorageProfile(value) { this._storageProfile = value }
    get DefaultNodes() { return this._defaultNodes }
    get DefaultBranches() { return this._defaultBranches }
    get DefaultDevices() { return this._defaultDevices }

    get CreatedDate() { return this._createdDate }
    get LastModifiedDate() { return this._lastModifiedDate }
    get ProjectYear() { return this._projectYear }

    get CapacityUnits() { return this._capacityUnits }
    get CapacityUnitsLabel() {
      return constants.CAPACITY_UNIT_LABELS[this._capacityUnits]
    }

    get CurrentUnits() { return this._currentUnits }
    get CurrentUnitsLabel() {
      return constants.CURRENT_UNIT_LABELS[this._currentUnits]
    }

    get VoltageUnits() { return this._voltageUnits }
    get VoltageUnitsLabel() {
      return constants.VOLTAGE_UNIT_LABELS[this._voltageUnits]
    }

    get Voltage1() { return this._voltage1 }
    get VoltageColor1() { return this._voltageColor1 }
    get Voltage2() { return this._voltage2 }
    get VoltageColor2() { return this._voltageColor2 }
    get Voltage3() { return this._voltage3 }
    get VoltageColor3() { return this._voltageColor3 }
    get Voltage4() { return this._voltage4 }
    get VoltageColor4() { return this._voltageColor4 }

    get LinkedOptimizationProjectId() { return this._LinkedOptimizationProjectId }
    set LinkedOptimizationProjectId(value) { this._LinkedOptimizationProjectId = value }

    get LinkedOptimizationProjectResultId() { return this._LinkedOptimizationProjectResultId }
    set LinkedOptimizationProjectResultId(value) { this._LinkedOptimizationProjectResultId = value }

    get CurrencySign() {
      return constants.CURRENCY_SIGNS[this._currencyId]
    }

    get CurrencyLabel() {
      return constants.CURRENCY_LABELS[this._currencyId]
    }

    get TypeLabel() {
      const projectTypeKey = Object.entries(constants.PROJECT_TYPE_IDS).find(x => x[1] === this._typeId)[0]
      return constants.PROJECT_TYPE_LABELS[projectTypeKey]
    }

    get IsAnsi() {
        return this._formatId === constants.PROJECT_FORMATS.ANSI
    }

    get UnitSystem() {
      return this._formatId === constants.PROJECT_FORMATS.ANSI ?
          constants.UNIT_SYSTEMS.IMPERIAL : constants.UNIT_SYSTEMS.METRIC
    }

    get LengthLabel() {
      return this._formatId === constants.PROJECT_FORMATS.ANSI ?
          constants.LENGTH_LABELS.FEET : constants.LENGTH_LABELS.METERS
    }

    get AbbreviatedLengthLabel() {
      return this._formatId === constants.PROJECT_FORMATS.ANSI ?
          constants.ABBREVIATED_LENGTH_LABELS.FT : constants.ABBREVIATED_LENGTH_LABELS.M
    }

    get UnitLength() {
      return this._formatId === constants.PROJECT_FORMATS.ANSI ?
          constants.UNIT_LENGTHS.THOUSAND_FEET : constants.UNIT_LENGTHS.KM
    }

    get FormattedFrequency() {
      return utils.formats.formatHz(this._frequency)
    }

    get TemperatureScale() {
      return this._formatId === constants.PROJECT_FORMATS.ANSI ?
          constants.TEMPERATURE_SCALES.FAHRENHEIT : constants.TEMPERATURE_SCALES.CELSIUS
    }

    get TemperatureSymbol() {
      return this._formatId === constants.PROJECT_FORMATS.ANSI ?
          constants.TEMPERATURE_SYMBOLS.FAHRENHEIT : constants.TEMPERATURE_SYMBOLS.CELSIUS
    }

    get TemperatureScaleAndSymbol() {
      return `${this.TemperatureScale} (${this.TemperatureSymbol})`
    }

    get NodeCount() {
      return this._oneLineNodes.size
    }

    get BranchCount() {
      return this._oneLineBranches.size
    }

    get SymbolCount() {
      return this._oneLineNodes.size + this._oneLineBranches.size
    }

    get PowerProducersCount() {
      return this.getPowerProducers().size
    }

    get LoadCount() {
      return this.getNodeCountByType(constants.NODE_TYPES.LOAD)
    }

    get BusbarCount() {
      return this.getNodeCountByType(constants.NODE_TYPES.BUSBAR)
    }

    get CableCount() {
      return this.getBranchCountByType(constants.BRANCH_TYPES.CABLE)
    }

    get TransformerCount() {
      return this.getBranchCountByType(constants.BRANCH_TYPES.TRANS2W)
    }

    get CableLength() {
      return this.computeTotalCableLength()
    }

    get CableCost() {
      return this.computeTotalCableCost()
    }

    // Considered in Northern Hemisphere if there are no nodes, no nodes with latitude, or any nodes with a positive latitude
    get InSouthernHemisphere() {
      if (this.OneLineNodes === null || this.OneLineNodes.size === 0)
        return false
      else if (this.OneLineNodes.filter(node => node.Latitude !== null && node.Latitude < 0).size === 0 || this.OneLineNodes.filter(node => node.Latitude !== null && node.Latitude > 0).size > 0)
        return false
      else
        return true
    }

    getEquipmentCategory(elementType) {
      if (Object.keys(constants.NODE_TYPES).includes(elementType))
        return constants.EQUIPMENT_CATEGORIES.NODE
      else if (Object.keys(constants.BRANCH_TYPES).includes(elementType))
        return constants.EQUIPMENT_CATEGORIES.BRANCH
      else if (Object.keys(constants.DEVICE_TYPES).includes(elementType))
        return constants.EQUIPMENT_CATEGORIES.DEVICE
      else
        return null
    }

    getOneLineElement(elementType, elementId) {
      const equipmentCategory = this.getEquipmentCategory(elementType)
      if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.NODE)
        return this.getOneLineNode(elementId)
      else if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.BRANCH)
        return this.getOneLineBranch(elementId)
      else if (equipmentCategory === constants.EQUIPMENT_CATEGORIES.DEVICE)
        return this.getOneLineDevice(elementId)
      else
        return null
    }

    updateData(data) {
        this._annotations = new List(data.Annotations)
        this._description = data.Description
        this._typeId = data.TypeId
        this._capacityUnits = data.CapacityUnits
        this._currentUnits = data.CurrentUnits
        this._voltageUnits = data.VoltageUnits

        this._voltage1 = data.Voltage1
        this._voltageColor1 = data.VoltageColor1
        this._voltage2 = data.Voltage2
        this._voltageColor2 = data.VoltageColor2
        this._voltage3 = data.Voltage3
        this._voltageColor3 = data.VoltageColor3
        this._voltage4 = data.Voltage4
        this._voltageColor4 = data.VoltageColor4

        this._cableOveragePercent = data.CableOveragePercent

        this.allGraphElementsNeedUpdating()
    }
   
    updateLastModifiedDate() {
        this._lastModifiedDate = utils.forms.getUtcNow()
    }

    updateDefaultBranch(catalogItemId, branchData) {
        const newDefaultBranch = {
            BranchType: branchData.BranchType,
            CatalogItemId: catalogItemId,
            CatalogName: branchData.CatalogName,
            Details: branchData.Details,
            Manufacturer: branchData.Manufacturer,
            PartNumber: branchData.PartNumber,
            NumberOfPhases: branchData.NumberOfPhases
        }
        const defaultBranches = Array.from(this._defaultBranches).filter(branch => branch.BranchType !== newDefaultBranch.BranchType)
        defaultBranches.push(newDefaultBranch)
        this._defaultBranches = List.fromArray(defaultBranches)
    }

    mapBranchToDefaultBranch(branchType, branchData, addToCatalogData) {
        switch(branchType) {
            case constants.BRANCH_TYPES.CABLE:
                return {
                    BranchType: branchData.BranchType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        Ampacity: branchData.Details.Ampacity,
                        CableMaterial: branchData.Details.CableMaterial,
                        CableSize: branchData.Details.CableSize,
                        CapacitancePos: branchData.Details.CapacitancePos,
                        CapacitanceZero: branchData.Details.CapacitanceZero,
                        CostsPerUnitDistance: branchData.Details.CostsPerUnitDistance,
                        InsulationType: branchData.Details.InsulationType,
                        Life: branchData.Details.Life,
                        NumConductors: branchData.Details.NumConductors,
                        RatedTemperature: branchData.Details.RatedTemperature,
                        ReactancePos: branchData.Details.ReactancePos,
                        ReactanceZero: branchData.Details.ReactanceZero,
                        ResistancePos: branchData.Details.ResistancePos,
                        ResistanceZero: branchData.Details.ResistanceZero,
                        VoltageRating: branchData.Details.VoltageRating
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }
            default:
                console.warn('OneLineProject.mapBranchToDefaultBranch(): Returned empty object')
                return {}
        }
    }

    updateDefaultNode(catalogItemId, nodeData) {
        const newDefaultNode = {
            NodeType: nodeData.NodeType,
            CatalogItemId: catalogItemId,
            CatalogName: nodeData.CatalogName,
            Details: nodeData.Details,
            Manufacturer: nodeData.Manufacturer,
            PartNumber: nodeData.PartNumber,
            NumberOfPhases: nodeData.NumberOfPhases
        }
        const defaultNodes = Array.from(this._defaultNodes).filter(node => node.NodeType !== newDefaultNode.NodeType)
        defaultNodes.push(newDefaultNode)
        this._defaultNodes = List.fromArray(defaultNodes)
    }

    mapNodeToDefaultNode(nodeType, nodeData, addToCatalogData) {
        switch(nodeType) {
            case constants.NODE_TYPES.UTILITY:
                return {
                    NodeType: nodeData.NodeType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        BaseMVA: nodeData.Details.BaseMVA,
                        LgShortCircuit: nodeData.Details.LgShortCircuit,
                        OperatingVoltage: nodeData.Details.OperatingVoltage,
                        ThreePhaseShortCircuit: nodeData.Details.ThreePhaseShortCircuit,
                        Voltage: nodeData.Details.Voltage,
                        VoltageAngle: nodeData.Details.VoltageAngle,
                        XrRatioPos: nodeData.Details.XrRatioPos,
                        XrRatioZero: nodeData.Details.XrRatioZero
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }

            case constants.NODE_TYPES.BUSBAR:
                return {
                    NodeType: nodeData.NodeType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        Age: nodeData.Details.Age,
                        AmpRating: nodeData.Details.AmpRating,
                        CapCosts: nodeData.Details.CapCosts,
                        Existing: nodeData.Details.Existing,
                        Lifetime: nodeData.Details.Lifetime,
                        OMCosts: nodeData.Details.OMCosts
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }

            case constants.NODE_TYPES.LOAD:
                return {
                    NodeType: nodeData.NodeType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        Connection: nodeData.Details.Connection,
                        LoadModel: nodeData.Details.LoadModel,
                        LoadShapeDate: nodeData.Details.LoadShapeDate,
                        LoadShapeName: nodeData.Details.LoadShapeName,
                        LoadShapePreservePeak: nodeData.Details.LoadShapePreservePeak,
                        LoadShapeResolution: nodeData.Details.LoadShapeResolution,
                        LoadShapeUnits: nodeData.Details.LoadShapeUnits,
                        MinVoltagePerUnit: nodeData.Details.MinVoltagePerUnit,
                        PowerFactor: nodeData.Details.PowerFactor,
                        PowerFactorType: nodeData.Details.PowerFactorType,
                        RatedPower: nodeData.Details.RatedPower,
                        RatedPowerUnits: nodeData.Details.RatedPowerUnits,
                        RatedVoltage: nodeData.Details.RatedVoltage
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }
            
            case constants.NODE_TYPES.SOLAR:
                return {
                    NodeType: nodeData.NodeType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        CutInPower: nodeData.Details.CutInPower,
                        CutOutPower: nodeData.Details.CutOutPower,
                        FaultX: nodeData.Details.FaultX,
                        InverterRating: nodeData.Details.InverterRating,
                        PowerFactor: nodeData.Details.PowerFactor,
                        RatedPower: nodeData.Details.RatedPower,
                        Stiffness: nodeData.Details.Stiffness,
                        ForceSeqPos: nodeData.Details.ForceSeqPos,
                        Voltage: nodeData.Details.Voltage,
                        XrRatio: nodeData.Details.XrRatio,
                        Connection: nodeData.Details.Connection
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }

            case constants.NODE_TYPES.WIND:
                return {
                  NodeType: nodeData.NodeType,
                  CatalogItemId: null,
                  CatalogName: addToCatalogData.CatalogName,
                  Details: {
                      Voltage: nodeData.Details.Voltage,
                      RatedPower: nodeData.Details.RatedPower,
                      WTGType: nodeData.Details.WTGType,
                      NegSeqReactance: nodeData.Details.NegSeqReactance,
                      SteadyState: nodeData.Details.SteadyState,
                      Transient: nodeData.Details.Transient,
                      Subtransient: nodeData.Details.Subtransient,
                      X0: nodeData.Details.X0,
                      XrRatio: nodeData.Details.XrRatio,
                      MaxPowerAbsorption: nodeData.Details.MaxPowerAbsorption,
                      MaxPowerDelivery: nodeData.Details.MaxPowerDelivery,
                      PowerFactorFullLoad: nodeData.Details.PowerFactorFullLoad,
                      PowerFactorCorrection: nodeData.Details.PowerFactorCorrection,
                      ShuntCapacitorStages: nodeData.Details.ShuntCapacitorStages,
                      ShuntCapacitorRating: nodeData.Details.ShuntCapacitorRating,
                      MaxPowerFactorOver: nodeData.Details.MaxPowerFactorOver,
                      MaxPowerFactorUnder: nodeData.Details.MaxPowerFactorUnder,
                      ControlMode: nodeData.Details.ControlMode,
                      Lifetime: nodeData.Details.Lifetime,
                      Cost: nodeData.Details.Cost,
                      FixedMaintCost: nodeData.Details.FixedMaintCost,
                      VarMaintCost: nodeData.Details.VarMaintCost,
                      HubHeight: nodeData.Details.HubHeight,
                      GenShedding: nodeData.Details.GenShedding,
                      TurbineModel: nodeData.Details.TurbineModel
                  },
                  Manufacturer: addToCatalogData.Manufacturer,
                  NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                  PartNumber: addToCatalogData.PartNumber
                }

            case constants.NODE_TYPES.GENERATOR:
                return {
                    NodeType: nodeData.NodeType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        Voltage: nodeData.Details.Voltage,
                        GeneratorModel: nodeData.Details.GeneratorModel,
                        Poles: nodeData.Details.Poles,
                        Connection: nodeData.Details.Connection,
                        MaxPowerAbsorption: nodeData.Details.MaxPowerAbsorption,
                        MaxPowerDelivery: nodeData.Details.MaxPowerDelivery,
                        PowerFactor: nodeData.Details.PowerFactor,
                        RatedPower: nodeData.Details.RatedPower,
                        RatedRPM: nodeData.Details.RatedRPM,
                        Reactance: nodeData.Details.Reactance,
                        NegSeqReactance: nodeData.Details.NegSeqReactance,
                        Resistance: nodeData.Details.Resistance,
                        SteadyState: nodeData.Details.SteadyState,
                        Transient: nodeData.Details.Transient,
                        Subtransient: nodeData.Details.Subtransient,
                        X0: nodeData.Details.X0,
                        XrRatio: nodeData.Details.XrRatio,
                        Stiffness: nodeData.Details.Stiffness
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }

            case constants.NODE_TYPES.STORAGE:
                return {
                    NodeType: nodeData.NodeType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        StoredCharge: nodeData.Details.StoredCharge,
                        FaultX: nodeData.Details.FaultX,
                        ForceSeqPos: nodeData.Details.ForceSeqPos,
                        Connection: nodeData.Details.Connection,
                        IdlingLossesKVAR: nodeData.Details.IdlingLossesKVAR,
                        IdlingLossesKW: nodeData.Details.IdlingLossesKW,
                        LimitCurrent: nodeData.Details.LimitCurrent,
                        MaxVoltagePU: nodeData.Details.MaxVoltagePU,
                        MinVoltagePU: nodeData.Details.MinVoltagePU,
                        PowerFactor: nodeData.Details.PowerFactor,
                        PowerFactorType: nodeData.Details.PowerFactorType,
                        RatedPower: nodeData.Details.RatedPower,
                        RatedVoltage: nodeData.Details.RatedVoltage,
                        Resistance: nodeData.Details.Resistance,
                        Reactance: nodeData.Details.Reactance,
                        StorageModel: nodeData.Details.StorageModel,
                        StorageRatedCapacity: nodeData.Details.StorageRatedCapacity,
                        XrRatio: nodeData.Details.XrRatio,
                        InstallationCost: nodeData.Details.InstallationCost,
                        InverterPurchaseCost: nodeData.Details.InverterPurchaseCost,
                        EnergyModulesPerkWh: nodeData.Details.EnergyModulesPerkWh,
                        DiscreteSize: nodeData.Details.DiscreteSize,
                        MaintenanceCostPerkWhPerMonth: nodeData.Details.MaintenanceCostPerkWhPerMonth,
                        ChargingEfficiency: nodeData.Details.ChargingEfficiency,
                        DischargingEfficiency: nodeData.Details.DischargingEfficiency,
                        MaxStateOfCharge: nodeData.Details.MaxStateOfCharge,
                        MinStateOfCharge: nodeData.Details.MinStateOfCharge,
                        SystemLifetime: nodeData.Details.SystemLifetime,
                        MaxChargeRate: nodeData.Details.MaxChargeRate,
                        MaxDischargeRate: nodeData.Details.MaxDischargeRate
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }

            default:
                console.warn('OneLineProject.mapNodeToDefaultNode(): Mapping skipped.')
        }
    }

    updateDefaultDevice(catalogItemId, deviceData) {
        const newDefaultDevice = {
            DeviceType: deviceData.DeviceType,
            CatalogItemId: catalogItemId,
            CatalogName: deviceData.CatalogName,
            Details: deviceData.Details,
            Manufacturer: deviceData.Manufacturer,
            PartNumber: deviceData.PartNumber,
            NumberOfPhases: deviceData.NumberOfPhases
        }
        const defaultDevices = Array.from(this._defaultDevices).filter(device => device.DeviceType !== newDefaultDevice.DeviceType)
        defaultDevices.push(newDefaultDevice)
        this._defaultDevices = List.fromArray(defaultDevices)
    }

    mapDeviceToDefaultDevice(deviceType, deviceData, addToCatalogData) {
        switch(deviceType) {
            case constants.DEVICE_TYPES.BREAKER:
            case constants.DEVICE_TYPES.SWITCH:
                return {
                    DeviceType: deviceData.DeviceType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        AmpRating: deviceData.Details.AmpRating,
                        InterruptRating: deviceData.Details.InterruptRating,
                        FrameSize: deviceData.Details.FrameSize,
                        FrameType: deviceData.Details.FrameType,
                        TripUnitType: deviceData.Details.TripUnitType
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    ModelNumber: addToCatalogData.ModelNumber,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }

            case constants.DEVICE_TYPES.FUSE:
                return {
                    DeviceType: deviceData.DeviceType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        AmpRating: deviceData.Details.AmpRating,
                        InterruptRating: deviceData.Details.InterruptRating,
                        VoltageRating: deviceData.Details.VoltageRating,
                        FuseClass: deviceData.Details.FuseClass,
                        FuseSpeed: deviceData.Details.FuseSpeed,
                        FuseType: deviceData.Details.FuseType
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    ModelNumber: addToCatalogData.ModelNumber,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }

            case constants.DEVICE_TYPES.RELAY:
                return {
                    DeviceType: deviceData.DeviceType,
                    CatalogItemId: null,
                    CatalogName: addToCatalogData.CatalogName,
                    Details: {
                        CTRatioNumerator: deviceData.Details.CTRatioNumerator,
                        CTRatioDenominator: deviceData.Details.CTRatioDenominator,
                        RelayType: deviceData.Details.RelayType,
                        TapSetting: deviceData.Details.TapSetting,
                        TimeDial: deviceData.Details.TimeDial
                    },
                    Manufacturer: addToCatalogData.Manufacturer,
                    ModelNumber: addToCatalogData.ModelNumber,
                    NumberOfPhases: Number(addToCatalogData.NumberOfPhases),
                    PartNumber: addToCatalogData.PartNumber
                }

            default:
                console.warn('OneLineProject.mapDeviceToDefaultDevice(): Mapping skipped.')
        }
    }

    getOneLineNode(nodeId) {
        return this.OneLineNodes.filter(node => node.NodeId === nodeId).firstOrDefault()
    }

    getOneLineNodeByName(nodeName) {
        return this.OneLineNodes.filter(node => node.Name === nodeName).firstOrDefault()
    }

    getOneLineBranch(branchId) {
        return this.OneLineBranches.filter(branch => branch.BranchId === branchId).firstOrDefault()
    }

    getOneLineDevice(deviceId) {
        return this.OneLineDevices.filter(device => device.DeviceId === deviceId).firstOrDefault()
    }

    getDefaultNode(nodeType) {
        return this.DefaultNodes.filter(node => node.NodeType === nodeType).firstOrDefault()
    }

    getDefaultBranch(branchType) {
        return this.DefaultBranches.filter(node => node.BranchType === branchType).firstOrDefault()
    }

    getDefaultDevice(deviceType) {
        return this.DefaultDevices.filter(device => device.DeviceType === deviceType).firstOrDefault()
    }

    getNodesByType(nodeType) {
        return Array.from(this.OneLineNodes.filter(node => node.NodeType === nodeType))
    }

    getNodeCountByType(nodeType) {
        return this.getNodesByType(nodeType).length
    }

    getBranchesByType(branchType) {
        return Array.from(this.OneLineBranches.filter(branch => branch.BranchType === branchType))
    }

    getBranchCountByType(branchType) {
        return this.getBranchesByType(branchType).length
    }

    computeTotalCableLength() {
        let totalCableLength = 0
        this.getBranchesByType(constants.BRANCH_TYPES.CABLE).forEach(item => {
            totalCableLength += this.app.topography.computeCableLength(item, false)
        })

        return Number(numeral(totalCableLength).format(constants.FORMATS.U0))
    }

    computeTotalCableCost() {
        let totalCableCost = 0
        let totalCableLength = 0
        let cableCost = 0

        
        this.getBranchesByType(constants.BRANCH_TYPES.CABLE).forEach(item => {

            let singleCableLength = this.app.topography.computeCableLength(item, false)


            totalCableLength += singleCableLength
            cableCost += Number(item.Details.CostsPerUnitDistance)
        })

        totalCableCost = (totalCableLength / 1000) * cableCost
        return Number(numeral(totalCableCost).format(constants.FORMATS.U0))
    }

    // For use with the Cable Overage % in the project settings
    generateCableLengthsRequestBody(oldCableOveragePercent, newCableOveragePercent) {
        const allCables = this.getBranchesByType(constants.BRANCH_TYPES.CABLE)
        allCables.forEach(item => {
            item.Details.CableLength =
              Number(
                numeral(
                  ( item.Details.CableLength * (1 + (newCableOveragePercent / 100)) ) /
                  (1 + (oldCableOveragePercent / 100))
                ).format(
                  constants.FORMATS.U0
                )
              )
        })
        return allCables.map(item => ({
            EquipmentId: item.BranchId,
            NewValue: item.Details.CableLength
        }))
    }


    allGraphElementsNeedUpdating() {
        this.OneLineNodes.forEach(node => node.NeedsGraphUpdate = true)
        this.OneLineBranches.forEach(branch => branch.NeedsGraphUpdate = true)
    }

    getAllVoltages() {
        const voltages = new Map()

        // Add the voltage contributed by each power producer
        this.OneLineNodes.forEach(node => {
            if (node.IsPowerProducer && node.LineToLineVoltage > 0)
                if (!voltages.has(node.LineToLineVoltage))
                    voltages.set(node.LineToLineVoltage, true)
        })

        // Add the voltage contributed by each voltage modifier
        this.OneLineBranches.forEach(branch => {
            if (branch.BranchType === constants.BRANCH_TYPES.TRANS2W) {
                const primarySideVoltage = branch.FromSourceIncomingVoltage
                if (primarySideVoltage !== null && primarySideVoltage > 0)
                    if (!voltages.has(primarySideVoltage))
                        voltages.set(primarySideVoltage, true)

                const secondarySideVoltage = branch.Details.SecondarySideVoltage
                if (secondarySideVoltage !== null && secondarySideVoltage > 0)
                    if (!voltages.has(secondarySideVoltage))
                        voltages.set(secondarySideVoltage, true)
            }
        })

        return voltages.keys()
    }

    getPowerProducers() {
        return this.OneLineNodes.filter(node => node.IsPowerProducer)
    }

    calculateVoltageAcrossNetwork() {
        const allNodes = this.OneLineNodes

        // Reset all voltages to 0
        allNodes.forEach(node => node.resetVoltage())
        this.OneLineBranches.forEach(branch => branch.clearIncomingVoltage())

        // Get all power producers
        const powerProducers = allNodes.filter(node => node.IsPowerProducer)
        let visitedNodeIds = []

        // Determine voltage across the network
        powerProducers.forEach((powerProducer) => {
            visitedNodeIds = []

            powerProducer.LineToLineVoltage = powerProducer.Details.Voltage

            this._calculateVoltageAcrossNetworkRecursively(powerProducer, powerProducer.Details.Voltage, visitedNodeIds)
        })

        // Now do it again to calculate the voltage irrespective of open devices
        powerProducers.forEach((powerProducer) => {
            visitedNodeIds = []

            powerProducer.LineToLineVoltageIrrespectiveOfOpenDevices = powerProducer.Details.Voltage

            this._calculateVoltageIrrespectiveOfOpenDevicesAcrossNetworkRecursively(powerProducer, powerProducer.LineToLineVoltageIrrespectiveOfOpenDevices, visitedNodeIds)
        })
    }

    _calculateVoltageAcrossNetworkRecursively(node, voltage, visitedNodeIds) {
        if (!visitedNodeIds.includes(node.NodeId)) {
            visitedNodeIds.push(node.NodeId)

            if (!node.IsPowerProducer && voltage > 0)
                node.LineToLineVoltage = voltage

            // Traverse the "out" branches, updating the voltage if needed
            node.OutgoingBranches.forEach(outgoingBranch => {
                if (outgoingBranch.FromSourceIncomingVoltage < outgoingBranch.FromNode.LineToLineVoltage)
                    outgoingBranch.FromSourceIncomingVoltage = node.LineToLineVoltage

                if (outgoingBranch.ToNode !== null) {
                    const voltageAfterDevice = outgoingBranch.getVoltageAfterToDevice()

                    this._calculateVoltageAcrossNetworkRecursively(outgoingBranch.ToNode, voltageAfterDevice, visitedNodeIds)
                }
            })

            // Only traverse "up" a branch if it's not a voltage modifier
            node.IncomingBranches.forEach(incomingBranch => {
                if (incomingBranch.FromSourceIncomingVoltage < voltage && !incomingBranch.IsVoltageModifier) {
                    // If there is nothing blocking us set the branch's incoming voltage and calculate away
                    if (incomingBranch.CanTraverse) {
                        incomingBranch.FromSourceIncomingVoltage = voltage

                        this._calculateVoltageAcrossNetworkRecursively(incomingBranch.FromNode, incomingBranch.FromSourceIncomingVoltage, visitedNodeIds)
                    }
                }
            })
        }
    }

    _calculateVoltageIrrespectiveOfOpenDevicesAcrossNetworkRecursively(node, voltageIrrespectiveOfOpenDevices, visitedNodeIds) {
        if (visitedNodeIds.includes(node.NodeId) && node.LineToLineVoltageIrrespectiveOfOpenDevices >= voltageIrrespectiveOfOpenDevices) {
            return
        } else {
            if (!visitedNodeIds.includes(node.NodeId))
                visitedNodeIds.push(node.NodeId)

            if (node.LineToLineVoltageIrrespectiveOfOpenDevices < voltageIrrespectiveOfOpenDevices && !node.IsPowerProducer)
                node.LineToLineVoltageIrrespectiveOfOpenDevices = voltageIrrespectiveOfOpenDevices

            // Traverse the "out" branches, updating the voltage if needed
            node.OutgoingBranches.forEach(outgoingBranch => {
                // If we're visiting a transformer we need to set the primary side voltage to the incoming voltage
                if (outgoingBranch.IsTransformer2W) {
                    outgoingBranch.Details.PrimarySideVoltage = node.LineToLineVoltageIrrespectiveOfOpenDevices
                }

                let voltageAfterBranch = voltageIrrespectiveOfOpenDevices
                if (outgoingBranch.IsTransformer2W) {
                    voltageAfterBranch = outgoingBranch.Details.SecondarySideVoltage
                }

                this._calculateVoltageIrrespectiveOfOpenDevicesAcrossNetworkRecursively(outgoingBranch.ToNode, voltageAfterBranch, visitedNodeIds)
            })

            // Only traverse "up" a branch if it's not a voltage modifier
            node.IncomingBranches.forEach(incomingBranch => {
                if (incomingBranch.FromNode.LineToLineVoltageIrrespectiveOfOpenDevices < voltageIrrespectiveOfOpenDevices && !incomingBranch.IsVoltageModifier)
                    this._calculateVoltageIrrespectiveOfOpenDevicesAcrossNetworkRecursively(incomingBranch.FromNode, voltageIrrespectiveOfOpenDevices, visitedNodeIds)
            })
        }
    }

    setInternalNodeConnectionsAcrossNetwork() {
        const allNodes = this.OneLineNodes

        // Reset internal connection to null for all nodes
        allNodes.forEach(node => node.InternalConnection = null)

        // Get all power producers
        const powerProducers = allNodes.filter(node => node.IsPowerProducer)
        let visitedNodeIds = []

        // Determine internal connection values across the network
        powerProducers.forEach((powerProducer) => {
            powerProducer.assignInternalConnectionBasedOnNodeType(null)

            this._setInternalNodeConnectionsAcrossNetworkRecursively(powerProducer, powerProducer.InternalConnection, visitedNodeIds)
        })
    }

    _setInternalNodeConnectionsAcrossNetworkRecursively(node, connection, visitedNodeIds) {
        if (!visitedNodeIds.includes(node.NodeId)) {
            visitedNodeIds.push(node.NodeId)

            node.assignInternalConnectionBasedOnNodeType(connection)

            // Traverse the "out" branches
            node.OutgoingBranches.forEach(outgoingBranch => {
                let outgoingConnection = node.InternalConnection

                if (outgoingBranch.IsVoltageModifier)
                    outgoingConnection = outgoingBranch.Details.SecondaryWindingType

                this._setInternalNodeConnectionsAcrossNetworkRecursively(outgoingBranch.ToNode, outgoingConnection, visitedNodeIds)
            })

            // Only traverse "up" a branch if it's not a voltage modifier
            node.IncomingBranches.forEach(incomingBranch => {
                if (!incomingBranch.IsVoltageModifier)
                    this._setInternalNodeConnectionsAcrossNetworkRecursively(incomingBranch.FromNode, node.InternalConnection, visitedNodeIds)
            })
        }
    }

    // Called to update the Rated Voltage of nodes. In short, if there are any loads, storage or other nodes with Rated Voltage -that is not set- and
    // the load or storage is hooked up to a charged network, then we want to update the Rated Voltage accordingly.
    updateRatedVoltageValuesAcrossNetwork() {
        let updatesToPerform = []

        // Set the rated voltage for nodes whose rated voltage is not yet set
        const nodesWithRatedVoltage = this.OneLineNodes.filter(node => node.NodeType === constants.NODE_TYPES.LOAD || node.NodeType === constants.NODE_TYPES.STORAGE)

        console.log('updateRatedVoltageValuesAcrossNetwork()::nodesWithRatedVoltage', nodesWithRatedVoltage)

        nodesWithRatedVoltage.forEach((node) => {
            if (typeof node.Details.RatedVoltage !== 'undefined' && node.Details.RatedVoltage === null) {
                const nodeNominalVoltage = Math.trunc(node.LineToLineVoltageIrrespectiveOfOpenDevices)

                if (nodeNominalVoltage > 0) {
                    // For ANSI projects, set the rated voltage for loads to a specific value based on the nominal voltage
                    if (this.FormatId === constants.PROJECT_FORMATS.ANSI && node.NodeType === constants.NODE_TYPES.LOAD) {
                        switch (nodeNominalVoltage) {
                            case 208:
                                node.Details.RatedVoltage = 200
                                break
                            case 240:
                                node.Details.RatedVoltage = 230
                                break
                            case 480:
                                node.Details.RatedVoltage = 460
                                break
                            case 600:
                                node.Details.RatedVoltage = 575
                                break
                            case 2400:
                                node.Details.RatedVoltage = 2300
                                break
                            case 4160:
                                node.Details.RatedVoltage = 4000
                                break
                            default:
                                node.Details.RatedVoltage = nodeNominalVoltage
                                break
                        }
                    } else {
                        // For IEC projects, and for non-load nodes, set the rated voltage to match the nominal voltage
                        node.Details.RatedVoltage = nodeNominalVoltage
                    }

                    updatesToPerform.push({ equipmentId: node.NodeId, newValue: node.Details.RatedVoltage })
                }
            }
        })

        return updatesToPerform
    }

    // Recurses through a subnetwork starting at startingNode looking for zero voltage power producers.
    // If any such zero voltage power producers are found, their voltage is updated to match the specified voltage.
    // This is used to allow a user to connect a 0V power source to a charged network and have the power source voltage updated to match
    // that of the subnetwork it's being connected to.
    updatePowerProducersWithZeroVoltageAcrossNetwork(startingNode, newVoltage) {
        let updatesToPerform = []
        let visitedNodeIds = []

        this._updatePowerProducersWithZeroVoltageAcrossNetwork(startingNode, newVoltage, updatesToPerform, visitedNodeIds)

        return updatesToPerform
    }

    _updatePowerProducersWithZeroVoltageAcrossNetwork(node, voltage, updatesToPerform, visitedNodeIds) {
        if (!visitedNodeIds.includes(node.NodeId)) {
            visitedNodeIds.push(node.NodeId)

            if (node.IsPowerProducer && (node.Details.Voltage === null || node.Details.Voltage === 0)) {
                node.Details.Voltage = voltage
                updatesToPerform.push({ equipmentId: node.NodeId, newValue: voltage })
            }

            // Traverse the "out" branches
            node.OutgoingBranches.forEach(outgoingBranch => {
                if (!outgoingBranch.IsVoltageModifier)
                    this._updatePowerProducersWithZeroVoltageAcrossNetwork(outgoingBranch.ToNode, voltage, updatesToPerform, visitedNodeIds)
            })

            // Only traverse "up" a branch if it's not a voltage modifier
            node.IncomingBranches.forEach(incomingBranch => {
                if (!incomingBranch.IsVoltageModifier)
                    this._updatePowerProducersWithZeroVoltageAcrossNetwork(incomingBranch.FromNode, voltage, updatesToPerform, visitedNodeIds)
            })
        }
    }

    // Traverses the network and updates the voltages of any transformers and power producers OTHER THAN the node/branch whose voltage change instigated this call
    // Called by patchBranch when changing a transformer's secondary side voltage
    // Called by patchNode when changing a power producer's voltage
    updateVoltagesInNetwork(startingNodeId, newVoltage, originatingEquipmentId) {
        let visitedNodeIds = []
        const batchUpdates = new BatchUpdateDTO()

        this._updateVoltagesInNetworkRecursively(startingNodeId, newVoltage, originatingEquipmentId, visitedNodeIds, batchUpdates)

        return batchUpdates
    }

    _updateVoltagesInNetworkRecursively(nodeId, newVoltage, originatingEquipmentId, visitedNodeIds, batchUpdates) {
        if (!visitedNodeIds.includes(nodeId)) {
            const currentNode = this.getOneLineNode(nodeId)

            visitedNodeIds.push(nodeId)

            // If this is a power producer that has not yet been visited AND is not the originating node then update it's voltage accordingly
            if (nodeId !== originatingEquipmentId && currentNode.IsPowerProducer) {
                currentNode.Details.Voltage = newVoltage
                batchUpdates.BatchUpdateVoltageCommands.push({ equipmentId: nodeId, newValue: newVoltage })
            } else {
                // Only traverse "up" a branch if it's not a voltage modifier
                currentNode.IncomingBranches.forEach(incomingBranch => {
                    if (incomingBranch.IsVoltageModifier) {
                        if (incomingBranch.BranchId !== originatingEquipmentId) {
                            incomingBranch.NeedsGraphUpdate = true
                            incomingBranch.Details.SecondarySideVoltage = newVoltage
                            batchUpdates.BatchUpdateSecondarySideVoltageCommands.push({ equipmentId: incomingBranch.BranchId, newValue: newVoltage })
                        }
                    }
                    else // Recurse for non-voltage modifiers
                        this._updateVoltagesInNetworkRecursively(incomingBranch.FromNodeId, newVoltage, originatingEquipmentId, visitedNodeIds, batchUpdates)
                })

                // Traverse the "out" branches if it's NOT a voltage modifier
                currentNode.OutgoingBranches.forEach(outgoingBranch => {
                    if (outgoingBranch.IsVoltageModifier) {
                        if (outgoingBranch.ToNodeId !== originatingEquipmentId) {
                            // This is a voltage modifier... we may need to update the PrimarySideVoltage
                            if (outgoingBranch.BranchType === constants.BRANCH_TYPES.TRANS2W) {
                                outgoingBranch.NeedsGraphUpdate = true
                                outgoingBranch.Details.PrimarySideVoltage = newVoltage
                                batchUpdates.BatchUpdatePrimarySideVoltageCommands.push({ equipmentId: outgoingBranch.BranchId, newValue: newVoltage })
                            }
                        }
                    }
                    else
                        this._updateVoltagesInNetworkRecursively(outgoingBranch.ToNodeId, newVoltage, originatingEquipmentId, visitedNodeIds, batchUpdates)
                })
            }
        }
    }

    // Traverses the network and updates the connection of any transformers and power producers OTHER THAN the node/branch whose connection change instigated this call
    updateConnectionsInNetwork(startingNodeId, newConnection, originatingEquipmentId) {
        let visitedNodeIds = []
        const batchUpdates = new BatchUpdateDTO()

        this._updateConnectionsInNetworkRecursively(startingNodeId, newConnection, originatingEquipmentId, visitedNodeIds, batchUpdates)

        return batchUpdates
    }

    _updateConnectionsInNetworkRecursively(nodeId, newConnection, originatingEquipmentId, visitedNodeIds, batchUpdates) {
        if (!visitedNodeIds.includes(nodeId)) {
            const currentNode = this.getOneLineNode(nodeId)

            visitedNodeIds.push(nodeId)

            // If this is a power producer that has not yet been visited AND is not the originating node then update its connection accordingly
            if (nodeId !== originatingEquipmentId && currentNode.IsPowerProducer) {
                // If GENERATOR or SOLAR, update CONNECTION property
                if (currentNode.IsSolar || currentNode.IsGenerator) {
                    currentNode.Details.Connection = newConnection
                    batchUpdates.BatchUpdateConnections.push({ equipmentId: currentNode.NodeId, newValue: newConnection })
                }
            } else {
                // Only traverse "up" a branch if it's not a voltage modifier
                currentNode.IncomingBranches.forEach(incomingBranch => {
                    if (incomingBranch.IsVoltageModifier) {
                        if (incomingBranch.BranchId !== originatingEquipmentId) {
                            incomingBranch.NeedsGraphUpdate = true
                            incomingBranch.Details.SecondaryWindingType = newConnection
                            batchUpdates.BatchUpdateConnections.push({ equipmentId: incomingBranch.BranchId, newValue: newConnection })
                        }
                    }
                    else // Recurse for non-voltage modifiers
                        this._updateConnectionsInNetworkRecursively(incomingBranch.FromNodeId, newConnection, originatingEquipmentId, visitedNodeIds, batchUpdates)
                })

                // Traverse the "out" branches if it's NOT a voltage modifier
                currentNode.OutgoingBranches.forEach(outgoingBranch => {
                    if (!outgoingBranch.IsVoltageModifier)
                        this._updateConnectionsInNetworkRecursively(outgoingBranch.ToNodeId, newConnection, originatingEquipmentId, visitedNodeIds, batchUpdates)
                })
            }
        }
    }

    // Returns true if there exists at least one source node and one target node - false otherwise
    canAddBranch() {
        if (this.OneLineNodes.size >= 2) {
            let nodeCountOfAvailableIncomingBranches = 0
            let nodeCountOfAvailableOutgoingBranches = 0

            for (let i = 0; i < this.OneLineNodes.size; i++) {
                const node = this.OneLineNodes.get(i)

                if (node.IncomingBranches.size < node.MaximumIncomingBranches)
                    nodeCountOfAvailableIncomingBranches++

                if (node.OutgoingBranches.size < node.MaximumOutgoingBranches)
                    nodeCountOfAvailableOutgoingBranches++

                if (nodeCountOfAvailableIncomingBranches > 0 && nodeCountOfAvailableOutgoingBranches > 0)
                    return true
            }
        }

        // If we reach here, we can't add a new branch - there are too few available nodes
        return false
    }
}