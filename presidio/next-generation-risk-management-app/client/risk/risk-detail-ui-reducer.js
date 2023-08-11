import * as types from './risk-action-types'

export const initState = {
  ValidationErrors: {},
  showRemediationDatePicker: false,
  showTargetRemediationDatePicker: false
}

const riskDetailUIReducer = (state = initState, action) => {
  switch (action.type) {
    case types.RISK_GET_FETCHING:
      return {
        ...state,
        ValidationErrors: {}
      }
    case types.RISK_POST_FAILED:
      return {
        ...state,
        ValidationErrors: action.validationErrors
      }
    case types.RISK_MITIGATION_DATE_CLICK:
    case types.RISK_MITIGATION_DATE_BLUR:
      return {
        ...state,
        showRemediationDatePicker: !state.showRemediationDatePicker
      }
    case types.RISK_MITIGATION_DATE_SELECTED:
    case types.RISK_MITIGATION_DATE_CLOSE:
      return {
        ...state,
        showRemediationDatePicker: false,
        showTargetRemediationDatePicker: false
      }
    case types.RISK_TARGET_REMEDIATION_DATE_CLICK:
    case types.RISK_TARGET_REMEDIATION_DATE_BLUR:
      return {
        ...state,
        showTargetRemediationDatePicker: !state.showTargetRemediationDatePicker
      }
    case types.RISK_TARGET_REMEDIATION_DATE_SELECTED:
    case types.RISK_TARGET_REMEDIATION_DATE_CLOSE:
      return {
        ...state,
        showRemediationDatePicker: false,
        showTargetRemediationDatePicker: false
      }
    default:
      return state
  }
}

export default riskDetailUIReducer