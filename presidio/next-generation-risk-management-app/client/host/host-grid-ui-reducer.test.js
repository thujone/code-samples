import * as types from './host-action-types'
import * as actions from '../actions/api'
import reducer from './host-grid-ui-reducer'

describe('Host Grid UI Reducer', () => {
  it('should handle HOST_EXPORT_DROPDOWN_CLICK:', () => {
    const action = {
      type: types.HOST_EXPORT_DROPDOWN_CLICK
    }
    const initState = {
      exportDropdownIsOpen: false
    }
    const expectedState = {
      exportDropdownIsOpen: true
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle HOST_EXPORT_DROPDOWN_MOUSE_LEAVE:', () => {
    const action = {
      type: types.HOST_EXPORT_DROPDOWN_MOUSE_LEAVE
    }
    const initState = {
      exportDropdownIsOpen: true,
    }
    const expectedState = {
      exportDropdownIsOpen: false
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })

  it('should handle HOST_POST_EXPORT_SUCCESS:', () => {
    const action = {
      type: types.HOST_POST_EXPORT_SUCCESS
    }
    const initState = {
      exportDropdownIsOpen: true,
    }
    const expectedState = {
      exportDropdownIsOpen: false
    }
    expect(reducer(initState, action)).toEqual(expectedState)
  })
})