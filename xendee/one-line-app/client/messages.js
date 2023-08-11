import constants from './constants.js'

const messages = {

    // General project messaging
    PROJECT_LOADED: projectName => `Project <strong>${projectName}</strong> loaded.`,
    BAD_GRAPH_FETCH: 'Sorry, could not retrieve graph data.',
    BAD_NODE_RENDER: 'Sorry, could not render graph nodes.',
    BAD_BRANCH_RENDER: 'Sorry, could not render graph branches.',
    CANNOT_ADD_BRANCH_TOO_FEW_AVAILABLE_NODES: branchType => `You cannot add a ${constants.LABELS[branchType]} as there are not enough available nodes.<br /><br />To add a branch there must be at least one available source node and one available target node.`,
    SERVER_ERROR: 'Sorry, a server error has occurred.',
    POST_NODE_SUCCESS: name => `A new node named <strong>${name}</strong> has been added.`,
    POST_BRANCH_SUCCESS: name => `A new branch named <strong>${name}</strong> has been added.`,
    POST_BRANCH_ERROR: name => `Error creating branch <strong>${name}</strong>.`,
    MISSING_CONNECTION_SELECTION: 'Both "From" node and "To" node must be selected.',
    CONFIRM_DELETE_NODE: name => `Are you sure you want to delete node <strong>${name}</strong>?`,
    CONFIRM_DELETE_BRANCH: name => `Are you sure you want to delete branch <strong>${name}</strong>?`,
    CONFIRM_DELETE_DEVICE: name => `Are you sure you want to delete device <strong>${name}</strong>?`,
    CONFIRM_DELETE_GIS_IMPORT_PROFILE: profileName => `Are you sure you want to delete profile <strong>${profileName}</strong>?`,
    CONFIRM_DELETE_ANALYSIS: analysisName => `Are you sure you want to delete analysis <strong>${analysisName}</strong>?`,
    BAD_LAYOUT: 'Sorry, could not update the layout.',
    EQUIPMENT_NAME_NOT_UNIQUE: name => `The name <strong>${name}</strong> is already in use. Please enter a unique name and try again.`,
    GENERIC_MAX_REQUESTS: 'Network is busy. Please wait a moment and try again.',
    MAX_REQUESTS_WITH_TYPE: itemType => `Could not create ${itemType}. ${messages.GENERIC_MAX_REQUESTS}`,
    MISMATCHED_CONNECTIONS: (fromNode, toNode) => `You cannot join ${fromNode.Name} to ${toNode.Name} because of mismatching connections. ${fromNode.Name} is connected via ${getConnectionName(fromNode.InternalConnection)}, whereas ${toNode.Name} is connected via ${getConnectionName(toNode.InternalConnection)}. Please change the connection type of one of these nodes and try again.`,

    // Generator
    X2_VALIDATION_ERROR: `If you're providing a <b>Negative Sequence Reactance (X2)</b> value, it must be less than or equal to the <b>Subtransient</b> value.`,

    MAX_POWER_CALCULATOR_ERROR: fieldLabel => `
        To have XENDEE calculate <strong>${fieldLabel}</strong>, please enter valid values for <strong>Rated Power</strong> (greater than 0 and less than 1000000) and <strong>Power Factor</strong> (greater than 1 and less than 100).
    `,
    MAX_POWER_CALCULATOR_ERROR_WIND: (fieldLabel, powerFactorLabel) => `
        To have XENDEE calculate <strong>${fieldLabel}</strong>, please enter valid values for <strong>Rated Power</strong> (greater than 0 and less than 1000000) and <strong>${powerFactorLabel}</strong> (greater than 1 and less than 100).
    `,

    // Save project
    SAVE_PROJECT_AS_SUCCESS: (currentProjectName, newProjectName) => `
        <p>Project saved as <strong>${newProjectName}</strong>.</p>
        <p>Click <strong>Continue</strong> to load the new project, <strong>${newProjectName}</strong>.</p>
        <p>Click <strong>Cancel</strong> to stay on this project, <strong>${currentProjectName}</strong>.</p>
    `,
    SAVE_PROJECT_AS_ERROR: 'Sorry, project could not be saved.',
    PROJECT_SETTINGS_SAVED: '<strong>Project and Annotation Settings</strong> saved.',
    PROJECT_SETTINGS_NOT_SAVED: 'Sorry, <strong>Project and Annotation Settings</strong> could not be saved.',

    // Send Copy
    SEND_COPY_TO_SUCCESS: 'Copy of the project sent successfully.',
    SEND_COPY_TO_NO_RECIPIENT: 'Please select a recipient.',

    // Solar details modal
    POST_SIMULATION_REQUIRED_FIELDS: '<strong>Latitude</strong>, <strong>Longitude</strong>, <strong>Array Tilt Angle</strong>, <strong>System Losses</strong>, and <strong>Efficiency</strong> are required fields for simulation.',
    POST_SIMULATION_SUCCESS: 'Simulation complete.',
    GET_SOLAR_CHART_SUCCESS: 'Chart retrieved.',

    // Wind details modal
    POST_WIND_COMPUTATION_REQUIRED_FIELDS: '<strong>Latitude</strong>, <strong>Longitude</strong>, <strong>Hub Height</strong>, and <strong>Turbine Model</strong> are required fields for performance computation.',
    POST_WIND_COMPUTATION_SUCCESS: '<strong>Wind Performance</strong> computation complete.',
    GET_WIND_CHART_SUCCESS: 'Chart retrieved.',
    RATED_POWER_MISMATCH: '<strong>Note:</strong> The rated size of the selected <strong>Turbine Model</strong> does not currently match the <strong>Rated Power</strong>.',
    INPUT_STRING_INCORRECT_FORMAT: 'Input string was not in a correct format.',
    LAT_LNG_OUT_OF_RANGE: 'Could not render chart. Please make sure <strong>Latitude</strong> and <strong>Longitude</strong> values are correct.',

    // Power producers
    VOLTAGE_CHANGED_FROM_NODE_PROPERTY: 'You have updated the voltage of a power producing node. The voltages for all other connected power producing nodes and transformer windings have been updated accordingly.',
    CONNECTION_CHANGED_FROM_NODE_PROPERTY: 'You have updated the connection type of a power producing node. The connection type for all other connected equipment has been updated accordingly.',
    VOLTAGE_CHANGED_FROM_BRANCH_PROPERTY: 'You have updated the voltage of a transformer winding. The voltages for all other connected power producing nodes and transformer windings have been updated accordingly.',
    CONNECTION_CHANGED_FROM_BRANCH_PROPERTY: 'You have updated the winding type of a transformer winding. The winding type for all other connected equipment has been updated accordingly.',

    // Storage
    VALIDATION_MAX_MIN_CHARGE: '<strong>Max Charge</strong> must be greater than or equal to <strong>Min Charge</strong>.',
    VALIDATION_MAX_MIN_VOLTAGE: '<strong>Max Voltage</strong> must be greater than or equal to <strong>Min Voltage</strong>.',

    // Cables
    COMPUTED_LENGTH: computedLength => `The computed length is <strong>${computedLength} ft</strong>.`,

    // Validation
    VALIDATION_REQUIRED: fieldLabel => `<strong>${fieldLabel}</strong> is a required field.`,
    VALIDATION_IS_NOT_NUMERIC: fieldLabel => `<strong>${fieldLabel}</strong> must be a valid number.`,
    VALIDATION_IS_NOT_INTEGER: fieldLabel => `<strong>${fieldLabel}</strong> must be a whole number.`,
    VALIDATION_IS_NOT_BOOLEAN: fieldLabel => `<strong>${fieldLabel}</strong> must be a boolean value.`,
    VALIDATION_IS_NOT_AGE: 'For an existing <strong>Lifetime</strong>, <strong>Age</strong> is required and must be greater than 0 and less than the value of <strong>Lifetime</strong>.',
    VALIDATION_IS_NOT_BIT: fieldLabel => `<strong>${fieldLabel}</strong> must be "on" or "off".`,
    VALIDATION_MAX_LENGTH: (fieldLabel, maxLength) => `<strong>${fieldLabel}</strong> must be no longer than ${maxLength} characters in length.`,
    VALIDATION_MIN_LENGTH: (fieldLabel, minLength) => `<strong>${fieldLabel}</strong> must be at least ${minLength} characters in length.`,
    VALIDATION_IS_NOT_WITHIN_NUMERIC_RANGE: (fieldLabel, rangeParams, fieldValidationResult) => `
        <strong>${fieldLabel}</strong> must be a number greater than
        ${fieldValidationResult.inclusiveFloor ? 'or equal to' : ''} ${fieldValidationResult.floor}
        and less than ${rangeParams.inclusiveCeiling ? 'or equal to' : ''} ${fieldValidationResult.ceiling}.
    `,
    VALIDATION_IS_NOT_GREATER_THAN: (fieldLabel, params, fieldValidationResult) =>
        `<strong>${fieldLabel}</strong> must be a number greater than ${(fieldValidationResult.inclusive) ? 'or equal to' : ''} ${fieldValidationResult.floor}.`,
    VALIDATION_IS_NOT_LESS_THAN: (fieldLabel, params) =>
        `<strong>${fieldLabel}</strong> must be a number less than ${params.inclusive ? 'or equal to' : ''} ${params.ceiling}.`,
    VALIDATION_IS_NOT_EQUIPMENT_NAME: (fieldLabel) => `<strong>${fieldLabel}</strong> may contain only letters, numbers, and underscores. Blank spaces are permitted between words.`,

    // Catalogs
    BAD_CATALOG_FETCH: 'Sorry, could not retrieve the catalog.',
    CATALOG_ROW_SELECTED: 'Please choose an item and click <strong>Select</strong>.',
    CATALOG_NAME_UNAVAILABLE: 'Sorry, that catalog item name is already taken. Please enter a unique name.',
    ADD_CATALOG_ITEM_SUCCESS: name => `<strong>${name}</strong> saved to <strong>My Catalog</strong>.`,
    ADD_DEFAULT_CATALOG_ITEM_SUCCESS: name => `<strong>${name}</strong> saved as a default to <strong>My Catalog</strong>.`,

    // Load shapes
    UPLOAD_LOAD_SHAPE_SUCCESS: name => `Load shape <strong>${name}</strong> uploaded successfully.`,
    IMPORT_NREL_LOAD_SHAPE_SUCCESS: name => `<strong>${name}</strong> imported successfully.`,
    DELETE_LOAD_SHAPE_SUCCESS: 'Load shape deleted successfully.',

    // Dispatch shapes
    UPLOAD_DISPATCH_SHAPE_SUCCESS: name => `Dispatch shape <strong>${name}</strong> uploaded successfully.`,
    DELETE_DISPATCH_SHAPE_SUCCESS: 'Dispatch shape deleted successfully.',

    // Analyses
    ANALYSES_MISSING_SWING_BUS: 'Please select a <strong>Swing Bus</strong>.',
    ANALYSES_MISSING_FAULT_LOCATION_BUS: 'Please select a specific <strong>Fault Location Bus</strong> or choose to fault all buses.',
    ANALYSES_MISSING_FAULT_TYPE: 'Please select a <strong>Fault Type</strong>.',
    ANALYSES_MISSING_PHASE_TO_FAULT: 'The selected <strong>Fault Type</strong> requires a specific <strong>Phase to Fault</strong>. Please choose the <strong>Phase to Fault</strong>.',
    ANALYSES_MISSING_STUDY_NAME: 'Please enter a <strong>Study Name</strong>.',
    ANALYSES_MISSING_ENGINE: 'Please choose an analysis engine by selecting a row in the table and try again.',
    ANALYSES_STUDY_NAME_TOO_LONG: '<strong>Study Name</strong> cannot be longer than 250 characters in length.',
    SAVE_ANALYSIS_SETTINGS_SUCCESS: `<strong>Analysis Settings</strong> saved.`,
    SAVE_ANALYSIS_SETTINGS_ERROR: `Sorry, could not save <strong>Analysis Settings</strong>.`,
    ANALYSES_RUNTIME_SUCCESS_MESSAGE: 'The analysis has completed.',

    // Import GIS Result
    MISSING_LOAD: `
        Sorry, you cannot create a new economic import profile, because there must be at least one
        <strong>Load</strong> in your One-Line project. Please add one and try again.
    `,
    MISSING_ONE_LINE_NODE: nodeType => `
        Sorry, the GIS optimization result cannot be imported, because you do not have a
        corresponding One-Line node of type <strong class="node-type">${nodeType.toLowerCase()}</strong>.
        Please add one to your One-Line project and try again.
    `,
    TOO_FEW_ONE_LINE_GENERATORS: (gisGeneratorCount, oneLineGeneratorCount) => `
        Sorry, the GIS optimization result cannot be imported, because there
        must be at least as many One-Line generators (${oneLineGeneratorCount})
        as there are GIS generators (${gisGeneratorCount}). Please add ${gisGeneratorCount - oneLineGeneratorCount}
        generator${pluralize(gisGeneratorCount - oneLineGeneratorCount)} to your One-Line project and try again.
    `,
    TOO_FEW_ONE_LINE_WIND: (gisWindCount, oneLineWindCount) => `
        Sorry, the GIS optimization result cannot be imported, because there
        must be at least as many One-Line Wind Turbines (${oneLineWindCount})
        as there are GIS Wind Turbines (${gisWindCount}). Please add ${gisWindCount - oneLineWindCount}
        turbine${pluralize(gisWindCount - oneLineWindCount)} to your One-Line project and try again.
    `,
    TOO_FEW_ONE_LINE_LOADS: (gisLoadCount, oneLineLoadCount) => `
        Sorry, the GIS optimization result cannot be imported, because there
        must be at least as many One-Line load nodes (${oneLineLoadCount})
        as there are GIS load nodes (${gisLoadCount}). Please add ${gisLoadCount - oneLineLoadCount}
        load node${pluralize(gisLoadCount - oneLineLoadCount)} to your One-Line project and try again.
    `,
    TOO_FEW_ONE_LINE_EV: (gisEvCount, oneLineEvCount) => `
        Sorry, the GIS optimization result cannot be imported, because there
        must be at least as many One-Line EV charger nodes (${oneLineEvCount})
        as there are GIS EV charger nodes (${gisEvCount}). Please add ${gisEvCount - oneLineEvCount}
        EV charger node${pluralize(gisEvCount - oneLineEvCount)} to your One-Line project and try again.
    `,
    TOO_FEW_ONE_LINE_STORAGE: (gisStorageCount, oneLineStorageCount) => `
        Sorry, the GIS optimization result cannot be imported, because there
        must be at least as many One-Line storage nodes (${oneLineStorageCount})
        as there are GIS storage nodes (${gisStorageCount}). Please add ${gisStorageCount - oneLineStorageCount}
        storage node${pluralize(gisStorageCount - oneLineStorageCount)} to your One-Line project and try again.
    `,
    TOO_FEW_ONE_LINE_SOLAR: (gisSolarCount, oneLineSolarCount) => `
        Sorry, the GIS optimization result cannot be imported, because there
        must be at least as many One-Line solar nodes (${oneLineSolarCount})
        as there are GIS solar nodes (${gisSolarCount}). Please add ${gisSolarCount - oneLineSolarCount}
        solar node${pluralize(gisSolarCount - oneLineSolarCount)} to your One-Line project and try again.
    `,
    TOTAL_ALLOCATION_PERCENTAGES: (nodeType) => `
        <strong>Allocation Percentages</strong> for <strong class="node-type">${nodeType.toLowerCase()}</strong>
        must total 100%.
    `,
    TOTAL_ALLOCATION_PERCENTAGES_MULTINODE: (nodeType, gisNodeName) => `
        <strong>Allocation Percentages</strong> for
        <strong class="node-type">${nodeType.toLowerCase()}</strong> named
        <strong>${gisNodeName}</strong> must total 100%.
    `,
    ALLOCATION_WHOLE_NUMBERS_ONLY: (nodeType) => `
        Only whole numbers can be used for <span class="node-type">${nodeType.toLowerCase()}</span>
        <strong>Allocation Percentage</strong> fields.
    `,
    ONE_LINE_STORAGE_ALREADY_USED: (batteryName) => `
        You cannot map the one-line Storage node <strong>${batteryName}</strong> to multiple GIS Storage.
    `,
    ONE_LINE_SOLAR_ALREADY_USED: (solarName) => `
        You cannot map the one-line Solar node <strong>${solarName}</strong> to multiple GIS Solar PV.
    `,
    ONE_LINE_LOAD_ALREADY_USED: (loadName) => `
        You cannot map the one-line Load node <strong>${loadName}</strong> to both the Load and the EV.
    `,
    ONE_LINE_EV_ALREADY_USED: (evName) => `
        You cannot map the one-line EV Charger node <strong>${evName}</strong> to both the Load and the EV.
    `,
    ONE_LINE_GENERATOR_ALREADY_USED: (generatorName) => `
        You cannot map the one-line Generator node <strong>${generatorName}</strong> to multiple GIS Generators.
    `,
    GENERATOR_ALLOCATION_TOTAL: (gisNodeName, countTotal) => `
        The total <strong>Number of Units</strong> for <strong>${gisNodeName}</strong> must equal ${countTotal}.
    `,
    ONE_LINE_WIND_ALREADY_USED: (windName) => `
        You cannot map the one-line Wind Turbine node <strong>${windName}</strong> to multiple GIS Wind Turbines.
    `,
    WIND_ALLOCATION_TOTAL: (gisNodeName, countTotal) => `
        The total <strong>Number of Units</strong> for <strong>${gisNodeName}</strong> must equal ${countTotal}.
    `,
    BAD_DISPATCH_DATE: 'There is no data available for the selected Month and Day',
    MISSING_DATE_ROW_HOUR: 'Please select an <strong>Hour</strong> for the current row.',
    MISSING_DISPATCH_HOUR: 'Please select an <strong>Hour</strong> for each row before continuing.',
    DUPLICATE_DATE_ROW: 'You cannot add this date row, because it is a duplicate of a previous row.',
    PROFILE_NAME_IS_REQUIRED: '<strong>Profile Name</strong> is required.',
    PROFILE_NAME_TOO_LONG: '<strong>Profile Name</strong> cannot exceed 120 characters in length.',

    IMPORT_PROFILE_SAVED: 'Allocation and dispatch date have been saved successfully.',

    // Print
    PRINT_SCALE_INPUT_ERROR: '<strong>Scale</strong> must be a number between 0.0 and 10.0.',
    PRINT_MARGIN_INPUT_ERROR: '<strong>Graph Margin</strong> must be a number between 0 and 300.',

    // Protective devices
    ADD_DEVICE_SUCCESS: name => `Device <strong>${name}</strong> added successfully.`,

    // Map View
    LOCATION_UPDATE_SUCCESS: title => `Updated location of <strong>${title}</strong>.`,
    LOCATION_UPDATE_ERROR: title => `Could not update location of <strong>${title}</strong>.`,
    ADDRESS_FINDER_LOCATION_FOUND: location => `Map centered on location <strong>${location}</strong>.`,
    ADDRESS_FINDER_LOCATION_NOT_FOUND: location => `Sorry, could not find location '${location}'.`,
    VERTICES_UPDATE_SUCCESS: title => `Updated vertices for <strong>${title}</strong>.`,
    VERTICES_UPDATE_ERROR: title => `Could not update vertices for <strong>${title}</strong>.`,
    ENDPOINT_VERTEX_UPDATE_SUCCESS: `Updated endpoint vertex for connected branches.`,
    ENDPOINT_VERTEX_UPDATE_ERROR: `Could not update endpoint vertex for connected branches.`,
    CONTEXT_MENU_CONTENT: (elementId, elementName, elementType) => `
        <div class="context-menu visible">
          <button class="menu-item edit-item-button" data-id="${elementId}" data-type="${elementType}">
            <i class="far fa-edit context-menu-icon"></i>
            Edit ${elementName}
          </button>
          <button class="menu-item delete-item-button" data-id="${elementId}" data-type="${elementType}">
            <i class="far fa-trash-alt context-menu-icon"></i>
            Delete ${elementName}
          </button>
        </div>
    `
}

export const getConnectionName = (conn) => {
    switch (conn) {
        case 1: return constants.CONNECTIONS.DELTA.label
        case 2: return constants.CONNECTIONS.WYE_UNGROUNDED.label
        case 3: return constants.CONNECTIONS.WYE_SOLIDLY.label
        case 4: return constants.CONNECTIONS.WYE_IMPEDANCE.label
        default: return 'UNKNOWN'
    }
}

export const getMessage = (messageFunc, paramsArr) => messageFunc.call(messages, ...paramsArr)

export const getMessageAsListItem = (messageFunc, paramsArr) => `<li>${getMessage(messageFunc, paramsArr)}</li>`

export const pluralize = (count) => count > 1 ? 's' : ''

Object.freeze(messages)

export default messages