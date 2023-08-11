using System.Collections.Generic;

namespace NGRM.Domain.Model
{
    public class Host
    {
        public Host()
        {
            VulnerabilityList = new List<Vulnerability>();
        }

        public string Id { get; set; }

        public string EngagementId { get; set; }

        public string PhaseId { get; set; }

        public string Phase { get; set; }

        public string AssetGroupId { get; set; }

        public string ImportedDate { get; set; }

        public string ImportedBy { get; set; }

        public string Name { get; set; }

        public string IpAddress { get; set; }

        public string OperatingSystem { get; set; }

        public decimal? OsConfidence { get; set; }

        public string AverageSeverity { get; set; }

        public decimal? AverageSeverityValue { get; set; }

        public bool IsCritical { get; set; }

        public string AssetGroup { get; set; }

        public string Status { get; set; }

        public bool IsPartiallyRemediated { get; set; }

        public List<Vulnerability> VulnerabilityList { get; set; }
    }
}
