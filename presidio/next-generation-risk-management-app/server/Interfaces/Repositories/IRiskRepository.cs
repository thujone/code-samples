using System.Collections.Generic;
using NGRM.Domain.Entities;

namespace NGRM.Domain.Interfaces.Repositories
{
    public interface IRiskRepository : IDataRepository<RiskEntity, int>
    {
        IEnumerable<RiskEntity> GetByEngagementId(int engagementId);

        IEnumerable<RiskEntity> GetByCustomerId(int customerId);

        IEnumerable<RiskEntity> GetExportData(int engagementId);
    }
}