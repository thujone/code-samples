import React from 'react'
import HostDetailContainer from './host-detail-container'
import { createStore } from 'redux'
import { shallow } from 'enzyme'
import * as actions from './host-actions'

describe("Host Detail Container", () => {
  let state

  beforeEach(() => {

    state = {
      session: {
        entitlements: {
          list: {
            hostRoles: 'entitlements',
            vulnerabilityRoles: 'vunerabilityRoles'
          }
        }
      },
      branding: {
        selectedEngagement: 'engagementId',
      },
      hostDetail: 'hostDetail'
    }
  })

  it('should map state to props', () => {
    const store = createStore(s => s, state)
    let subject = shallow(<HostDetailContainer store={store} />)

    expect(subject.props().engagementId).toEqual('engagementId')
    expect(subject.props().host).toEqual('hostDetail')
    expect(subject.props().entitlements).toEqual('entitlements')
    expect(subject.props().entitlementsVulnerability).toEqual('vunerabilityRoles')
  })

  it('should map dispatch to props', () => {
    const store = createStore(s => s, state)
    let subject = shallow(<HostDetailContainer store={store} />)

    expect(subject.props().actions.handleVulnerabilitiesSort).toBeDefined()
    expect(subject.props().actions.handleVulnerabilitiesFilter).toBeDefined()
    expect(subject.props().actions.handleVulnerabilitiesPageSizeChange).toBeDefined()
    expect(subject.props().actions.handleVulnerabilitiesPageIndexChange).toBeDefined()
    expect(subject.props().willMount).toBeDefined()
  })

  it('should pass props to actions.get', () => {
    const store = createStore(s => s, state)
    const subject = shallow(<HostDetailContainer store={store} />)

    const returnMock = jest.fn()
    actions.get = jest.fn().mockReturnValue(returnMock)
    subject.props().willMount(
      {
        match: {
          params: {
            hostId: 'hostId'
          }
        },
        engagementId: 'mockEngagementId'
      }
    )
    expect(actions.get).toHaveBeenCalledWith(store.dispatch)
    expect(returnMock).toHaveBeenCalledWith('mockEngagementId', 'hostId')
  })

  it('should map state to props with undefined entitlements', () => {

    state.session.entitlements.list = {}
    let subject = shallow(<HostDetailContainer
      store={createStore(s => s, state)} />
    )

    expect(subject.props().entitlements).toEqual({})
    expect(subject.props().entitlementsVulnerability).toEqual({})
  })
})
