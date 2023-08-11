using System.Collections.Generic;
using NGRM.Domain.Model;

namespace NGRM.Domain.Interfaces.Services
{
    public interface IRiskService
    {
        IEnumerable<Risk> GetRisks(int engagementId);

        Risk Get(int riskId);

        void Add(Risk risk);

        void Update(Risk risk);

        void Remove(int riskId);

        IEnumerable<Risk> GetExportData(int engagementId);
    }
}