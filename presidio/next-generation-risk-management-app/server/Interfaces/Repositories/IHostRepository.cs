using System.Collections.Generic;
using NGRM.Domain.Entities;

namespace NGRM.Domain.Interfaces.Repositories
{
    public interface IHostRepository : IDataRepository<HostEntity, int>
    {
        IEnumerable<HostEntity> GetByEngagementId(int engagementId);

        IEnumerable<HostEntity> GetByPhaseId(int phaseId);

        IEnumerable<HostEntity> GetByVulnerabilityId(int vulnerabilityId);

        IEnumerable<HostEntity> GetByAssetGroupId(int assetGroupId);
    }
}