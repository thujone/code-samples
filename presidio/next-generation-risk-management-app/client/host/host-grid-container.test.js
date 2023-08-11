import React from 'react'
import HostGridContainer from './host-grid-container'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { shallow } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'
import * as actions from './host-actions'

describe("Host Grid Container", () => {
  let state

  beforeEach(() => {
    actions.handleSort = jest.fn().mockReturnValueOnce('handleSort')
    actions.handleFilter = jest.fn().mockReturnValueOnce('handleFilter')
    actions.handlePageSizeChange = jest.fn().mockReturnValueOnce('handlePageSizeChange')
    actions.handlePageIndexChange = jest.fn().mockReturnValueOnce('handlePageIndexChange')
    actions.handleExportDropdownClick = jest.fn().mockReturnValueOnce('handleExportDropdownClick')
    actions.handleExportDropdownMouseLeave = jest.fn().mockReturnValueOnce('handleExportDropdownMouseLeave')
    actions.handleExport = jest.fn().mockReturnValueOnce('handleExport')

    state = {
      session: {
        entitlements: {
          list: {
            hostRoles: 'entitlements'
          }
        }
      },
      charts: {
        hosts: 'charts.hosts'
      },
      branding: {
        selectedEngagement: 'engagementId',
      },
      hostGrid: {
        currentPageIndex: 'currentPageIndex',
        pageSize: 'pageSize',
        data: 'data',
        sort: 'sort',
        filters: 'filters',
        selectedRows: 'selectedRows'
      },
      ui: {
        hostGrid: 'ui.hostGrid'
      }
    }
  })

  it('should map state to props', () => {
    const store = createStore(s => s, state)
    const subject = shallow(<HostGridContainer store={store} />)

    expect(subject.props().engagementId).toEqual('engagementId')
    expect(subject.props().selectedRows).toEqual('selectedRows')
    expect(subject.props().ui).toEqual('ui.hostGrid')
    expect(subject.props().entitlements).toEqual('entitlements')
    expect(subject.props().charts).toEqual('charts.hosts')
  })

  it('should map dispatch to props', () => {
    const store = createStore(s => s, state)
    const subject = shallow(<HostGridContainer store={store} />)
  
    expect(subject.props().actions).toEqual({})
  })

  it('should map state to props with undefined entitlements', () => {

    state.session.entitlements.list = {}
    let subject = shallow(<HostGridContainer
      store={createStore(s => s, state)} />
    )

    expect(subject.props().entitlements).toEqual({})
  })

})
