import React from 'react'
import { Link } from 'react-router-dom'
import ValidationSummary from '../components/validation/validation-summary'
import * as routes from '../constants/routes'
import { Table } from 'react-bootstrap'
import Pager from '../components/table/pager'
import {
  TextField,
  TextareaField,
  SelectField,
  DatepickerField,
  SelectResourceField
} from '../components/field'
import { getLookup } from './risk-detail-helper'
import {
  IconLinkCell,
  TextCell,
  SortableHeader,
  TextFilterHeader,
  stringComparator,
  numberComparator,
  textFilter
} from '../components/table'
import './risk-detail.css'

const RiskDetail = props => {

  let filteredSortedRows = [...props.risk.VulnerabilityList]
  Object.keys(props.risk.filters).forEach(field => {
    const filterField = props.risk.filters[field]
    filteredSortedRows = [...filteredSortedRows.filter(row => filterField.filter(field)(row, filterField.value))]
  })
  Object.keys(props.risk.sort).forEach(field => {
    const sortField = props.risk.sort[field]
    filteredSortedRows = [...filteredSortedRows.sort(sortField.comparator(field))]
    if (sortField.direction === "desc")
      filteredSortedRows = filteredSortedRows.reverse()
  })

  const getPage = (rows) => {
    var startIndex = props.risk.currentPageIndex * props.risk.pageSize
    var endIndex = startIndex + (props.risk.pageSize)
    return rows.slice(startIndex, endIndex)
  }

  return (
    <div>
      <ValidationSummary id="risk-validation-summary" validationErrors={props.ui.ValidationErrors} />
      <div className="row">
        <div className="col-md-9">
          <form className="form-horizontal">

            <div className="col-md-6">
              <TextField
                label='Title'
                entitlement={props.entitlements['Name']}
                hasError={props.ui.ValidationErrors['Name']}
                id='name-risk'
                required
                onChange={(e) => props.actions.handleNameChange(e.target.value)}
                value={props.risk.Name}
                inputClassName='col-md-6'
                labelClassName='col-md-6'
              />
              <SelectField
                label='Engagement Phase'
                entitlement={props.entitlements['PhaseId']}
                hasError={props.ui.ValidationErrors['PhaseId']}
                id='phase'
                required
                onChange={(e) => props.actions.handlePhaseChange(e.target.value)}
                value={props.risk.PhaseId}
                inputClassName='col-md-6'
                labelClassName='col-md-6'
              >
                <option value="">Select</option>
                {
                  props.risk.PhaseList &&
                  props.risk.PhaseList.map((option, index) => {
                    return (
                      <option key={index} value={option.ResourceId}>{option.ResourceName}</option>
                    )
                  })
                }
              </SelectField>
              <TextField
                label='Affected Systems'
                entitlement={props.entitlements['AffectedSystemsCount']}
                hasError={props.ui.ValidationErrors['AffectedSystemsCount']}
                id='affected-systems'
                onChange={(e) => props.actions.handleAffectedSystemsChange(e.target.value)}
                value={props.risk.AffectedSystemsCount}
                inputClassName='col-md-3'
                labelClassName='col-md-6'
              />
              <TextField
                label='Possible Affected Systems'
                entitlement={props.entitlements['PossibleAffectedSystemsCount']}
                hasError={props.ui.ValidationErrors['PossibleAffectedSystemsCount']}
                id='possible-affected-systems'
                onChange={(e) => props.actions.handlePossibleAffectedSystemsChange(e.target.value)}
                value={props.risk.PossibleAffectedSystemsCount}
                inputClassName='col-md-3'
                labelClassName='col-md-6'
              />
            </div>
            <div className="col-md-6">
              <TextField
                label='Final Risk Score'
                entitlement={props.entitlements['RiskScore']}
                hasError={props.ui.ValidationErrors['RiskScore']}
                id='risk-score'
                onChange={(e) => props.actions.handleRiskScoreChange(e.target.value)}
                required
                value={props.risk.RiskScore}
                inputClassName='col-md-3'
                labelClassName='col-md-6'
                hintClassName='col-md-3'
                hint={getLookup(props.risk.RiskScore, props.risk.ThreatLevels)}
              />
              <TextField
                label='Impact'
                entitlement={props.entitlements['Impact']}
                hasError={props.ui.ValidationErrors['Impact']}
                id='impact'
                onChange={(e) => props.actions.handleImpactChange(e.target.value)}
                required
                value={props.risk.Impact}
                inputClassName='col-md-3'
                labelClassName='col-md-6'
                hintClassName='col-md-3'
                hint={getLookup(props.risk.Impact, props.risk.ThreatLevels)}
              />
              <TextField
                label='Base Likelihood'
                entitlement={props.entitlements['Likelihood']}
                hasError={props.ui.ValidationErrors['Likelihood']}
                id='likelihood'
                onChange={(e) => props.actions.handleLikelihoodChange(e.target.value)}
                required
                value={props.risk.Likelihood}
                inputClassName='col-md-3'
                labelClassName='col-md-6'
                hintClassName='col-md-3'
                hint={getLookup(props.risk.Likelihood, props.risk.ThreatLevels)}
              />
              <TextField
                label='Inherent Risk'
                entitlement={props.entitlements['InherentRisk']}
                hasError={props.ui.ValidationErrors['InherentRisk']}
                id="inherent-risk"
                onChange={(e) => props.actions.handleInherentRiskChange(e.target.value)}
                required
                value={props.risk.InherentRisk}
                inputClassName='col-md-3'
                labelClassName='col-md-6'
                hintClassName='col-md-3'
                hint={getLookup(props.risk.InherentRisk, props.risk.ThreatLevels)}
              />
              <TextField
                label='Effectiveness'
                entitlement={props.entitlements['Effectiveness']}
                hasError={props.ui.ValidationErrors['Effectiveness']}
                id="effectiveness"
                onChange={(e) => props.actions.handleEffectivenessChange(e.target.value)}
                value={props.risk.Effectiveness}
                inputClassName='col-md-3'
                labelClassName='col-md-6'
                hintClassName='col-md-3'
                hint={getLookup(props.risk.Effectiveness, props.risk.EffectivenessLevels)}
              />
              <TextField
                label='Control Effectiveness'
                entitlement={props.entitlements['ControlEffectiveness']}
                hasError={props.ui.ValidationErrors['ControlEffectiveness']}
                id='control-effectiveness'
                onChange={(e) => props.actions.handleControlEffectivenessChange(e.target.value)}
                value={props.risk.ControlEffectiveness}
                inputClassName='col-md-3'
                labelClassName='col-md-6'
                hintClassName='col-md-3'
                hint={getLookup(props.risk.ControlEffectiveness, props.risk.EffectivenessLevels)}
              />
            </div>

            <div className="col-md-12">
              <TextareaField
                label='Description'
                entitlement={props.entitlements['Description']}
                hasError={props.ui.ValidationErrors['Description']}
                id='description'
                rows='4'
                onChange={(e) => props.actions.handleDescriptionChange(e.target.value)}
                value={props.risk.Description}
                inputClassName='col-md-8'
                labelClassName='col-md-3'
              />
              <TextareaField
                label='Recommendation'
                entitlement={props.entitlements['Recommendation']}
                hasError={props.ui.ValidationErrors['Recommendation']}
                id='recommendation'
                rows='4'
                onChange={(e) => props.actions.handleRecommendationChange(e.target.value)}
                value={props.risk.Recommendation}
                inputClassName='col-md-8'
                labelClassName='col-md-3'
              />
              <TextareaField
                label='References'
                entitlement={props.entitlements['References']}
                hasError={props.ui.ValidationErrors['References']}
                id='references'
                rows='6'
                onChange={(e) => props.actions.handleReferencesChange(e.target.value)}
                value={props.risk.References}
                inputClassName='col-md-8'
                labelClassName='col-md-3'
              />
            </div>
          </form>
          <div className="clearfix"></div>

          {
            props.risk.VulnerabilityList.length > 0 &&
            <div className="container-fluid">
              <hr />
              <div>
                <div id="total-vulnerability-count" className="pull-right">{props.risk.VulnerabilityList.length} total vulnerabilities</div>
                <h4>Vulnerabilities</h4>
              </div>
              <Table striped={true} condensed={true} className="outline">
                <thead>
                  <tr>
                    <SortableHeader
                      title="Title"
                      sort={props.risk.sort["Title"]}
                      entitlement={props.entitlementsVulnerability["Title"]}
                      onClick={() => props.actions.handleVulnerabilitiesSort("Title", stringComparator)}
                    />
                    <SortableHeader
                      title="Severity"
                      sort={props.risk.sort["CVSSScore"]}
                      entitlement={props.entitlementsVulnerability["CVSSScore"]}
                      onClick={() => props.actions.handleVulnerabilitiesSort("CVSSScore", numberComparator)}
                    />
                  </tr>
                  <tr>
                    <TextFilterHeader
                      entitlement={props.entitlementsVulnerability["Title"]}
                      onChange={(e) => props.actions.handleVulnerabilitiesFilter("Title", e.target.value, textFilter)}
                      value={props.risk.filters['Title'] ? props.risk.filters['Title'].value : ''}
                    />
                    <TextFilterHeader
                      entitlement={props.entitlementsVulnerability["CVSSScore"]}
                      onChange={(e) => props.actions.handleVulnerabilitiesFilter("Severity", e.target.value, textFilter)}
                      value={props.risk.filters['Severity'] ? props.risk.filters['Severity'].value : ''}
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
                            entitlement={props.entitlementsVulnerability["Title"]}
                            col={{ field: 'Title', getPath: () => routes.RISK_PAGE_BASE + routes.VULN_PAGE + '/' + props.engagementId + '/' + row.Id }}
                            iconClassName={"fa fa-circle " + (row.Severity ? row.Severity.replace(' ', '-') : "")}
                          />
                          <TextCell
                            item={row}
                            entitlement={props.entitlementsVulnerability["CVSSScore"]}
                            col={{ field: 'Severity' }}
                          />
                        </tr>
                      )
                    })
                  }
                </tbody>
              </Table>
              <Pager
                pageSize={props.risk.pageSize}
                totalRowCount={filteredSortedRows.length}
                currentPageIndex={props.risk.currentPageIndex}
                handlePageSize={(size) => props.actions.handleVulnerabilitiesPageSizeChange(size)}
                handlePageChange={(index) => props.actions.handleVulnerabilitiesPageIndexChange(index)}
              />
            </div>
          }
        </div>
        <div className="col-md-3 gutter">
          <div className="container-fluid">
            <h4>Assignments</h4>
            <form>
              <SelectField
                label='Remediation Status'
                entitlement={props.entitlements['RemediationStatusId']}
                hasError={props.ui.ValidationErrors['RemediationStatusId']}
                id='remediation-status'
                value={props.risk.RemediationStatusId || "1"}
                onChange={(e) => props.actions.handleRemediationStatusChange(e.target.value)}
              >
                {
                  props.risk.MitigationStatusList &&
                  props.risk.MitigationStatusList.map((option, index) => {
                    return (
                      <option key={index} value={option.ResourceId}>{option.ResourceName}</option>
                    )
                  })
                }
              </SelectField>

              <SelectResourceField
                resourceId={props.risk.ResourceId}
                groupId={props.risk.GroupId}
                resourceList={props.risk.ResourceList}
                groupList={props.risk.GroupList}
                entitlement={props.entitlements.RemediationResource}
                onChangeAction={props.actions.handleResourceAssignSave}
                hasError={props.ui.ValidationErrors.RemediationResource}
              />

              <DatepickerField
                id='target-remediation-date'
                label='Target Remediation Date'
                entitlement={props.entitlements['TargetRemediationDate']}
                hasError={props.ui.ValidationErrors['TargetRemediationDate']}
                visible={props.ui.showTargetRemediationDatePicker}
                value={props.risk.TargetRemediationDate}
                onChange={(e) => props.actions.handleTargetRemediationDateChange(e.target.value)}
                onClick={(e) => props.actions.handleTargetRemediationDateClick()}
                onSelected={(value) => props.actions.handleTargetRemediationDateSelected(value)}
                onClose={(e) => props.actions.handleTargetRemediationDateClose()}
                onBlur={(e) => props.actions.handleTargetRemediationDateBlur()}
              />

              <DatepickerField
                id='remediation-date'
                label='Remediated Date'
                entitlement={props.entitlements['MitigationDate']}
                hasError={props.ui.ValidationErrors['MitigationDate']}
                visible={props.ui.showRemediationDatePicker}
                value={props.risk.MitigationDate}
                maxDate={0}
                onChange={(e) => props.actions.handleMitigationDateChange(e.target.value)}
                onClick={(e) => props.actions.handleMitigationDateClick()}
                onSelected={(value) => props.actions.handleMitigationDateSelected(value)}
                onClose={(e) => props.actions.handleMitigationDateClose()}
                onBlur={(e) => props.actions.handleMitigationDateBlur()}
              />
            </form>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <br />
        <div className="pull-right">
          <button
            id="risk-save-button"
            className="btn btn-default"
            disabled={props.risk.IsFetching}
            onClick={(e) => props.actions.update(props.risk, props.history)}
          >
            Save Risk
          </button>
          <Link
            id="risk-cancel-button"
            to={routes.RISK_PAGE_BASE + routes.RISK_PAGE + '/' + props.engagementId}
            className="btn btn-alternate">
            Cancel
          </Link>
        </div>
        <div className="clearfix"></div>
      </div>
    </div>
  )
}

export default RiskDetail
