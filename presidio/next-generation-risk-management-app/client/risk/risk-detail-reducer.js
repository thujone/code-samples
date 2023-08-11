import * as types from './risk-action-types'

export const initState = {
  currentPageIndex: 0,
  pageSize: 10,
  filters: {},
  sort: {},
  Id: '',
  EngagementId: '',
  MitigationStatusId: '',
  ResourceId: '',
  GroupId: '',
  Name: '',
  PhaseId: '',
  ImportedDate: '',
  ImportedBy: '',
  Phase: '',
  InherentRisk: '',
  Likelihood: '',
  Description: '',
  ResourceList: [],
  GroupList: [],
  Recommendation: '',
  MitigationStatus: '',
  MitigationDate: '',
  TargetRemediationDate: '',
  AffectedSystemsCount: '',
  PossibleAffectedSystemsCount: '',
  Effectiveness: '',
  ControlEffectiveness: '',
  References: '',
  ReferenceUrls:[],
  Impact: '',
  RiskScore: '',
  PhaseList:[],
  MitigationStatusList:[],
  VulnerabilityList:[],
  InherentSeverity: '',
  ScoreSeverity: '',
  ImpactSeverity: '',
  LikelihoodSeverity: '',
  RemediationStatus: '',
  RemediationStatusId: '',
  ThreatLevels:[],
  EffectivenessLevels:[],
}

const riskDetailReducer = (state = initState, action) => {
  switch (action.type) {
    case types.RISK_GET_SUCCESS:
      return {
        ...state,
        ...action.payload,
        currentPageIndex: 0,
        filters: {},
        sort: {}
      }
    case types.RISK_POST_FETCHING:
      return {
        ...state,
        IsFetching: true
      }
    case types.RISK_POST_SUCCESS:
      return {
        ...state,
        IsFetching: false
      }
    case types.RISK_POST_FAILED:
      return {
        ...state,
        IsFetching: false
      }
    case types.RISK_VULNERABILITIES_SORT:
      let localSort = {}

      // toggle sort direction from asc to desc for field
      if (state.sort[action.field] && state.sort[action.field].direction === "asc") {
        localSort[action.field] = {
          direction: "desc",
          comparator: action.comparator
        }
      }
      else {
        // set sort direction asc for field
        localSort[action.field] = {
          direction: "asc",
          comparator: action.comparator
        }
      }

      return {
        ...state,
        sort: localSort,
        currentPageIndex: 0
      }
    case types.RISK_VULNERABILITIES_FILTER:
      const localFilters = {
        ...state.filters
      }

      // update field filter value only when not empty
      if (action.value && action.value !== "") {
        localFilters[action.field] = {
          value: action.value,
          filter: action.filter
        }
      } else {
        // remove field filter when empty
        delete localFilters[action.field]
      }

      return {
        ...state,
        filters: localFilters,
        currentPageIndex: 0
      }
    case types.RISK_VULNERABILITIES_PAGE_SIZE_CHANGE:
      return {
        ...state,
        pageSize: action.size
      }
    case types.RISK_VULNERABILITIES_PAGE_INDEX_CHANGE:
      return {
        ...state,
        currentPageIndex: action.index
      }
    case types.RISK_NAME_CHANGE:
      return {
        ...state,
        Name: action.value
      }
    case types.RISK_PHASE_CHANGE:
      return {
        ...state,
        PhaseId: action.value
      }
    case types.RISK_INHERENT_RISK_CHANGE:
      return {
        ...state,
        InherentRisk: action.value
      }
    case types.RISK_LIKELIHOOD_CHANGE:
      return {
        ...state,
        Likelihood: action.value
      }
    case types.RISK_MITIGATION_STATUS_CHANGE:
      return {
        ...state,
        MitigationStatusId: action.value
      }
    case types.RISK_IMPACT_CHANGE:
      return {
        ...state,
        Impact: action.value
      }
    case types.RISK_SCORE_CHANGE:
      return {
        ...state,
        RiskScore: action.value
      }
    case types.RISK_DESCRIPTION_CHANGE:
      return {
        ...state,
        Description: action.value
      }
    case types.RISK_RECOMMENDATION_CHANGE:
      return {
        ...state,
        Recommendation: action.value
      }
    case types.RISK_REFERENCES_CHANGE:
      return {
        ...state,
        References: action.value
      }
    case types.RISK_EFFECTIVENESS_CHANGE:
      return {
        ...state,
        Effectiveness: action.value
      }
    case types.RISK_CONTROL_EFFECTIVENESS_CHANGE:
      return {
        ...state,
        ControlEffectiveness: action.value
      }
    case types.RISK_AFFECTED_SYSTEMS_CHANGE:
      return {
        ...state,
        AffectedSystemsCount: action.value
      }
    case types.RISK_POSSIBLE_AFFECTED_SYSTEMS_CHANGE:
      return {
        ...state,
        PossibleAffectedSystemsCount: action.value
      }
    case types.RISK_REMEDIATION_STATUS_CHANGE:
      return {
        ...state,
        RemediationStatusId: action.value
      }
    case types.RISK_MITIGATION_DATE_CHANGE:
    case types.RISK_MITIGATION_DATE_SELECTED:
      return {
        ...state,
        MitigationDate: action.value
      }
    case types.RISK_TARGET_REMEDIATION_DATE_CHANGE:
    case types.RISK_TARGET_REMEDIATION_DATE_SELECTED:
      return {
        ...state,
        TargetRemediationDate: action.value
      }
    case types.RISK_RESOURCE_ASSIGN_SAVE:
      return {
        ...state,
        ResourceId: action.resource,
        GroupId: action.group
      }
    default:
      return state
  }
}

export default riskDetailReducer