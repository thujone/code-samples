import { connect } from 'react-redux'
import { fetchTable } from '../components/table/fetch-table'
import RiskGrid from './risk-grid'

const mapStateToProps = state => {
  return {
    selectedEngagement: state.branding.selectedEngagement,
    entitlements: state.session.entitlements.list['riskRoles'] || {},
    ui: state.ui.riskGrid,
    charts: state.charts.risks
  }
}

const mapDispatchToProps = dispatch => ({
  actions: {
  }
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    engagementId: stateProps.selectedEngagement || ownProps.match.params.engagementId
  })
}

export const RiskGridContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(fetchTable('risk')(RiskGrid))

export default RiskGridContainer
