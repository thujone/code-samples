using System;
using NGRM.Domain.Entities;
using NGRM.Domain.Interfaces.Mappers;
using NGRM.Domain.Model;
using NGRM.Domain.Interfaces.Services;
using NGRM.Domain.Lookups;

namespace NGRM.Domain.Mappers
{
    public class RiskMapper : Mapper<Risk, RiskEntity>, IRiskMapper
    {
        public RiskMapper(ICryptographyService cryptographyService) : base(cryptographyService)
        {
        }

        protected override void MapToModel(RiskEntity source, Risk destination)
        {
            destination.Id = source.Id.ToString();
            destination.EngagementId = source.EngagementId.ToString();
            destination.Phase = source.Phase?.Name ?? "Unknown";
            destination.PhaseId = source.PhaseId.ToString();
            destination.ResourceId = source.ResourceId;
            destination.GroupId = source.GroupId;
            destination.RemediationStatus = MitigationStatus.LookupByValue(source.RemediationStatusId.GetValueOrDefault())?.Name;
            destination.RemediationStatusId = source.RemediationStatusId.ToString();
            destination.Name = Decrypt<string>(source.NameBytes);
            destination.Description = Decrypt<string>(source.DescriptionBytes);
            destination.InherentRisk = source.InheritScore?.ToString("N1");
            destination.InherentSeverity = ThreatLevel.LookupByValue(source.InheritScore).Name;
            destination.Likelihood = source.Likelihood?.ToString("N1");
            destination.LikelihoodSeverity = ThreatLevel.LookupByValue(source.Likelihood).Name;
            destination.Recommendation = Decrypt<string>(source.RecommendationBytes);
            destination.RemediationResource = GetRemediationResource(source);
            destination.MitigationDate = source.MitigatedDate?.ToString("M/d/yyyy");
            destination.TargetRemediationDate = source.TargetRemediationDate?.ToString("M/d/yyyy");
            destination.AffectedSystemsCount = source.AffectedSystems?.ToString();
            destination.PossibleAffectedSystemsCount = source.PossibleAffectedSystems?.ToString();
            destination.Effectiveness = source.Effectiveness?.ToString("N1");
            destination.ControlEffectiveness = source.ControlEffectiveness?.ToString("N1");
            destination.Impact = source.Impact?.ToString("N1");
            destination.ImpactSeverity = ThreatLevel.LookupByValue(source.Impact).Name;
            destination.References = Decrypt<string>(source.ReferencesBytes);
            destination.RiskScore = source.FinalScore?.ToString("N1");
            destination.ScoreSeverity = ThreatLevel.LookupByValue(source.FinalScore).Name;
        }

        protected override void MapToEntity(Risk source, RiskEntity destination)
        {
            destination.PhaseId = Convert.ToInt32(source.PhaseId);
            destination.EngagementId = Convert.ToInt32(source.EngagementId);
            destination.RemediationStatusId = string.IsNullOrWhiteSpace(source.RemediationStatusId) ? (int?)null : Convert.ToInt32(source.RemediationStatusId);
            destination.ResourceId = source.ResourceId;
            destination.GroupId = source.GroupId;
            destination.NameBytes = Encrypt(source.Name);
            destination.DescriptionBytes = Encrypt(source.Description);
            destination.RecommendationBytes = Encrypt(source.Recommendation);
            destination.ReferencesBytes = Encrypt(source.References);
            destination.MitigatedDate = string.IsNullOrWhiteSpace(source.MitigationDate) ? (DateTime?)null : Convert.ToDateTime(source.MitigationDate);
            destination.TargetRemediationDate = string.IsNullOrWhiteSpace(source.TargetRemediationDate) ? (DateTime?)null : Convert.ToDateTime(source.TargetRemediationDate);
            destination.InheritScore = string.IsNullOrWhiteSpace(source.InherentRisk) ? (decimal?)null : Convert.ToDecimal(source.InherentRisk);
            destination.Likelihood = string.IsNullOrWhiteSpace(source.Likelihood) ? (decimal?)null : Convert.ToDecimal(source.Likelihood);
            destination.AffectedSystems = string.IsNullOrWhiteSpace(source.AffectedSystemsCount) ? (int?)null : Convert.ToInt32(source.AffectedSystemsCount);
            destination.PossibleAffectedSystems = string.IsNullOrWhiteSpace(source.PossibleAffectedSystemsCount) ? (int?)null : Convert.ToInt32(source.PossibleAffectedSystemsCount);
            destination.ReferencesBytes = Encrypt(source.References);
            destination.Effectiveness = string.IsNullOrWhiteSpace(source.Effectiveness) ? (decimal?)null : Convert.ToDecimal(source.Effectiveness);
            destination.ControlEffectiveness = string.IsNullOrWhiteSpace(source.ControlEffectiveness) ? (decimal?)null : Convert.ToDecimal(source.ControlEffectiveness);
            destination.Impact = string.IsNullOrWhiteSpace(source.Impact) ? (decimal?)null : Convert.ToDecimal(source.Impact);
            destination.FinalScore = string.IsNullOrWhiteSpace(source.RiskScore) ? (decimal?)null : Convert.ToDecimal(source.RiskScore);
        }

        private string GetRemediationResource(RiskEntity source)
        {
            if (source.Resource != null)
                return source.Resource.Name;
            if (source.Group != null)
                return source.Group.Name;
            return string.Empty;
        }
    }
}
