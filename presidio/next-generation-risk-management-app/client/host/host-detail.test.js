import React from 'react'
import { shallow, mount } from 'enzyme'
import { Link } from 'react-router-dom'
import Pager from '../components/table/pager'
import {
  IconLinkCell,
  TextCell,
  SortableHeader,
  TextFilterHeader
} from '../components/table'
import HostDetail from './host-detail'
import * as routes from '../constants/routes'

describe("Host Detail", () => {
  let props

  beforeEach(() => {
    props = {
      history: [],
      engagementId: "engagementId",
      entitlements: {},
      entitlementsVulnerability: {},
      host: {
        currentPageIndex: 0,
        pageSize: 10,
        sort: {},
        filters: {},
        Id: "id",
        EngagementId: "engagementId",
        PhaseId: "phaseId",
        AssetGroupId: "assetGroupId",
        ImportedDate: "discoveryDate",
        ImportedBy: "importedBy",
        Name: "name",
        IpAddress: "ipAddress",
        OperatingSystem: "operatingSystem",
        OsConfidence: "osConfidence",
        AverageSeverity: "averageSeverity",
        AverageSeverityValue: "averageSeverityValue",
        IsCritical: false,
        AssetGroup: "assetGroup",
        Status: "status",
        VulnerabilityList: []
      },
      actions: {
        handleVulnerabilitiesSort: jest.fn(),
        handleVulnerabilitiesFilter: jest.fn(),
        handleVulnerabilitiesPageSizeChange: jest.fn(),
        handleVulnerabilitiesPageIndexChange: jest.fn()
      }
    }
  })

  it('should pass down props to name field', () =>{
    props.entitlements.Name = 0
    let subject = shallow(<HostDetail {...props}/>)
    let name = subject.find({ id: 'host-name', title: 'Name', value: 'name', entitlement: 0})
    expect(name).toHaveLength(1)
  })

  it('should pass down props to host os', () =>{
    props.entitlements.OperatingSystem = 0
    let subject = shallow(<HostDetail {...props}/>)
    let field = subject.find({ id: 'host-os', title: 'Host Operating System', value: 'operatingSystem', entitlement: 0})
    expect(field).toHaveLength(1)
  })

  it('should pass down props to host ip', () =>{
    props.entitlements.IpAddress = 0
    let subject = shallow(<HostDetail {...props}/>)
    let ip = subject.find({ id: 'host-ip', title: 'IP Address', value: 'ipAddress', entitlement: 0})
    expect(ip).toHaveLength(1)
  })

  it('should pass down props to os confidence', () => {
    props.entitlements.OsConfidence = 0
    let subject = shallow(<HostDetail {...props}/>)
    let field = subject.find({ id: 'host-confidence', title: 'OS Confidence', value: 'osConfidence', entitlement: 0 })
    expect(field).toHaveLength(1)
  })

  it('should render Discovery Date', () => {
    let subject = shallow(<HostDetail {...props}/>)
    let field = subject.find('#host-imported-date')
    expect(field.text()).toEqual("discoveryDate")
  })

  it('should render imported by', () => {
    let subject = shallow(<HostDetail {...props}/>)
    let field = subject.find('#host-imported-by')
    expect(field.text()).toEqual("importedBy")
  })

  it('should pass down props to status', () => {
    props.entitlements.Status = 0
    let subject = shallow(<HostDetail {...props}/>)
    let field = subject.find({ id: 'host-status', title: 'Status', value: 'status', entitlement: 0 })
    expect(field).toHaveLength(1)
  })

  it('should render total vulnerabilities count', () => {
    props.host.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<HostDetail {...props} />)
    let element = subject.find('#total-vulnerability-count')
    expect(element.text()).toEqual('1 total vulnerabilities')
  })

  it('should pass titles to column headers', () => {
    props.host.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<HostDetail {...props} />)
    let headers = subject.find(SortableHeader)
    let titles = headers.map(h => h.props().title)
    expect(titles).toEqual(
      [
        'Title',
        'Severity'
      ]
    )
  })

  it('should pass sort objects to headers', () => {
    props.host.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]
    props.host.sort = {
      Title: { direction: 'desc', comparator: () => 0 },
      CVSSScore: { direction: 'desc', comparator: () => 0 },
    }

    let subject = shallow(<HostDetail {...props} />)
    let headers = subject.find(SortableHeader)
    headers.forEach(header => {
      expect(header.props().sort.direction).toEqual('desc')
    })
  })

  it('should pass sort handleVulnerabilitiesSort to sort headers', () => {
    props.host.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<HostDetail {...props} />)
    let headers = subject.find(SortableHeader)
    headers.forEach(header => {
      header.props().onClick()
    })
    expect(props.actions.handleVulnerabilitiesSort).toHaveBeenCalledTimes(2)
  })

  it('should pass entitlements to Sort Headers', () => {
    props.entitlementsVulnerability = {
      CVSSScore : 0,
      Title: 0
    }
    let subject = shallow(<HostDetail {...props} />)
    let headers = subject.find(SortableHeader)
    headers.forEach(header => {
      expect(header.props().entitlement).toEqual(0)
    })
  })

  it('should pass entitlements to Filter Headers', () => {
    props.entitlementsVulnerability = {
      CVSSScore : 0,
      Title: 0
    }
    let subject = shallow(<HostDetail {...props} />)
    let headers = subject.find(TextFilterHeader)
    headers.forEach(header => {
      expect(header.props().entitlement).toEqual(0)
    })
  })

  it('should pass entitlements to cells', () => {
    props.host.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]
    props.entitlementsVulnerability = {
      CVSSScore : 0,
      Title: 0
    }
    let subject = shallow(<HostDetail {...props} />)
    expect(subject.find(IconLinkCell).props().entitlement).toEqual(0)
    expect(subject.find(TextCell).props().entitlement).toEqual(0)
  })

  it('should pass handleVulnerabilitiesFilter to filter headers', () => {
    props.host.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<HostDetail {...props} />)
    let headers = subject.find(TextFilterHeader)
    headers.forEach(header => {
      header.props().onChange({ target: { value: 1 } })
    })
    expect(props.actions.handleVulnerabilitiesFilter).toHaveBeenCalledTimes(2)
  })

  it('should render tbody Row', () => {
    props.entitlementsVulnerability.Title = 0
    props.entitlementsVulnerability.CVSSScore = 0
    props.host.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]
    let subject = shallow(<HostDetail {...props} />)
    expect(subject.find(IconLinkCell).props().item).toEqual(props.host.VulnerabilityList[0])
    expect(subject.find(IconLinkCell).props().col.getPath()).toEqual(routes.RISK_PAGE_BASE + routes.VULN_PAGE + "/engagementId/id")
    expect(subject.find(IconLinkCell).props().entitlement).toEqual(0)
    const textCells = subject.find(TextCell)
    expect(subject.find(TextCell).props().col.field).toEqual("Severity")
    expect(subject.find(TextCell).props().entitlement).toEqual(0)
  })

  it('should render a Pager component, passing required props along', () => {
    props.host.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<HostDetail {...props} />)
    expect(subject.find(Pager).props().pageSize).toEqual(10)
    expect(subject.find(Pager).props().totalRowCount).toEqual(props.host.VulnerabilityList.length)
    expect(subject.find(Pager).props().currentPageIndex).toEqual(0)
    expect(subject.find(Pager).props().handlePageSize).toBeInstanceOf(Function)
    expect(subject.find(Pager).props().handlePageChange).toBeInstanceOf(Function)
  })

  it('should render Cancel button', () => {
    let subject = shallow(<HostDetail {...props} />)
    let link = subject.find(Link)
    expect(link.props().id).toEqual("host-cancel-button")
    expect(link.props().to).toEqual(routes.RISK_PAGE_BASE + routes.HOST_PAGE + '/engagementId')
    expect(link.props().className).toEqual("btn btn-alternate")
  })
})