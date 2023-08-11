import { connect } from 'react-redux'
import wrapper from '../components/will-mount-wrapper'
import * as actions from './risk-actions'
import RiskDetail from './risk-detail'

const mapStateToProps = state => {
  return {
    engagementId: state.branding.selectedEngagement,
    risk: state.riskDetail,
    ui: state.ui.riskDetail,
    entitlements: state.session.entitlements.list['riskRoles'] || {},
    entitlementsVulnerability: state.session.entitlements.list['vulnerabilityRoles'] || {}
  }
}

const mapDispatchToProps = dispatch => ({
  actions: {
    handleNameChange: actions.handleNameChange(dispatch),
    handlePhaseChange: actions.handlePhaseChange(dispatch),
    handleInherentRiskChange: actions.handleInherentRiskChange(dispatch),
    handleLikelihoodChange: actions.handleLikelihoodChange(dispatch),
    handleMitigationStatusChange: actions.handleMitigationStatusChange(dispatch),
    handleImpactChange: actions.handleImpactChange(dispatch),
    handleRiskScoreChange: actions.handleRiskScoreChange(dispatch),
    handleRecommendationChange: actions.handleRecommendationChange(dispatch),
    handleDescriptionChange: actions.handleDescriptionChange(dispatch),
    handleReferencesChange: actions.handleReferencesChange(dispatch),
    handleEffectivenessChange: actions.handleEffectivenessChange(dispatch),
    handleControlEffectivenessChange: actions.handleControlEffectivenessChange(dispatch),
    handleAffectedSystemsChange: actions.handleAffectedSystemsChange(dispatch),
    handlePossibleAffectedSystemsChange: actions.handlePossibleAffectedSystemsChange(dispatch),
    handleRemediationStatusChange: actions.handleRemediationStatusChange(dispatch),
    handleMitigationDateChange: actions.handleMitigationDateChange(dispatch),
    handleMitigationDateSelected: actions.handleMitigationDateSelected(dispatch),
    handleMitigationDateClick: actions.handleMitigationDateClick(dispatch),
    handleMitigationDateClose: actions.handleMitigationDateClose(dispatch),
    handleMitigationDateBlur: actions.handleMitigationDateBlur(dispatch),
    handleTargetRemediationDateChange: actions.handleTargetRemediationDateChange(dispatch),
    handleTargetRemediationDateSelected: actions.handleTargetRemediationDateSelected(dispatch),
    handleTargetRemediationDateClick: actions.handleTargetRemediationDateClick(dispatch),
    handleTargetRemediationDateClose: actions.handleTargetRemediationDateClose(dispatch),
    handleTargetRemediationDateBlur: actions.handleTargetRemediationDateBlur(dispatch),
    handleResourceAssignSave: actions.handleResourceAssignSave(dispatch),
    handleVulnerabilitiesSort: actions.handleVulnerabilitiesSort(dispatch),
    handleVulnerabilitiesFilter: actions.handleVulnerabilitiesFilter(dispatch),
    handleVulnerabilitiesPageSizeChange: actions.handleVulnerabilitiesPageSizeChange(dispatch),
    handleVulnerabilitiesPageIndexChange: actions.handleVulnerabilitiesPageIndexChange(dispatch),
    update: actions.update(dispatch)
  },
  willMount: props => actions.get(dispatch)(props.engagementId, props.match.params.riskId, props.location)
})

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps)

export const RiskDetailContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(wrapper(RiskDetail))

export default RiskDetailContainer
