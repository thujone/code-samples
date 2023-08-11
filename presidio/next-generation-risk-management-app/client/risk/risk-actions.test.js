import configureMockStore from 'redux-mock-store'
import moxios from 'moxios'
import * as types from './risk-action-types'
import * as endpoints from '../constants/endpoints'
import * as routes from '../constants/routes'
import * as httpStatus from '../constants/http-status-codes'
import * as actions from './risk-actions'
import * as chartTypes from '../components/charts/chart-action-types'

const mockStore = configureMockStore()

describe('Risk Actions', () => {
  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('should dispatch RISK_GET_ITEMS_FETCHING', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_GET_ITEMS_FETCHING }]

    actions.getItems(store.dispatch)('engagementId')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_GET_ITEMS_SUCCESS', (done) => {
    const store = mockStore()
    const response = "test"
    const expectedAction = { type: types.RISK_GET_ITEMS_SUCCESS, payload: "test" }

    moxios.stubRequest(endpoints.RISKS + '/engagementId', {
      status: httpStatus.OK,
      response
    })

    actions.getItems(store.dispatch)('engagementId')
      .then(() => {
        expect(store.getActions()[1]).toEqual(expectedAction)
        done()
      })
  })

  it('should dispatch RISK_GET_ITEMS_FAILED', (done) => {
    const store = mockStore()
    const response = "test"
    const expectedAction = { type: types.RISK_GET_ITEMS_FAILED }

    moxios.stubRequest(endpoints.RISKS + '/engagementId', {
      status: httpStatus.BAD_REQUEST,
      response
    })

    actions.getItems(store.dispatch)('engagementId')
      .then(() => {
        expect(store.getActions()[1]).toEqual(expectedAction)
        done()
      })
  })

  it('getGrid should getRiskCharts and getItems', () => {
    const store = mockStore()
    const expectedActions = [
      { type: chartTypes.GET_RISK_CHARTS_FETCHING },
      { type: types.RISK_GET_ITEMS_FETCHING }
    ]

    actions.getGrid(store.dispatch)('engagementId')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_GET_FETCHING', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_GET_FETCHING }]

    actions.get(store.dispatch)('engagementId', 'riskId')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_GET_SUCCESS', (done) => {
    const store = mockStore()
    const response = "test"
    const expectedAction = { type: types.RISK_GET_SUCCESS, payload: "test" }

    moxios.stubRequest(endpoints.RISKS + '/engagementId/riskId', {
      status: httpStatus.OK,
      response
    })

    actions.get(store.dispatch)('engagementId', 'riskId')
      .then(() => {
        expect(store.getActions()[1]).toEqual(expectedAction)
        done()
      })
  })

  it('should dispatch RISK_GET_SUCCESS with vulnerability list from location state', (done) => {
    const store = mockStore()
    const response = {
      VulnerabilityList: ['a','c']
    }
    const location = {
      state: {
        vulnerabilityList: ['b']
      }
    }
    const expectedAction = {
      type: types.RISK_GET_SUCCESS,
      payload: {
        VulnerabilityList: ['a','c','b']
      }
    }

    moxios.stubRequest(endpoints.RISKS + '/engagementId/riskId', {
      status: httpStatus.OK,
      response
    })

    actions.get(store.dispatch)('engagementId', 'riskId', location)
      .then(() => {
        expect(store.getActions()[1]).toEqual(expectedAction)
        done()
      })
  })

  it('should dispatch RISK_GET_FAILED', (done) => {
    const store = mockStore()
    const response = "test"
    const expectedAction = { type: types.RISK_GET_FAILED, error: "test" }

    moxios.stubRequest(endpoints.RISKS + '/engagementId/riskId', {
      status: httpStatus.BAD_REQUEST,
      response
    })

    actions.get(store.dispatch)('engagementId', 'riskId')
      .then(() => {
        expect(store.getActions()[1]).toEqual(expectedAction)
        done()
      })
  })

  it('should dispatch RISK_POST_FETCHING', () => {
    const store = mockStore()
    const response = "test"
    const expectedActions = [{ type: types.RISK_POST_FETCHING }]
    const history = []
    const risk = {}

    moxios.stubRequest(endpoints.RISKS, {
      status: httpStatus.OK,
      response
    })

    actions.update(store.dispatch)(risk, history)

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_POST_SUCCESS and navigate to risks route', (done) => {
    const store = mockStore()
    const response = "test"
    const expectedAction = { type: types.RISK_POST_SUCCESS, payload: "test" }
    const history = []
    const risk = {
      Id: "Id",
      EngagementId: "EngagementId",
      ImportedDate: "ImportedDate",
      ImportedBy: "ImportedBy",
      Name: "Name",
      PhaseId: "PhaseId",
      ResourceId: "ResourceId",
      GroupId: "GroupId",
      InherentRisk: "InherentRisk",
      Likelihood: "Likelihood",
      Description: "Description",
      Recommendation: "Recommendation",
      RemediationStatusId: "RemediationStatusId",
      MitigationDate: "MitigationDate",
      MitigationStatusId: "MitigationStatusId",
      AffectedSystemsCount: "AffectedSystemsCount",
      PossibleAffectedSystemsCount: "PossibleAffectedSystemsCount",
      Effectiveness: "Effectiveness",
      ControlEffectiveness: "ControlEffectiveness",
      Impact: "Impact",
      RiskScore: "RiskScore",
      References: "References",
      VulnerabilityList: "VulnerabilityList"
    }

    moxios.stubRequest(endpoints.RISKS, {
      status: httpStatus.OK,
      response
    })

    actions.update(store.dispatch)(risk, history)
      .then(() => {
        let request = moxios.requests.mostRecent()
        expect(request.config.method).toEqual('post')
        expect(request.config.data).toEqual(JSON.stringify(risk))
        expect(store.getActions()[1]).toEqual(expectedAction)
        expect(history[0]).toEqual(routes.RISK_PAGE_BASE + routes.RISK_PAGE + '/EngagementId')
        done()
      })
  })

  it('should dispatch RISK_POST_FAILED', (done) => {
    const store = mockStore()
    const response = "test"
    const expectedAction = { type: types.RISK_POST_FAILED, validationErrors: "test" }
    const history = []
    const risk = {}

    moxios.stubRequest(endpoints.RISKS, {
      status: httpStatus.BAD_REQUEST,
      response
    })

    actions.update(store.dispatch)(risk, history)
      .then(() => {
        expect(store.getActions()[1]).toEqual(expectedAction)
        done()
      })
  })

  it('should dispatch RISK_NAME_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_NAME_CHANGE, value: 'Value' }]

    actions.handleNameChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_PHASE_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_PHASE_CHANGE, value: 'Value' }]

    actions.handlePhaseChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_INHERENT_RISK_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_INHERENT_RISK_CHANGE, value: 'Value' }]

    actions.handleInherentRiskChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_MITIGATION_STATUS_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_MITIGATION_STATUS_CHANGE, value: 'Value' }]

    actions.handleMitigationStatusChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_IMPACT_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_IMPACT_CHANGE, value: 'Value' }]

    actions.handleImpactChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_SCORE_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_SCORE_CHANGE, value: 'Value' }]

    actions.handleRiskScoreChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_DESCRIPTION_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_DESCRIPTION_CHANGE, value: 'Value' }]

    actions.handleDescriptionChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_RECOMMENDATION_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_RECOMMENDATION_CHANGE, value: 'Value' }]

    actions.handleRecommendationChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_REFERENCES_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_REFERENCES_CHANGE, value: 'Value' }]

    actions.handleReferencesChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_EFFECTIVENESS_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_EFFECTIVENESS_CHANGE, value: 'Value' }]

    actions.handleEffectivenessChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_CONTROL_EFFECTIVENESS_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_CONTROL_EFFECTIVENESS_CHANGE, value: 'Value' }]

    actions.handleControlEffectivenessChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_AFFECTED_SYSTEMS_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_AFFECTED_SYSTEMS_CHANGE, value: 'Value' }]

    actions.handleAffectedSystemsChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_POSSIBLE_AFFECTED_SYSTEMS_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_POSSIBLE_AFFECTED_SYSTEMS_CHANGE, value: 'Value' }]

    actions.handlePossibleAffectedSystemsChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_REMEDIATION_STATUS_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_REMEDIATION_STATUS_CHANGE, value: 'Value' }]

    actions.handleRemediationStatusChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_MITIGATION_DATE_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_MITIGATION_DATE_CHANGE, value: 'Value' }]

    actions.handleMitigationDateChange(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_MITIGATION_DATE_SELECTED', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_MITIGATION_DATE_SELECTED, value: 'Value' }]

    actions.handleMitigationDateSelected(store.dispatch)('Value')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_MITIGATION_DATE_CLICK', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_MITIGATION_DATE_CLICK }]

    actions.handleMitigationDateClick(store.dispatch)()

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_MITIGATION_DATE_CLOSE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_MITIGATION_DATE_CLOSE }]

    actions.handleMitigationDateClose(store.dispatch)()

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_RESOURCE_ASSIGN_SAVE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_RESOURCE_ASSIGN_SAVE, resource: "Resource", group: "Group" }]

    actions.handleResourceAssignSave(store.dispatch)("Resource", "Group")

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_VULNERABILITIES_SORT', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_VULNERABILITIES_SORT, field: "Field", comparator: "Comparator" }]
    actions.handleVulnerabilitiesSort(store.dispatch)("Field", "Comparator")
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_VULNERABILITIES_FILTER', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_VULNERABILITIES_FILTER, field: "Field", value: "Value", filter: "Filter" }]
    actions.handleVulnerabilitiesFilter(store.dispatch)("Field", "Value", "Filter")
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_VULNERABILITIES_PAGE_SIZE_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_VULNERABILITIES_PAGE_SIZE_CHANGE, size: "Size" }]
    actions.handleVulnerabilitiesPageSizeChange(store.dispatch)("Size")
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_LIKELIHOOD_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_LIKELIHOOD_CHANGE, value: "value" }]
    actions.handleLikelihoodChange(store.dispatch)("value")
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch RISK_VULNERABILITIES_PAGE_INDEX_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.RISK_VULNERABILITIES_PAGE_INDEX_CHANGE, index: "Index" }]
    actions.handleVulnerabilitiesPageIndexChange(store.dispatch)("Index")
    expect(store.getActions()).toEqual(expectedActions)
  })
})
