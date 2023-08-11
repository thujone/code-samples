import * as types from './risk-action-types'
import * as actions from '../actions/api'
import reducer from './risk-grid-ui-reducer'

describe('Risk Grid UI Reducer', () => {
  it('should handle RISK_EXPORT_DROPDOWN_CLICK:', () => {
    const action = {
      type: types.RISK_EXPORT_DROPDOWN_CLICK
    }
    const initState = {
      exportDropdownIsOpen: false
    }
    const expectedState = {
      exportDropdownIsOpen: true
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_EXPORT_DROPDOWN_MOUSE_LEAVE:', () => {
    const action = {
      type: types.RISK_EXPORT_DROPDOWN_MOUSE_LEAVE
    }
    const initState = {
      exportDropdownIsOpen: true,
    }
    const expectedState = {
      exportDropdownIsOpen: false
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_REMOVE_CLICK:', () => {
    const action = {
      type: types.RISK_REMOVE_CLICK,
      riskId: 'A'
    }
    const initState = {
      confirmRemoveById: {
        B: false
      }
    }
    const expectedState = {
      confirmRemoveById: {
        B: false,
        A: true
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_REMOVE_CANCEL_CLICK:', () => {
    const action = {
      type: types.RISK_REMOVE_CANCEL_CLICK,
      riskId: 'A'
    }
    const initState = {
      confirmRemoveById: {
        B: false,
        A: true
      }
    }
    const expectedState = {
      confirmRemoveById: {
        B: false,
        A: false
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle RISK_REMOVE_SUCCESS:', () => {
    const action = {
      type: types.RISK_REMOVE_SUCCESS,
      riskId: 'A'
    }
    const initState = {
      confirmRemoveById: {
        B: false,
        A: true
      }
    }
    const expectedState = {
      confirmRemoveById: {
        B: false,
        A: false
      }
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })
})