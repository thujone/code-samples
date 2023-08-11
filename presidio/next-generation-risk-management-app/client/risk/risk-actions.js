import axios from 'axios'
import * as endpoints from '../constants/endpoints'
import * as routes from '../constants/routes'
import * as httpStatus from '../constants/http-status-codes'
import * as types from './risk-action-types'
import * as chartActions from '../components/charts/chart-actions'

export const getItems = dispatch => engagementId => {
  dispatch({ type: types.RISK_GET_ITEMS_FETCHING })

  return axios.get(endpoints.RISKS + '/' + engagementId)
    .then(r => dispatch({ type: types.RISK_GET_ITEMS_SUCCESS, payload: r.data }))
    .catch(e => {
      if (e.response.status !== httpStatus.BAD_REQUEST) return
      dispatch({ type: types.RISK_GET_ITEMS_FAILED })
    })
}

export const getGrid = dispatch => engagementId => {
  if (engagementId) {
    chartActions.getRiskCharts(dispatch)(engagementId)
    getItems(dispatch)(engagementId)
  }
}

export const get = dispatch => (engagementId, riskId, location) => {

  dispatch({ type: types.RISK_GET_FETCHING })

  return axios.get(endpoints.RISKS + '/' + engagementId + '/' + riskId)
    .then(r => {
      const hasVulnerabilityList =
        r.data &&
        r.data.VulnerabilityList &&
        location &&
        location.state &&
        location.state.vulnerabilityList
      if (hasVulnerabilityList) {
        r.data.VulnerabilityList = [
          ...r.data.VulnerabilityList,
          ...location.state.vulnerabilityList
        ]
      }

      dispatch({ type: types.RISK_GET_SUCCESS, payload: r.data })
    })
    .catch(e => {
      if (e.response.status !== httpStatus.BAD_REQUEST) return
      dispatch({ type: types.RISK_GET_FAILED, error: e.response.data })
    })
}

export const handleNameChange = dispatch => (value) => {
  dispatch({ type: types.RISK_NAME_CHANGE, value })
}

export const handlePhaseChange = dispatch => (value) => {
  dispatch({ type: types.RISK_PHASE_CHANGE, value })
}

export const handleInherentRiskChange = dispatch => (value) => {
  dispatch({ type: types.RISK_INHERENT_RISK_CHANGE, value })
}

export const handleLikelihoodChange = dispatch => (value) => {
  dispatch({ type: types.RISK_LIKELIHOOD_CHANGE, value })
}

export const handleMitigationStatusChange = dispatch => (value) => {
  dispatch({ type: types.RISK_MITIGATION_STATUS_CHANGE, value })
}

export const handleImpactChange = dispatch => (value) => {
  dispatch({ type: types.RISK_IMPACT_CHANGE, value })
}

export const handleRiskScoreChange = dispatch => (value) => {
  dispatch({ type: types.RISK_SCORE_CHANGE, value })
}

export const handleDescriptionChange = dispatch => (value) => {
  dispatch({ type: types.RISK_DESCRIPTION_CHANGE, value })
}

export const handleRecommendationChange = dispatch => (value) => {
  dispatch({ type: types.RISK_RECOMMENDATION_CHANGE, value })
}

export const handleReferencesChange = dispatch => (value) => {
  dispatch({ type: types.RISK_REFERENCES_CHANGE, value })
}

export const handleEffectivenessChange = dispatch => (value) => {
  dispatch({ type: types.RISK_EFFECTIVENESS_CHANGE, value })
}

export const handleControlEffectivenessChange = dispatch => (value) => {
  dispatch({ type: types.RISK_CONTROL_EFFECTIVENESS_CHANGE, value })
}

export const handleAffectedSystemsChange = dispatch => (value) => {
  dispatch({ type: types.RISK_AFFECTED_SYSTEMS_CHANGE, value })
}

export const handlePossibleAffectedSystemsChange = dispatch => (value) => {
  dispatch({ type: types.RISK_POSSIBLE_AFFECTED_SYSTEMS_CHANGE, value })
}

export const handleRemediationStatusChange = dispatch => (value) => {
  dispatch({ type: types.RISK_REMEDIATION_STATUS_CHANGE, value })
}

export const handleMitigationDateChange = dispatch => (value) => {
  dispatch({ type: types.RISK_MITIGATION_DATE_CHANGE, value })
}

export const handleMitigationDateSelected = dispatch => (value) => {
  dispatch({ type: types.RISK_MITIGATION_DATE_SELECTED, value })
}

export const handleMitigationDateClick = dispatch => () => {
  dispatch({ type: types.RISK_MITIGATION_DATE_CLICK })
}

export const handleMitigationDateClose = dispatch => () => {
  dispatch({ type: types.RISK_MITIGATION_DATE_CLOSE })
}

export const handleMitigationDateBlur = dispatch => () => {
  dispatch({ type: types.RISK_MITIGATION_DATE_BLUR })
}

export const handleTargetRemediationDateChange = dispatch => (value) => {
  dispatch({ type: types.RISK_TARGET_REMEDIATION_DATE_CHANGE, value })
}

export const handleTargetRemediationDateSelected = dispatch => (value) => {
  dispatch({ type: types.RISK_TARGET_REMEDIATION_DATE_SELECTED, value })
}

export const handleTargetRemediationDateClick = dispatch => () => {
  dispatch({ type: types.RISK_TARGET_REMEDIATION_DATE_CLICK })
}

export const handleTargetRemediationDateClose = dispatch => () => {
  dispatch({ type: types.RISK_TARGET_REMEDIATION_DATE_CLOSE })
}

export const handleTargetRemediationDateBlur = dispatch => () => {
  dispatch({ type: types.RISK_TARGET_REMEDIATION_DATE_BLUR })
}

export const handleResourceAssignSave = dispatch => (resource, group) => {
  dispatch({ type: types.RISK_RESOURCE_ASSIGN_SAVE, resource, group })
}

export const handleVulnerabilitiesSort = dispatch => (field, comparator) => {
  dispatch({ type: types.RISK_VULNERABILITIES_SORT, field, comparator })
}

export const handleVulnerabilitiesFilter = dispatch => (field, value, filter) => {
  dispatch({ type: types.RISK_VULNERABILITIES_FILTER, field, value, filter })
}

export const handleVulnerabilitiesPageSizeChange = dispatch => (size) => {
  dispatch({ type: types.RISK_VULNERABILITIES_PAGE_SIZE_CHANGE, size })
}

export const handleVulnerabilitiesPageIndexChange = dispatch => (index) => {
  dispatch({ type: types.RISK_VULNERABILITIES_PAGE_INDEX_CHANGE, index })
}

export const update = dispatch => (risk, history) => {
  var data = {
    Id: risk.Id,
    EngagementId: risk.EngagementId,
    ImportedDate: risk.ImportedDate,
    ImportedBy: risk.ImportedBy,
    Name: risk.Name,
    PhaseId: risk.PhaseId,
    ResourceId: risk.ResourceId,
    GroupId: risk.GroupId,
    InherentRisk: risk.InherentRisk,
    Likelihood: risk.Likelihood,
    Description: risk.Description,
    Recommendation: risk.Recommendation,
    RemediationStatusId: risk.RemediationStatusId,
    MitigationDate: risk.MitigationDate,
    TargetRemediationDate: risk.TargetRemediationDate,
    MitigationStatusId: risk.MitigationStatusId,
    AffectedSystemsCount: risk.AffectedSystemsCount,
    PossibleAffectedSystemsCount: risk.PossibleAffectedSystemsCount,
    Effectiveness: risk.Effectiveness,
    ControlEffectiveness: risk.ControlEffectiveness,
    Impact: risk.Impact,
    RiskScore: risk.RiskScore,
    References: risk.References,
    VulnerabilityList: risk.VulnerabilityList
  };

  dispatch({ type: types.RISK_POST_FETCHING })

  return axios.post(endpoints.RISKS, data)
    .then(r => {
      dispatch({ type: types.RISK_POST_SUCCESS, payload: r.data })
      history.push(routes.RISK_PAGE_BASE + routes.RISK_PAGE + '/' + risk.EngagementId)
    })
    .catch(e => {
      if (e.response.status !== httpStatus.BAD_REQUEST) return
      dispatch({ type: types.RISK_POST_FAILED, validationErrors: e.response.data })
    })
}
