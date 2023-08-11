import * as types from './host-action-types'
import reducer from './host-detail-reducer'

describe('Host Detail Reducer', () => {
  it('should handle HOST_GET_SUCCESS', () => {
    const action = {
      type: types.HOST_GET_SUCCESS,
      payload: {data: 'value'}
    }
    const initState = {
    }
    const expectedState = {
      data: 'value',
      currentPageIndex: 0,
      filters: {},
      sort: {}
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle HOST_VULNERABILITIES_SORT add field asc as only sort field', () => {
    const action = {
      type: types.HOST_VULNERABILITIES_SORT,
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

  it('should handle HOST_VULNERABILITIES_SORT toggle field to asc', () => {
    const action = {
      type: types.HOST_VULNERABILITIES_SORT,
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

  it('should handle HOST_VULNERABILITIES_SORT toggle field to desc', () => {
    const action = {
      type: types.HOST_VULNERABILITIES_SORT,
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

  it('should handle HOST_VULNERABILITIES_FILTER update field filter value', () => {
    const action = {
      type: types.HOST_VULNERABILITIES_FILTER,
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

  it('should handle HOST_VULNERABILITIES_FILTER remove field filter when value empty', () => {
    const action = {
      type: types.HOST_VULNERABILITIES_FILTER,
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

  it('should handle HOST_VULNERABILITIES_PAGE_SIZE_CHANGE', () => {
    const action = {
      type: types.HOST_VULNERABILITIES_PAGE_SIZE_CHANGE,
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

  it('should handle HOST_VULNERABILITIES_PAGE_INDEX_CHANGE', () => {
    const action = {
      type: types.HOST_VULNERABILITIES_PAGE_INDEX_CHANGE,
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