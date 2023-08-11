import React from 'react'
import * as routes from '../constants/routes'
import * as endpoints from '../constants/endpoints'
import Pager from '../components/table/pager'
import TableView, {
  IconLinkCell,
  TextCell,
  SortableHeader,
  TextFilterHeader,
  ThreatLevelFilterHeader,
  MitigationStatusFilterHeader,
  stringComparator,
  numberComparator,
  dateComparator,
  textFilter,
  equalsFilter,
  TotalCount
} from '../components/table'
import {
  ColumnDrilldownChart,
  PieDrilldownChart,
  BarChart
} from '../components/charts'
import { SecuredLinkButton as LinkButton } from '../components/buttons/link-button'
import { SecureExportButton as ExportButton}  from '../components/buttons/export-button'
import './risk-grid.css'

const RiskGrid = props => {

  const createEvent = (value) => ({ target: { value } })

  const clearFilters = () => {
    props.table.handleFilterChange("Name", "", textFilter)
    props.table.handleFilterChange("Phase", "", textFilter)
    props.table.handleFilterChange("ScoreSeverity", "", textFilter)
    props.table.handleFilterChange("ImpactSeverity", "", textFilter)
    props.table.handleFilterChange("LikelihoodSeverity", "", textFilter)
    props.table.handleFilterChange("RemediationStatus", "", textFilter)
    props.table.handleFilterChange("RemediationResource", "", textFilter)
    props.table.handleFilterChange("MitigationDate", "", textFilter)
  }

  return (
      <div className='container-fluid'>
        
        <div className="row">
          <BarChart
            id="risks-top-risks-chart"
            className="col-md-6"
            title="Top Risks"
            subtitle="Click the bar to view risk details"
            yTitle="Risk Score"
            yMax="10"
            yTickInterval="1"
            height="300"
            chart={props.charts.byTopScoreChart}
            onClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("Name", equalsFilter)(createEvent(e.point.name.split('. ')[1]))
            }}
          />
          <ColumnDrilldownChart
            id="risks-by-phase-chart"
            className="col-md-6"
            title="Risks by Phase"
            subtitle="Click the columns to view by score"
            yTitle="Risks"
            height="300"
            chart={props.charts.byPhaseChart}
            onClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("Phase", equalsFilter)(createEvent(e.point.series.name))
              props.table.handleFilterChange("ScoreSeverity", equalsFilter)(createEvent(e.point.name))
            }}
            onDrilldownClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("Phase", equalsFilter)(createEvent(e.point.name))
            }}
            onDrillupClick={clearFilters}
          />
        </div>

        <hr />
  
        <div className="row">
          <PieDrilldownChart
            id="risks-by-impact-chart"
            className="col-md-4"
            title="Risks by Impact"
            subtitle="Click the slice to view by phase"
            height="300"
            legend={true}
            chart={props.charts.byImpactChart}
            onClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("ImpactSeverity", equalsFilter)(createEvent(e.point.series.name))
              props.table.handleFilterChange("Phase", equalsFilter)(createEvent(e.point.name))
            }}
            onDrilldownClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("ImpactSeverity", equalsFilter)(createEvent(e.point.name))
            }}
            onDrillupClick={clearFilters}
          />
          <PieDrilldownChart
            id="risks-by-score-chart"
            className="col-md-4"
            title="Risks by Score"
            subtitle="Click the slice to view by phase"
            height="300"
            legend={true}
            chart={props.charts.byScoreChart}
            onClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("ScoreSeverity", equalsFilter)(createEvent(e.point.series.name))
              props.table.handleFilterChange("Phase", equalsFilter)(createEvent(e.point.name))
            }}
            onDrilldownClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("ScoreSeverity", equalsFilter)(createEvent(e.point.name))
            }}
            onDrillupClick={clearFilters}
          />
          <PieDrilldownChart
            id="risks-by-likelihood-chart"
            className="col-md-4"
            title="Risks by Likelihood"
            subtitle="Click the slice to view by phase"
            height="300"
            legend={true}
            chart={props.charts.byLikelihoodChart}
            onClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("LikelihoodSeverity", equalsFilter)(createEvent(e.point.series.name))
              props.table.handleFilterChange("Phase", equalsFilter)(createEvent(e.point.name))
            }}
            onDrilldownClick={(e) => {
              clearFilters()
              props.table.handleFilterChange("LikelihoodSeverity", equalsFilter)(createEvent(e.point.name))
            }}
            onDrillupClick={clearFilters}
          />
        </div>

        <hr />

        <div className="table-btn-action">
          
          <TotalCount
            totalRowCount={props.table.filteredAndSorted.length}
            id='risks-total'
            label={'Total risks'}
            containerClassName=''
          />
          

          { props.table && props.table.page && 
            <ExportButton
              entitlement={props.entitlements['Export']}
              exportURL={endpoints.EXPORT_RISKS}
              ids={props.table.page.map(r=>r.Id)}
              engagementId={props.engagementId}
              name='Risks'
            />
          }

          <LinkButton
            id={'addRisk'}
            className='pull-right'
            visible
            entitlement={props.entitlements['Add']}
            route={routes.RISK_PAGE_BASE + routes.RISK_PAGE + '/' + props.engagementId + '/0'}
            label='Add Risk'
          />
        </div>

        <hr />

        { props.table &&
          <div>
            <TableView
              headers={[
                {
                  component: SortableHeader,
                  props: {
                    title: 'Title',
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
                    title: 'Score',
                    sort: props.table.sort['RiskScore'],
                    onClick: props.table.handleSort('RiskScore', numberComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Impact',
                    sort: props.table.sort['Impact'],
                    onClick: props.table.handleSort('Impact', numberComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Likelihood',
                    sort: props.table.sort['Likelihood'],
                    onClick: props.table.handleSort('Likelihood', numberComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Remediation Status',
                    sort: props.table.sort['RemediationStatusId'],
                    onClick: props.table.handleSort('RemediationStatusId', numberComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Resource',
                    sort: props.table.sort['RemediationResource'],
                    onClick: props.table.handleSort('RemediationResource', stringComparator)
                  }
                },
                {
                  component: SortableHeader,
                  props: {
                    title: 'Remediated Date',
                    sort: props.table.sort['MitigationDate'],
                    onClick: props.table.handleSort('MitigationDate', dateComparator)
                  }
                }
              ]}
              filters={[
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
                  component: ThreatLevelFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('ScoreSeverity', equalsFilter),
                    value: props.table.filters['ScoreSeverity'] ? props.table.filters['ScoreSeverity'].value : ''
                  }
                },
                {
                  component: ThreatLevelFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('ImpactSeverity', equalsFilter),
                    value: props.table.filters['ImpactSeverity'] ? props.table.filters['ImpactSeverity'].value : ''
                  }
                },
                {
                  component: ThreatLevelFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('LikelihoodSeverity', equalsFilter),
                    value: props.table.filters['LikelihoodSeverity'] ? props.table.filters['LikelihoodSeverity'].value : ''
                  }
                },
                {
                  component: MitigationStatusFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('RemediationStatus', equalsFilter),
                    value: props.table.filters['RemediationStatus'] ? props.table.filters['RemediationStatus'].value : ''
                  }
                },
                {
                  component: TextFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('RemediationResource', textFilter),
                    value: props.table.filters['RemediationResource'] ? props.table.filters['RemediationResource'].value : ''
                  }
                },
                {
                  component: TextFilterHeader,
                  props: {
                    onChange: props.table.handleFilterChange('MitigationDate', textFilter),
                    value: props.table.filters['MitigationDate'] ? props.table.filters['MitigationDate'].value : ''
                  }
                }
              ]}
              cells={row => ([
                {
                  component: IconLinkCell,
                  props: {
                    item: row,
                    col: { field: 'Name', getPath:() => routes.RISK_PAGE_BASE + routes.RISK_PAGE + '/' + props.engagementId + '/' + row.Id },
                    iconClassName: 'fa fa-circle ' + (row.ScoreSeverity ? row.ScoreSeverity.replace(' ', '-') : '')
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'Phase' }
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'ScoreSeverity' }
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'ImpactSeverity' }
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'LikelihoodSeverity' }
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'RemediationStatus' }
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'RemediationResource' }
                  }
                },
                {
                  component: TextCell,
                  props: {
                    item: row,
                    col: { field: 'MitigationDate' }
                  }
                }
              ])}
              page={props.table.page}
              onDelete={props.table.deleteRow}
            />
            <Pager {...props.table} totalRowCount={props.table.filteredAndSorted.length} />
          </div>
        }
        
        
        
      </div>
    
  )
}

export default RiskGrid
