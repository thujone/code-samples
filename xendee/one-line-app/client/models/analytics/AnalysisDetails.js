import {
    List
} from '../../../yfiles/lib/es-modules/yfiles.js'

import constants from '../../constants.js'
import utils from '../../utils.js'

export default class AnalysisDetails {
    constructor(analysisDto) {
        this._analysis = analysisDto.Analysis
        this._options = new List(analysisDto.Options)
        this._annotations = null
        this._reports = analysisDto.Reports
        this._reportIndex = 0
    }

    get Analysis() { return this._analysis }
    get Options() { return this._options }
    get Reports() { return this._reports }

    get ReportIndex() { return this._currentReportIndex }
    set ReportIndex(value) { this._currentReportIndex = value }

    /// Returns true if the analysis is one of the short-circuit analyses, false otherwise
    get IsShortCircuit() {
        return this._analysis.AnalysisTypeId === constants.ANALYTICS.SHORT_CIRCUIT_ANSI || this._analysis.AnalysisTypeId === constants.ANALYTICS.SHORT_CIRCUIT_CLASSICAL
    }

    get Annotations() {
        if (this._annotations === null) {
            this._annotations = []
                constants.ANNOTATION_TYPES.P,
                constants.ANNOTATION_TYPES.Q

            this.Options.forEach(opt => {
                if (opt.value === true) {
                    const anno = this._getAnnotationForOption(opt)
                    if (anno !== null && anno.length > 0)
                        this._annotations.push(anno)
                }
            })

            // For Power-Flow analyses, always annotate P & Q and cable ampacity
            // NOTE: This is not needed for newer Power Flow analyses, as these are added on the server when the analysis is run... but for backwards compat we need to add these...
            if (this.Analysis.AnalysisTypeId === constants.ANALYTICS.POWER_FLOW) {
                this._annotations.push(constants.ANNOTATION_TYPES.CABLE_AMPACITY)
                this._annotations.push(constants.ANNOTATION_TYPES.P)
                this._annotations.push(constants.ANNOTATION_TYPES.Q)
            }
        }

        return this._annotations
    }

    /// Returns the nodeToNodeDistance to use for the yWorks layout coordinator. Returning null instructs yWorks to use the default distance
    getNodeToNodeDistance() {
        // For short-circuit analyses that have non-three-phase faults, use a wider nodeToNodeDistance setting
        // since the annotations include currents across all three phases (and therefore need more horizontal space)
        if (this.IsShortCircuit && this.getOptionValue(constants.ANALYSIS_OPTIONS.SHORT_CIRCUIT_NOT_THREE_PHASE_FAULT)) {
            return 215
        }

        return null
    }

    /// Returns an HTML string with details about the analysis being viewed; displayed on screen of the analysis backline annotation
    getDetails() {
        let details = `<h2>${this._analysis.StudyName}</h2>
            <i>${this._analysis.AnalyticName}</i><br />
            Generated: <span class="analysis-detail">${utils.forms.convertUtcDateTimeToRelativeTime(this._analysis.DateGenerated)}</span><br />`

        if (this.IsShortCircuit) {
            const studyDataPieces = this._analysis.StudyData.split("|")
            details += `Swing bus: <span class="analysis-detail">${studyDataPieces[0]}</span>`

            if (studyDataPieces.length > 1) {
                details += `<br />Fault bus: <span class="analysis-detail">${studyDataPieces[1].length > 0 ? studyDataPieces[1] : "All"}</span>`
            }

            if (studyDataPieces.length > 3) {
                details += `<br />Fault type: <span class="analysis-detail">${this.getFaultType(studyDataPieces[2], studyDataPieces[3])}</span>`
            }

            if (studyDataPieces.length > 5) {
                details += `<br />Fixed X/R: <span class="analysis-detail">${studyDataPieces[5] === "true" ? "Yes" : "No"}</span>`
            }

            details += `<br />Fault cycle: <span class="analysis-detail">${this.getSubanalysisTitle()}</span>`
        } else {
            details += `Swing bus: <span class="analysis-detail">${this._analysis.StudyData}</span>`
        }

        return details
    }

    getFaultType(faultType, faultPhases) {
        const displayPieces = []

        Object.keys(constants.SHORT_CIRCUIT.FAULTS).forEach(item => {
            if (constants.SHORT_CIRCUIT.FAULTS[item].VALUE === faultType) {
                displayPieces.push(constants.SHORT_CIRCUIT.FAULTS[item].TEXT)
            }
        })

        Object.keys(constants.SHORT_CIRCUIT.PHASES).forEach(item => {
            if (constants.SHORT_CIRCUIT.PHASES[item].VALUE === faultPhases) {
                displayPieces.push(constants.SHORT_CIRCUIT.PHASES[item].TEXT)
            }
        })

        return displayPieces.join(", ")
    }

    getSubanalysisTitle() {
        if (this._analysis.AnalysisTypeId === constants.ANALYTICS.SHORT_CIRCUIT_ANSI) {
            switch (this.ReportIndex) {
                case 0: return "Peak"
                case 1: return "Momentary"
                case 2: return "1st Cycle"
                case 3: return "Interrupting"
                case 4: return "30 Cycle"
            }
        } else if (this._analysis.AnalysisTypeId === constants.ANALYTICS.SHORT_CIRCUIT_CLASSICAL) {
            switch (this.ReportIndex) {
                case 0: return "½ Cycle"
                case 1: return "1½ - 4 Cycle"
                case 2: return "8 Cycle"
                case 3: return "30 Cycle"
            }
        }

        return "";
    }

    showPandQArrows() {
        return this._annotations.includes(constants.ANNOTATION_TYPES.P) || this._annotations.includes(constants.ANNOTATION_TYPES.Q)
    }

    getProjectData() {
        return this._reports[this.ReportIndex].ProjectData;
    }

    _getAnnotationForOption(opt) {
        switch (opt.id) {
            case constants.ANALYSIS_OPTIONS.ANNOTATE_NAME: return constants.ANNOTATION_TYPES.NAME
            case constants.ANALYSIS_OPTIONS.ANNOTATE_DESCRIPTION: return constants.ANNOTATION_TYPES.DESCRIPTION
            case constants.ANALYSIS_OPTIONS.ANNOTATE_CATALOG_NAME: return constants.ANNOTATION_TYPES.CATALOG_NAME
            case constants.ANALYSIS_OPTIONS.ANNOTATE_VOLTAGE: return constants.ANNOTATION_TYPES.VOLTAGE
            case constants.ANALYSIS_OPTIONS.ANNOTATE_PERCENT_LOADED: return constants.ANNOTATION_TYPES.PERCENT_LOADED
            case constants.ANALYSIS_OPTIONS.ANNOTATE_PERCENT_VOLTAGE_DROP: return constants.ANNOTATION_TYPES.PERCENT_VOLTAGE_DROP
            case constants.ANALYSIS_OPTIONS.ANNOTATE_CALC_CURRENT: return constants.ANNOTATION_TYPES.CALC_CURRENT
            case constants.ANALYSIS_OPTIONS.ANNOTATE_CALC_VOLTAGE: return constants.ANNOTATION_TYPES.CALC_VOLTAGE
            case constants.ANALYSIS_OPTIONS.ANNOTATE_RATED_POWER: return constants.ANNOTATION_TYPES.LOAD_RATEDPOWER
            case constants.ANALYSIS_OPTIONS.ANNOTATE_PU: return constants.ANNOTATION_TYPES.PU
            case constants.ANALYSIS_OPTIONS.ANNOTATE_P: return constants.ANNOTATION_TYPES.P
            case constants.ANALYSIS_OPTIONS.ANNOTATE_Q: return constants.ANNOTATION_TYPES.Q
            case constants.ANALYSIS_OPTIONS.ANNOTATE_CABLE_AMPACITY: return constants.ANNOTATION_TYPES.CABLE_AMPACITY
            case constants.ANALYSIS_OPTIONS.ANNOTATE_FAULT_XR_RATIO: return constants.ANNOTATION_TYPES.FAULT_XR_RATIO
            case constants.ANALYSIS_OPTIONS.ANNOTATE_SYMM_FAULT: return constants.ANNOTATION_TYPES.SYMM_FAULT
            case constants.ANALYSIS_OPTIONS.ANNOTATE_ASYMM_FAULT: return constants.ANNOTATION_TYPES.ASYMM_FAULT
            default: return null
        }
    }

    getAnalysisNode(nodeId) {
        for (let i = 0; i < this.Reports.length; i++) {
            const matchedNode = this.Reports[i].ReportNodes.filter(node => node.NodeId === nodeId)
            if (matchedNode.length > 0) {
                return matchedNode[0]
            }
        }

        return null
    }

    getAnalysisBranch(branchId) {
        for (let i = 0; i < this.Reports.length; i++) {
            const matchedBranch = this.Reports[i].ReportBranches.filter(node => node.BranchId === branchId)
            if (matchedBranch.length > 0) {
                return matchedBranch[0]
            }
        }

        return null
    }

    getOptionValue(id) {
        const opt = this.Options.filter(o => o.id === id).firstOrDefault()
        return opt === null ? null : opt.value
    }
}