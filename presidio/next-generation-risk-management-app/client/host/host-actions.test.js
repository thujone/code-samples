import configureMockStore from 'redux-mock-store'
import moxios from 'moxios'
import * as types from './host-action-types'
import * as endpoints from '../constants/endpoints'
import * as httpStatus from '../constants/http-status-codes'
import * as actions from './host-actions'
import * as chartTypes from '../components/charts/chart-action-types'

const mockStore = configureMockStore()

describe('Host Actions', () => {
  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('should dispatch HOST_VULNERABILITIES_SORT', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.HOST_VULNERABILITIES_SORT, field: "Field", comparator: "Comparator" }]
    actions.handleVulnerabilitiesSort(store.dispatch)("Field", "Comparator")
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch HOST_VULNERABILITIES_FILTER', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.HOST_VULNERABILITIES_FILTER, field: "Field", value: "Value", filter: "Filter" }]
    actions.handleVulnerabilitiesFilter(store.dispatch)("Field", "Value", "Filter")
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch HOST_VULNERABILITIES_PAGE_SIZE_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.HOST_VULNERABILITIES_PAGE_SIZE_CHANGE, size: "Size" }]
    actions.handleVulnerabilitiesPageSizeChange(store.dispatch)("Size")
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch HOST_VULNERABILITIES_PAGE_INDEX_CHANGE', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.HOST_VULNERABILITIES_PAGE_INDEX_CHANGE, index: "Index" }]
    actions.handleVulnerabilitiesPageIndexChange(store.dispatch)("Index")
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch HOST_GET_ITEMS_FETCHING', () => {
    const store = mockStore()
    const expectedActions = [{ type: types.HOST_GET_ITEMS_FETCHING }]

    actions.getItems(store.dispatch)('engagementId')

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should dispatch HOST_GET_ITEMS_SUCCESS', (done) => {
    const store = mockStore()
    const response = "test"
    const expectedAction = { type: types.HOST_GET_ITEMS_SUCCESS, payload: "test" }

    moxios.stubRequest(endpoints.HOSTS + '/engagementId', {
      status: httpStatus.OK,
      response
    })

    actions.getItems(store.dispatch)('engagementId')
      .then(() => {
        expect(store.getActions()[1]).toEqual(expectedAction)
        done()
      })
  })

  it('should dispatch HOST_GET_ITEMS_FAILED', (done) => {
    const store = mockStore()
    const response = "test"
    const expectedAction = { type: types.HOST_GET_ITEMS_FAILED, error: "test" }

    moxios.stubRequest(endpoints.HOSTS + '/engagementId', {
      status: httpStatus.BAD_REQUEST,
      response
    })

    actions.getItems(store.dispatch)('engagementId')
      .then(() => {
        expect(store.getActions()[1]).toEqual(expectedAction)
        done()
      })
  })

  // it('getGrid should getHostCharts and getItems', () => {
  //   const store = mockStore()
  //   const expectedActions = [
  //     { type: chartTypes.GET_HOST_CHARTS_FETCHING },
  //     { type: types.HOST_GET_ITEMS_FETCHING }
  //   ]

  //   actions.getGrid(store.dispatch)('engagementId', 'host')

  //   expect(store.getActions()).toEqual(expectedActions)
  // })

})
