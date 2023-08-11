import * as types from './host-action-types'
import * as actions from '../actions/api'
import reducer from './host-grid-reducer'

describe('Host Grid Reducer', () => {
  it('should handle HOST_GET_ITEMS_SUCCESS:', () => {
    const action = {
      type: types.HOST_GET_ITEMS_SUCCESS,
      payload: "test"
    }
    const initState = {
      data: "",
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

  it('should handle HOST_GET_ITEMS_FETCHING', () => {
    const action = {
      type: types.HOST_GET_ITEMS_FETCHING
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

  it('should handle HOST_GET_ITEMS_FAILED', () => {
    const action = {
      type: types.HOST_GET_ITEMS_FAILED
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

  it('should handle HOST_SORT add field asc as only sort field', () => {
    const action = {
      type: types.HOST_SORT,
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

  it('should handle HOST_SORT toggle field to asc', () => {
    const action = {
      type: types.HOST_SORT,
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

  it('should handle HOST_SORT toggle field to desc', () => {
    const action = {
      type: types.HOST_SORT,
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

  it('should handle HOST_FILTER update field filter value', () => {
    const action = {
      type: types.HOST_FILTER,
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

  it('should handle HOST_FILTER remove field filter when value empty', () => {
    const action = {
      type: types.HOST_FILTER,
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

  it('should handle HOST_PAGE_SIZE_CHANGE', () => {
    const action = {
      type: types.HOST_PAGE_SIZE_CHANGE,
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

  it('should handle HOST_PAGE_INDEX_CHANGE', () => {
    const action = {
      type: types.HOST_PAGE_INDEX_CHANGE,
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

  it('should handle HOST_SELECT_ALL_CLICK updating to true', () => {
    const action = {
      type: types.HOST_SELECT_ALL_CLICK,
      checked: true,
      rows: [
        { Id: 'a' },
        { Id: 'b' }
      ]
    }
    const initState = {
      selectedRows: {
        a: false,
        b: true
      }
    }
    const expectedState = {
      selectedRows: {
        a: true,
        b: true
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle HOST_SELECT_ALL_CLICK updating to false', () => {
    const action = {
      type: types.HOST_SELECT_ALL_CLICK,
      checked: false,
      rows: [
        { Id: 'a' },
        { Id: 'b' }
      ]
    }
    const initState = {
      selectedRows: {
        a: false,
        b: true
      }
    }
    const expectedState = {
      selectedRows: {
        a: false,
        b: false
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle HOST_SELECT_ROW_CLICK initializing to false', () => {
    const action = {
      type: types.HOST_SELECT_ROW_CLICK,
      checked: true,
      id: 'Id'
    }
    const initState = {
      selectedRows: { }
    }
    const expectedState = {
      selectedRows: { Id: true }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle HOST_SELECT_ROW_CLICK updating to true', () => {
    const action = {
      type: types.HOST_SELECT_ROW_CLICK,
      checked: true,
      id: 'Id'
    }
    const initState = {
      selectedRows: { Id: false }
    }
    const expectedState = {
      selectedRows: { Id: true }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle HOST_SELECT_ROW_CLICK updating to false', () => {
    const action = {
      type: types.HOST_SELECT_ROW_CLICK,
      checked: false,
      id: 'Id'
    }
    const initState = {
      selectedRows: { Id: true }
    }
    const expectedState = {
      selectedRows: { Id: false }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })
})