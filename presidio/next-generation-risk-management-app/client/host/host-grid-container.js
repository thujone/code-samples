import { connect } from 'react-redux'
import { fetchTable } from '../components/table/fetch-table'
import HostGrid from './host-grid'
import * as actions from './host-actions'
import * as tableActions from '../components/table/actions'

const mapStateToProps = state => {
  return {
    entitlements: state.session.entitlements.list['hostRoles'] || {},
    selectedEngagement: state.branding.selectedEngagement,
    selectedRows: state.hostGrid.selectedRows,
    assignForm: state.hostGrid.assignForm,
    ui: state.ui.hostGrid,
    charts: state.charts.hosts,
    isFetching: state.ui.table.host.isFetching
  }
}

const mapDispatchToProps = dispatch => ({
  actions: {
    handleSelectAll: actions.handleSelectAll(dispatch),
    handleSelectRow: actions.handleSelectRow(dispatch),
    handleSelectedItemActionsDropdownClick: actions.handleSelectedItemActionsDropdownClick(dispatch),
    handleSelectedItemActionsDropdownMouseLeave: actions.handleSelectedItemActionsDropdownMouseLeave(dispatch),
    handleSelectedItemActionsClear: actions.handleSelectedItemActionsClear(dispatch),
    handleSelectedItemActionsAssignStatus: actions.handleSelectedItemActionsAssignStatus(dispatch),
    handleAssignStatusChange: actions.handleAssignStatusChange(dispatch),
    handleAssignStatusCancel: actions.handleAssignStatusCancel(dispatch),
    handleAssignStatusSave: actions.handleAssignStatusSave(dispatch),
    handleHistoryButtonToggle: tableActions.handleHistoryButtonToggle(dispatch)('host'),
    initGridState: tableActions.initGridState(dispatch)('host')
  }
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    engagementId: stateProps.selectedEngagement || ownProps.match.params.engagementId
  })
}

export const HostsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(fetchTable('host')(HostGrid))

export default HostsContainer
