import * as types from './host-action-types'

export const initState = {
  currentPageIndex: 0,
  pageSize: 10,
  filters: {},
  sort: {},
  data: [],
  selectedRows: {},
  assignForm: {
    hostStatus: ''
  }
}

const hostGridReducer = (state = initState, action) => {
  switch (action.type) {
    case types.HOST_GET_ITEMS_SUCCESS:
      return {
        ...state,
        data: action.payload
      }
    case types.HOST_GET_ITEMS_FAILED:
      return {
        ...state
      }
    case types.HOST_SORT:
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
    case types.HOST_FILTER:
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
    case types.HOST_PAGE_SIZE_CHANGE:
      return {
        ...state,
        pageSize: action.size
      }
    case types.HOST_PAGE_INDEX_CHANGE:
      return {
        ...state,
        currentPageIndex: action.index
      }
    case types.HOST_SELECT_ALL_CLICK:
      let selectedRows = { ...state.selectedRows }
      action.rows.forEach(row => {
        selectedRows[row.Id] = action.checked
      });

      return {
        ...state,
        selectedRows
      }
    case types.HOST_SELECT_ROW_CLICK:
      return {
        ...state,
        selectedRows: {
          ...state.selectedRows,
          [action.id]: action.checked
        }
      }
      case types.HOST_SELECTED_ITEM_ACTIONS_CLEAR:
        return {
          ...state,
          selectedRows: {}
        }
      case types.HOST_SELECTED_ITEM_ACTIONS_ASSIGN_STATUS:
        return {
          ...state,
          hostStatus: action.payload,
          assignForm: initState.assignForm
        }
      case types.HOST_ASSIGN_STATUS_CHANGE:
        return {
          ...state,
          assignForm: {
            ...state.assignForm,
            hostStatus: action.value
          }
        }
      case types.HOST_ASSIGN_STATUS_CANCEL:
        return {
          ...state,
          assignForm: initState.assignForm,
          fieldErrors: initState.fieldErrors
        }
      case types.HOST_POST_ASSIGN_STATUS_SUCCESS:
        return {
          ...state,
          selectedRows: {},
          assignForm: initState.assignForm,
          fieldErrors: initState.fieldErrors
        }
      case types.HOST_POST_ASSIGN_STATUS_FAILED:
        return {
          ...state,
          fieldErrors: action.fieldErrors
        }
    default:
      return state
  }
}

export default hostGridReducer