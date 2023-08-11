import React from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'react-bootstrap'
import Pager from '../components/table/pager'
import {
  IconLinkCell,
  TextCell,
  SortableHeader,
  TextFilterHeader,
  stringComparator,
  numberComparator,
  textFilter
} from '../components/table'
import {
  ReadOnlyField,
  SelectField
} from '../components/field'
import * as routes from '../constants/routes'
import { SecureHistoryButton as HistoryButton} from '../components/buttons/history-button'
import './host-detail.css'

const HostDetail = props => {
  let filteredSortedRows = [...props.host.VulnerabilityList]
  Object.keys(props.host.filters).forEach(field => {
    const filterField = props.host.filters[field]
    filteredSortedRows = [...filteredSortedRows.filter(row => filterField.filter(field)(row, filterField.value))]
  })
  Object.keys(props.host.sort).forEach(field => {
    const sortField = props.host.sort[field]
    filteredSortedRows = [...filteredSortedRows.sort(sortField.comparator(field))]
    if (sortField.direction === "desc")
      filteredSortedRows = filteredSortedRows.reverse()
  })

  const getPage = (rows) => {
    var startIndex = props.host.currentPageIndex * props.host.pageSize
    var endIndex = startIndex + (props.host.pageSize)
    return rows.slice(startIndex, endIndex)
  }

  return (

    <div>
      { props.host.isFetching &&
        <div>
          <p className="text-center">
            <i className="fa fa-5x fa-circle-o-notch fa-spin" />
          </p>
        </div>
      }
      { !props.host.isFetching &&
        <div>
          <div className="row">
            <div className="col-md-9">
              <div className="col-md-3">
                <div className="container-fluid">
                  <ReadOnlyField
                    title={'Name'}
                    value={props.host.Name}
                    id={'host-name'}
                    entitlement={props.entitlements['Name']}/>
                  <ReadOnlyField
                    title={'IP Address'}
                    id={'host-ip'}
                    value={props.host.IpAddress}
                    entitlement={props.entitlements['IpAddress']}
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="container-fluid">
                  <ReadOnlyField
                    title={'Host Operating System'}
                    id={'host-os'}
                    value={props.host.OperatingSystem}
                    entitlement={props.entitlements['OperatingSystem']}/>
                  <ReadOnlyField
                    title={'OS Confidence'}
                    id={'host-confidence'}
                    value={props.host.OsConfidence}
                    entitlement={props.entitlements['OsConfidence']}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="container-fluid">
                  { (props.host.Status === 'Retired' || props.host.Status === 'Offline') ?
                    <SelectField
                      label='Status'
                      entitlement={props.entitlements['Status']}
                      id='host-status'
                      onChange={(e) => props.actions.handleHostStatusChange(e.target.value)}
                      value={props.host.Status}
                    >
                      <option value="">Select</option>
                      <option value="Retired">Retired</option>
                      <option value="Offline">Offline</option>
                    </SelectField>
                  :
                    <ReadOnlyField
                      title={'Status'}
                      id={'host-status'}
                      value={props.host.Status}
                      entitlement={1}
                    />
                  }
                </div>
              </div>

              <div className="col-md-12">
                <div className="container-fluid">
                  <hr />
                  <div>
                    <div id="total-vulnerability-count" className="pull-right">{props.host.VulnerabilityList.length} total vulnerabilities</div>
                    <h4 className="pull-left">Vulnerabilities</h4>
                    <div className="pull-left">
                      <HistoryButton
                        entitlement={props.entitlements['History']}
                        visible={props.host.allVulns && props.host.activeVulns && props.host.allVulns.length !== props.host.activeVulns.length}
                        showHistory={!props.host.showHistory}
                        onClick={() => props.actions.handleHistoryButtonToggle()}
                      />
                    </div>
                  </div>
                  <div>
                    <Table striped={true} condensed={true} className="outline">
                      <thead>
                        <tr>
                          <SortableHeader
                            title="Title"
                            sort={props.host.sort["Title"]}
                            onClick={() => props.actions.handleVulnerabilitiesSort("Title", stringComparator)}
                            entitlement={props.entitlementsVulnerability['Title']}
                            width="600px"
                          />
                          <SortableHeader
                            title="Severity"
                            sort={props.host.sort["CVSSScore"]}
                            onClick={() => props.actions.handleVulnerabilitiesSort("CVSSScore", numberComparator)}
                            entitlement={props.entitlementsVulnerability['CVSSScore']}
                          />
                        </tr>
                        <tr>
                          <TextFilterHeader
                            onChange={(e) => props.actions.handleVulnerabilitiesFilter("Title", e.target.value, textFilter)}
                            entitlement={props.entitlementsVulnerability['Title']}
                            value={props.host.filters['Title'] ? props.host.filters['Title'].value : ''}
                          />
                          <TextFilterHeader
                            onChange={(e) => props.actions.handleVulnerabilitiesFilter("Severity", e.target.value, textFilter)}
                            entitlement={props.entitlementsVulnerability['CVSSScore']}
                            value={props.host.filters['Severity'] ? props.host.filters['Severity'].value : ''}
                          />
                        </tr>
                      </thead>
                      <tbody>
                        {
                          getPage(filteredSortedRows).map((row, index) => {
                            return (
                              <tr key={index}>
                                <IconLinkCell
                                  item={row}
                                  col={{ field: 'Title', getPath: () => routes.RISK_PAGE_BASE + routes.VULN_PAGE + '/' + props.engagementId + '/' + row.Id }}
                                  iconClassName={"fa fa-circle " + (row.Severity ? row.Severity.replace(' ', '-') : "")}
                                  entitlement={props.entitlementsVulnerability['Title']}
                                  hasTag={row.IsHistorical || row.IsPartiallyRemediated}
                                  tagLabel='Remediated'
                                  tagClassName='remediated-tag'
                                />
                                <TextCell
                                  item={row}
                                  col={{ field: 'Severity' }}
                                  entitlement={props.entitlementsVulnerability['CVSSScore']}
                                />
                              </tr>
                            )
                          })
                        }
                      </tbody>
                    </Table>
                    <Pager
                      pageSize={props.host.pageSize}
                      totalRowCount={filteredSortedRows.length}
                      currentPageIndex={props.host.currentPageIndex}
                      handlePageSize={(size) => props.actions.handleVulnerabilitiesPageSizeChange(size)}
                      handlePageChange={(index) => props.actions.handleVulnerabilitiesPageIndexChange(index)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 gutter">
              <div className="container-fluid">
                <h4>Information</h4>
                <dl>
                  <dt>Discovery Date</dt>
                  <dd><p id='host-imported-date'>{props.host.ImportedDate}</p></dd>
                  <dt>Imported By</dt>
                  <dd><p id='host-imported-by'>{props.host.ImportedBy}</p></dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="container-fluid">
            <br />
            <div className="pull-right">
              { (props.host.Status === 'Retired' || props.host.Status === 'Offline' ) && props.entitlements['Status'] === 0 &&
                <button
                  id="host-save-button"
                  className="btn btn-default"
                  disabled={props.host.IsFetching}
                  onClick={(e) => props.actions.update(props.host, props.history)}
                >
                    Save Host
                </button>
              }
              <Link
                id="host-cancel-button"
                to={routes.RISK_PAGE_BASE + routes.HOST_PAGE + '/' + props.engagementId}
                className="btn btn-alternate">
                Cancel
              </Link>
            </div>
            <div className="clearfix"></div>
          </div>
        </div>
      }
    </div>
  )
}

export default HostDetail
