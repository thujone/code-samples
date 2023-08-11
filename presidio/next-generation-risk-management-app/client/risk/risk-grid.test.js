import React from 'react'
import { shallow } from 'enzyme'
import RiskGrid from './risk-grid'
import TableView, {
  SortableHeader,
  TextFilterHeader,
  TotalCount
} from '../components/table'
import {
  ColumnDrilldownChart,
  PieDrilldownChart,
  BarChart
} from '../components/charts'

describe("Risk Grid", () => {
  let props

  beforeEach(() => {
    props = {
      engagementId: 'engagementId',
      charts: {
        byImpactChart: { value: 'impactChart' },
        byLikelihoodChart: { value: 'likelihoodChart' },
        byPhaseChart: { value: 'phaseChart' },
        byScoreChart: { value: 'scoreChart' },
        byPhaseScoreChart: { value: 'phaseScoreChart' },
        byTopScoreChart: { value: 'topScoreChart' }
      },
      table: {
        currentPageIndex: 0,
        page: [
          { Name: 'Name1' },
          { Name: 'Name2' }
        ],
        pageSize: 10,
        sort: {},
        totalRowCount: 2,
        filters: {},
        filteredAndSorted: [
          { Id: '100' },
          { Id: '101'}
        ],
        phaseList: [],
        fetchRows: jest.fn(),
        handleSort: jest.fn(),
        handleFilterChange: jest.fn(),
        handlePageChange: jest.fn().mockReturnValue('handlePageChange'),
        handlePageSize: jest.fn().mockReturnValue('handlePageSize'),
        handleExportDropdownClick: jest.fn(),
        handleExportDropdownMouseLeave: jest.fn(),
        handleExport: jest.fn(),
        handleSelectAll: jest.fn(),
        handleSelectRow: jest.fn()
      },
      ui: {
        exportDropdownIsOpen: false,
        confirmRemoveById: {}
      },  
      entitlements: {
        Remove: 0
      }
    }
  })


  it('should render total risks count', () => {
    const subject = shallow(<RiskGrid {...props} />)

    const element = subject.find(TotalCount)
    expect(element.props().totalRowCount).toEqual(2)
    expect(element.props().id).toEqual("risks-total")
    expect(element.props().label).toEqual("Total risks")

  })
0
  it('should pass titles to column headers', () => {
    const subject = shallow(<RiskGrid {...props} />)
    const headers = subject.find(TableView).props().headers
    const titles = headers.map(h => h.props.title)
    expect(titles).toEqual(
      [
        'Title',
        'Phase',
        'Score',
        'Impact',
        'Likelihood',
        'Mitigation Status',
        'Resource',
        'Remediation'
      ]
    )
  })

  it('should pass sort objects to headers', () => {
    props.table.sort = {
      Name: { direction: 'desc', comparator: () => 0 },
      Phase: { direction: 'desc', comparator: () => 0 },
      ScoreSeverity: { direction: 'desc', comparator: () => 0 },
      ImpactSeverity: { direction: 'desc', comparator: () => 0 },
      LikelihoodSeverity: { direction: 'desc', comparator: () => 0 },
      MitigationStatus: { direction: 'desc', comparator: () => 0 },
      RemediationResource: { direction: 'desc', comparator: () => 0 },
      MitigationDate: { direction: 'desc', comparator: () => 0 }
    }
    const subject = shallow(<RiskGrid {...props} />)
    const headers = subject.find(SortableHeader)
    headers.forEach(header => {
      expect(header.props().sort.direction).toEqual('desc')
    })
  })

  it('should pass sort handleSort to sort headers', () => {
    const subject = shallow(<RiskGrid {...props} />)
    const headers = subject.find(SortableHeader)
    headers.forEach(header => {
      header.props().onClick()
    })
    expect(props.table.handleSort).toHaveBeenCalledTimes(8)
  })

  it('should pass handleFilter to filter headers', () => {
    const subject = shallow(<RiskGrid {...props} />)
    const headers = subject.find(TextFilterHeader)
    headers.forEach(header => {
      header.simulate('change',{ target: { value: 1 } })
    })
    expect(props.table.handleFilterChange).toHaveBeenCalledTimes(8)
  })

  it('should render chart for risks by phase', () => {
    const subject = shallow(<RiskGrid {...props} />).find(ColumnDrilldownChart)
    expect(subject.props().id).toEqual("risks-by-phase-chart")
    expect(subject.props().title).toEqual("Risks by Phase")
    expect(subject.props().subtitle).toEqual("Click the columns to view by score")
    expect(subject.props().className).toEqual("col-md-6")
    expect(subject.props().height).toEqual("300")
    expect(subject.props().yTitle).toEqual("Risks")
    expect(subject.props().chart.value).toEqual("phaseChart")
  })

  it('should render chart for top risks', () => {
    const subject = shallow(<RiskGrid {...props} />).find(BarChart)
    expect(subject.props().id).toEqual("risks-top-risks-chart")
    expect(subject.props().title).toEqual("Top Risks")
    expect(subject.props().subtitle).toEqual("Click the bar to view risk details")
    expect(subject.props().className).toEqual("col-md-6")
    expect(subject.props().height).toEqual("300")
    expect(subject.props().yTitle).toEqual("Risk Score")
    expect(subject.props().chart.value).toEqual("topScoreChart")
  })

  it('should render chart for risks by impact', () => {
    const subject = shallow(<RiskGrid {...props} />).find(PieDrilldownChart).first()
    expect(subject.props().id).toEqual("risks-by-impact-chart")
    expect(subject.props().title).toEqual("Risks by Impact")
    expect(subject.props().subtitle).toEqual("Click the slice to view by phase")
    expect(subject.props().className).toEqual("col-md-4")
    expect(subject.props().height).toEqual("300")
    expect(subject.props().chart.value).toEqual("impactChart")
  })

  it('should render chart for risks by score', () => {
    const subject = shallow(<RiskGrid {...props} />).find(PieDrilldownChart).at(1)
    expect(subject.props().id).toEqual("risks-by-score-chart")
    expect(subject.props().title).toEqual("Risks by Score")
    expect(subject.props().subtitle).toEqual("Click the slice to view by phase")
    expect(subject.props().className).toEqual("col-md-4")
    expect(subject.props().height).toEqual("300")
    expect(subject.props().chart.value).toEqual("scoreChart")
  })

  it('should render chart for risks by impact', () => {
    const subject = shallow(<RiskGrid {...props} />).find(PieDrilldownChart).at(2)
    expect(subject.props().id).toEqual("risks-by-likelihood-chart")
    expect(subject.props().title).toEqual("Risks by Likelihood")
    expect(subject.props().subtitle).toEqual("Click the slice to view by phase")
    expect(subject.props().className).toEqual("col-md-4")
    expect(subject.props().height).toEqual("300")
    expect(subject.props().chart.value).toEqual("likelihoodChart")
  })

})
