import * as types from './risk-action-types'
import reducer from './risk-detail-reducer'

describe('Risk Detail Reducer', () => {
  it('should handle RISK_GET_SUCCESS', () => {
    const action = {
      type: types.RISK_GET_SUCCESS,
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

  it('should handle RISK_POST_FETCHING', () => {
    const action = {
      type: types.RISK_POST_FETCHING
    }
    const initState = {
    }
    const expectedState = {
      IsFetching: true
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_POST_SUCCESS', () => {
    const action = {
      type: types.RISK_POST_SUCCESS
    }
    const initState = {
    }
    const expectedState = {
      IsFetching: false
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_POST_FAILED', () => {
    const action = {
      type: types.RISK_POST_FAILED
    }
    const initState = {
    }
    const expectedState = {
      IsFetching: false
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_NAME_CHANGE', () => {
    const action = {
      type: types.RISK_NAME_CHANGE,
      value: 'Name'
    }
    const initState = {
    }
    const expectedState = {
      Name: 'Name'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_PHASE_CHANGE', () => {
    const action = {
      type: types.RISK_PHASE_CHANGE,
      value: 'PhaseId'
    }
    const initState = {
    }
    const expectedState = {
      PhaseId: 'PhaseId'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_INHERENT_RISK_CHANGE', () => {
    const action = {
      type: types.RISK_INHERENT_RISK_CHANGE,
      value: 'InherentRisk'
    }
    const initState = {
    }
    const expectedState = {
      InherentRisk: 'InherentRisk'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_LIKELIHOOD_CHANGE', () => {
    const action = {
      type: types.RISK_LIKELIHOOD_CHANGE,
      value: 'Likelihood'
    }
    const initState = {
    }
    const expectedState = {
      Likelihood: 'Likelihood'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_MITIGATION_STATUS_CHANGE', () => {
    const action = {
      type: types.RISK_MITIGATION_STATUS_CHANGE,
      value: 'MitigationStatusId'
    }
    const initState = {
    }
    const expectedState = {
      MitigationStatusId: 'MitigationStatusId'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_IMPACT_CHANGE', () => {
    const action = {
      type: types.RISK_IMPACT_CHANGE,
      value: 'Impact'
    }
    const initState = {
    }
    const expectedState = {
      Impact: 'Impact'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_SCORE_CHANGE', () => {
    const action = {
      type: types.RISK_SCORE_CHANGE,
      value: 'Score'
    }
    const initState = {
    }
    const expectedState = {
      RiskScore: 'Score'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_DESCRIPTION_CHANGE', () => {
    const action = {
      type: types.RISK_DESCRIPTION_CHANGE,
      value: 'Score'
    }
    const initState = {
    }
    const expectedState = {
      Description: 'Score'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_RECOMMENDATION_CHANGE', () => {
    const action = {
      type: types.RISK_RECOMMENDATION_CHANGE,
      value: 'Score'
    }
    const initState = {
    }
    const expectedState = {
      Recommendation: 'Score'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_REFERENCES_CHANGE', () => {
    const action = {
      type: types.RISK_REFERENCES_CHANGE,
      value: 'References'
    }
    const initState = {
    }
    const expectedState = {
      References: 'References'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_EFFECTIVENESS_CHANGE', () => {
    const action = {
      type: types.RISK_EFFECTIVENESS_CHANGE,
      value: 'Effectiveness'
    }
    const initState = {
    }
    const expectedState = {
      Effectiveness: 'Effectiveness'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_CONTROL_EFFECTIVENESS_CHANGE', () => {
    const action = {
      type: types.RISK_CONTROL_EFFECTIVENESS_CHANGE,
      value: 'ControlEffectiveness'
    }
    const initState = {
    }
    const expectedState = {
      ControlEffectiveness: 'ControlEffectiveness'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_AFFECTED_SYSTEMS_CHANGE', () => {
    const action = {
      type: types.RISK_AFFECTED_SYSTEMS_CHANGE,
      value: 'AffectedSystems'
    }
    const initState = {
    }
    const expectedState = {
      AffectedSystemsCount: 'AffectedSystems'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_POSSIBLE_AFFECTED_SYSTEMS_CHANGE', () => {
    const action = {
      type: types.RISK_POSSIBLE_AFFECTED_SYSTEMS_CHANGE,
      value: 'PossibleAffectedSystems'
    }
    const initState = {
    }
    const expectedState = {
      PossibleAffectedSystemsCount: 'PossibleAffectedSystems'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_REMEDIATION_STATUS_CHANGE', () => {
    const action = {
      type: types.RISK_REMEDIATION_STATUS_CHANGE,
      value: 'RemediationStatusId'
    }
    const initState = {
    }
    const expectedState = {
      RemediationStatusId: 'RemediationStatusId'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_RESOURCE_ASSIGN_SAVE for resource', () => {
    const action = {
      type: types.RISK_RESOURCE_ASSIGN_SAVE,
      resource: "1",
      group: undefined
    }
    const initState = {
      ResourceId: "",
      GroupId: ""
    }
    const expectedState = {
      ResourceId: "1",
      GroupId: undefined
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_RESOURCE_ASSIGN_SAVE for group', () => {
    const action = {
      type: types.RISK_RESOURCE_ASSIGN_SAVE,
      resource: undefined,
      group: "1"
    }
    const initState = {
      ResourceId: "",
      GroupId: ""
    }
    const expectedState = {
      ResourceId: undefined,
      GroupId: "1"
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_MITIGATION_DATE_CHANGE', () => {
    const action = {
      type: types.RISK_MITIGATION_DATE_CHANGE,
      value: 'MitigationDate'
    }
    const initState = {
    }
    const expectedState = {
      MitigationDate: 'MitigationDate'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_MITIGATION_DATE_SELECTED', () => {
    const action = {
      type: types.RISK_MITIGATION_DATE_SELECTED,
      value: 'MitigationDate'
    }
    const initState = {
    }
    const expectedState = {
      MitigationDate: 'MitigationDate'
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_VULNERABILITIES_SORT add field asc as only sort field', () => {
    const action = {
      type: types.RISK_VULNERABILITIES_SORT,
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

  it('should handle RISK_VULNERABILITIES_SORT toggle field to asc', () => {
    const action = {
      type: types.RISK_VULNERABILITIES_SORT,
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

  it('should handle RISK_VULNERABILITIES_SORT toggle field to desc', () => {
    const action = {
      type: types.RISK_VULNERABILITIES_SORT,
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

  it('should handle RISK_VULNERABILITIES_FILTER update field filter value', () => {
    const action = {
      type: types.RISK_VULNERABILITIES_FILTER,
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

  it('should handle RISK_VULNERABILITIES_FILTER remove field filter when value empty', () => {
    const action = {
      type: types.RISK_VULNERABILITIES_FILTER,
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

  it('should handle RISK_VULNERABILITIES_PAGE_SIZE_CHANGE', () => {
    const action = {
      type: types.RISK_VULNERABILITIES_PAGE_SIZE_CHANGE,
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

  it('should handle RISK_VULNERABILITIES_PAGE_INDEX_CHANGE', () => {
    const action = {
      type: types.RISK_VULNERABILITIES_PAGE_INDEX_CHANGE,
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