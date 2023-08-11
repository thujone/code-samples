import HostDetail from './host-detail'
import wrapper from '../components/will-mount-wrapper'
import { connect } from 'react-redux'
import * as actions from './host-actions'


const mapStateToProps = state => {
  return {
    engagementId: state.branding.selectedEngagement,
    host: state.hostDetail,
    entitlements: state.session.entitlements.list['hostRoles'] || {},
    entitlementsVulnerability: state.session.entitlements.list['vulnerabilityRoles'] || {}
  }
}

const mapDispatchToProps = dispatch => {
  return {
    actions: {
      handleVulnerabilitiesSort: actions.handleVulnerabilitiesSort(dispatch),
      handleVulnerabilitiesFilter: actions.handleVulnerabilitiesFilter(dispatch),
      handleVulnerabilitiesPageSizeChange: actions.handleVulnerabilitiesPageSizeChange(dispatch),
      handleVulnerabilitiesPageIndexChange: actions.handleVulnerabilitiesPageIndexChange(dispatch),
      handleHostStatusChange: actions.handleHostStatusChange(dispatch),
      handleHistoryButtonToggle: actions.handleHistoryButtonToggle(dispatch),
      update: actions.update(dispatch)
    },
    willMount: props => {
      return actions.get(dispatch)(props.match.params.engagementId, props.match.params.phaseId, props.match.params.hostId)
    }
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign({}, stateProps, dispatchProps, ownProps)

export const HostDetailContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(wrapper(HostDetail))

export default HostDetailContainer