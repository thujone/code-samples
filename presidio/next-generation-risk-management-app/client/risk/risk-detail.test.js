import React from 'react'
import { shallow } from 'enzyme'
import { Link } from 'react-router-dom'
import Asterisk from '../components/validation/asterisk'
import ValidationSummary from '../components/validation/validation-summary'
import Datepicker from '../components/datepicker/datepicker'
import {
  TextField,
  TextareaField,
  SelectField,
  SelectResourceField,
  DatepickerField,
  ResourceAssignField
} from '../components/field'
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
import RiskDetail from './risk-detail'
import * as helpers from './risk-detail-helper'
import * as routes from '../constants/routes'

describe("Risk Detail", () => {
  let props

  beforeEach(() => {
    props = {
      history: [],
      engagementId: "engagementId",
      entitlements: {},
      risk:{
        currentPageIndex: 0,
        pageSize: 10,
        sort: {},
        filters: {},
        Name: "name",
        PhaseId: "phaseId",
        PhaseList: [],
        InherentRisk: "inherentRisk",
        ThreatLevels: [{Name: "threatLevelName", Color: "threatLevelColor"}],
        EffectivenessLevels: [{Name: "effectivenessLevelName", Color: "effectivenessLevelColor"}],
        Likelihood: "likelihood",
        MitigationStatusId: "mitigationStatusId",
        MitigationStatusList: [],
        Impact: "impact",
        RiskScore: "riskScore",
        Recommendation: "recommendation",
        Description: "description",
        References: "references",
        Effectiveness: "1",
        ControlEffectiveness: "0",
        AffectedSystemsCount: "affectedSystems",
        PossibleAffectedSystemsCount: "possibleAffectedSystems",
        RemediationStatusId: "remediationStatusId",
        MitigationDate: "mitigationDate",
        VulnerabilityList: [],
        ResourceId: "resourceId",
        ResourceList: [],
        GroupId: "groupId",
        GroupList: [],
      },
      ui: {
        ValidationErrors: {},
        showRemediationDatePicker: false
      },
      actions: {
        update: jest.fn(),
        handleNameChange: jest.fn(),
        handlePhaseChange: jest.fn(),
        handleInherentRiskChange: jest.fn(),
        handleLikelihoodChange: jest.fn(),
        handleMitigationStatusChange: jest.fn(),
        handleImpactChange: jest.fn(),
        handleRiskScoreChange: jest.fn(),
        handleRecommendationChange: jest.fn(),
        handleDescriptionChange: jest.fn(),
        handleReferencesChange: jest.fn(),
        handleEffectivenessChange: jest.fn(),
        handleControlEffectivenessChange: jest.fn(),
        handleAffectedSystemsChange: jest.fn(),
        handlePossibleAffectedSystemsChange: jest.fn(),
        handleRemediationStatusChange: jest.fn(),
        handleMitigationDateChange: jest.fn(),
        handleMitigationDateSelected: jest.fn(),
        handleMitigationDateClick: jest.fn(),
        handleMitigationDateClose: jest.fn(),
        handleResourceAssignSave: jest.fn(),
        handleVulnerabilitiesSort: jest.fn(),
        handleVulnerabilitiesFilter: jest.fn(),
        handleVulnerabilitiesPageSizeChange: jest.fn(),
        handleVulnerabilitiesPageIndexChange: jest.fn(),
        onResourceChange: jest.fn()
      }
    }
  })

  it("should render validation summary", () => {
    let subject = shallow(<RiskDetail {...props} />)
    let validationSummary = subject.find(ValidationSummary)
    expect(validationSummary.props().id).toEqual("risk-validation-summary")
    expect(validationSummary.props().validationErrors).toEqual(props.ui.ValidationErrors)
  })

  it("should render Title text field", () => {
    props.entitlements['Name'] = 1
    props.ui.ValidationErrors['Name'] = {name:'errors'}

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Title")
    expect(field.props().id).toEqual("name-risk")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().required).toEqual(true)
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("name")
    expect(field.props().inputClassName).toEqual("col-md-6")
  })

  it("should handle Title on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Title")
    field.props().onChange(event)
    expect(props.actions.handleNameChange).toHaveBeenCalledWith("Value")
  })

  it("should render Final Risk Score text field", () => {
    props.entitlements['RiskScore'] = 1
    props.ui.ValidationErrors['RiskScore'] = {name:'errors'}
    helpers.getLookup = jest.fn(() => ({Name:"severity",Color:"color"}))

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Final Risk Score")
    expect(field.props().id).toEqual("risk-score")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().required).toEqual(true)
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("riskScore")
    expect(field.props().inputClassName).toEqual("col-md-3")
    expect(field.props().hintClassName).toEqual("col-md-3")
    expect(field.props().hint.Name).toEqual("severity")
  })

  it("should handle Final Risk Score on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Final Risk Score")
    field.props().onChange(event)
    expect(props.actions.handleRiskScoreChange).toHaveBeenCalledWith("Value")
  })

  it("should render Phase select field", () => {
    props.entitlements['PhaseId'] = 1
    props.ui.ValidationErrors['PhaseId'] = {name:'errors'}
    props.risk.PhaseList = [
      { ResourceId: "resourceId", ResourceName: "resourceName" }
    ]

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Engagement Phase")
    expect(field.props().id).toEqual("phase")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().required).toEqual(true)
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("phaseId")
    expect(field.props().inputClassName).toEqual("col-md-6")

    let options = field.find('option')
    expect(options.at(0).props().value).toEqual("")
    expect(options.at(0).text()).toEqual("Select")
    expect(options.at(1).props().value).toEqual("resourceId")
    expect(options.at(1).text()).toEqual("resourceName")
  })

  it("should handle Phase on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Engagement Phase")
    field.props().onChange(event)
    expect(props.actions.handlePhaseChange).toHaveBeenCalledWith("Value")
  })

  it("should render Inherent Risk text field", () => {
    props.entitlements['InherentRisk'] = 1
    props.ui.ValidationErrors['InherentRisk'] = {name:'errors'}
    helpers.getLookup = jest.fn(() => ({Name:"severity",Color:"color"}))

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Inherent Risk")
    expect(field.props().id).toEqual("inherent-risk")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().required).toEqual(true)
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("inherentRisk")
    expect(field.props().inputClassName).toEqual("col-md-3")
    expect(field.props().hintClassName).toEqual("col-md-3")
    expect(field.props().hint.Name).toEqual("severity")
  })

  it("should handle Inherent Risk on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Inherent Risk")
    field.props().onChange(event)
    expect(props.actions.handleInherentRiskChange).toHaveBeenCalledWith("Value")
  })

  it("should render Base Likelihood text field", () => {
    props.entitlements['Likelihood'] = 1
    props.ui.ValidationErrors['Likelihood'] = {name:'errors'}
    helpers.getLookup = jest.fn(() => ({Name:"severity",Color:"color"}))

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Base Likelihood")
    expect(field.props().id).toEqual("likelihood")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().required).toEqual(true)
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("likelihood")
    expect(field.props().inputClassName).toEqual("col-md-3")
    expect(field.props().hintClassName).toEqual("col-md-3")
    expect(field.props().hint.Name).toEqual("severity")
  })

  it("should handle Base Likelihood on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Base Likelihood")
    field.props().onChange(event)
    expect(props.actions.handleLikelihoodChange).toHaveBeenCalledWith("Value")
  })

  it("should render Mitigation Status select field", () => {
    props.entitlements['MitigationStatusId'] = 1
    props.ui.ValidationErrors['MitigationStatusId'] = {name:'errors'}
    props.risk.MitigationStatusList = [
      { ResourceId: "resourceId", ResourceName: "resourceName" }
    ]

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Mitigation Status")
    expect(field.props().id).toEqual("mitigation-status")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().required).toEqual(true)
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("mitigationStatusId")
    expect(field.props().inputClassName).toEqual("col-md-6")

    let options = field.find('option')
    expect(options.at(0).props().value).toEqual("")
    expect(options.at(0).text()).toEqual("Select")
    expect(options.at(1).props().value).toEqual("resourceId")
    expect(options.at(1).text()).toEqual("resourceName")
  })

  it("should handle Mitigation Status on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Mitigation Status")
    field.props().onChange(event)
    expect(props.actions.handleMitigationStatusChange).toHaveBeenCalledWith("Value")
  })

  it("should render Impact text field", () => {
    props.entitlements['Impact'] = 1
    props.ui.ValidationErrors['Impact'] = {name:'errors'}
    helpers.getLookup = jest.fn(() => ({Name:"severity",Color:"color"}))

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Impact")
    expect(field.props().id).toEqual("impact")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().required).toEqual(true)
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("impact")
    expect(field.props().inputClassName).toEqual("col-md-3")
    expect(field.props().hintClassName).toEqual("col-md-3")
    expect(field.props().hint.Name).toEqual("severity")
  })

  it("should handle Impact on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Impact")
    field.props().onChange(event)
    expect(props.actions.handleImpactChange).toHaveBeenCalledWith("Value")
  })

  it("should render Description textarea field", () => {
    props.entitlements['Description'] = 1
    props.ui.ValidationErrors['Description'] = {name:'errors'}

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Description")
    expect(field.props().id).toEqual("description")
    expect(field.props().labelClassName).toEqual("col-md-3")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("description")
    expect(field.props().inputClassName).toEqual("col-md-8")
    expect(field.props().rows).toEqual("4")
  })

  it("should handle Description on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Description")
    field.props().onChange(event)
    expect(props.actions.handleDescriptionChange).toHaveBeenCalledWith("Value")
  })

  it("should render Recommendation textarea field", () => {
    props.entitlements['Recommendation'] = 1
    props.ui.ValidationErrors['Recommendation'] = {name:'errors'}

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Recommendation")
    expect(field.props().id).toEqual("recommendation")
    expect(field.props().labelClassName).toEqual("col-md-3")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("recommendation")
    expect(field.props().inputClassName).toEqual("col-md-8")
    expect(field.props().rows).toEqual("4")
  })

  it("should handle Recommendation on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Recommendation")
    field.props().onChange(event)
    expect(props.actions.handleRecommendationChange).toHaveBeenCalledWith("Value")
  })

  it("should render References textarea field", () => {
    props.entitlements['References'] = 1
    props.ui.ValidationErrors['References'] = {name:'errors'}

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "References")
    expect(field.props().id).toEqual("references")
    expect(field.props().labelClassName).toEqual("col-md-3")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("references")
    expect(field.props().inputClassName).toEqual("col-md-8")
    expect(field.props().rows).toEqual("6")
  })

  it("should handle References on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "References")
    field.props().onChange(event)
    expect(props.actions.handleReferencesChange).toHaveBeenCalledWith("Value")
  })

  it("should render Effectiveness text field", () => {
    props.entitlements['Effectiveness'] = 1
    props.ui.ValidationErrors['Effectiveness'] = {name:'errors'}
    helpers.getLookup = jest.fn(() => ({Name:"effectiveness",Color:"color"}))

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Effectiveness")
    expect(field.props().id).toEqual("effectiveness")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("1")
    expect(field.props().inputClassName).toEqual("col-md-3")
    expect(field.props().hintClassName).toEqual("col-md-3")
    expect(field.props().hint.Name).toEqual("effectiveness")
  })

  it("should handle Effectiveness on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Effectiveness")
    field.props().onChange(event)
    expect(props.actions.handleEffectivenessChange).toHaveBeenCalledWith("Value")
  })

  it("should render Control Effectiveness text field", () => {
    props.entitlements['ControlEffectiveness'] = 1
    props.ui.ValidationErrors['ControlEffectiveness'] = {name:'errors'}
    helpers.getLookup = jest.fn(() => ({Name:"effectiveness",Color:"color"}))

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Control Effectiveness")
    expect(field.props().id).toEqual("control-effectiveness")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("0")
    expect(field.props().inputClassName).toEqual("col-md-3")
    expect(field.props().hintClassName).toEqual("col-md-3")
    expect(field.props().hint.Name).toEqual("effectiveness")
  })

  it("should handle Control Effectiveness on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Control Effectiveness")
    field.props().onChange(event)
    expect(props.actions.handleControlEffectivenessChange).toHaveBeenCalledWith("Value")
  })

  it("should render Affected Systems text field", () => {
    props.entitlements['AffectedSystemsCount'] = 1
    props.ui.ValidationErrors['AffectedSystemsCount'] = {name:'errors'}

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Affected Systems")
    expect(field.props().id).toEqual("affected-systems")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("affectedSystems")
    expect(field.props().inputClassName).toEqual("col-md-3")
  })

  it("should handle Affected Systems on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Affected Systems")
    field.props().onChange(event)
    expect(props.actions.handleAffectedSystemsChange).toHaveBeenCalledWith("Value")
  })

  it("should render Possible Affected Systems text field", () => {
    props.entitlements['PossibleAffectedSystemsCount'] = 1
    props.ui.ValidationErrors['PossibleAffectedSystemsCount'] = {name:'errors'}

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Possible Affected Systems")
    expect(field.props().id).toEqual("possible-affected-systems")
    expect(field.props().labelClassName).toEqual("col-md-6")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("possibleAffectedSystems")
    expect(field.props().inputClassName).toEqual("col-md-3")
  })

  it("should handle Possible Affected Systems on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Possible Affected Systems")
    field.props().onChange(event)
    expect(props.actions.handlePossibleAffectedSystemsChange).toHaveBeenCalledWith("Value")
  })

  it("should render Remediation Status select field", () => {
    props.entitlements['RemediationStatusId'] = 1
    props.ui.ValidationErrors['RemediationStatusId'] = {name:'errors'}
    props.risk.MitigationStatusList = [
      { ResourceId: "resourceId", ResourceName: "resourceName" }
    ]

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Remediation Status")
    expect(field.props().id).toEqual("remediation-status")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("remediationStatusId")

    let options = field.find('option')
    expect(options.at(0).props().value).toEqual("")
    expect(options.at(0).text()).toEqual("Select")
    expect(options.at(1).props().value).toEqual("resourceId")
    expect(options.at(1).text()).toEqual("resourceName")
  })

  it("should handle Remediation Status on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Remediation Status")
    field.props().onChange(event)
    expect(props.actions.handleRemediationStatusChange).toHaveBeenCalledWith("Value")
  })

  it("should render Remediation Date datepicker field", () => {
    props.entitlements['MitigationDate'] = 1
    props.ui.ValidationErrors['MitigationDate'] = {name:'errors'}
    props.ui.showRemediationDatePicker = true

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Remediation Date")
    expect(field.props().id).toEqual("remediation-date")
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().value).toEqual("mitigationDate")
    expect(field.props().visible).toEqual(true)
  })

  it("should handle Remediation Date on change", () => {
    let event = {
      target: {
        value: "Value"
      }
    }

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Remediation Date")
    field.props().onChange(event)
    expect(props.actions.handleMitigationDateChange).toHaveBeenCalledWith("Value")
  })

  it("should handle Remediation Date on selected", () => {
    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Remediation Date")
    field.props().onSelected("Value")
    expect(props.actions.handleMitigationDateSelected).toHaveBeenCalledWith("Value")
  })

  it("should handle Remediation Date on click", () => {
    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Remediation Date")
    field.props().onClick()
    expect(props.actions.handleMitigationDateClick).toHaveBeenCalled()
  })

  it("should handle Remediation Date on close", () => {
    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.findWhere(f => f.props().label === "Remediation Date")
    field.props().onClose()
    expect(props.actions.handleMitigationDateClose).toHaveBeenCalled()
  })

  it("should render Remediation Resource select field", () => {
    props.entitlements['RemediationResource'] = 1
    props.ui.ValidationErrors['RemediationResource'] = {name:'errors'}
    props.risk.ResourceId = 'resourceId'
    props.risk.GroupId = 'groupId'
    props.risk.ResourceList = ['resourceList']
    props.risk.GroupList = ['groupList']
    props.actions.handleResourceAssignSave = jest.fn().mockReturnValue('onResourceChange')

    let subject = shallow(<RiskDetail {...props} />)
    let field = subject.find(SelectResourceField)
    expect(field.props().entitlement).toEqual(1)
    expect(field.props().hasError).toBeTruthy()
    expect(field.props().groupId).toEqual('groupId')
    expect(field.props().groupList[0]).toEqual('groupList')
    expect(field.props().resourceId).toEqual('resourceId')
    expect(field.props().resourceList[0]).toEqual('resourceList')
    expect(field.props().onChangeAction()).toEqual('onResourceChange')
  })

  it('should render total vulnerabilities count', () => {
    props.entitlementsVulnerability = { Title: 0, CVSSScore: 0 }
    props.risk.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<RiskDetail {...props} />)
    let element = subject.find('#total-vulnerability-count')
    expect(element.text()).toEqual('1 total vulnerabilities')
  })

  it('should pass titles to column headers', () => {
    props.entitlementsVulnerability = { Title: 0, CVSSScore: 0 }
    props.risk.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<RiskDetail {...props} />)
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
    props.entitlementsVulnerability = { Title: 0, CVSSScore: 0 }
    props.risk.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]
    props.risk.sort = {
      Title: { direction: 'desc', comparator: () => 0 },
      CVSSScore: { direction: 'desc', comparator: () => 0 },
    }

    let subject = shallow(<RiskDetail {...props} />)
    let headers = subject.find(SortableHeader)
    headers.forEach(header => {
      expect(header.props().sort.direction).toEqual('desc')
    })
  })

  it('should pass sort handleVulnerabilitiesSort to sort headers', () => {
    props.entitlementsVulnerability = { Title: 0, CVSSScore: 0 }
    props.risk.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<RiskDetail {...props} />)
    let headers = subject.find(SortableHeader)
    headers.forEach(header => {
      header.props().onClick()
    })
    expect(props.actions.handleVulnerabilitiesSort).toHaveBeenCalledTimes(2)
  })

  it('should pass handleVulnerabilitiesFilter to filter headers', () => {
    props.entitlementsVulnerability = { Title: 0, CVSSScore: 0 }
    props.risk.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<RiskDetail {...props} />)
    let headers = subject.find(TextFilterHeader)
    headers.forEach(header => {
      header.props().onChange({ target: { value: 1 } })
    })
    expect(props.actions.handleVulnerabilitiesFilter).toHaveBeenCalledTimes(2)
  })

  it('should render tbody Row', () => {
    props.entitlementsVulnerability = { Title: 0, CVSSScore: 0 }
    props.risk.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<RiskDetail {...props} />)
    expect(subject.find(IconLinkCell).props().item).toEqual(props.risk.VulnerabilityList[0])
    expect(subject.find(IconLinkCell).props().col.getPath()).toEqual(routes.RISK_PAGE_BASE + routes.VULN_PAGE + "/engagementId/id")
    const textCells = subject.find(TextCell)
    expect(subject.find(TextCell).props().col.field).toEqual("Severity")
  })

  it('should render a Pager component, passing required props along', () => {
    props.entitlementsVulnerability = { Title: 0, CVSSScore: 0 }
    props.risk.VulnerabilityList = [
      { Id: 'id', Title: 'title', Severity: 'severity', CVSSScore: 'cvssScore' }
    ]

    let subject = shallow(<RiskDetail {...props} />)
    expect(subject.find(Pager).props().pageSize).toEqual(10)
    expect(subject.find(Pager).props().totalRowCount).toEqual(props.risk.VulnerabilityList.length)
    expect(subject.find(Pager).props().currentPageIndex).toEqual(0)
    expect(subject.find(Pager).props().handlePageSize).toBeInstanceOf(Function)
    expect(subject.find(Pager).props().handlePageChange).toBeInstanceOf(Function)
  })

  it("should render save button", () => {
    let subject = shallow(<RiskDetail {...props} />)
    let saveButton = subject.find("#risk-save-button")
    expect(saveButton.props().className).toEqual("btn btn-default")
  })

  it("should handle save button on click", () => {
    let subject = shallow(<RiskDetail {...props} />)
    subject.find("#risk-save-button").simulate("click")
    expect(props.actions.update).toHaveBeenCalledWith(props.risk, props.history)
  })

  it('should render Cancel button', () => {
    let subject = shallow(<RiskDetail {...props} />)
    let link = subject.find(Link)
    expect(link.props().id).toEqual("risk-cancel-button")
    expect(link.props().to).toEqual(routes.RISK_PAGE_BASE + routes.RISK_PAGE + '/engagementId')
    expect(link.props().className).toEqual("btn btn-alternate")
  })
})
