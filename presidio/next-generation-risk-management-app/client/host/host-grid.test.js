import React from 'react'
import { shallow } from 'enzyme'
import HostGrid from './host-grid'
import TableView, {
  TextFilterHeader,
  SortableHeader,
  TextCell,
  TotalCount
} from '../components/table'
import {
  ColumnDrilldownChart
} from '../components/charts'

describe("Host Grid", () => {
  let props

  beforeEach(() => {
    props = {
      entitlements: {
        Export: 0,
        Name: 0,

      },
      charts: {
        byOperatingSystemChart: { value: 'chart' }
      },
      table: {
        currentPageIndex: 0,
        page: [
          { Name: '192.168.60.65', OperatingSystem: 'Kyocera Printer', Severity: 'Moderate' },
          { Name: '192.168.60.65', OperatingSystem: 'Kyocera Copier', Severity: 'Moderate' }
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
        exportDropdownIsOpen: false
      },  
    }
  })

  it('should render total hosts count', () => {
    const subject = shallow(<HostGrid {...props} />)

    const element = subject.find(TotalCount)
    expect(element.props().totalRowCount).toEqual(2)
    expect(element.props().id).toEqual("host-total")
    expect(element.props().label).toEqual("Total host controls")

  })
0
  it('should pass titles to column headers', () => {
    const subject = shallow(<HostGrid {...props} />)
    const headers = subject.find(TableView).props().headers
    const titles = headers.map(h => h.props.title)
    expect(titles).toEqual(
      [
        'Name',
        'Operating System',
        'Severity',
        'Status'
      ]
    )
  })

  it('should pass sort objects to headers', () => {
    props.table.sort = {
      Name: { direction: 'desc', comparator: () => 0 },
      OperatingSystem: { direction: 'desc', comparator: () => 0 },
      AverageSeverityValue: { direction: 'desc', comparator: () => 0 }
    }
    const subject = shallow(<HostGrid {...props} />)
    const headers = subject.find(SortableHeader)
    headers.forEach(header => {
      expect(header.props().sort.direction).toEqual('desc')
    })
  })

  it('should pass sort handleSort to sort headers', () => {
    const subject = shallow(<HostGrid {...props} />)
    const headers = subject.find(SortableHeader)
    headers.forEach(header => {
      header.props().onClick()
    })
    expect(props.table.handleSort).toHaveBeenCalledTimes(4)
  })

  it('should pass handleFilter to filter headers', () => {
    const subject = shallow(<HostGrid {...props} />)
    const headers = subject.find(TextFilterHeader)
    headers.forEach(header => {
      header.simulate('change',{ target: { value: 1 } })
    })
    expect(props.table.handleFilterChange).toHaveBeenCalledTimes(4)
  })

  it('should render tbody Row', () => {
    props.rows = [
      { Id: '7' }
    ]
    const subject = shallow(<HostGrid {...props} />)
    const textCells = subject.find(TextCell)
    const expected = [
      'OperatingSystem',
      'AverageSeverity'
    ]
    Array.from(textCells).forEach((cell, index) => {
      expect(cell.props.col.field).toEqual(expected[index])
    })
  })

  it('should render hosts by os chart', () => {
    const subject = shallow(<HostGrid {...props} />).find(ColumnDrilldownChart)
    expect(subject.props().id).toEqual("hosts-by-os-chart")
    expect(subject.props().title).toEqual("Active Hosts by Operating System")
    expect(subject.props().subtitle).toEqual("Click the columns to view by specific operating system")
    expect(subject.props().className).toEqual("col-md-12")
    expect(subject.props().height).toEqual("300")
    expect(subject.props().yTitle).toEqual("Hosts")
    expect(subject.props().chart.value).toEqual("chart")
  })

})
