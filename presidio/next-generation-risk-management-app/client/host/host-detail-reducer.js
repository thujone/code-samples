import * as types from './host-action-types'

export const initState = {
  currentPageIndex: 0,
  pageSize: 10,
  filters: {},
  sort: {},
  showHistory: false,
  allVulns: [],
  activeVulns: [],
  isFetching: false,
  Id: '',
  EngagementId: '',
  PhaseId: '',
  AssetGroupId: '',
  ImportedDate: '',
  ImportedBy: '',
  Name: '',
  IpAddress: '',
  OperatingSystem: '',
  OsConfidence: '',
  AverageSeverity: '',
  AverageSeverityValue: '',
  IsCritical: false,
  AssetGroup: '',
  Status: '',
  VulnerabilityList: [],
}

const hostDetailReducer = (state = initState, action) => {
  switch (action.type) {
    case types.HOST_GET_FETCHING:
      return {
        ...state,
        data: [],
        filters: {},
        sort: {},
        isFetching: true
      }
    case types.HOST_GET_FAILED:
      return {
        ...state,
        isFetching: false
      }
    case types.HOST_GET_SUCCESS:
      const allVulns = action.payload.VulnerabilityList
      const activeVulns = allVulns.filter(vuln => !vuln.IsPartiallyRemediated)
      return {
        ...state,
        ...action.payload,
        currentPageIndex: 0,
        filters: {},
        sort: {},
        isFetching: false,
        allVulns: allVulns,
        activeVulns: activeVulns,
        showHistory: false,
        VulnerabilityList: activeVulns
      }
    case types.HOST_POST_FETCHING:
      return {
        ...state,
        IsFetching: true
      }
    case types.HOST_POST_SUCCESS:
      return {
        ...state,
        IsFetching: false
      }
    case types.HOST_POST_FAILED:
      return {
        ...state,
        IsFetching: false
      }
    case types.HOST_STATUS_CHANGE:
      return {
        ...state,
        Status: action.value
      }
    case types.HOST_VULNERABILITIES_SORT:
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
    case types.HOST_VULNERABILITIES_FILTER:
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
    case types.HOST_VULNERABILITIES_PAGE_SIZE_CHANGE:
      return {
        ...state,
        pageSize: action.size
      }
    case types.HOST_VULNERABILITIES_PAGE_INDEX_CHANGE:
      return {
        ...state,
        currentPageIndex: action.index
      }
    case types.HOST_DETAIL_HISTORY_BUTTON_TOGGLE:
      state.showHistory = !state.showHistory
      if (state.showHistory) {
        return {
          ...state,
          VulnerabilityList: state.allVulns
        }
      } else {
        return {
          ...state,
          VulnerabilityList: state.activeVulns
        }
      }
    default:
      return state
  }
}

export default hostDetailReducer