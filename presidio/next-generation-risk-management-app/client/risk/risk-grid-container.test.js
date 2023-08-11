import React from 'react'
import RiskGridContainer from './risk-grid-container'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { shallow } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'
import * as actions from './risk-actions'

describe("Risk Grid Container", () => {
  let state

  beforeEach(() => {
    actions.handleSort = jest.fn().mockReturnValueOnce('handleSort')
    actions.handleFilter = jest.fn().mockReturnValueOnce('handleFilter')
    actions.handlePageSizeChange = jest.fn().mockReturnValueOnce('handlePageSizeChange')
    actions.handlePageIndexChange = jest.fn().mockReturnValueOnce('handlePageIndexChange')
    actions.handleExportDropdownClick = jest.fn().mockReturnValueOnce('handleExportDropdownClick')
    actions.handleExportDropdownMouseLeave = jest.fn().mockReturnValueOnce('handleExportDropdownMouseLeave')
    actions.handleExport = jest.fn().mockReturnValueOnce('handleExport')
    actions.handleRemoveClick = jest.fn().mockReturnValueOnce('handleRemoveClick')
    actions.handleRemoveCancelClick = jest.fn().mockReturnValueOnce('handleRemoveCancelClick')
    actions.handleRemoveConfirmClick = jest.fn().mockReturnValueOnce('handleRemoveConfirmClick')

    state = {
      branding: {
        selectedEngagement: 'engagementId',
      },
      riskGrid: {
        currentPageIndex: 'currentPageIndex',
        pageSize: 'pageSize',
        data: 'data',
        sort: 'sort',
        filters: 'filters'
      },
      ui: {
        riskGrid: 'ui.riskGrid'
      },
      charts: {
        risks: 'charts.risks'
      },
      session: {
        entitlements: {
          list: {
            riskRoles: "riskRoles"
          }
        }
      }
    }
  })

  it('should map state to props', () => {
    const subject = shallow(<RiskGridContainer store={createStore(s => s, state)} />)

    expect(subject.props().engagementId).toEqual('engagementId')
    expect(subject.props().ui).toEqual('ui.riskGrid')
    expect(subject.props().entitlements).toEqual('riskRoles')
    expect(subject.props().charts).toEqual('charts.risks')
  })

  it('should map state to props with undefined entitlements', () => {

    state.session.entitlements.list = {}
    const subject = shallow(<RiskGridContainer store={createStore(s => s, state)} />)

    expect(subject.props().entitlements).toEqual({})
  })

  it('should map dispatch to props', () => {
    const subject = shallow(<RiskGridContainer store={createStore(s => s, state)} />)
    
    expect (subject.props().actions).toEqual({})
  })
})
