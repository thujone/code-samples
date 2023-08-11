  /****************************************************************************
 ** Constants for the Xendee One-Line diagramming app.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/

import {
    LineCap
} from '../yfiles/lib/es-modules/yfiles.js'

const constants = {
    APP_MODES: {
        MAIN: 0,
        ANALYSIS: 1,
        MAP: 2
    },

    API_PATH: '/Studio/OneLine',
    PROJECT_PATH: '/Studio/OneLine/View',

    RESOURCES: {
        GET_GRAPH: 'GetGraph',
        ADD_NODE: 'AddNode',
        UPDATE_NODE: 'UpdateNode',
        DELETE_NODE: 'DeleteNode',
        BATCH_UPDATE_NODE_RATED_VOLTAGE: 'BatchUpdateRatedVoltage',
        BATCH_UPDATE_POWER_SOURCE_VOLTAGE: 'BatchUpdatePowerSourceVoltage',
        BATCH_UPDATE_NODE_VOLTAGE: 'BatchUpdateVoltage',
        BATCH_UPDATE_BRANCH_SECONDARY_SIDE_VOLTAGE: 'BatchUpdateSecondarySideVoltage',
        UPDATE_LAT_LON: 'UpdateLatLon',
        ADD_BRANCH: 'AddBranch',
        UPDATE_BRANCH: 'UpdateBranch',
        DELETE_BRANCH: 'DeleteBranch',
        UPDATE_PROJECT_SETTINGS: 'UpdateProjectSettings',
        POST_SAVE_PROJECT: 'SaveAs',
        GET_PROJECT_SHARING_INFO: 'GetProjectSharingInfo',
        POST_SEND_PROJECT: 'SendProject',
        GET_CATALOG: 'GetCatalog',
        GET_CATALOG_NAME_AVAILABLE: 'CatalogNameAvailable',
        PATCH_BATCH_UPDATE_CABLE_LENGTHS: 'BatchUpdateCableLengths',
        POST_LOAD_SHAPE_DETAILS: 'UploadLoadShape',
        DELETE_LOAD_SHAPE_DETAILS: 'DeleteLoadShape',
        POST_DISPATCH_SHAPE: 'UploadDispatchShape',
        DELETE_DISPATCH_SHAPE: 'DeleteDispatchShape',
        GET_DISPATCH_SHAPE_CHART_DATA: 'GetDispatchShapeChartData',
        POST_SOLAR_PERFORMANCE: 'SimulateSolarPvPerformance',
        GET_SOLAR_PERFORMANCE_CHART_DATA: 'GetSolarPvPerformanceChartData',
        POST_WIND_PERFORMANCE: 'SimulateWindPerformance',
        GET_WIND_PERFORMANCE_CHART_DATA: 'GetWindPerformanceChartData',
        DELETE_ANALYSIS: 'DeleteAnalysis',
        GET_ANALYSIS: 'GetAnalysis',
        GET_COMPLETED_ANALYSES: 'GetAnalyses',
        POST_RENAME_ANALYSIS: 'RenameAnalysis',
        GET_AVAILABLE_ANALYSES: 'GetOneLineAnalyticProviderAnalytics',
        POST_RUN_ANALYSIS: 'RunAnalysis',
        GET_ANALYSIS_REPORT: 'AnalysisReport',
        UPDATE_ANALYSIS_SETTINGS: 'UpdateAnalysisSettings',
        GET_DOWNLOAD_ANALYSIS_RESULTS: 'DownloadAnalysisResults',
        ADD_DEVICE: 'AddDevice',
        UPDATE_DEVICE: 'UpdateDevice',
        UPDATE_DEVICE_STATE: 'UpdateDeviceState',
        DELETE_DEVICE: 'DeleteDevice',
        GET_IMPORTED_GIS_PROJECT_PROFILES: 'GetImportedGisProjectProfiles',
        GET_IMPORTED_GIS_PROJECT_PROFILE: 'GetImportedGisProjectProfile',
        DELETE_IMPORTED_GIS_PROJECT_PROFILE: 'DeleteImportedGisProjectProfile',
        GET_IMPORTABLE_GIS_PROJECTS: 'GetImportableGisProjects',
        GET_IMPORTABLE_GIS_PROJECT_RESULTS: 'GetImportableGisProjectResults',
        GET_IMPORTABLE_GIS_PROJECT_RESULT_DATA: 'GetImportableGisProjectResultData',
        GET_IMPORT_GIS_DISPATCH_DATA: 'GetImportableGisProjectResultDispatchData',
        SAVE_IMPORTABLE_GIS_PROJECT_RESULTS_PROFILE: 'SaveImportableGisProjectResultsProfile'
    },

    PROJECT_TYPES: {
        INDUSTRIAL_BALANCED: 'INDUSTRIAL_BALANCED'
    },

    PROJECT_TYPE_IDS: {
        INDUSTRIAL_BALANCED: 9
    },

    PROJECT_TYPE_LABELS: {
        INDUSTRIAL_BALANCED: 'Industrial Balanced'
    },

    PROJECT_FORMATS: {
        ANSI: 'ANSI',
        IEC: 'IEC'
    },

    UNIT_SYSTEMS: {
        IMPERIAL: 'Imperial',
        METRIC: 'Metric'
    },

    LENGTH_LABELS: {
        FEET: 'Feet',
        METERS: 'Meters'
    },

    ABBREVIATED_LENGTH_LABELS: {
        FT: 'ft',
        M: 'm'
    },

    UNIT_LENGTHS: {
        THOUSAND_FEET: '1000 ft',
        KM: 'km'
    },

    TEMPERATURE_SCALES: {
        FAHRENHEIT: 'Fahrenheit',
        CELSIUS: 'Celsius',
    },

    TEMPERATURE_SYMBOLS: {
        FAHRENHEIT: `\u2109`,
        CELSIUS: `\u2103`
    },

    BRANCH_SIDE: {
        INCOMING: 'Incoming',
        OUTGOING: 'Outgoing'
    },

    BRANCH_SIDES: {
        FROM: 'FROM',
        TO: 'TO'
    },

    CURRENCY_IDS: {
        USD: 'USD',
        AUD: 'AUD',
        CAD: 'CAD',
        EUR: 'EUR',
        GBP: 'GBP',
        SEK: 'SEK',
        ZAR: 'ZAR'
    },

    CURRENCY_LABELS: {
        USD: 'USD ($)',
        AUD: 'AUD ($)',
        CAD: 'CAD ($)',
        EUR: 'EUR (€)',
        GBP: 'GBP (£)',
        SEK: 'SEK (kr)',
        ZAR: 'ZAR (R)'
    },

    // Short-circuit constants
    SHORT_CIRCUIT: {
        FAULTS: {
            THREE_PHASE_BOLTED: { TEXT: '3Phase Bolted (LLL-G)', VALUE: '3PB' },
            THREE_PHASE_UNGROUNDED: { TEXT: '3Phase Ungrnd (LLL)', VALUE: '3PU' },
            THREE_PHASE_MESHED: { TEXT: '3Phase Meshed (LLL)', VALUE: '3PM' },
            TWO_LINE_GROUND: { TEXT: '2 Line-Ground (LL-G)', VALUE: 'LLG' },
            LINE_LINE: { TEXT: 'Line-to-Line (LL)', VALUE: 'LL' },
            LINE_TO_GROUND: { TEXT: 'Line-to-Ground (SLG)', VALUE: 'SLG' }
        },
        PHASES: {
            AB: { TEXT: 'A-B', VALUE: 'AB' },
            BC: { TEXT: 'B-C', VALUE: 'BC' },
            CA: { TEXT: 'C-A', VALUE: 'CA' },
            A: { TEXT: 'A', VALUE: 'A' },
            B: { TEXT: 'B', VALUE: 'B' },
            C: { TEXT: 'C', VALUE: 'C' }
        }
    },

    // Map constants
    EARTH_RADIUS_KM: 6371,
    KM_TO_MILES_FACTOR: 0.621371,
    FT_TO_M_FACTOR: .3048,
    THOUSAND_FT_TO_KM_FACTOR: .3048,
    MILES_TO_FT_FACTOR: 5280,
    OHMS_PER_THOUSAND_FT_TO_OHMS_PER_KM_FACTOR: 3.28084,

    CONNECTIONS: {
        DELTA: { label: 'Delta', value: 1 },
        WYE_UNGROUNDED: { label: 'Wye-Ungrounded', value: 2 },
        WYE_SOLIDLY: { label: 'Wye-Solidly', value: 3 },
        WYE_IMPEDANCE: { label: 'Wye-Impedance', value: 4 }
    },

    CABLE_MATERIAL: {
        COPPER: { label: 'Copper', value: 1 },
        ALUMINUM: { label: 'Aluminum', value: 2 }
    },

    GRAPH_MODIFICATIONS: {
        NOT_MODIFIED: 'NotModified',
        EDITED_OR_RESIZED_ONLY: 'ElementsEditedOrResizedOnly',
        ELEMENTS_ADDED_OR_REMOVED: 'ElementsAddedOrRemoved'
    },

    MINIMUM_VOLTAGE_FOR_HIGH_VOLTAGE_BREAKER: 5000,

    ZERO_VOLTAGE_COLOR: '#a0a0a0',

    DEFAULT_NONZERO_VOLTAGE_COLOR: '#000000',
    FAULTING_BUS_COLOR: '#ff0000',

    POLYLINE_COLORS: {
        TRANS2W: 'rgba(252, 196, 43, .8)',
        CABLE: 'rgba(217, 125, 4, .8)',
        DCON: 'rgba(24, 27, 31, .9)'
    },

    SELECTED_POLYLINE_OPTIONS: {
        strokeColor: 'rgb(2, 60, 189)',
        strokeWeight: 8
    },

    MONTHS: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    EQUIPMENT_CATEGORIES: {
        NODE: 'NODE',
        BRANCH: 'BRANCH',
        DEVICE: 'DEVICE'
    },

    REQUEST_NAMES: {
        GET_ALL: 'getAll',
        POST_NODE: 'postNode',
        PATCH_NODE: 'patchNode',
        DELETE_NODE: 'deleteNode',
        POST_BRANCH: 'postBranch',
        PATCH_BRANCH: 'patchBranch',
        DELETE_BRANCH: 'deleteBranch',
        PATCH_SETTINGS: 'patchSettings',
        POST_SAVE_PROJECT: 'postSaveProject',
        POST_SEND_PROJECT: 'postSendProject'
    },

    ELEMENT_CATEGORIES: {
        NODE: 'node',
        BRANCH: 'branch',
        DEVICE: 'device'
    },

    NODE_TYPES: {
        UTILITY: 'UTILITY',
        BUSBAR: 'BUSBAR',
        LOAD: 'LOAD',
        EV: 'EV',  // Duck-typed LOAD
        SOLAR: 'SOLAR',
        WIND: 'WIND',
        GENERATOR: 'GENERATOR',
        STORAGE: 'STORAGE'
    },

    BRANCH_TYPES: {
        CABLE: 'CABLE',
        DCON: 'DCON',
        TRANS2W: 'TRANS2W'
    },

    ACTION_TYPES: {
        ADD_BRANCH: 'ADD_BRANCH',
        SETTINGS: 'SETTINGS',
        POWER_FLOW_ANALYSIS_SETTINGS: 'POWER_FLOW_ANALYSIS_SETTINGS',
        ANALYSES: 'ANALYSES'
    },

    LABELS: {
        // Nodes
        UTILITY: 'Utility',
        BUSBAR: 'Busbar',
        LOAD: 'Load',
        SOLAR: 'Solar',
        WIND: 'Wind',
        STORAGE: 'Storage',
        GENERATOR: 'Generator',

        // Edges
        DCON: 'Direct Connection',
        CABLE: 'Cable',
        TRANS2W: 'Transformer',

        // Devices
        BREAKER: 'Breaker',
        FUSE: 'Fuse',
        RELAY: 'Relay',
        SWITCH: 'Switch',

        // Actions
        ADD_BRANCH: 'Add Branch',
        SETTINGS: 'Project and Annotation Settings',
        SAVE_PROJECT: 'Save Project As',
        POWER_FLOW_ANALYSIS_SETTINGS: 'Power Flow Analysis Settings',
        ANALYSES: 'Analyze Project'
    },

    MODALS: {
        // Nodes
        UTILITY: 'UTILITY',
        BUSBAR: 'BUSBAR',
        LOAD: 'LOAD',
        SOLAR: 'SOLAR',
        WIND: 'WIND',
        GENERATOR: 'GENERATOR',
        STORAGE: 'STORAGE',

        // Edges
        DCON: 'DCON',
        CABLE: 'CABLE',
        TRANS2W: 'TRANS2W',

        // Devices
        BREAKER: 'BREAKER',
        FUSE: 'FUSE',
        RELAY: 'RELAY',
        SWITCH: 'SWITCH',

        // Actions
        ADD_BRANCH: 'ADD_BRANCH',
        SETTINGS: 'SETTINGS',
        POWER_FLOW_ANALYSIS_SETTINGS: 'POWER_FLOW_ANALYSIS_SETTINGS',
        SAVE_PROJECT: 'SAVE_PROJECT',
        SEND_COPY_PROJECT: 'SEND_COPY_PROJECT',
        ANALYSES: 'ANALYSES',
        ANALYSES_NEW: 'ANALYSES_NEW',
        ANALYSIS_DETAILS: 'ANALYSIS_DETAILS',
        ANALYSES_OPTIONS: 'ANALYSES_OPTIONS',
        TOPOGRAPHY: 'TOPOGRAPHY',
        IMPORT_GIS_HOME: 'IMPORT_GIS_HOME',
        IMPORTABLE_GIS_PROJECTS: 'IMPORTABLE_GIS_PROJECTS',
        IMPORTABLE_GIS_RESULTS: 'IMPORTABLE_GIS_RESULTS',
        IMPORTABLE_GIS_RESULT: 'IMPORTABLE_GIS_RESULT',
        IMPORT_GIS_DATE: 'IMPORT_GIS_DATE',
        IMPORT_GIS_PROFILE_NAME: 'IMPORT_GIS_PROFILE_NAME',
        IMPORT_GIS_VIEW_PROFILE: 'IMPORT_GIS_VIEW_PROFILE',
    },

    TEMPLATE_NAMES: {

        // Nodes
        UTILITY: 'utility-node-template',
        BUSBAR: 'busbar-node-template',
        LOAD: 'load-node-template',
        SOLAR: 'solar-node-template',
        WIND: 'wind-node-template',
        GENERATOR: 'generator-node-template',
        STORAGE: 'storage-node-template',

        // Edges
        DCON: 'direct-connection-branch-template',
        CABLE: 'cable-branch-template',
        TRANS2W: 'two-winding-transformer-branch-template',

        // Devices
        BREAKER: 'breaker-device-template',
        FUSE: 'fuse-device-template',
        RELAY: 'relay-device-template',
        SWITCH: 'switch-device-template',

        // Actions
        ADD_BRANCH: 'add-branch-action-template',
        SETTINGS: 'project-settings-action-template',
        POWER_FLOW_ANALYSIS_SETTINGS: 'power-flow-analysis-settings-template',
        SAVE_PROJECT: 'save-project-action-template',
        SEND_COPY_PROJECT: 'send-copy-project-action-template',
        LOCATOR_TABLE: 'locator-table-template',
        ANALYSES_HOME: 'analyses-home-template',
        ANALYSES_NEW: 'analyses-new-template',
        ANALYSIS_DETAILS: 'analysis-details-template',
        ANALYSES_OPTIONS: 'analyses-options-template',
        TOPOGRAPHY: 'map-template',
        IMPORT_GIS_HOME_TEMPLATE: 'import-gis-home-template',
        IMPORTABLE_GIS_PROJECTS_TEMPLATE: 'importable-gis-projects-template',
        IMPORTABLE_GIS_PROJECTS: 'importable-gis-results-template',
        IMPORTABLE_GIS_RESULT_TEMPLATE: 'importable-gis-result-template',
        IMPORT_GIS_DATE: 'import-gis-date-template',
        IMPORT_GIS_PROFILE_NAME: 'import-gis-profile-name-template',
        IMPORT_GIS_VIEW_PROFILE_TEMPLATE: 'import-gis-view-profile-template'

    },

    CATALOG_TABLE_TEMPLATE_NAMES: {

        // Nodes
        UTILITY: 'utility-catalog-table-template',
        BUSBAR: 'busbar-catalog-table-template',
        LOAD: 'load-catalog-table-template',
        SOLAR: 'solar-catalog-table-template',
        WIND: 'wind-catalog-table-template',
        GENERATOR: 'generator-catalog-table-template',
        STORAGE: 'storage-catalog-table-template',

        // Devices
        BREAKER: 'breaker-catalog-table-template',
        FUSE: 'fuse-catalog-table-template',
        RELAY: 'relay-catalog-table-template',
        SWITCH: 'switch-catalog-table-template'
    },

    MODAL_CATEGORIES: {
        ACTION: 'action',
        NODE: 'node',
        BRANCH: 'branch',
        DEVICE: 'device'
    },

    // The main modal MUST be listed first
    MODALS_BY_TYPE: {
        UTILITY: ['utility-modal', 'catalog-modal', 'save-catalog-modal'],
        BUSBAR: ['busbar-modal', 'catalog-modal', 'save-catalog-modal'],
        LOAD: ['load-modal', 'catalog-modal', 'enter-load-shape', 'save-catalog-modal', 'nrel-chart-full', 'nrel-load-shape'],
        SOLAR: ['solar-modal', 'catalog-modal', 'save-catalog-modal', 'solar-settings-full-chart'],
        WIND: ['wind-modal', 'catalog-modal', 'save-catalog-modal', 'wind-settings-full-chart'],
        GENERATOR: ['generator-modal', 'catalog-modal', 'save-catalog-modal', 'enter-dispatch-shape', 'dispatch-chart-full'],
        STORAGE: ['storage-modal', 'catalog-modal', 'save-catalog-modal'],
        ADD_BRANCH: ['add-branch-modal'],
        DCON: ['dcon-modal', 'target-modal'],
        CABLE: ['cable-modal', 'catalog-modal', 'save-catalog-modal', 'cable-parallel', 'from-to-connection-modal'],
        TRANS2W: ['transformer-modal', 'catalog-modal', 'save-catalog-modal', 'from-to-connection-modal'],
        BREAKER: ['breaker-modal', 'breaker-catalog-modal', 'breaker-save-catalog-modal'],
        FUSE: ['fuse-modal', 'fuse-catalog-modal', 'fuse-save-catalog-modal'],
        RELAY: ['relay-modal', 'relay-catalog-modal', 'relay-save-catalog-modal'],
        SWITCH: ['switch-modal', 'switch-catalog-modal', 'switch-save-catalog-modal'],
        SETTINGS: ['settings-modal'],
        SAVE_PROJECT: ['save-project-modal'],
        SEND_COPY_PROJECT: ['send-copy-project-modal'],
        ANALYSES: ['analyses-home-modal'],
        ANALYSES_NEW: ['analyses-new-modal'],
        ANALYSIS_DETAILS: ['analysis-details-modal'],
        ANALYSES_OPTIONS: ['power-flow-options-modal'],  // TODO: Make dynamic for different analytic types
        POWER_FLOW_ANALYSIS_SETTINGS: ['power-flow-analysis-settings-modal'],
        TOPOGRAPHY: ['topography-modal'],
        IMPORT_GIS_HOME: ['import-gis-home-modal'],
        IMPORTABLE_GIS_PROJECTS: ['importable-gis-projects-modal'],
        IMPORTABLE_GIS_RESULTS: ['importable-gis-projects-results'],
        IMPORTABLE_GIS_RESULT: ['importable-gis-projects-result-options'],
        IMPORT_GIS_DATE: ['import-gis-date-modal'],
        IMPORT_GIS_PROFILE_NAME: ['import-gis-profile-name-modal'],
        IMPORT_GIS_VIEW_PROFILE: ['import-gis-view-profile-modal']
    },

    // The main form MUST be listed first
    MODAL_FORM_IDS: {
        UTILITY: ['utility-main-form', 'utility-catalog-form', 'utility-save-catalog-form'],
        BUSBAR: ['busbar-main-form', 'busbar-catalog-form', 'busbar-save-catalog-form'],
        LOAD: ['load-main-form', 'load-catalog-form', 'load-save-catalog-form', 'enter-load-shape-form', 'nrel-chart-full-form', 'nrel-load-shape-form'],
        SOLAR: ['solar-main-form', 'solar-catalog-form', 'solar-save-catalog-form', 'solar-settings-full-chart-form', 'solar-settings-full-chart'],
        WIND: ['wind-main-form', 'wind-catalog-form', 'wind-save-catalog-form', 'wind-settings-full-chart-form', 'wind-settings-full-chart'],
        GENERATOR: ['generator-main-form', 'generator-catalog-form', 'generator-save-catalog-form', 'enter-dispatch-shape-form', 'dispatch-chart-full-form'],
        STORAGE: ['storage-main-form', 'storage-catalog-form', 'storage-save-catalog-form'],
        ADD_BRANCH: ['add-branch-main-form'],
        DCON: ['direct-connection-main-form', 'direct-connection-breaker-switch'],
        CABLE: ['cable-main-form', 'cable-catalog-form', 'save-catalog-form'],
        TRANS2W: ['transformer-main-form', 'transformer-catalog-form', 'transformer-save-catalog-form'],
        BREAKER: ['breaker-main-form', 'breaker-catalog-form', 'breaker-save-catalog-form'],
        FUSE: ['fuse-main-form', 'fuse-catalog-form', 'fuse-save-catalog-form'],
        RELAY: ['relay-main-form', 'relay-catalog-form', 'relay-save-catalog-form'],
        SWITCH: ['switch-main-form', 'switch-catalog-form', 'switch-save-catalog-form'],
        SETTINGS: ['settings-main-form'],
        SAVE_PROJECT: ['save-project-main-form'],
        SEND_COPY_PROJECT: ['send-copy-project-main-form'],
        ANALYSES: ['analyses-main-form'],
        ANALYSES_OPTIONS: ['power-flow-options-form'],
        POWER_FLOW_ANALYSIS_SETTINGS: ['power-flow-analysis-settings-form'],
        TOPOGRAPHY: ['topography-modal-form'],
        IMPORT_GIS_HOME: ['import-gis-home-form'],
        IMPORTABLE_GIS_PROJECTS: ['importable-gis-projects-form'],
        IMPORTABLE_GIS_RESULTS: ['importable-gis-projects-results-form'],
        IMPORTABLE_GIS_RESULT: ['importable-gis-projects-results-options-form'],
        IMPORT_GIS_DATE: ['import-gis-date-form'],
        IMPORT_GIS_PROFILE_NAME: ['import-gis-profile-name-form'],
        IMPORT_GIS_VIEW_PROFILE: ['import-gis-view-profile-form-modal']
    },

    // Protection devices
    DEVICE_TYPES: {
        BREAKER: 'BREAKER',
        FUSE: 'FUSE',
        RELAY: 'RELAY',
        SWITCH: 'SWITCH'
    },

    DEVICE_LABELS: {
        BREAKER: 'Breaker',
        FUSE: 'Fuse',
        RELAY: 'Relay',
        SWITCH: 'Switch'
    },

    DEVICE_STATES: {
        OPEN: 'OPEN',
        CLOSE: 'CLOSE'
    },

    DEVICE_STATE_LABELS: {
        OPEN: 'Open',
        CLOSE: 'Closed'
    },

    // For radio and select groups
    FIELD_NAMES: {
        CONNECTION: 'Connection',
        GENERATOR_CONNECTION: 'Connection',
        FUEL_TYPE: 'FuelType',
        STORAGE_CONNECTION: 'Connection',
        LOAD_MODEL: 'LoadModel',
        GENERATOR_POWER_MODEL: 'GeneratorModel',
        POWER_FACTOR_TYPE: 'PowerFactorType',
        RATED_POWER_UNITS: 'RatedPowerUnits',
        CABLE_MATERIAL: 'CableMaterial',
        INSULATION_TYPE: 'InsulationType',
        PRIMARY_WINDING_TYPE: 'PrimaryWindingType',
        SECONDARY_WINDING_TYPE: 'SecondaryWindingType',
        TAP_SIDE: 'TapSide',
        EXISTING: 'Existing',
        SOLAR_PANEL_TYPE: 'PanelType',
        SOLAR_ARRAY_TYPE: 'ArrayType',
        AZIMUTH: 'Azimuth',
        STORAGE_MODEL: 'StorageModel',
        STORAGE_STATE: 'StorageState',
        WTG_TYPE: 'WTGType',
        TURBINE_MODEL: 'TurbineModel',
        CONTROL_MODE: 'ControlMode'
    },

    // Units and formats
    UNITS: {
        V: 'V',
        kV: 'kV',
        A: 'A',
        kA: 'kA',
        kVA: 'kVA',
        MVA: 'MVA',
        kW: 'kW',
        kWh: 'kWh',
        kVAR: 'kVAR',
        MVAR: 'MVAR',
        DOLLARS: '$',
        BRITISH_POUNDS: '£',
        EUROS: '€',
        RAND: 'R',
        SEK: 'kr',
        DEGREES: `\u00B0`,  // For angles, not temperature
        CELSIUS: `\u2103`,
        FAHRENHEIT: `\u2109`,
        YEARS: 'Years',
        PU: 'PU',
        FEET: 'Ft',
        PERCENT: '%',
        AWG_KCMIL: 'AWG/kcmil',
        OHMS: 'Ω',
        OHMS_PER_THOUSAND_FEET: 'Ω/1000Ft',
        HZ: 'Hz'
    },

    FORMATS: {
        V: '0,0',
        kV: '0,0.[000]',
        A: '0,0',
        kA: '0,0.[000]',
        kVA: '0,0.[000]',
        MVA: '0,0.[000000]',
        LAT_LNG: '0.[000000]',
        N0: '0,0',
        N01: '0,0.[0]',
        N02: '0,0.[00]',
        N03: '0,0.[000]',
        N04: '0,0.[0000]',
        U0: '0',
        U1: '0.[0]',
        U2: '0.[00]',
        U3: '0.[000]',
        U4: '0.[0000]',
        U5: '0.[00000]',
        N1: '0,0.0',
        N2: '0,0.00',
        N3: '0,0.000',
        N4: '0,0.0000'
    },

    UNIT_TYPES: {
        CAPACITY: 'CAPACITY',
        CURRENT: 'CURRENT',
        VOLTAGE: 'VOLTAGE'
    },

    CAPACITY_UNIT_LABELS: {
        kVA: 'kilovolt-amps (kVA)',
        MVA: 'megavolt-amps (MVA)'
    },

    CURRENT_UNIT_LABELS: {
        A: 'amps (A)',
        kA: 'kiloamps (kA)'
    },

    VOLTAGE_UNIT_LABELS: {
        V: 'volts (V)',
        kV: 'kilovolts (kV)'
    },

    TOGGLE_CONTROL_LABELS: {
        ON: 'on',
        OFF: 'off'
    },

    UNIT_FIELDS: {
        UTILITY: {
            VOLTAGE: [
                { formField: 'voltage', dataField: 'Details.Voltage' },
                { formField: 'operating-voltage', dataField: 'Details.OperatingVoltage' }
            ],
            CAPACITY: [
                { formField: 'three-phase-short-circuit', dataField: 'Details.ThreePhaseShortCircuit' },
                { formField: 'line-ground-short-circuit', dataField: 'Details.LgShortCircuit' }
            ]
        },
        BUSBAR: {
            VOLTAGE: [
                { formField: 'nominal-voltage', dataField: 'LineToLineVoltage' }
            ],
            CURRENT: [
                { formField: 'amp-rating', dataField: 'Details.AmpRating' }
            ]
        },
        LOAD: {
            VOLTAGE: [
                { formField: 'nominal-voltage', dataField: 'LineToLineVoltage' },
                { formField: 'rated-voltage', dataField: 'Details.RatedVoltage' }
            ]
        },
        SOLAR: {
            VOLTAGE: [
                { formField: 'voltage', dataField: 'Details.Voltage' }
            ]
        },
        WIND: {
            VOLTAGE: [
                { formField: 'voltage', dataField: 'Details.Voltage' }
            ]
        },
        GENERATOR: {
            VOLTAGE: [
                { formField: 'voltage', dataField: 'LineToLineVoltage' }
            ]
        },
        STORAGE: {
            VOLTAGE: [
                { formField: 'nominal-voltage', dataField: 'LineToLineVoltage' },
                { formField: 'rated-voltage', dataField: 'Details.RatedVoltage' }
            ]
        },
        TRANS2W: {
            VOLTAGE: [
                { formField: 'primary-rated-voltage', dataField: 'Details.PrimarySideVoltage' },
                { formField: 'secondary-rated-voltage', dataField: 'Details.SecondarySideVoltage' }
            ],
            CAPACITY: [
                { formField: 'rating', dataField: 'Details.Rating' }
            ]
        },
        CABLE: {
            VOLTAGE: [
                { formField: 'voltage-rating', dataField: 'Details.VoltageRating' }
            ],
            CURRENT: [
                { formField: 'ampacity', dataField: 'Details.Ampacity' }
            ]
        },
        BREAKER: {
            VOLTAGE: [
                { formField: 'voltage-rating', dataField: 'Details.VoltageRating' }
            ],
            CURRENT: [
                { formField: 'amp-rating', dataField: 'Details.AmpRating' },
                { formField: 'interrupt-rating', dataField: 'Details.InterruptRating' }
            ]
        },
        SWITCH: {
            VOLTAGE: [
                { formField: 'voltage-rating', dataField: 'Details.VoltageRating' }
            ],
            CURRENT: [
                { formField: 'amp-rating', dataField: 'Details.AmpRating' },
                { formField: 'interrupt-rating', dataField: 'Details.InterruptRating' }
            ]
        },
        FUSE: {
            VOLTAGE: [
                { formField: 'voltage-rating', dataField: 'Details.VoltageRating' }
            ],
            CURRENT: [
                { formField: 'amp-rating', dataField: 'Details.AmpRating' },
                { formField: 'interrupt-rating', dataField: 'Details.InterruptRating' }
            ]
        }
    },

    SELECTORS: {
      OVERVIEW_COMPONENT: '#overview-component',
      OVERVIEW_GRAPH_COMPONENT: '#overview-graph-component',
      GRAPH_COMPONENT: 'graph-component',
      ANALYSIS_GRAPH_COMPONENT: 'analysis-graph-component',
      GRAPH_OVERVIEW_COMPONENT: '#graph-overview-component',
      MODAL_BACKDROP: '.modal-backdrop',
      DATA_NODE_TYPE: 'data-node-type',
      DATA_BRANCH_TYPE: 'data-branch-type',
      DATA_NODE_ID: 'data-node-id',
      SAVE_BUTTON: '.save-button',
      CLOSE_BUTTON: '.destroy-button',
      DESTROY_BUTTON: 'destroy-button',
      PROJECT_SETTINGS_NAV_BUTTON: '.project-settings-nav button',

      // Toolbar buttons
      ZOOM_IN_ICON: 'zoom-in-icon',
      ZOOM_OUT_ICON: 'zoom-out-icon',
      FIT_GRAPH_BOUNDS_ICON: 'fit-graph-bounds-icon',
      ZOOM_IN_MAP: 'zoom-in-map',
      ZOOM_OUT_MAP: 'zoom-out-map',
      CENTER_VIEW_MAP: 'center-view-map',
      ZOOM_ORIGINAL_SIZE_ICON: 'zoom-original-size-icon',
      SETTINGS_BUTTON: 'settings-button',
      SAVE_PROJECT_BUTTON: 'save-project-button',
      SEND_COPY_PROJECT_BUTTON: 'send-copy-project-button',
      PRINT_TOOLBAR_BUTTON: 'print-toolbar-button',
      AERIAL_BUTTON: 'aerial-button',
      MAP_BUTTON: 'map-button',
      LOCATOR_BUTTON: 'locator-button',
      PROPERTIES_BUTTON: 'properties-button',
      ANALYZE_PROJECT_BUTTON: 'analyze-project-button',
      ANALYSIS_DETAILS_CONTAINER: 'analysis-details',
      BACK_TO_ANALYSE_PROJECT_BUTTON: 'back-to-analyze-project',
      SUBANALYSIS_BUTTON: (index) => `subanalysis-${index}`,
      CLOSE_AERIAL_BUTTON: 'close-aerial-overlay',
      IMPORT_GIS_RESULT_BUTTON: 'import-gis-result-button',
      MAP_ZOOM_CONTROLS: 'map-zoom-controls',
      GRAPH_ZOOM_CONTROLS: 'graph-zoom-controls',
      ADD_PROJECT_ELEMENTS_CONTAINER: 'add-project-elements-container',


      // Action buttons
      ADD_NODE_BUTTON: 'add-node-button',
      ADD_BRANCH_BUTTON: 'add-branch-button',
      ADD_CONNECTION_TABLE: '.addconn-table',
      LI_NOT_SELECTED_ACTIVE: '#add-branch-modal li:not(.selected-active)',
      SELECTED_ACTIVE: 'selected-active',

      // Node modals
      NEW_DEFAULT_CATALOG_ITEM_ID: 'new-default-catalog-item-id',

      // Connection modal
      RESULT_FROM: 'result-from',
      RESULT_FROM_LI: '#result-from li',
      CONN_INPUT_FROM: 'conn-input-from',
      CONN_FROM: 'conn-from',
      CLR_FROM: 'clr-from',
      RESULT_TO: 'result-to',
      RESULT_TO_LI: '#result-to li',
      CONN_INPUT_TO: 'conn-input-to',
      CONN_TO: 'conn-to',
      CLR_TO: 'clr-to',

      // Locator overlay
      LOCATOR_OVERLAY: '#locator-overlay',
      LOCATOR_MAIN: '#locator-main',
      LOCATOR_MAIN_DATATABLES_SCROLLBODY: '#locator-main tbody',
      LOCATOR_TABLE: '#locator-table',
      LOCATOR_TABLE_TBODY_TR: '#locator-table tbody tr',

      // Properties overlay
      PROPERTIES_OVERLAY: '#properties-overlay',
      PROPERTIES_MAIN: '#properties-main',
      PROPERTIES_TABLE: '#properties-table',

      // Aerial Overlay
      OVERLAY_HEADER: '.overlay-header',

      // Catalog modals
      SELECT_CATALOG_BUTTON: '.select-catalog-button',
      SELECT_AND_MAKE_DEFAULT_BUTTON: '.select-and-make-default-button',
      CLOSE_CATALOG_BUTTON: '.destroy-catalog-button',
      SAVE_AND_CATALOG_BUTTON: '.save-and-catalog-button',
      SAVE_CATALOG_MODAL: '#save-catalog-modal',
      SAVE_AND_MAKE_DEFAULT_BUTTON: '#save-catalog-modal .save-and-make-default-button',
      SAVE_WITHOUT_DEFAULT_BUTTON: '#save-catalog-modal .save-without-default-button',
      CATALOG_MODAL: '#catalog-modal',
      CATALOG_MODAL_CLASS: '.catalog-modal',
      CATALOG_BUTTON: '.catalog-button',
      CATALOG_TABLE: '#catalog-table',
      CATALOG_TABLE_CONTAINER: '#catalog-modal .catalog-table-container',
      CATALOG_TABLE_WRAPPER: '#catalog-table_wrapper',
      CATALOG_RADIAL: 'catalog-radial',
      CATALOG_RADIAL_1: '#catalog-radial-1',
      CATALOG_RADIAL_2: '#catalog-radial-2',
      CATALOG_RADIAL_3: '#catalog-radial-3',
      UTILITY_CATALOG_TABLE_TEMPLATE: '#utility-catalog-table-template',
      BUSBAR_CATALOG_TABLE_TEMPLATE: '#busbar-catalog-table-template',
      LOAD_CATALOG_TABLE_TEMPLATE: '#load-catalog-table-template',
      CABLE_CATALOG_TABLE_TEMPLATE: '#cable-catalog-table-template',
      TRANS2W_CATALOG_TABLE_TEMPLATE: '#two-winding-transformer-catalog-table-template',
      SOLAR_CATALOG_TABLE_TEMPLATE: '#solar-catalog-table-template',
      WIND_CATALOG_TABLE_TEMPLATE: '#wind-catalog-table-template',
      GENERATOR_CATALOG_TABLE_TEMPLATE: '#generator-catalog-table-template',
      STORAGE_CATALOG_TABLE_TEMPLATE: '#storage-catalog-table-template',
      BREAKER_CATALOG_TABLE_TEMPLATE: '#breaker-catalog-table-template',
      FUSE_CATALOG_TABLE_TEMPLATE: '#fuse-catalog-table-template',
      RELAY_CATALOG_TABLE_TEMPLATE: '#relay-catalog-table-template',
      SWITCH_CATALOG_TABLE_TEMPLATE: '#switch-catalog-table-template',
      ERROR_NOTIFICATION_OK_BUTTON: '.noty_buttons .btn',
      COLUMN_HEADERS: '.dataTables_scrollHead thead th',
      FIRST_ROW_CELLS: 'tbody tr:first-child td',
      SELECTED_ROW_CELLS: 'tr.selected td',
      SELECTED_ROW_CATALOG_NAME: 'tr.selected td:nth-child(2)',
      DATATABLES_SCROLL: '.dataTables_scroll',
      BACK_TO_MY_PROJECTS_BUTTON: 'back-to-projects',
      XENDEE_LOGO_IMG: 'xendee-logo-img',

      // Device catalog modals
      DEVICE_MODAL: '.device-modal',
      DEVICE_CATALOG_MODAL: '.device-catalog-modal',
      DEVICE_CATALOG_TABLE: '#device-catalog-table',
      DEVICE_CATALOG_RADIAL_1: '#device-catalog-radial-1',
      DEVICE_CATALOG_RADIAL_2: '#device-catalog-radial-2',
      DEVICE_CATALOG_RADIAL_3: '#device-catalog-radial-3',
      DEVICE_CATALOG_BUTTON: '.device-catalog-button',
      DEVICE_CATALOG_TABLE_WRAPPER: '#device-catalog-table_wrapper',
      DEVICE_CATALOG_TABLE_CONTAINER: '.device-catalog-modal .device-catalog-table-container',
      DEVICE_SELECT_CATALOG_BUTTON: '.device-select-catalog-button',
      DEVICE_SELECT_AND_MAKE_DEFAULT_BUTTON: '.device-select-and-make-default-button',
      DEVICE_CLOSE_CATALOG_BUTTON: '.device-destroy-catalog-button',
      DEVICE_SAVE_AND_CATALOG_BUTTON: '.device-save-and-catalog-button',
      DEVICE_SAVE_CATALOG_MODAL: '.device-save-catalog-modal',
      DEVICE_SAVE_AND_MAKE_DEFAULT_BUTTON: '.device-save-and-make-default-button',
      DEVICE_SAVE_WITHOUT_DEFAULT_BUTTON: '.device-save-without-default-button',

      // Load shape modals
      ENTER_LOAD_SHAPE: 'enter-load-shape',
      ENTER_LOAD_SHAPE_FORM: 'enter-load-shape-form',
      DELETE_LOAD_SHAPE_BUTTON: 'delete-load-shape-button',
      CANCEL_LOAD_SHAPE_BUTTON: 'cancel-load-shape-button',
      UPLOAD_LOAD_SHAPE_BUTTON: 'upload-load-shape-button',
      IMPORTING_LOAD_SHAPE_CANCEL_BUTTON: 'importing-load-shape-cancel-button',
      LOAD_UPLOAD_FILE: 'load-upload-file',
      LOAD_SHAPE_START_DATE_WRAPPER: '#load-shape-start-date-wrapper',
      LOAD_SHAPE_UNITS_TIME_WRAPPER: '#load-shape-units-time-wrapper',
      SMALL_PEAK_LOAD_CHART_WRAPPER: '#small-peak-load-chart-wrapper',
      NREL_LOAD_SHAPE_FORM: 'nrel-load-shape-form',
      LOAD_SHAPE_PREVIEW: '#loadShapePreview',
      LOAD_SHAPE_READONLY: 'load-shape-readonly',
      LOAD_SHAPE_START_DATE_READONLY: 'load-shape-start-date-readonly',
      LOAD_SHAPE_UNITS_READONLY: 'load-shape-units-readonly',
      LOAD_SHAPE_TIME_STEP_READONLY: 'load-shape-time-step-readonly',
      RATED_POWER: 'rated-power',
      RATED_POWER_UNITS: 'rated-power-units',
      BUILDING_TYPE: 'BuildingType',
      BUILDING_AGE: 'BuildingAge',
      SELECT_BUILDING_TYPE_AND_AGE: '#selectBuildingTypeAndAge',
      ANNUAL_ELECTRICITY_PURCHASES_MULTIPLIER: 'AnnualElectricityPurchasesMultiplier',
      NREL_ANNUAL_ELECTRICITY_PURCHASES_MULTIPLIER_ENTER_SINGLE: '#NRELAnnualElectricityPurchasesMultiplier-EnterSingle',
      NREL_DATA_IMPORT: 'NRELdata-import',
      NREL_DATA_GO_TO_STEP_1: 'NRELdata-GoToStep1',
      ENERGY_ENTRY_ERRORS: '#energyEntryErrors',
      ENERGY_ENTRY_WARNINGS: '#energyEntryWarnings',

      // Dispatch shape modals
      ENTER_DISPATCH_SHAPE: 'enter-dispatch-shape',
      ENTER_DISPATCH_SHAPE_FORM: 'enter-dispatch-shape-form',
      DELETE_DISPATCH_BUTTON: 'delete-dispatch-button',
      OPEN_DISPATCH_MODAL_BUTTON: 'open-dispatch-modal-button',
      CANCEL_DISPATCH_BUTTON: 'cancel-dispatch-button',
      VIEW_DISPATCH_BUTTON: 'view-dispatch-button',
      UPLOAD_DISPATCH_BUTTON: 'upload-dispatch-button',
      DISPATCH_UPLOAD_FILE: 'dispatch-upload-file',

      // Analysis wizard
      ANALYSES_HOME_MODAL: 'analyses-home-modal',
      COMPLETED_ANALYSES_TABLE: '#completed-analyses-table',
      DELETE_ANALYSIS_LINK: 'delete-analysis-link',
      NEW_ANALYSIS_BUTTON: '#new-analysis-button',
      ANALYSES_NEW_MODAL: '#analyses-new-modal',
      ANALYSES_NEW_PANEL: '#analyses-new-panel',
      STEP_LABELS: '.step-labels',
      ADD_NEW_ANALYSIS_HEADER: '#add-new-analysis-header',
      AVAILABLE_ANALYSES_TABLE: '#available-analyses-table',
      AVAILABLE_ANALYSIS_DETAILS: '#available-analysis-details',
      ANALYSIS_TITLE: 'analysis-title',
      ANALYSIS_DETAILS_MODAL: '#analysis-details-modal',
      SELECT_OPTIONS_BUTTON_WRAPPER: 'select-options-button-wrapper',
      SELECT_OPTIONS_BUTTON: '#select-options-button',
      ANALYSIS_OPTIONS_PANEL: '#analysis-options-panel',
      ANALYSIS_ERROR_PANEL: '#analysis-errors-panel',
      ERROR_GRID: '.error-grid',
      ERROR_GRID_BODY: '.error-grid-body',
      DESTROY_ERROR_GRID_BUTTON: '.destroy-error-grid-button',
      ANALYSES_ERRORS_CONTENT_BUTTON_ROW: '#analyses-errors-content .button-row',
      CANCEL_ANALYSIS_BUTTON: '#cancel-analysis-button',
      POWER_FLOW_OPTIONS_MODAL: '#power-flow-options-modal',
      EQUIPMENT_NAME: 'equipment-name',
      FAULT_LOCATION_NAME: 'fault-location-name',
      STUDY_NAME: 'study-name',
      STUDY_NOTES: 'study-notes',
      STUDY_NAME_CANCEL_BUTTON: '.study-name-cancel-button',
      STUDY_NAME_CANCEL_BUTTON_CLASSNAME: 'study-name-cancel-button',
      STUDY_NAME_CELL: '.study-name-cell',
      STUDY_NAME_TEXT: '.study-name-text',
      STUDY_NAME_TEXT_CLASSNAME: 'study-name-text',
      STUDY_NAME_INPUT_GROUP: '.study-name-input-group',
      STUDY_NAME_INPUT: '.study-name-input',
      STUDY_NAME_INPUT_CLASSNAME: 'study-name-input',
      STUDY_NAME_SUBMIT_BUTTON: '.study-name-submit-button',
      STUDY_NAME_SUBMIT_BUTTON_CLASSNAME: 'study-name-submit-button',
      ANALYSIS_FIXED_XR_NAME: 'analysis-fixed-xr',
      ANALYSIS_FAULT_TYPE_NAME: 'analysis-fault-type',
      ANALYSIS_PHASES_TO_FAULT_CONTAINER: 'analysis-phases-to-fault-container',
      ANALYSIS_PHASES_TO_FAULT_NAME: 'analysis-phases-to-fault',
      ANALYSIS_FAULT_LOCATION_NAME: 'analysis-fault-all-locations',
      ANALYSIS_FAULT_ALL_CONTAINER_CLASSNAME: 'fault-all-buses-container',
      ANALYSIS_FAULT_SINGLE_CONTAINER_CLASSNAME: 'fault-single-bus-container',
      DATA_SAVED_VALUE: 'data-saved-value',
      ANALYSIS_CATALOG_TABLE: '#analysis-catalog-table',
      ANALYSIS_SHORT_CIRCUIT_FAULT_LOCATIONS_TABLE: '#analysis-short-circuit-fault-locations-table',
      FIRST_ROW_FIRST_CELL: 'tbody tr:first-child td:nth-child(1)',
      CANCEL_ANALYSIS_OPTIONS_BUTTON: '.cancel-analysis-options-button',
      DESTROY_ANALYSIS_OPTIONS_BUTTON: '.destroy-analysis-options-button',
      RUN_ANALYSIS_BUTTON: '#run-analysis-button',
      GIS_PROFILE_CHECKBOX: '.gis-profile-checkbox',
      RUN_AGAIN_BUTTON: '#run-again-button',
      GLIDE_BULLETS: '.glide__bullets',
      DATA_ANALYTIC_PROVIDER_ANALYTIC_ID: 'data-analytic-provider-analytic-id',
      SPINNER_OVERLAY: '#spinner-overlay',
      ANALYSIS_SETTINGS_LINK: 'analysis-settings-link',
      ANALYSIS_BACK_TO_ONE_LINE_BUTTON: '.back-to-one-line-button',
      DOWNLOAD_REPORT_LINK: 'download-report-link',
      DOWNLOAD_DATA_LINK: 'download-data-link',
      BACK_ANNOTATION_LINK: 'back-annotation-link',
      POWER_FLOW_ANALYSIS_SETTINGS_MODAL: '#power-flow-analysis-settings-modal',
      DATA_ANALYSIS_ID: 'data-analysis-id',

      // Import GIS Results
      IMPORT_GIS_HOME_MODAL: '#import-gis-home-modal',
      IMPORT_GIS_HOME_PANEL: '#import-gis-home-panel',
      COMPLETED_PROFILES_TABLE: '#completed-profiles-table',
      COMPLETED_PROFILES_TR: '.completed-profiles-tr',
      VIEW_PROFILE_LINK: 'view-profile-link',
      VIEW_PROFILE_PREVIOUS_BUTTON: '#view-profile-previous-button',
      DELETE_PROFILE_LINK: 'delete-profile-link',
      NEW_GIS_IMPORT_BUTTON: '#new-gis-import-button',
      IMPORT_GIS_HOME_NEXT_BUTTON: '#import-gis-home-next-button',
      IMPORT_GIS_NEW_CONTENT: '#import-gis-new-content',
      IMPORT_GIS_NEW_BACK_BUTTON: '#import-gis-new-back-button',
      IMPORTABLE_GIS_PROJECTS_MODAL: '#importable-gis-projects-modal',
      IMPORTABLE_GIS_PROJECTS_TABLE: '#importable-gis-projects-table',
      IMPORTABLE_GIS_PROJECTS_NEW_PANEL: '#importable-gis-projects-new-panel',
      IMPORTABLE_GIS_PROJECTS_OPTIONS_PANEL: '#importable-gis-projects-options-panel',
      IMPORTABLE_GIS_PROJECTS_PANEL: '#importable-gis-projects-panel',
      IMPORT_GIS_PROFILE_NAME_PANEL: '#import-gis-profile-name-panel',
      IMPORT_GIS_VIEW_PROFILE_PANEL: '#import-gis-view-profile-panel',
      IMPORT_GIS_DATE_PANEL: '#import-gis-date-panel',
      IMPORTABLE_GIS_PROJECTS_ERROR_PANEL: '#importable-gis-projects-errors-panel',
      IMPORTABLE_GIS_PROJECTS_ERROR_GRID_BODY: '.error-grid-body',
      ADD_NEW_IMPORTABLE_GIS_PROJECTS_HEADER: '#add-new-importable-gis-projects-header',
      GIS_PROJECTS_LIST_TR: '.gis-projects-list-tr',
      GIS_RESULTS_LIST_TR: '.gis-results-list-tr',
      IMPORTABLE_GIS_PROJECTS_RESULT_HEADER: '#importable-gis-projects-header',
      IMPORTABLE_GIS_PROJECTS_RESULT_MODAL: '#importable-gis-projects-results-new-modal',
      IMPORTABLE_GIS_PROJECTS_OPTIONS: '#gis-results-options',
      IMPORTABLE_GIS_PROJECTS_RESULT_OPTIONS: '#importable-gis-projects-result-options',
      IMPORTABLE_GIS_PROJECTS_RESULTS_NEW_PANEL: '#importable-gis-projects-results-new-panel',
      IMPORTABLE_GIS_PROJECTS_RESULTS: 'importable-gis-projects-results',
      IMPORTABLE_GIS_PROJECT_PREVIOUS: '#gis-results-previous',
      IMPORTABLE_GIS_PROJECT_RESULTS_PREVIOUS: '#back-gis-results-previous',
      DESTROY_OPTIONS_BUTTON: '.destroy-gis-results-options',
      IMPORTABLE_GIS_PROJECT_RESULTS_TABLE: '#importable-gis-projects-results-table',
      IMPORT_GIS_BACK_TO_ONE_LINE_BUTTON: '.back-to-one-line-button',
      MAPPING_FORM: 'mapping-form',
      MAPPING_TABLE: '#mapping-table',
      ALLOCATION_INPUT: '.allocation-input',
      ALLOCATION_INPUT_NAME: 'allocation-input',
      DISPATCH_DATES: '.dispatch-dates',
      GIS_HIDDEN_INPUT: '.gis-hidden-input',
      ONE_LINE_NAME: '.one-line-name',
      ONE_LINE_NODETYPE: '.one-line-type',
      SAVE_MAPPING_BUTTON: 'save-mapping-button',
      IMPORT_GIS_DATE_MODAL: '#import-gis-date-modal',
      IMPORT_GIS_DATE_PREVIOUS_BUTTON: '#import-gis-date-previous-button',
      IMPORT_GIS_DATE_NEXT_BUTTON: '#import-gis-date-next-button',
      IMPORT_GIS_DATE_FORM: '#import-gis-date-form',
      IMPORT_GIS_PROFILE_NAME_PREVIOUS_BUTTON: '#import-gis-profile-name-previous-button',
      IMPORT_GIS_PROFILE_NAME_SAVE_BUTTON: '#import-gis-profile-name-save-button',
      PROFILE_NAME_INPUT: '#profile-name-input',
      PROFILE_NAME_CONTROL: 'profile-name-control',
      DISPATCH_CANVAS: 'dispatch-canvas',
      DISPATCH_CHART_CONTAINER: 'dispatch-chart-container',
      DISPATCH_CHART_STACKED_NOTE: 'dispatch-chart-stacked-note',
      DISPATCH_CHART_LEGEND: 'dispatch-chart-legend',
      MONTH_DROPDOWN: '.month-dropdown',
      MONTH_DROPDOWN_LAST_CHILD: '.month-dropdown:last-child',
      DAY_TYPE_DROPDOWN: '.day-type-dropdown',
      DAY_TYPE_DROPDOWN_LAST_CHILD: '.day-type-dropdown:last-child',
      HOUR_DROPDOWN: '.hour-dropdown',
      HOUR_DROPDOWN_LAST_CHILD: '.hour-dropdown:last-child',
      DATE_ROWS: '#date-rows',
      DATE_ROW: '.date-row',
      ADD_DATE_ROW_BUTTON: '.add-date-row-button',
      REMOVE_DATE_ROW_BUTTON: '.remove-date-row-button',
      HIDDEN_INPUT: 'hidden-input',
      WIND_HIDDEN_COUNT_INPUT: '.wind-hidden-count-input',
      WIND_INPUT: '.wind-input',
      GENERATOR_INPUT: '.generator-input',
      STORAGE_INPUT: '.storage-input',
      SOLAR_INPUT: '.solar-input',
      LOAD_INPUT: '.load-input',
      EV_INPUT: '.ev-input',

      // Save project overlay
      SAVE_PROJECT_MAIN_FORM: '#save-project-main-form',
      NEW_PROJECT_NAME: '#new-project-name',
      NEW_PROJECT_DESCRIPTION: '#new-project-description',
      SAVE_COPY_BUTTON: '#save-copy-button',

      // Send Copy To overlay
      SEND_COPY_TO_DROPDOWN: '#send-copy-to-dropdown',
      MESSAGE_TO_RECIPIENT_TEXTAREA: '#message-to-recipient-textarea',
      SEND_COPY_BUTTON: '#send-copy-button',

      // Generator overlay
      PHASE_SWTCH_OPEN: '.phase-swtch-open',

      // Cable overlay
      CABLE_LENGTH: '#cable-length',
      CABLE_LENGTH_LABEL: '#cable-length-label',
      OVERRIDE_BUTTON: '#override-button',
      COMPUTE_CABLE_LENGTHS: 'compute-cable-lengths',

      // Solar and Wind overlays
      PHASE_SWITCH_OPEN_SOLAR: '.phase-swtch-open-solar',
      SIMULATE_BUTTON: 'simulate-button',
      EXPAND_BUTTON: 'expand-button',
      SOLAR_CHART_THUMB_CONTAINER: 'solar-chart-thumb-container',
      SOLAR_CHART_THUMB: 'solar-chart-thumb',
      SOLAR_CHART_FULL_CONTAINER: 'solar-chart-full-container',
      SOLAR_CHART_FULL: 'solar-chart-full',
      SOLAR_SETTINGS_FULL_CHART: 'solar-settings-full-chart',
      DESTROY_SOLAR_CHART_BUTTON: 'destroy-solar-chart-button',
      COMPUTE_BUTTON: 'compute-button',
      WIND_CHART_THUMB_CONTAINER: 'wind-chart-thumb-container',
      WIND_CHART_THUMB: 'wind-chart-thumb',
      WIND_CHART_FULL_CONTAINER: 'wind-chart-full-container',
      WIND_CHART_FULL: 'wind-chart-full',
      WIND_SETTINGS_FULL_CHART: 'wind-settings-full-chart',
      DESTROY_WIND_CHART_BUTTON: 'destroy-wind-chart-button',

      // Print overlay
      PRINT_OVERLAY: '#print-overlay',
      PRINT_BUTTON: '#print-button',
      CLOSE_PRINT_OVERLAY_BUTTON: '#close-print-overlay-button',
      CLOSE_PRINT_OVERLAY_BUTTON_ID: 'close-print-overlay-button',

      // Protection devices
      FROM_PROTECTION: '.from-protection',
      FROM_PROTECTION_SELECT: '.from-protection-select',
      FROM_PROTECTION_SELECT_BARE: 'from-protection-select',
      FROM_DEVICE_ID: '#from-device-id',
      FROM_REMOVE_LINKS: '#from-breaker-remove, #from-fuse-remove, #from-relay-remove, #from-switch-remove',
      FROM_BREAKER_TITLE: '#from-breaker-title',
      FROM_FUSE_TITLE: '#from-fuse-title',
      FROM_RELAY_TITLE: '#from-relay-title',
      FROM_SWITCH_TITLE: '#from-switch-title',

      TO_PROTECTION: '.to-protection',
      TO_PROTECTION_SELECT: '.to-protection-select',
      TO_DEVICE_ID: '#to-device-id',
      TO_REMOVE_LINKS: '#to-breaker-remove, #to-fuse-remove, #to-relay-remove, #to-switch-remove',
      TO_BREAKER_TITLE: '#to-breaker-title',
      TO_FUSE_TITLE: '#to-fuse-title',
      TO_RELAY_TITLE: '#to-relay-title',
      TO_SWITCH_TITLE: '#to-switch-title',

      DESTROY_DEVICE_BUTTON: '.destroy-device-button',
      SAVE_DEVICE_BUTTON: '.save-device-button',
      SAVE_CATALOG_DEVICE_BUTTON: '.save-catalog-device-button',
      DEVICE_STATUS: '.device-status',
      DEVICE_STATUS_OPEN: '.device-status-open',
      DEVICE_STATUS_CLOSE: '.device-status-close',
      CONNECTION_TITLE: '.connection-title',
      ICO_IMG: '.ico img',

      // Topographic Map
      ONE_LINE_BUTTON: 'one-line-button',
      TOPOGRAPHIC_MAP: 'topographic-map',
      TOPOGRAPHY_CONTAINER: '#topography-container',
      CONTROL_INTERFACE: 'control-interface',
      CONTROL_TEXT: 'control-text',
      CONTROL_CONTAINER: 'control-container',
      UNPOSITIONED_ELEMENTS_INTERFACE: 'unpositioned-elements-interface',
      UNPOSITIONED_ELEMENTS_TEXT: 'unpositioned-elements-text',
      UNPOSITIONED_CONTAINER: 'unpositioned-container',
      UNPOSITIONED_CONTAINER_DIV: '#unpositioned-container > div',
      MARKER_POSITION: 'marker-position',
      UNPOSITIONED_ELEMENTS_LIST_ITEM: '.unpositioned-elements-list-item',
      OVERHEAD_PERCENTAGE: 'overhead-percentage',
      CABLE_ROW: '.cable-row',
      COMPUTED_LENGTH: '.computed-length',
      DATA_BRANCH_ID: 'data-branch-id',
      SELECTED_MARKER: 'selected-marker',
      SELECTED_MAP_MARKER: 'selected-map-marker',
      MARKER_LABEL_ONELINE: 'marker-labels-oneline',
      TOPOGRAPHIC_MODAL: 'topography-modal'
    },

    TRANSITION_SPEEDS: {
      FAST: 100,
      MEDIUM: 200,
      SLOW: 300,
      VERY_SLOW: 500
    },

    TRANSITION_FRAME_COUNTS: {
      HIGH: 20,
      STANDARD: 10,
      LOW: 5
    },

    STYLE: {
      STROKE_WIDTH: 2,
      STROKE_LINECAP: LineCap.FLAT,
      SELECTED_ELEMENT_COLOR: '#fcb96f'
    },

    ANALYTIC_NAMES: {
      POWER_FLOW_ANALYSIS: 'Power Flow Analysis'
    },

    ANALYSIS_OPTIONS: {
      BUS_UNDER_LOADED_UPPERBOUND: 1,
      BUS_UNDER_LOADED_COLOR: 2,
      BUS_NORMAL_LOADED_UPPERBOUND: 3,
      BUS_NORMAL_LOADED_COLOR: 4,
      BUS_FULLY_LOADED_UPPERBOUND: 5,
      BUS_FULLY_LOADED_COLOR: 6,
      BUS_OVER_LOADED_COLOR: 7,

      BUS_UNDER_VOLTAGE_UPPERBOUND: 11,
      BUS_UNDER_VOLTAGE_COLOR: 12,
      BUS_NORMAL_VOLTAGE_UPPERBOUND: 13,
      BUS_NORMAL_VOLTAGE_COLOR: 14,
      BUS_OVER_VOLTAGE_COLOR: 15,

      ANNOTATE_NAME: 100,
      ANNOTATE_DESCRIPTION: 101,
      ANNOTATE_CATALOG_NAME: 102,
      ANNOTATE_VOLTAGE: 103,
      ANNOTATE_PERCENT_LOADED: 300,
      ANNOTATE_PERCENT_VOLTAGE_DROP: 301,
      ANNOTATE_CALC_CURRENT: 302,
      ANNOTATE_CALC_VOLTAGE: 303,
      ANNOTATE_RATED_POWER: 304,
      ANNOTATE_PU: 305,
      ANNOTATE_P: 306,
      ANNOTATE_Q: 307,
      ANNOTATE_CABLE_AMPACITY: 308,
      ANNOTATE_FAULT_XR_RATIO: 400,
      ANNOTATE_SYMM_FAULT: 401,
      ANNOTATE_ASYMM_FAULT: 402,
      SHORT_CIRCUIT_NOT_THREE_PHASE_FAULT: 403
    },

    ANALYTICS: {
        POWER_FLOW: 2001,
        SHORT_CIRCUIT_CLASSICAL: 2002,
        SHORT_CIRCUIT_ANSI: 2003
    },

    LOCATOR_TABLE_ACTIONS: {
        CREATE: 'CREATE',
        DELETE: 'DELETE',
        UPDATE: 'UPDATE'
    },

    ANNOTATION_TYPES: {
        NAME: 'NAME',
        DESCRIPTION: 'DESCRIPTION',
        CATALOG_NAME: 'CATALOG_NAME',
        VOLTAGE: 'VOLTAGE',

        UTILITY_SHORTCIRCUIT_LL: 'UTILITY_SHORTCIRCUIT_LL',
        UTILITY_SHORTCIRCUIT_LN: 'UTILITY_SHORTCIRCUIT_LN',

        SOLAR_RATEDPOWER: 'SOLAR_RATEDPOWER',
        SOLAR_POWERFACTOR: 'SOLAR_POWERFACTOR',

        STORAGE_STATE: 'STORAGE_STATE',
        STORAGE_CHARGE: 'STORAGE_CHARGE',

        GENERATOR_RATEDPOWER: 'GENERATOR_RATEDPOWER',
        GENERATOR_POWERFACTOR: 'GENERATOR_POWERFACTOR',
        GENERATOR_RATEDRPM: 'GENERATOR_RATEDRPM',

        WIND_RATEDPOWER: 'WIND_RATEDPOWER',
        WIND_WTGTYPE: 'WIND_WTGTYPE',

        LOAD_RATEDVOLTAGE: 'LOAD_RATEDVOLTAGE',
        LOAD_RATEDPOWER: 'LOAD_RATEDPOWER',
        LOAD_POWERFACTOR: 'LOAD_POWERFACTOR',
        LOAD_LOADMODEL: 'LOAD_LOADMODEL',

        CABLE_AMPACITY: 'CABLE_AMPACITY',
        CABLE_LENGTH: 'CABLE_LENGTH',
        CABLE_SIZE: 'CABLE_SIZE',
        CABLE_MATERIAL: 'CABLE_MATERIAL',
        CABLE_RATEDVOLTAGE: 'CABLE_RATEDVOLTAGE',
        CABLE_NUMCONDUCTORS: 'CABLE_NUMCONDUCTORS',
        CABLE_INSULATION: 'CABLE_INSULATION',
        CABLE_PARALLEL: 'CABLE_PARALLEL',

        TRANS_RATING: 'TRANS_RATING',
        TRANS_IMPEDANCE: 'TRANS_IMPEDANCE',

        FUSE_AMPRATING: 'FUSE_AMPRATING',
        FUSE_MODELNUM: 'FUSE_MODELNUM',

        BREAKER_AMPRATING: 'BREAKER_AMPRATING',
        BREAKER_MODELNUM: 'BREAKER_MODELNUM',

        SWITCH_AMPRATING: 'SWITCH_AMPRATING',
        SWITCH_MODELNUM: 'SWITCH_MODELNUM',

        RELAY_TYPE: 'RELAY_TYPE',
        RELAY_MODELNUM: 'RELAY_MODELNUM',

        PERCENT_LOADED: 'PERCENT_LOADED',
        PERCENT_VOLTAGE_DROP: 'PERCENT_VOLTAGE_DROP',
        CALC_CURRENT: 'CALC_CURRENT',
        CALC_VOLTAGE: 'CALC_VOLTAGE',
        PU: 'PU',
        P: 'P',
        Q: 'Q',

        FAULT_XR_RATIO: 'FAULT_XR_RATIO',
        SYMM_FAULT: 'SYMM_FAULT',
        ASYMM_FAULT: 'ASYMM_FAULT'
    }
}

constants.POWER_PRODUCER_NODES = [
    constants.NODE_TYPES.UTILITY,
    constants.NODE_TYPES.SOLAR,
    constants.NODE_TYPES.WIND,
    constants.NODE_TYPES.GENERATOR
]

constants.VOLTAGE_MODIFIER_BRANCHES = [
    constants.BRANCH_TYPES.TRANS2W
]

constants.FIELD_OPTIONS = {
    VOLTAGE_COLORS: [
        { label: '', value: '', class: '' },
        { label: 'Red', value: 'ff0000', class: 'color-red' },
        { label: 'Orange', value: 'ffa500', class: 'color-orange' },
        { label: 'Green', value: '008000', class: 'color-green' },
        { label: 'Light Blue', value: '1e90ff', class: 'color-lblue' },
        { label: 'Blue', value: '0000ff', class: 'color-blue' },
        { label: 'Purple', value: '8a2be2', class: 'color-purple' },
        { label: 'Pink', value: 'ff1493', class: 'color-pink' }
    ],
    CABLE_OVERAGE_PERCENT: [
        { label: '0%', value: '0' },
        { label: '5%', value: '5' },
        { label: '10%', value: '10' },
        { label: '15%', value: '15' },
        { label: '20%', value: '20' },
        { label: '25%', value: '25' },
        { label: '30%', value: '30' },
        { label: '35%', value: '35' },
        { label: '40%', value: '40' },
        { label: '45%', value: '45' },
        { label: '50%', value: '50' },
        { label: '55%', value: '55' },
        { label: '60%', value: '60' },
        { label: '65%', value: '65' },
        { label: '70%', value: '70' },
        { label: '75%', value: '75' },
        { label: '80%', value: '80' },
        { label: '85%', value: '85' },
        { label: '90%', value: '90' },
        { label: '95%', value: '95' },
        { label: '100%', value: '100' }
    ],
    ANALYSIS_LOADED_COLORS: [
        { label: '', value: '', class: '' },
        { label: 'Black', value: '000000', class: 'color-black' },
        { label: 'Red', value: 'ff0000', class: 'color-red' },
        { label: 'Orange', value: 'ffa500', class: 'color-orange' },
        { label: 'Green', value: '008000', class: 'color-green' },
        { label: 'Light Blue', value: '1e90ff', class: 'color-lblue' },
        { label: 'Blue', value: '0000ff', class: 'color-blue' },
        { label: 'Purple', value: '8a2be2', class: 'color-purple' },
        { label: 'Pink', value: 'ff1493', class: 'color-pink' }
    ],
    LOAD_MODEL: [
        { label: 'Constant kVA', value: 1, title: 'Normal load-flow type load: Constant P and Q' },
        { label: 'Constant Current', value: 5, title: 'Rectifier load: Constant P, constant current' },
        { label: 'Constant Impedance', value: 2, title: 'Constant impedance load' },
        { label: 'Constant P Quadratic Q', value: 3, title: 'Constant P, quadratic Q (somewhat like a motor)' },
        { label: 'Linear P Quadratic Q', value: 4, title: 'Linear P, quadratic Q (mixed resistive, motor)' }
    ],
    STORAGE_MODEL: [
        { label: 'Constant kW @ PF', value: 1 },
        { label: 'Constant Admittance', value: 2 }
    ],
    STORAGE_STATE: [
        { label: 'Idling', value: 1 },
        { label: 'Charging', value: 2 },
        { label: 'Discharging', value: 3 }
    ],
    GENERATOR_POWER_MODEL: [
        { label: 'Constant PQ', value: 1, title: 'Generator injects a constant kW at a specified power factor' },
        { label: 'Constant Z', value: 2, title: 'Generator is modeled as a constant admittance' },
        { label: 'Constant P |V|', value: 3, title: 'Constant kW, constant kV - somewhat like a conventional transmission power flow' },
        { label: 'Constant P Fixed Q', value: 4, title: 'Constant kW, fixed Q (Q never varies)' },
        { label: 'Constant P Fixed Reactance', value: 5, title: 'Constant kW, fixed Q (as a constant reactance)' },
        { label: 'Constant PQ Current Limited', value: 6, title: 'Constant kW, but current is limited when voltage is below V-min PU (0.95)' }
    ],
    POWER_FACTOR_TYPE: [
        { label: 'Lag', value: 1 },
        { label: 'Lead', value: 2 }
    ],
    RATED_POWER_UNITS: [
        { label: 'kW', value: 2 },
        { label: 'Amps', value: 1 }
    ],
    EXISTING: [
        { label: 'New', value: "false" },
        { label: 'Existing', value: "true" }
    ],
    CABLE_MATERIAL: [
        { label: constants.CABLE_MATERIAL.COPPER.label, value: constants.CABLE_MATERIAL.COPPER.value },
        { label: constants.CABLE_MATERIAL.ALUMINUM.label, value: constants.CABLE_MATERIAL.ALUMINUM.value }
    ],
    INSULATION_TYPE: [
        { label: '', value: 0 },
        { label: 'Bare', value: 1 },
        { label: 'EPR', value: 2 },
        { label: 'HDPE', value: 3 },
        { label: 'HMWPE', value: 4 },
        { label: 'PILC', value: 5 },
        { label: 'PVC', value: 6 },
        { label: 'RHH', value: 7 },
        { label: 'THHN', value: 8 },
        { label: 'THHW', value: 9 },
        { label: 'TR-XLPE', value: 10 },
        { label: 'XHHW', value: 11 },
        { label: 'XLPE', value: 12 }
    ],
    PRIMARY_WINDING_TYPE: [
        { label: constants.CONNECTIONS.DELTA.label, value: constants.CONNECTIONS.DELTA.value },
        { label: constants.CONNECTIONS.WYE_UNGROUNDED.label, value: constants.CONNECTIONS.WYE_UNGROUNDED.value },
        { label: constants.CONNECTIONS.WYE_SOLIDLY.label, value: constants.CONNECTIONS.WYE_SOLIDLY.value },
        { label: constants.CONNECTIONS.WYE_IMPEDANCE.label, value: constants.CONNECTIONS.WYE_IMPEDANCE.value }
    ],
    SECONDARY_WINDING_TYPE: [
        { label: constants.CONNECTIONS.DELTA.label, value: constants.CONNECTIONS.DELTA.value },
        { label: constants.CONNECTIONS.WYE_UNGROUNDED.label, value: constants.CONNECTIONS.WYE_UNGROUNDED.value },
        { label: constants.CONNECTIONS.WYE_SOLIDLY.label, value: constants.CONNECTIONS.WYE_SOLIDLY.value },
        { label: constants.CONNECTIONS.WYE_IMPEDANCE.label, value: constants.CONNECTIONS.WYE_IMPEDANCE.value }
    ],
    CONNECTION: [
        { label: constants.CONNECTIONS.DELTA.label, value: constants.CONNECTIONS.DELTA.value },
        { label: constants.CONNECTIONS.WYE_UNGROUNDED.label, value: constants.CONNECTIONS.WYE_UNGROUNDED.value },
        { label: constants.CONNECTIONS.WYE_SOLIDLY.label, value: constants.CONNECTIONS.WYE_SOLIDLY.value }
    ],
    FUEL_TYPE: [
        { label: 'Diesel', value: 4 },
        { label: 'Bio-Diesel', value: 5 },
        { label: 'Natural Gas', value: 3 },
        { label: 'Bio-Gas', value: 7 },
        { label: 'Hydrogen / Other', value: 6 }
    ],
    GENERATOR_CONNECTION: [
      { label: constants.CONNECTIONS.DELTA.label, value: constants.CONNECTIONS.DELTA.value },
      { label: constants.CONNECTIONS.WYE_UNGROUNDED.label, value: constants.CONNECTIONS.WYE_UNGROUNDED.value },
      { label: constants.CONNECTIONS.WYE_SOLIDLY.label, value: constants.CONNECTIONS.WYE_SOLIDLY.value },
      { label: constants.CONNECTIONS.WYE_IMPEDANCE.label, value: constants.CONNECTIONS.WYE_IMPEDANCE.value }
    ],
    STORAGE_CONNECTION: [
      { label: constants.CONNECTIONS.DELTA.label, value: constants.CONNECTIONS.DELTA.value },
      { label: constants.CONNECTIONS.WYE_SOLIDLY.label, value: constants.CONNECTIONS.WYE_SOLIDLY.value },
      { label: constants.CONNECTIONS.WYE_IMPEDANCE.label, value: constants.CONNECTIONS.WYE_IMPEDANCE.value },
      { label: constants.CONNECTIONS.WYE_UNGROUNDED.label, value: constants.CONNECTIONS.WYE_UNGROUNDED.value }
    ],
    TAP_SIDE: [
        { label: 'Primary', value: 1 },
        { label: 'Secondary', value: 2 }
    ],
    PROJECT_ANNOTATIONS: [
        { name: 'annotation-name', value: constants.ANNOTATION_TYPES.NAME },
        { name: 'annotation-description', value: constants.ANNOTATION_TYPES.DESCRIPTION },
        { name: 'annotation-catalog-name', value: constants.ANNOTATION_TYPES.CATALOG_NAME },
        { name: 'annotation-voltage', value: constants.ANNOTATION_TYPES.VOLTAGE },

        { name: 'utility-short-circuit-kva', value: constants.ANNOTATION_TYPES.UTILITY_SHORTCIRCUIT_LL },
        { name: 'utility-short-circuit-lg', value: constants.ANNOTATION_TYPES.UTILITY_SHORTCIRCUIT_LN },

        { name: 'solar-rated-power', value: constants.ANNOTATION_TYPES.SOLAR_RATEDPOWER },
        { name: 'solar-power-factor', value: constants.ANNOTATION_TYPES.SOLAR_POWERFACTOR },

        { name: 'storage-state', value: constants.ANNOTATION_TYPES.STORAGE_STATE },
        { name: 'storage-charge', value: constants.ANNOTATION_TYPES.STORAGE_CHARGE },

        { name: 'generator-rated-power', value: constants.ANNOTATION_TYPES.GENERATOR_RATEDPOWER },
        { name: 'generator-power-factor', value: constants.ANNOTATION_TYPES.GENERATOR_POWERFACTOR },
        { name: 'generator-rated-rpm', value: constants.ANNOTATION_TYPES.GENERATOR_RATEDRPM },

        { name: 'wind-turbine-rated-power', value: constants.ANNOTATION_TYPES.WIND_RATEDPOWER },
        { name: 'wind-turbine-wtg-type', value: constants.ANNOTATION_TYPES.WIND_WTGTYPE },

        { name: 'load-rated-voltage', value: constants.ANNOTATION_TYPES.LOAD_RATEDVOLTAGE },
        { name: 'load-rated-power', value: constants.ANNOTATION_TYPES.LOAD_RATEDPOWER },
        { name: 'load-power-factor', value: constants.ANNOTATION_TYPES.LOAD_POWERFACTOR },
        { name: 'load-load-model', value: constants.ANNOTATION_TYPES.LOAD_LOADMODEL },

        { name: 'cable-length', value: constants.ANNOTATION_TYPES.CABLE_LENGTH },
        { name: 'cable-size', value: constants.ANNOTATION_TYPES.CABLE_SIZE },
        { name: 'cable-material', value: constants.ANNOTATION_TYPES.CABLE_MATERIAL },
        { name: 'cable-rated-voltage', value: constants.ANNOTATION_TYPES.CABLE_RATEDVOLTAGE },
        { name: 'cable-number-conductors', value: constants.ANNOTATION_TYPES.CABLE_NUMCONDUCTORS },
        { name: 'cable-insulation-type', value: constants.ANNOTATION_TYPES.CABLE_INSULATION },
        { name: 'cable-cables-in-parallel', value: constants.ANNOTATION_TYPES.CABLE_PARALLEL },
        { name: 'cable-ampacity', value: constants.ANNOTATION_TYPES.CABLE_AMPACITY },

        { name: 'trans2w-rating', value: constants.ANNOTATION_TYPES.TRANS_RATING },
        { name: 'trans2w-impedance', value: constants.ANNOTATION_TYPES.TRANS_IMPEDANCE },

        { name: 'fuse-amp-rating', value: constants.ANNOTATION_TYPES.FUSE_AMPRATING },
        { name: 'fuse-model-number', value: constants.ANNOTATION_TYPES.FUSE_MODELNUM },

        { name: 'breaker-amp-rating', value: constants.ANNOTATION_TYPES.BREAKER_AMPRATING },
        { name: 'breaker-model-number', value: constants.ANNOTATION_TYPES.BREAKER_MODELNUM },

        { name: 'relay-type', value: constants.ANNOTATION_TYPES.RELAY_TYPE },
        { name: 'relay-model-number', value: constants.ANNOTATION_TYPES.RELAY_MODELNUM },

        { name: 'switch-amp-rating', value: constants.ANNOTATION_TYPES.SWITCH_AMPRATING },
        { name: 'switch-model-number', value: constants.ANNOTATION_TYPES.SWITCH_MODELNUM }
    ],
    CAPACITY_UNITS: [
        { label: 'kVA', value: 'kVA' },
        { label: 'MVA', value: 'MVA' }
    ],
    CURRENT_UNITS: [
        { label: 'A', value: 'A' },
        { label: 'kA', value: 'kA' }
    ],
    VOLTAGE_UNITS: [
        { label: 'V', value: 'V' },
        { label: 'kV', value: 'kV' }
    ],
    UNIT_FIELDS: [
        { field: 'CapacityUnits', name: 'CAPACITY_UNITS' },
        { field: 'CurrentUnits', name: 'CURRENT_UNITS' },
        { field: 'VoltageUnits', name: 'VOLTAGE_UNITS' }
    ],
    LOAD_SHAPE_TIME_STEPS: [
        { label: '1 Hour', value: 1 },
        { label: '30 Minutes', value: 2 },
        { label: '15 Minutes', value: 4 }
    ],
    SOLAR_PANEL_TYPE: [
        { label: `Standard \u2013 19% Nominal Efficiency`, value: 0 },
        { label: `Premium \u2013 21% Nominal Efficiency`, value: 1 },
        { label: `Thin Film \u2013 18% Nominal Efficiency`, value: 2 },
    ],
    SOLAR_ARRAY_TYPE: [
        { label: `Fixed \u2013 Open Rack`, value: 0 },
        { label: `Fixed \u2013 Roof Mounted`, value: 1 },
        { label: '1-Axis', value: 2 },
        { label: '1-Axis Backtracking', value: 3 },
        { label: '2-Axis', value: 4 }
    ],
    AZIMUTH: [
        { label: 'N', value: 0 },
        { label: 'NE', value: 45 },
        { label: 'E', value: 90 },
        { label: 'SE', value: 135 },
        { label: 'S', value: 180 },
        { label: 'SW', value: 225 },
        { label: 'W', value: 270 },
        { label: 'NW', value: 315 }
    ],
    TURBINE_MODEL: [
      { label: '100kW XANT M21', value: 'XANT M21 100', size: '100' },
      { label: '150kW Bonus B23', value: 'Bonus B23 150', size: '150' },
      { label: '150kW Nordex N27', value: 'Nordex N27 150', size: '150' },
      { label: '225kW Vestas V27', value: 'Vestas V27 225', size: '225' },
      { label: '225kW Vestas V29', value: 'Vestas V29 225', size: '225' },
      { label: '250kW Nordex N29', value: 'Nordex N29 250', size: '250' },
      { label: '300kW Bonus B33', value: 'Bonus B33 300', size: '300' },
      { label: '300kW Windmaster WM28', value: 'Windmaster WM28 300', size: '300' },
      { label: '450kW Bonus B37', value: 'Bonus B37 450', size: '450' },
      { label: '500kW Bonus B41', value: 'Bonus B41 500', size: '500' },
      { label: '500kW Dewind D4 41', value: 'Dewind D4 41 500', size: '500' },
      { label: 'Enercon E40 500', value: 'Enercon E40 500', size: '500' },
      { label: 'NEG Micon M1500 500', value: 'NEG Micon M1500 500', size: '500' },
      { label: 'Nordtank NTK500', value: 'Nordtank NTK500', size: '500' },
      { label: '500kW Windflow', value: 'Windflow 500', size: '500' },
      { label: '500kW Vestas V39', value: 'Vestas V39 500', size: '500' },
      { label: '600kW Bonus B44', value: 'Bonus B44 600', size: '600' },
      { label: '600kW Enercon E40', value: 'Enercon E40 600', size: '600' },
      { label: '600kW Nordex N43', value: 'Nordex N43 600', size: '600' },
      { label: '600kW Nordtank NTK600', value: 'Nordtank NTK600', size: '600' },
      { label: '600kW Tacke TW600 43', value: 'Tacke TW600 43', size: '600' },
      { label: '600kW Vestas V42', value: 'Vestas V42 600', size: '600' },
      { label: '600kW Vestas V44', value: 'Vestas V44 600', size: '600' },
      { label: '660kW Gamesa G47', value: 'Gamesa G47 660', size: '660' },
      { label: '660kW Vestas V47', value: 'Vestas V47 660', size: '660' },
      { label: '750kW NEG Micon M1500', value: 'NEG Micon M1500 750', size: '750' },
      { label: '750kW NEG Micon NM48', value: 'NEG Micon NM48 750', size: '750' },
      { label: '750kW Windmaster WM43', value: 'Windmaster WM43 750', size: '750' },
      { label: '800kW Enercon E48', value: 'Enercon E48 800', size: '800' },
      { label: '800kW Enercon E53', value: 'Enercon E53 800', size: '800' },
      { label: '800kW Nordex N50', value: 'Nordex N50 800', size: '800' },
      { label: '850kW Gamesa G52', value: 'Gamesa G52 850', size: '850' },
      { label: '850kW Gamesa G58', value: 'Gamesa G58 850', size: '850' },
      { label: '850kW Vestas V52', value: 'Vestas V52 850', size: '850' },
      { label: '900kW Enercon E44', value: 'Enercon E44 900', size: '900' },
      { label: '900kW EWT DirectWind 52', value: 'EWT DirectWind 52 900', size: '900' },
      { label: '900kW GE 900S', value: 'GE 900S', size: '900' },
      { label: '900kW NEG Micon NM52', value: 'NEG Micon NM52 900', size: '900' },
      { label: '900kW PowerWind 56', value: 'PowerWind 56 900', size: '900' },
      { label: '1000kW Bonus B54', value: 'Bonus B54 1000', size: '1000' },
      { label: '1000kW Dewind D6', value: 'Dewind D6 1000', size: '1000' },
      { label: '1000kW NEG Micon NM60', value: 'NEG Micon NM60 1000', size: '1000' },
      { label: '1300kW Bonus B62', value: 'Bonus B62 1300', size: '1300' },
      { label: '1300kW Nordex N60', value: 'Nordex N60 1300', size: '1300' },
      { label: '1300kW Siemens SWT 62 1.3', value: 'Siemens SWT 1.3 62', size: '1300' },
      { label: '1500kW Acciona AW77', value: 'Acciona AW77 1500', size: '1500' },
      { label: '1500kW Enercon E66', value: 'Enercon E66 1500', size: '1500' },
      { label: '1500kW GE 1.5s', value: 'GE 1.5s', size: '1500' },
      { label: '1500kW GE 1.5se', value: 'GE 1.5se', size: '1500' },
      { label: '1500kW GE 1.5sl', value: 'GE 1.5sl', size: '1500' },
      { label: '1500kW GE 1.5sle', value: 'GE 1.5sle', size: '1500' },
      { label: '1500kW GE 1.5xle', value: 'GE 1.5xle', size: '1500' },
      { label: '1500kW Goldwind GW82', value: 'Goldwind GW82 1500', size: '1500' },
      { label: '1500kW NEG Micon NM64c', value: 'NEG Micon NM64c 1500', size: '1500' },
      { label: '1500kW REpower MD70', value: 'REpower MD70 1500', size: '1500' },
      { label: '1500kW REPower MD77', value: 'REPower MD77 1500', size: '1500' },
      { label: '1600kW GE 1.6', value: 'GE 1.6', size: '1600' },
      { label: '1650kW Vestas V66', value: 'Vestas V66 1650', size: '1650' },
      { label: '1670kW Alstom Eco 74', value: 'Alstom Eco 74', size: '1670' },
      { label: '1700kW GE 1.7', value: 'GE 1.7', size: '1700' },
      { label: '1750kW Vestas V66', value: 'Vestas V66 1750', size: '1750' },
      { label: '1800kW Enercon E66', value: 'Enercon E66 1800', size: '1800' },
      { label: '1800kW Enercon E82', value: 'Enercon E82 1800', size: '1800' },
      { label: '1800kW Vestas V80', value: 'Vestas V80 1800', size: '1800' },
      { label: '1800kW Vestas V90', value: 'Vestas V90 1800', size: '1800' },
      { label: '1800kW Vestas V100', value: 'Vestas V100 1800', size: '1800' },
      { label: '2000kW Alstom Eco 80', value: 'Alstom Eco 80', size: '2000' },
      { label: '2000kW Vestas V90', value: 'Vestas V90 2000', size: '2000' },
      { label: '2000kW Enercon E82', value: 'Enercon E82 2000', size: '2000' },
      { label: '2000kW Enercon E82', value: 'Enercon E82 2000', size: '2000' },
      { label: '2000kW Enercon E82', value: 'Enercon E82 2000', size: '2000' },
      { label: '2000kW Gamesa G80', value: 'Gamesa G80 2000', size: '2000' },
      { label: '2000kW Gamesa G87', value: 'Gamesa G87 2000', size: '2000' },
      { label: '2000kW Gamesa G90', value: 'Gamesa G90 2000', size: '2000' },
      { label: '2000kW REpower MM70', value: 'REpower MM70 2000', size: '2000' },
      { label: '2000kW REpower MM82', value: 'REpower MM82 2000', size: '2000' },
      { label: '2000kW REpower MM92', value: 'REpower MM92 2000', size: '2000' },
      { label: '2000kW Vestas V66', value: 'Vestas V66 2000', size: '2000' },
      { label: '2000kW Vestas V80', value: 'Vestas V80 2000', size: '2000' },
      { label: '2000kW Vestas V100', value: 'Vestas V100 2000', size: '2000' },
      { label: '2000kW Vestas V110', value: 'Vestas V110 2000', size: '2000' },
      { label: '2100kW Suzlon S88', value: 'Suzlon S88 2100', size: '2100' },
      { label: '2100kW Suzlon S97', value: 'Suzlon S97 2100', size: '2100' },
      { label: '2300kW Siemens SWT 2.3 93', value: 'Siemens SWT 2.3 93', size: '2300' },
      { label: '2300kW Bonus B82', value: 'Bonus B82 2300', size: '2300' },
      { label: '2300kW Enercon E70', value: 'Enercon E70 2300', size: '2300' },
      { label: '2300kW Enercon E82', value: 'Enercon E82 2300', size: '2300' },
      { label: '2300kW Enercon E92', value: 'Enercon E92 2300', size: '2300' },
      { label: '2300kW Nordex N90', value: 'Nordex N90 2300', size: '2300' },
      { label: '2300kW Siemens SWT 2.3 82', value: 'Siemens SWT 2.3 82', size: '2300' },
      { label: '2300kW Siemens SWT 2.3 101', value: 'Siemens SWT 2.3 101', size: '2300' },
      { label: '2350kW Enercon E92', value: 'Enercon E92 2350', size: '2350' },
      { label: '2500kW GE 2.5xl', value: 'GE 2.5xl', size: '2500' },
      { label: '2500kW Nordex N80', value: 'Nordex N80 2500', size: '2500' },
      { label: '2500kW Nordex N90', value: 'Nordex N90 2500', size: '2500' },
      { label: '2500kW Nordex N100', value: 'Nordex N100 2500', size: '2500' },
      { label: '2750kW GE 2.75 103', value: 'GE 2.75 103', size: '2750' },
      { label: '2750kW NEG Micon NM80', value: 'NEG Micon NM80 2750', size: '2750' },
      { label: '3000kW Alstom Eco 110', value: 'Alstom Eco 110', size: '3000' },
      { label: '3000kW Enercon E82 3000', value: 'Enercon E82 3000', size: '3000' },
      { label: '3000kW Enercon E101 3000', value: 'Enercon E101 3000', size: '3000' },
      { label: '3000kW Nordex N131 3000', value: 'Nordex N131 3000', size: '3000' },
      { label: '3000kW Siemens SWT 3.0 101', value: 'Siemens SWT 3.0 101', size: '3000' },
      { label: '3000kW Vestas V9', value: 'Vestas V90 3000', size: '3000' },
      { label: '3000kW Vestas V112', value: 'Vestas V112 3000', size: '3000' },
      { label: '3300kW Nordex N131', value: 'Nordex N131 3300', size: '3300' },
      { label: '3300kW Vestas V112', value: 'Vestas V112 3300', size: '3300' },
      { label: '3400kW REpower 3.4M', value: 'REpower 3.4M', size: '3400' },
      { label: '3600kW Siemens SWT 3.6 107', value: 'Siemens SWT 3.6 107', size: '3600' },
      { label: '3600kW Siemens SWT 3.6 120', value: 'Siemens SWT 3.6 120', size: '3600' },
      { label: '3700kW Wind World W3700', value: 'Wind World W3700', size: '3700' },
      { label: '4000kW Siemens SWT 4.0 130', value: 'Siemens SWT 4.0 130', size: '4000' },
      { label: '4200kW Wind World W4200', value: 'Wind World W4200', size: '4200' },
      { label: '4500kW Enercon E112', value: 'Enercon E112 4500', size: '4500' },
      { label: '4500kW Gamesa G128', value: 'Gamesa G128 4500', size: '4500' },
      { label: '5000kW REpower 5M', value: 'REpower 5M', size: '5000' },
      { label: '6000kW REpower 6M', value: 'REpower 6M', size: '6000' },
      { label: '6500kW Enercon E126', value: 'Enercon E126 6500', size: '6500' },
      { label: '7000kW Vestas V164', value: 'Vestas V164 7000', size: '7000' },
      { label: '7000kW Enercon E126', value: 'Enercon E126 7000', size: '7000' },
      { label: '7500kW Enercon E126', value: 'Enercon E126 7500', size: '7500' }
    ],
    WTG_TYPE: [
      { label: '(1) Squirrel-Cage Induction', value: 1, id: 'wtg-type-1' },
      { label: '(2) Wound Rotor Induction', value: 2, id: 'wtg-type-2' },
      { label: '(3) Doubly-Fed Asynchronous', value: 3, id: 'wtg-type-3' },
      { label: '(4) Full Converter Interface', value: 4, id: 'wtg-type-4' }
    ],
    CONTROL_MODE: [
      { label: 'Voltage Control', value: 1 },
      { label: 'Fixed PF', value: 2 }
    ]
}

constants.CURRENCY_SIGNS = {
    USD: constants.UNITS.DOLLARS,
    AUD: constants.UNITS.DOLLARS,
    CAD: constants.UNITS.DOLLARS,
    EUR: constants.UNITS.EUROS,
    GBP: constants.UNITS.BRITISH_POUNDS,
    SEK: constants.UNITS.SEK,
    ZAR: constants.UNITS.RAND
}

constants.APPORTIONABLE_TYPES = {
    [constants.NODE_TYPES.LOAD]: constants.NODE_TYPES.LOAD,
    [constants.NODE_TYPES.EV]: constants.NODE_TYPES.EV,
    [constants.NODE_TYPES.STORAGE]: constants.NODE_TYPES.STORAGE,
    [constants.NODE_TYPES.SOLAR]: constants.NODE_TYPES.SOLAR
}

constants.APPORTIONABLE_PERCENTAGE_TYPES = {
    [constants.NODE_TYPES.LOAD]: constants.NODE_TYPES.LOAD,
    [constants.NODE_TYPES.EV]: constants.NODE_TYPES.EV,
    [constants.NODE_TYPES.STORAGE]: constants.NODE_TYPES.STORAGE,
    [constants.NODE_TYPES.SOLAR]: constants.NODE_TYPES.SOLAR
}

constants.ALL_IMPORTABLE_TYPES = {
    [constants.NODE_TYPES.LOAD]: constants.NODE_TYPES.LOAD,
    [constants.NODE_TYPES.EV]: constants.NODE_TYPES.EV,
    [constants.NODE_TYPES.STORAGE]: constants.NODE_TYPES.STORAGE,
    [constants.NODE_TYPES.SOLAR]: constants.NODE_TYPES.SOLAR,
    [constants.NODE_TYPES.WIND]: constants.NODE_TYPES.WIND,
    [constants.NODE_TYPES.GENERATOR]: constants.NODE_TYPES.GENERATOR
}

constants.ANNOTATIONS = {
    MAXLENGTH: 50,              // The max number of characters to display for an annotation (if the annotation exceeds this number of characters, it is shortened & ellipses are added)

    ORDER: [
        // Top-level annotations
        constants.ANNOTATION_TYPES.NAME,
        constants.ANNOTATION_TYPES.DESCRIPTION,
        constants.ANNOTATION_TYPES.CATALOG_NAME,
        constants.ANNOTATION_TYPES.VOLTAGE,

        // Cable annotations
        constants.ANNOTATION_TYPES.CABLE_LENGTH,
        constants.ANNOTATION_TYPES.CABLE_SIZE,
        constants.ANNOTATION_TYPES.CABLE_MATERIAL,
        constants.ANNOTATION_TYPES.CABLE_RATEDVOLTAGE,
        constants.ANNOTATION_TYPES.CABLE_NUMCONDUCTORS,
        constants.ANNOTATION_TYPES.CABLE_INSULATION,
        constants.ANNOTATION_TYPES.CABLE_PARALLEL,
        constants.ANNOTATION_TYPES.CABLE_AMPACITY,

        // Transformer annotations
        constants.ANNOTATION_TYPES.TRANS_RATING,
        constants.ANNOTATION_TYPES.TRANS_IMPEDANCE,

        // Utility annotations
        constants.ANNOTATION_TYPES.UTILITY_SHORTCIRCUIT_LL,
        constants.ANNOTATION_TYPES.UTILITY_SHORTCIRCUIT_LN,

        // Solar annotations
        constants.ANNOTATION_TYPES.SOLAR_RATEDPOWER,
        constants.ANNOTATION_TYPES.SOLAR_POWERFACTOR,

        // Wind annotations
        constants.ANNOTATION_TYPES.WIND_RATEDPOWER,
        constants.ANNOTATION_TYPES.WIND_WTGTYPE,

        // Storage annotations
        constants.ANNOTATION_TYPES.STORAGE_STATE,
        constants.ANNOTATION_TYPES.STORAGE_CHARGE,

        // Generator annotations
        constants.ANNOTATION_TYPES.GENERATOR_RATEDPOWER,
        constants.ANNOTATION_TYPES.GENERATOR_POWERFACTOR,
        constants.ANNOTATION_TYPES.GENERATOR_RATEDRPM,

        // Load annotations
        constants.ANNOTATION_TYPES.LOAD_RATEDVOLTAGE,
        constants.ANNOTATION_TYPES.LOAD_RATEDPOWER,
        constants.ANNOTATION_TYPES.LOAD_POWERFACTOR,
        constants.ANNOTATION_TYPES.LOAD_LOADMODEL,

        // Power Flow annotations
        constants.ANNOTATION_TYPES.CALC_CURRENT,
        constants.ANNOTATION_TYPES.CALC_VOLTAGE,
        constants.ANNOTATION_TYPES.PU,
        constants.ANNOTATION_TYPES.PERCENT_VOLTAGE_DROP,
        constants.ANNOTATION_TYPES.P,
        constants.ANNOTATION_TYPES.Q,
        constants.ANNOTATION_TYPES.PERCENT_LOADED,

        // Short Circuit annotations
        constants.ANNOTATION_TYPES.FAULT_XR_RATIO,
        constants.ANNOTATION_TYPES.SYMM_FAULT,
        constants.ANNOTATION_TYPES.ASYMM_FAULT,

        // Fuse annotations
        constants.ANNOTATION_TYPES.FUSE_AMPRATING,
        constants.ANNOTATION_TYPES.FUSE_MODELNUM,

        // Breaker annotations
        constants.ANNOTATION_TYPES.BREAKER_AMPRATING,
        constants.ANNOTATION_TYPES.BREAKER_MODELNUM,

        // Switch annotations
        constants.ANNOTATION_TYPES.SWITCH_AMPRATING,
        constants.ANNOTATION_TYPES.SWITCH_MODELNUM,

        // Relay annotations
        constants.ANNOTATION_TYPES.RELAY_TYPE,
        constants.ANNOTATION_TYPES.RELAY_MODELNUM,
    ],

    NAME: {
        appliesTo: null,
        key: constants.ANNOTATION_TYPES.NAME
    },
    DESCRIPTION: {
        appliesTo: null,
        key: constants.ANNOTATION_TYPES.DESCRIPTION
    },
    CATALOG_NAME: {
        appliesTo: null,
        key: constants.ANNOTATION_TYPES.CATALOG_NAME
    },
    VOLTAGE: {
        appliesTo: null,
        key: constants.ANNOTATION_TYPES.VOLTAGE
    },

    UTILITY_SHORTCIRCUIT_LL: {
        appliesTo: constants.NODE_TYPES.UTILITY,
        key: constants.ANNOTATION_TYPES.UTILITY_SHORTCIRCUIT_LL
    },
    UTILITY_SHORTCIRCUIT_LN: {
        appliesTo: constants.NODE_TYPES.UTILITY,
        key: constants.ANNOTATION_TYPES.UTILITY_SHORTCIRCUIT_LN
    },

    SOLAR_RATEDPOWER: {
        appliesTo: constants.NODE_TYPES.SOLAR,
        key: constants.ANNOTATION_TYPES.SOLAR_RATEDPOWER
    },
    SOLAR_POWERFACTOR: {
        appliesTo: constants.NODE_TYPES.SOLAR,
        key: constants.ANNOTATION_TYPES.SOLAR_POWERFACTOR
    },

    WIND_RATEDPOWER: {
        appliesTo: constants.NODE_TYPES.WIND,
        key: constants.ANNOTATION_TYPES.WIND_RATEDPOWER
    },
    WIND_WTGTYPE: {
        appliesTo: constants.NODE_TYPES.WIND,
        key: constants.ANNOTATION_TYPES.WIND_WTGTYPE
    },

    STORAGE_STATE: {
        appliesTo: constants.NODE_TYPES.STORAGE,
        key: constants.ANNOTATION_TYPES.STORAGE_STATE
    },
    STORAGE_CHARGE: {
        appliesTo: constants.NODE_TYPES.STORAGE,
        key: constants.ANNOTATION_TYPES.STORAGE_CHARGE
    },

    GENERATOR_RATEDPOWER: {
        appliesTo: constants.NODE_TYPES.GENERATOR,
        key: constants.ANNOTATION_TYPES.GENERATOR_RATEDPOWER
    },
    GENERATOR_POWERFACTOR: {
        appliesTo: constants.NODE_TYPES.GENERATOR,
        key: constants.ANNOTATION_TYPES.GENERATOR_POWERFACTOR
    }, GENERATOR_RATEDRPM: {
        appliesTo: constants.NODE_TYPES.GENERATOR,
        key: constants.ANNOTATION_TYPES.GENERATOR_RATEDRPM
    },

    LOAD_RATEDVOLTAGE: {
        appliesTo: constants.NODE_TYPES.LOAD,
        key: constants.ANNOTATION_TYPES.LOAD_RATEDVOLTAGE
    },
    LOAD_RATEDPOWER: {
        appliesTo: constants.NODE_TYPES.LOAD,
        key: constants.ANNOTATION_TYPES.LOAD_RATEDPOWER
    },
    LOAD_POWERFACTOR: {
        appliesTo: constants.NODE_TYPES.LOAD,
        key: constants.ANNOTATION_TYPES.LOAD_POWERFACTOR
    },
    LOAD_LOADMODEL: {
        appliesTo: constants.NODE_TYPES.LOAD,
        key: constants.ANNOTATION_TYPES.LOAD_LOADMODEL
    },

    CABLE_LENGTH: {
        appliesTo: constants.BRANCH_TYPES.CABLE,
        key: constants.ANNOTATION_TYPES.CABLE_LENGTH
    },
    CABLE_SIZE: {
        appliesTo: constants.BRANCH_TYPES.CABLE,
        key: constants.ANNOTATION_TYPES.CABLE_SIZE
    },
    CABLE_MATERIAL: {
        appliesTo: constants.BRANCH_TYPES.CABLE,
        key: constants.ANNOTATION_TYPES.CABLE_MATERIAL
    },
    CABLE_RATEDVOLTAGE: {
        appliesTo: constants.BRANCH_TYPES.CABLE,
        key: constants.ANNOTATION_TYPES.CABLE_RATEDVOLTAGE
    },
    CABLE_NUMCONDUCTORS: {
        appliesTo: constants.BRANCH_TYPES.CABLE,
        key: constants.ANNOTATION_TYPES.CABLE_NUMCONDUCTORS
    },
    CABLE_INSULATION: {
        appliesTo: constants.BRANCH_TYPES.CABLE,
        key: constants.ANNOTATION_TYPES.CABLE_INSULATION
    },
    CABLE_PARALLEL: {
        appliesTo: constants.BRANCH_TYPES.CABLE,
        key: constants.ANNOTATION_TYPES.CABLE_PARALLEL
    },
    CABLE_AMPACITY: {
        appliesTo: constants.BRANCH_TYPES.CABLE,
        key: constants.ANNOTATION_TYPES.CABLE_AMPACITY
    },

    TRANS_RATING: {
        appliesTo: constants.BRANCH_TYPES.TRANS2W,
        key: constants.ANNOTATION_TYPES.TRANS_RATING
    },
    TRANS_IMPEDANCE: {
        appliesTo: constants.BRANCH_TYPES.TRANS2W,
        key: constants.ANNOTATION_TYPES.TRANS_IMPEDANCE
    },

    FUSE_AMPRATING: {
        appliesTo: constants.DEVICE_TYPES.FUSE,
        key: constants.ANNOTATION_TYPES.FUSE_AMPRATING
    },
    FUSE_MODELNUM: {
        appliesTo: constants.DEVICE_TYPES.FUSE,
        key: constants.ANNOTATION_TYPES.FUSE_MODELNUM
    },

    BREAKER_AMPRATING: {
        appliesTo: constants.DEVICE_TYPES.BREAKER,
        key: constants.ANNOTATION_TYPES.BREAKER_AMPRATING
    },
    BREAKER_MODELNUM: {
        appliesTo: constants.DEVICE_TYPES.BREAKER,
        key: constants.ANNOTATION_TYPES.BREAKER_MODELNUM
    },

    SWITCH_AMPRATING: {
        appliesTo: constants.DEVICE_TYPES.SWITCH,
        key: constants.ANNOTATION_TYPES.SWITCH_AMPRATING
    },
    SWITCH_MODELNUM: {
        appliesTo: constants.DEVICE_TYPES.SWITCH,
        key: constants.ANNOTATION_TYPES.SWITCH_MODELNUM
    },

    RELAY_TYPE: {
        appliesTo: constants.DEVICE_TYPES.RELAY,
        key: constants.ANNOTATION_TYPES.RELAY_TYPE
    },
    RELAY_MODELNUM: {
        appliesTo: constants.DEVICE_TYPES.RELAY,
        key: constants.ANNOTATION_TYPES.RELAY_MODELNUM
    },

    PERCENT_LOADED: {
        appliesTo: [
            // PERCENT_LOADED applies to all branch types -except- for Direct Connection
            constants.BRANCH_TYPES.CABLE,
            constants.BRANCH_TYPES.TRANS2W
        ],
        key: constants.ANNOTATION_TYPES.PERCENT_LOADED
    },
    PERCENT_VOLTAGE_DROP: {
        appliesTo: constants.EQUIPMENT_CATEGORIES.NODE,
        key: constants.ANNOTATION_TYPES.PERCENT_VOLTAGE_DROP
    },

    CALC_CURRENT: {
        appliesTo: constants.EQUIPMENT_CATEGORIES.BRANCH,
        key: constants.ANNOTATION_TYPES.CALC_CURRENT
    },
    CALC_VOLTAGE: {
        appliesTo: constants.EQUIPMENT_CATEGORIES.NODE,
        key: constants.ANNOTATION_TYPES.CALC_VOLTAGE
    },

    PU: {
        appliesTo: constants.EQUIPMENT_CATEGORIES.NODE,
        key: constants.ANNOTATION_TYPES.PU
    },
    P: {
        appliesTo: null,
        key: constants.ANNOTATION_TYPES.P
    },
    Q: {
        appliesTo: null,
        key: constants.ANNOTATION_TYPES.Q
    },
    FAULT_XR_RATIO: {
        appliesTo: constants.EQUIPMENT_CATEGORIES.NODE,
        key: constants.ANNOTATION_TYPES.FAULT_XR_RATIO
    },
    SYMM_FAULT: {
        appliesTo: constants.EQUIPMENT_CATEGORIES.NODE,
        key: constants.ANNOTATION_TYPES.SYMM_FAULT
    },
    ASYMM_FAULT: {
        appliesTo: constants.EQUIPMENT_CATEGORIES.NODE,
        key: constants.ANNOTATION_TYPES.ASYMM_FAULT
    }
}

Object.freeze(constants)  // Make constants immutable

export default constants