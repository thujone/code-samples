using System;
using System.Linq;
using NGRM.Domain.Entities;
using NGRM.Domain.Interfaces.Mappers;
using NGRM.Domain.Interfaces.Services;
using NGRM.Domain.Lookups;
using NGRM.Domain.Model;

namespace NGRM.Domain.Mappers
{
    public class HostMapper : Mapper<Host, HostEntity>, IHostMapper
    {
        public HostMapper(ICryptographyService cryptographyService) : base(cryptographyService)
        {
        }

        protected override void MapToModel(HostEntity source, Host destination)
        {
            destination.Id = source.Id.ToString();
            destination.EngagementId = source.EngagementId.ToString();
            destination.Phase = source.Phase?.Name ?? "Unknown";
            destination.PhaseId = source.PhaseId.ToString();
            destination.Name = Decrypt<string>(source.NameBytes);
            destination.IpAddress = Decrypt<string>(source.IPAddressBytes);
            destination.OperatingSystem = Decrypt<string>(source.OperatingSystemBytes);
            destination.OsConfidence = source.OSConfidence;
            destination.ImportedBy = source.ImportedBy;
            destination.ImportedDate = source.ImportedDate?.ToString("M/d/yyyy") ?? string.Empty;
            destination.AssetGroupId = source.AssetGroupId?.ToString();
            destination.AssetGroup = source.AssetGroup?.Name ?? string.Empty;
            destination.IsCritical = source.IsCritical;
            destination.Status = source.Status;

            var averageSeverity = source.HostVulnerabilities.Any() ? source.HostVulnerabilities?.Average(c => c.Vulnerability.CvssScore) : null;
            destination.AverageSeverityValue = averageSeverity;
            destination.AverageSeverity = ThreatLevel.LookupByValue(averageSeverity).Name;
        }

        protected override void MapToEntity(Host source, HostEntity destination)
        {
            destination.Id = Convert.ToInt32(source.Id);
            destination.EngagementId = Convert.ToInt32(source.EngagementId);
            destination.PhaseId = string.IsNullOrWhiteSpace(source.PhaseId) ? (int?)null : Convert.ToInt32(source.PhaseId);
            destination.AssetGroupId = string.IsNullOrWhiteSpace(source.AssetGroupId) ? (int?)null : Convert.ToInt32(source.AssetGroupId);
            destination.NameBytes = Encrypt(source.Name);
            destination.IPAddressBytes = Encrypt(source.IpAddress);
            destination.OperatingSystemBytes = Encrypt(source.OperatingSystem);
            destination.OSConfidence = source.OsConfidence;
            destination.IsCritical = source.IsCritical;
            destination.Status = string.IsNullOrWhiteSpace(source.Status) ? "Active" : source.Status;
        }
    }
}
