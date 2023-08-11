import * as types from './risk-action-types'

export const initState = {
  exportDropdownIsOpen: false,
  confirmRemoveById: {}
}

const riskGridUIReducer = (state = initState, action) => {
  switch (action.type) {
    case types.RISK_EXPORT_DROPDOWN_CLICK:
      return {
        ...state,
        exportDropdownIsOpen: !state.exportDropdownOpenIsOpen
      }
    case types.RISK_EXPORT_DROPDOWN_MOUSE_LEAVE:
      return {
        ...state,
        exportDropdownIsOpen: false
      }
    case types.RISK_REMOVE_CLICK:
      return {
        ...state,
        confirmRemoveById: {
          ...state.confirmRemoveById,
          [action.riskId]: true
        }
      }
    case types.RISK_REMOVE_SUCCESS:
    case types.RISK_REMOVE_CANCEL_CLICK:
      return {
        ...state,
        confirmRemoveById: {
          ...state.confirmRemoveById,
          [action.riskId]: false
        }
      }
    default:
      return state
  }
}

export default riskGridUIReducer