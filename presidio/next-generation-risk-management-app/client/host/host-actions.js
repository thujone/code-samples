import axios from 'axios'
import * as endpoints from '../constants/endpoints'
import * as routes from '../constants/routes'
import * as httpStatus from '../constants/http-status-codes'
import * as types from './host-action-types'

export const get = dispatch => (engagementId, phaseId, hostId) => {
  dispatch({ type: types.HOST_GET_FETCHING })
  return axios.get(endpoints.HOSTS + '/' + engagementId + '/' + phaseId + '/' + hostId)
    .then(r => dispatch({ type: types.HOST_GET_SUCCESS, payload: r.data }))
    .catch(e => {
      if (e.response.status !== httpStatus.BAD_REQUEST) return
      dispatch({ type: types.HOST_GET_FAILED, error: e.response.data })
    })
}

export const getGrid = dispatch => (engagementId, table) => {
  if (engagementId) {
    getItems(dispatch)(engagementId)
    table.fetchRows()
  }
}

export const update = dispatch => (details, history) => {
  var data = [{
    Id: details.Id,
    Status: details.Status,
    EngagementId: details.EngagementId,
    ImportedBy: details.ImportedBy,
    ImportedDate: details.ImportedDate,
    Name: details.Name,
    PhaseId: details.PhaseId,
    AssetGroupId: details.AssetGroupId,
    IpAddress: details.IpAddress,
    OperatingSystem: details.OperatingSystem,
    OsConfidence: details.OsConfidence,
    AverageSeverity: details.AverageSeverity,
    AverageSeverityValue: details.AverageSeverityValue,
    VulnerabilityList: details.VulnerabilityList,
    Phase: details.Phase
  }];

  dispatch({ type: types.HOST_POST_FETCHING })

  return axios.post(endpoints.HOSTS, data)
    .then(r => {
      dispatch({ type: types.HOST_POST_SUCCESS, payload: r.data })
      history.push(routes.RISK_PAGE_BASE + routes.HOST_PAGE + '/' + details.EngagementId)
    })
    .catch(e => {
      if (e.response.status !== httpStatus.BAD_REQUEST) return
      dispatch({ type: types.HOST_POST_FAILED, validationErrors: e.response.data })
    })
}

export const handleHostStatusChange = dispatch => (value) => {
  return dispatch({ type: types.HOST_STATUS_CHANGE, value })
}

export const handleVulnerabilitiesSort = dispatch => (field, comparator) => {
  dispatch({ type: types.HOST_VULNERABILITIES_SORT, field, comparator })
}

export const handleVulnerabilitiesFilter = dispatch => (field, value, filter) => {
  dispatch({ type: types.HOST_VULNERABILITIES_FILTER, field, value, filter })
}

export const handleVulnerabilitiesPageSizeChange = dispatch => (size) => {
  dispatch({ type: types.HOST_VULNERABILITIES_PAGE_SIZE_CHANGE, size })
}

export const handleVulnerabilitiesPageIndexChange = dispatch => (index) => {
  dispatch({ type: types.HOST_VULNERABILITIES_PAGE_INDEX_CHANGE, index })
}

export const getItems = dispatch => engagementId => {
  dispatch({ type: types.HOST_GET_ITEMS_FETCHING })

  return axios.get(endpoints.HOSTS + '/' + engagementId)
    .then(r => dispatch({ type: types.HOST_GET_ITEMS_SUCCESS, payload: r.data }))
    .catch(e => {
      if (e.response.status !== httpStatus.BAD_REQUEST) return
      dispatch({ type: types.HOST_GET_ITEMS_FAILED, error: e.response.data })
    })
}

export const handleSelectAll = dispatch => (checked, rows) => {
  dispatch({ type: types.HOST_SELECT_ALL_CLICK, checked, rows })
}

export const handleSelectRow = dispatch => (checked, id, rows) => {
  dispatch({ type: types.HOST_SELECT_ROW_CLICK, checked, id, rows })
}

export const handleSelectedItemActionsDropdownClick = dispatch => () => {
  dispatch({ type: types.HOST_SELECTED_ITEM_ACTIONS_DROPDOWN_CLICK })
}

export const handleSelectedItemActionsDropdownMouseLeave = dispatch => () => {
  dispatch({ type: types.HOST_SELECTED_ITEM_ACTIONS_DROPDOWN_MOUSE_LEAVE })
}

export const handleSelectedItemActionsClear = dispatch => () => {
  dispatch({ type: types.HOST_SELECTED_ITEM_ACTIONS_CLEAR })
}

export const handleSelectedItemActionsAssignStatus = dispatch => (engagementId) => {
  dispatch({ type: types.HOST_SELECTED_ITEM_ACTIONS_ASSIGN_STATUS })  
}

export const handleAssignStatusChange = dispatch => (value) => {
  dispatch({ type: types.HOST_ASSIGN_STATUS_CHANGE, value })
}

export const handleAssignStatusCancel = dispatch => (value) => {
  dispatch({ type: types.HOST_ASSIGN_STATUS_CANCEL })
}

export const handleAssignStatusSave = dispatch => (form, selectedHosts, table, engagementId) => {
  dispatch({ type: types.HOST_POST_ASSIGN_STATUS_FETCHING })

  if (form.hostStatus) {
    selectedHosts = selectedHosts.map(host => {
      host.Status = form.hostStatus
      return host
    })
  }

  if (!form.hostStatus) {
    dispatch({ type: types.HOST_POST_ASSIGN_STATUS_FAILED, fieldErrors: { hostStatus: ["Required"] } })
    return Promise.resolve()
  }

  return axios.post(endpoints.HOSTS, selectedHosts)
    .then(r => {
      dispatch({ type: types.HOST_POST_ASSIGN_STATUS_SUCCESS })
      getGrid(dispatch)(engagementId, table)
    })
    .catch(e => {
      if (e.response.status !== httpStatus.BAD_REQUEST) return

      let fieldErrors = {}
      if (typeof (e.response.data) === "object") {
        fieldErrors = e.response.data
      }

      dispatch({ type: types.HOST_POST_ASSIGN_STATUS_FAILED, fieldErrors })
    })
}

export const handleHistoryButtonToggle = dispatch => () => {
  dispatch(
    {
      type: types.HOST_DETAIL_HISTORY_BUTTON_TOGGLE
    }
  )
}
