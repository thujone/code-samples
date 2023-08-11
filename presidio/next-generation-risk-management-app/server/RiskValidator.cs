using System;
using System.Linq;
using System.Text.RegularExpressions;
using NGRM.Domain.Extensions;
using NGRM.Domain.Interfaces.Validators;
using NGRM.Domain.Model;
using NGRM.Domain.Utils;
using FluentValidation;

namespace NGRM.Domain.Validators
{
    public class RiskValidator : AbstractValidator<Risk>, IRiskValidator
    {
        public RiskValidator()
        {
            RuleFor(risk => risk.PhaseId)
                .NotEmpty()
                .WithName("Engagement Phase");

            RuleFor(risk => risk.Name)
                .NotEmpty()
                .Length(0, 500)
                .WithName("Title");

            RuleFor(risk => risk.Description)
                .Length(0, 3000);

            RuleFor(risk => risk.Recommendation)
                .Length(0, 3000);

            RuleFor(risk => risk.MitigationDate)
                .Date()
                .WithName("Remediation Date");

            RuleFor(risk => risk.InherentRisk)
                .NotEmpty()
                .Decimal(0, 10);

            RuleFor(risk => risk.RiskScore)
                .NotEmpty()
                .Decimal(0, 10)
                .WithName("Final Risk Score");

            RuleFor(risk => risk.Likelihood)
                .NotEmpty()
                .Decimal(0, 10)
                .WithName("Base Likelihood");

            RuleFor(risk => risk.Impact)
                .NotEmpty()
                .Decimal(0, 10);

            RuleFor(risk => risk.AffectedSystemsCount)
                .Number()
                .WithName("Affected Systems");

            RuleFor(risk => risk.PossibleAffectedSystemsCount)
                .Number()
                .WithName("Possible Affected Systems");

            RuleFor(risk => risk.Effectiveness)
                .Decimal(0, 10);

            RuleFor(risk => risk.ControlEffectiveness)
                .Decimal(0, 10);

            RuleFor(risk => risk.References)
                .Length(0, 500);

            RuleFor(risk => risk.RemediationStatusId)
               .NotEmpty()
               .WithName("Remediation Status");
        }
    }
}
