using System.Collections.Generic;
using NGRM.Domain.Lookups;

namespace NGRM.Domain.Model
{
    public class Risk
    {
        public Risk()
        {
            PhaseList = new List<Resource>();
            MitigationStatusList = new List<Resource>();
            VulnerabilityList = new List<Vulnerability>();
            ThreatLevels = ThreatLevel.List;
            EffectivenessLevels = EffectivenessLevel.List;
            RemediationStatusId = Lookups.MitigationStatus.NotMitigated.Value.ToString();
        }

        public string Id { get; set; }

        public string EngagementId { get; set; }

        public int? ResourceId { get; set; }

        public int? GroupId { get; set; }

        public string Name { get; set; }

        public string PhaseId { get; set; }

        public string ImportedDate { get; set; }

        public string ImportedBy { get; set; }

        public string Phase { get; set; }

        public string InherentRisk { get; set; }

        public string Likelihood { get; set; }

        public string Description { get; set; }

        public string Recommendation { get; set; }

        public string RemediationResource { get; set; }

        public string MitigationDate { get; set; }
        
        public string TargetRemediationDate { get; set; }

        public string AffectedSystemsCount { get; set; }

        public string PossibleAffectedSystemsCount { get; set; }

        public string Effectiveness { get; set; }

        public string ControlEffectiveness { get; set; }

        public string References { get; set; }

        public string Impact { get; set; }

        public string RiskScore { get; set; }

        public List<Resource> PhaseList { get; set; }

        public List<Resource> MitigationStatusList { get; set; }

        public List<Vulnerability> VulnerabilityList { get; set; }

        public string InherentSeverity { get; set; }

        public string ScoreSeverity { get; set; }

        public string ImpactSeverity { get; set; }

        public string LikelihoodSeverity { get; set; }

        public string RemediationStatus { get; set; }

        public string RemediationStatusId { get; set; }

        public List<ThreatLevel> ThreatLevels { get; set; }

        public List<EffectivenessLevel> EffectivenessLevels { get; set; }

        public List<Resource> ResourceList { get; set; }

        public List<Resource> GroupList { get; set; }
    }
}
