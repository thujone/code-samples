import * as types from './risk-action-types'

export const initState = {
  currentPageIndex: 0,
  pageSize: 10,
  filters: {},
  sort: {},
  data: []
}

const riskGridReducer = (state = initState, action) => {
  switch (action.type) {
    case types.RISK_GET_ITEMS_SUCCESS:
      return {
        ...state,
        data: action.payload,
        filters: {},
        sort: {}
      }
    case types.RISK_GET_ITEMS_FETCHING:
      return {
        ...state,
        data: [],
        filters: {},
        sort: {}
      }
    case types.RISK_GET_ITEMS_FAILED:
      return {
        ...state
      }
    case types.RISK_SORT:
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
    case types.RISK_FILTER:
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
    case types.RISK_PAGE_SIZE_CHANGE:
      return {
        ...state,
        pageSize: action.size
      }
    case types.RISK_PAGE_INDEX_CHANGE:
      return {
        ...state,
        currentPageIndex: action.index
      }
    default:
      return state
  }
}

export default riskGridReducer