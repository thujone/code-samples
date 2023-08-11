import React from 'react'
import * as routes from '../constants/routes'
import * as endpoints from '../constants/endpoints'
import TableView, {
  PlainHeader,
  TextFilterHeader,
  SelectFilterHeader,
  stringComparator,
  textFilter,
  Pager,
  TotalCount,
  SortableHeader,
  CheckboxCell,
  TextCell,
  IconLinkCell,
  equalsFilter,
  startsWithFilter
} from '../components/table'
import './host-grid.css'
import { ColumnDrilldownChart } from '../components/charts'
import { SecureExportButton as ExportButton}  from '../components/buttons/export-button'


class HostGrid extends React.Component {

  createEvent(value) {
    return { target: { value } }
  }

  getSelectedItems() {
    if (!this.props.selectedRows)
      return []
    return this.props.table.rows.filter(row => this.props.selectedRows[row.Id])
  }

  getPage(rows) {
    var startIndex = this.props.currentPageIndex * this.props.pageSize
    var endIndex = startIndex + (this.props.pageSize)
    return rows.slice(startIndex, endIndex)
  }

  clearFilters() {
    this.props.table.handleFilterChange('Name', equalsFilter)(this.createEvent(''))
    this.props.table.handleFilterChange('OperatingSystem', textFilter)(this.createEvent(''))
    this.props.table.handleFilterChange('AverageSeverity', textFilter)(this.createEvent(''))
  }

  componentWillMount() {
    this.props.actions.initGridState('host')();
  }

  render() {
    const props = this.props

    return (
      <div className='container-fluid'>
        <div className='row'>
          <ColumnDrilldownChart
            id='hosts-by-os-chart'
            className='col-md-12'
            title='Active Hosts by Operating System'
            subtitle='Click the columns to view by specific operating system'
            height='300'
            legend={true}
            yTitle='Hosts'
            chart={props.charts.byOperatingSystemChart}
            onClick={(e) => {
              this.clearFilters()
              this.props.table.handleFilterChange('AverageSeverity', equalsFilter)(this.createEvent(e.point.name))
              this.props.table.handleFilterChange('OperatingSystem', equalsFilter)(this.createEvent(e.point.name))
            }}
            onDrilldownClick={(e) => {
              this.clearFilters()
              this.props.table.handleFilterChange('AverageSeverity', equalsFilter)(this.createEvent(e.point.name))
              this.props.table.handleFilterChange('OperatingSystem', startsWithFilter)(this.createEvent(e.point.name))
            }}
            onDrillupClick={this.clearFilters}
          />
        </div>

        <hr />

        <div className='table-btn-action'>
          <TotalCount
            totalRowCount={props.table.filteredAndSorted.length}
            id='host-total'
            label={'Total host controls'}
          />
          <ExportButton
            entitlement={props.entitlements['Export']}
            exportURL={endpoints.EXPORT_HOSTS}
            ids={props.table.page.map(r=>r.Id)}
            engagementId={props.engagementId}
            name='Hosts'
          />

          {
            //Number.isInteger(props.entitlements["Assign"]) &&
            this.getSelectedItems().length > 0 &&
            <div className="pull-right">
              <div
                id="host-selected-item-actions"
                className={"btn-group btn-group-actions" + (props.ui.selectedItemActionsDropdownIsOpen ? " open" : "") + (props.ui.updateStatusFormIsVisible ? " hidden" : "")}
              >
                <button
                  id="host-selected-item-actions-button"
                  type="button"
                  className="btn btn-primary btn-dropdown dropdown-toggle"
                  onClick={() => props.actions.handleSelectedItemActionsDropdownClick()}
                >
                  <i className="fa fa-caret-down pull-right" />
                  <span className="pull-left">
                    <span className="badge">{this.getSelectedItems().length}</span> Selected
                  </span>
                </button>
                <ul
                  className="dropdown-menu"
                  onMouseLeave={() => props.actions.handleSelectedItemActionsDropdownMouseLeave()}
                >
                  <li>
                    <a
                      id="host-selected-items-actions-clear"
                      className="cursor-pointer"
                      onClick={() => props.actions.handleSelectedItemActionsClear()}
                    >
                      Clear Selected
                    </a>
                  </li>
                  <li>
                    <a
                      id="host-selected-item-actions-assign-status"
                      className="cursor-pointer"
                      onClick={() => props.actions.handleSelectedItemActionsAssignStatus(props.engagementId)}
                    >
                      Update Status
                    </a>
                  </li>
                </ul>
              </div>

              <form
                id="host-update-status-form"
                className={"form-inline" + (props.ui.updateStatusFormIsVisible ? "" : " hidden")}>
                <div className="form-group">
                  <label className="control-label" htmlFor="update-status-select">Status</label>
                  <select
                    id="update-status-select"
                    className="form-control"
                    value={props.assignForm.hostStatus}
                    onChange={(e) => props.actions.handleAssignStatusChange(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Offline">Offline</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <button
                  id="host-assign-status-save-button"
                  type="button"
                  className="btn btn-default"
                  onClick={() => props.actions.handleAssignStatusSave(props.assignForm, this.getSelectedItems(), props.table, props.selectedEngagement)}
                >
                  Assign
                </button>
                <button
                  id="host-assign-status-cancel-button"
                  type="button"
                  className="btn btn-alternate"
                  onClick={() => props.actions.handleAssignStatusCancel()}
                >
                  Cancel
                </button>
              </form>
            </div>
          }

          <div className='clearfix'></div>
        </div>

        <hr />

        { props.isFetching &&
          <div>
            <p className="text-center">
              <i className="fa fa-5x fa-circle-o-notch fa-spin" />
            </p>
          </div>
        }
        { !props.isFetching &&
          <div>
            <TableView
              headers={[
                {
                  component: PlainHeader,
                  props: {
                    title: ''
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Name',
                    sort: props.table.sort['Name'],
                    onClick: props.table.handleSort('Name', stringComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Phase',
                    sort: props.table.sort['Phase'],
                    onClick: props.table.handleSort('Phase', stringComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Operating System',
                    sort: props.table.sort['OperatingSystem'],
                    onClick: props.table.handleSort('OperatingSystem', stringComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Severity',
                    sort: props.table.sort['AverageSeverityValue'],
                    onClick: props.table.handleSort('AverageSeverityValue', stringComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Status',
                    sort: props.table.sort['Status'],
                    onClick: props.table.handleSort('Status', stringComparator)
                  }

                }
              ]}
              filters={[
                { component: TextFilterHeader, props: { value: null } },
                {
                  component: TextFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('Name', textFilter),
                    value: props.table.filters['Name'] ? props.table.filters['Name'].value : ''
                  }
                },
                {
                  component: TextFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('Phase', textFilter),
                    value: props.table.filters['Phase'] ? props.table.filters['Phase'].value : ''
                  }
                },
                {
                  component: TextFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('OperatingSystem', textFilter),
                    value: props.table.filters['OperatingSystem'] ? props.table.filters['OperatingSystem'].value : ''
                  }
                },
                {
                  component: SelectFilterHeader,
                  props: {
                    children: ['', 'Very Low', 'Low', 'Moderate', 'High', 'Very High'].map((val, i) => <option key={i} value={val}>{val}</option>),
                    onChange: props.table.handleFilterChange('AverageSeverity', equalsFilter),
                    value: props.table.filters['AverageSeverity'] ? props.table.filters['AverageSeverity'].value : ''
                  }
                },
                {
                  component: SelectFilterHeader,
                  props: {
                    children: ['', 'Active', 'Offline', 'Retired'].map((val, i) => <option key={i} value={val}>{val}</option>),
                    onChange: props.table.handleFilterChange('Status', equalsFilter),
                    value: props.table.filters['Status'] ? props.table.filters['Status'].value : ''
                  }
                }
              ]}
              cells={row => [
                {
                  component: CheckboxCell,
                  props: {
                    rowIndex: row.id,
                    checked: props.selectedRows[row.Id],
                    onChange: (e) => props.actions.handleSelectRow(e.target.checked, row.Id, this.getPage(props.table.filteredAndSorted)),
                    visible: props.entitlements['Status'] === 0 && row.Status !== 'Active' ? props.table.deleteRow : null
                  }
                },
                {
                  component: IconLinkCell,
                  props: {
                    item: row,
                    col: {
                      field: 'Name',
                      getPath: () => `${routes.RISK_PAGE_BASE}${routes.HOST_PAGE}/${props.engagementId}/${row.PhaseId}/${row.Id}` 
                    },
                    iconClassName: 'fa fa-circle ' + (row.AverageSeverity ? row.AverageSeverity.replace(' ', '-') : '')
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'Phase' },
                    isEmphatic: row.Status === 'Retired'
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'OperatingSystem' },
                    path: `${routes.COMPLIANCE_PAGE}/t${props.schemeId}/${props.selectedEngagement}/${props.schemeId}/${row.Id}`,
                    isEmphatic: row.Status === 'Retired'
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'AverageSeverity' },
                    isEmphatic: row.Status === 'Retired'
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'Status' },
                    isEmphatic: row.Status === 'Retired'
                  }
                }
              ]}
              page={props.table.page}
                onDelete={Number.isInteger(props.entitlements['Remove']) ? props.table.deleteRow : null}
            />

            <Pager
              {...props.table}
              totalRowCount={props.table.filteredAndSorted.length}
            />
          </div>
        }

      </div>
    )
  }
}

HostGrid.propTypes = {
}

export default HostGrid
