import * as types from './risk-action-types'
import * as actions from '../actions/api'
import reducer from './risk-grid-reducer'

describe('Risk Grid Reducer', () => {
  it('should handle RISK_GET_ITEMS_SUCCESS:', () => {
    const action = {
      type: types.RISK_GET_ITEMS_SUCCESS,
      payload: "test"
    }
    const initState = {
      data: "",
      filters: "filters",
      sort: "sort"
    }
    const expectedState = {
      data: "test",
      filters: {},
      sort: {}
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_GET_ITEMS_FETCHING', () => {
    const action = {
      type: types.RISK_GET_ITEMS_FETCHING
    }
    const initState = {
      data: "test",
      filters: "filters",
      sort: "sort"
    }
    const expectedState = {
      data: [],
      filters: {},
      sort: {}
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_GET_ITEMS_FAILED', () => {
    const action = {
      type: types.RISK_GET_ITEMS_FAILED
    }
    const initState = {
      data: "test",
      filters: "filters",
      sort: "sort"
    }
    const expectedState = {
      data: "test",
      filters: "filters",
      sort: "sort"
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_SORT add field asc as only sort field', () => {
    const action = {
      type: types.RISK_SORT,
      field: "FieldName",
      comparator: "Comparator"
    }
    const initState = {
      currentPageIndex: 10,
      sort: {
        OtherName: {
          direction: "asc"
        }
      }
    }
    const expectedState = {
      currentPageIndex: 0,
      sort: {
        FieldName: {
          comparator: "Comparator",
          direction: "asc"
        }
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_SORT toggle field to asc', () => {
    const action = {
      type: types.RISK_SORT,
      field: "FieldName",
      comparator: "Comparator"
    }
    const initState = {
      currentPageIndex: 10,
      sort: {
        FieldName: {
          direction: "desc"
        }
      }
    }
    const expectedState = {
      currentPageIndex: 0,
      sort: {
        FieldName: {
          comparator: "Comparator",
          direction: "asc"
        }
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_SORT toggle field to desc', () => {
    const action = {
      type: types.RISK_SORT,
      field: "FieldName",
      comparator: "Comparator"
    }
    const initState = {
      currentPageIndex: 10,
      sort: {
        FieldName: {
          direction: "asc"
        }
      }
    }
    const expectedState = {
      currentPageIndex: 0,
      sort: {
        FieldName: {
          comparator: "Comparator",
          direction: "desc"
        }
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_FILTER update field filter value', () => {
    const action = {
      type: types.RISK_FILTER,
      field: "FieldName",
      value: "Value",
      filter: "Filter"
    }
    const initState = {
      currentPageIndex: 10,
      filters: {
        OtherField: {
          value: "a",
          filter: "b"
        },
        FieldName: {
          value: "",
          filter: ""
        }
      }
    }
    const expectedState = {
      currentPageIndex: 0,
      filters: {
        OtherField: {
          value: "a",
          filter: "b"
        },
        FieldName: {
          value: "Value",
          filter: "Filter"
        }
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_FILTER remove field filter when value empty', () => {
    const action = {
      type: types.RISK_FILTER,
      field: "FieldName",
      value: "",
      filter: "Filter"
    }
    const initState = {
      currentPageIndex: 10,
      filters: {
        OtherField: {
          value: "a",
          filter: "b"
        },
        FieldName: {
          value: "",
          filter: ""
        }
      }
    }
    const expectedState = {
      currentPageIndex: 0,
      filters: {
        OtherField: {
          value: "a",
          filter: "b"
        }
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_PAGE_SIZE_CHANGE', () => {
    const action = {
      type: types.RISK_PAGE_SIZE_CHANGE,
      size: 5
    }
    const initState = {
      pageSize: 10
    }
    const expectedState = {
      pageSize: 5
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_PAGE_INDEX_CHANGE', () => {
    const action = {
      type: types.RISK_PAGE_INDEX_CHANGE,
      index: 5
    }
    const initState = {
      currentPageIndex: 10
    }
    const expectedState = {
      currentPageIndex: 5
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })
})