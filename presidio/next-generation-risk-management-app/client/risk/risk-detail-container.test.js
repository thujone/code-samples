import React from 'react'
import RiskDetailContainer from './risk-detail-container'
import { createStore } from 'redux'
import { shallow } from 'enzyme'
import * as actions from './risk-actions'

describe("Risk Detail Container", () => {
  let state
  beforeEach(() => {
    state = {
      session: {
        entitlements: {
          list: {
            riskRoles: 'entitlements',
            vulnerabilityRoles: 'entitlementsVulnerability'
          }
        }
      },
      branding: {
        selectedEngagement: 'engagementId',
      },
      riskDetail: 'riskDetail',
      ui: {
        riskDetail: 'ui.riskDetail'
      }
    }
  })

  it('should map state to props', () => {

    let subject = shallow(<RiskDetailContainer
      store={createStore(s => s, state)} />
    )

    expect(subject.props().engagementId).toEqual('engagementId')
    expect(subject.props().risk).toEqual('riskDetail')
    expect(subject.props().ui).toEqual('ui.riskDetail')
    expect(subject.props().entitlements).toEqual('entitlements')
    expect(subject.props().entitlementsVulnerability).toEqual('entitlementsVulnerability')
  })

  it('should map state to props with undefined entitlements', () => {

    state.session.entitlements.list = {}
    let subject = shallow(<RiskDetailContainer
      store={createStore(s => s, state)} />
    )

    expect(subject.props().entitlements).toEqual({})
  })

  it('should map dispatch to props', () => {


    let subject = shallow(<RiskDetailContainer
      store={createStore(s => s, state)} />
    )

    expect(subject.props().actions.update).toBeDefined()
    expect(subject.props().actions.handleNameChange).toBeDefined()
    expect(subject.props().actions.handlePhaseChange).toBeDefined()
    expect(subject.props().actions.handleInherentRiskChange).toBeDefined()
    expect(subject.props().actions.handleLikelihoodChange).toBeDefined()
    expect(subject.props().actions.handleMitigationStatusChange).toBeDefined()
    expect(subject.props().actions.handleImpactChange).toBeDefined()
    expect(subject.props().actions.handleRiskScoreChange).toBeDefined()
    expect(subject.props().actions.handleDescriptionChange).toBeDefined()
    expect(subject.props().actions.handleRecommendationChange).toBeDefined()
    expect(subject.props().actions.handleReferencesChange).toBeDefined()
    expect(subject.props().actions.handleEffectivenessChange).toBeDefined()
    expect(subject.props().actions.handleControlEffectivenessChange).toBeDefined()
    expect(subject.props().actions.handleAffectedSystemsChange).toBeDefined()
    expect(subject.props().actions.handlePossibleAffectedSystemsChange).toBeDefined()
    expect(subject.props().actions.handleRemediationStatusChange).toBeDefined()
    expect(subject.props().actions.handleMitigationDateChange).toBeDefined()
    expect(subject.props().actions.handleMitigationDateSelected).toBeDefined()
    expect(subject.props().actions.handleMitigationDateClick).toBeDefined()
    expect(subject.props().actions.handleMitigationDateClose).toBeDefined()
    expect(subject.props().actions.handleResourceAssignSave).toBeDefined()
    expect(subject.props().actions.handleVulnerabilitiesSort).toBeDefined()
    expect(subject.props().actions.handleVulnerabilitiesFilter).toBeDefined()
    expect(subject.props().actions.handleVulnerabilitiesPageSizeChange).toBeDefined()
    expect(subject.props().actions.handleVulnerabilitiesPageIndexChange).toBeDefined()
    expect(subject.props().willMount).toBeDefined()
  })

  it('should pass props to actions.get', () => {

    const store = createStore(s => s, state)
    let subject = shallow(<RiskDetailContainer
      store={store} />
    )

    const returnMock = jest.fn()
    actions.get = jest.fn().mockReturnValue(returnMock)
    subject.props().willMount(
      {
        engagementId: 'mockEngagementId',
        location: 'location',
        match: {
          params: {
            riskId: 'mockRiskId'
          }
        }
      }
    )
    expect(actions.get).toHaveBeenCalledWith(store.dispatch)
    expect(returnMock).toHaveBeenCalledWith('mockEngagementId', 'mockRiskId', 'location')
  })
})
