import * as types from './host-action-types'

export const initState = {
  exportDropdownIsOpen: false
}

const hostGridUIReducer = (state = initState, action) => {
  switch (action.type) {
    case types.HOST_EXPORT_DROPDOWN_CLICK:
      return {
        ...state,
        exportDropdownIsOpen: !state.exportDropdownOpenIsOpen
      }
    case types.HOST_EXPORT_DROPDOWN_MOUSE_LEAVE:
    case types.HOST_POST_EXPORT_SUCCESS:
      return {
        ...state,
        exportDropdownIsOpen: false
      }
    case types.HOST_SELECTED_ITEM_ACTIONS_DROPDOWN_CLICK:
      return {
        ...state,
        selectedItemActionsDropdownIsOpen: !state.selectedItemActionsDropdownIsOpen
      }
    case types.HOST_SELECTED_ITEM_ACTIONS_DROPDOWN_MOUSE_LEAVE:
      return {
        ...state,
        selectedItemActionsDropdownIsOpen: false
      }
    case types.HOST_SELECTED_ITEM_ACTIONS_CLEAR:
      return {
        ...state,
        selectedItemActionsDropdownIsOpen: false
      }
    case types.HOST_SELECTED_ITEM_ACTIONS_ASSIGN_STATUS:
      return {
        ...state,
        selectedItemActionsDropdownIsOpen: false,
        updateStatusFormIsVisible: true
      }
    case types.HOST_SELECT_ALL_CLICK:
    case types.HOST_SELECT_ROW_CLICK:
    case types.HOST_ASSIGN_STATUS_CANCEL:
      return {
        ...state,
        updateStatusFormIsVisible: false
      }
    default:
      return state
  }
}

export default hostGridUIReducer
