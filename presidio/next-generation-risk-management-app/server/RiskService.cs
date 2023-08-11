using System;
using System.Collections.Generic;
using System.Linq;
using NGRM.Domain.Entities;
using NGRM.Domain.Interfaces.Mappers;
using NGRM.Domain.Interfaces.Repositories;
using NGRM.Domain.Interfaces.Services;
using NGRM.Domain.Model;
using NGRM.Domain.Utils;

namespace NGRM.Domain.Services
{
    public class RiskService : IRiskService
    {
        private readonly IRiskMapper _riskMapper;
        private readonly IVulnerabilityMapper _vulnerabilityMapper;
        private readonly IRiskRepository _riskRepository;
        private readonly IRiskVulnerabilityRepository _riskVulnerabilityRepository;

        public RiskService(IRiskRepository riskRepository, IRiskVulnerabilityRepository riskVulnerabilityRepository, IRiskMapper riskMapper, IVulnerabilityMapper vulnerabilityMapper)
        {
            _riskMapper = riskMapper;
            _vulnerabilityMapper = vulnerabilityMapper;
            _riskRepository = riskRepository;
            _riskVulnerabilityRepository = riskVulnerabilityRepository;
        }

        public IEnumerable<Risk> GetRisks(int engagementId)
        {
            var riskEntities = _riskRepository.GetByEngagementId(engagementId).ToList();
            var riskList = new List<Risk>();
            foreach (var riskEntity in riskEntities)
            {
                var risk = _riskMapper.Map(riskEntity);
                MapVulnerabilityList(riskEntity, risk);
                riskList.Add(risk);
            }
            return riskList;
        }

        public Risk Get(int riskId)
        {
            Guard.ForLessOrEqualZero(riskId, "riskId");
            Risk risk = null;

            var riskEntity = _riskRepository.Get(riskId);
            if (riskEntity != null)
            {
                risk = _riskMapper.Map(riskEntity);
                MapVulnerabilityList(riskEntity, risk);
            }

            return risk;
        }

        public void Add(Risk risk)
        {
            Guard.ForArgumentIsNull(risk, "risk");

            var riskEntity = _riskMapper.Map(risk);
            MapRiskVulnerabilityEntityList(risk, riskEntity);
            _riskRepository.Add(riskEntity);

            _riskRepository.Save();
        }

        public void Update(Risk risk)
        {
            Guard.ForArgumentIsNull(risk, "risk");

            var riskId = Convert.ToInt32(risk.Id);
            Guard.ForLessOrEqualZero(riskId, "risk.Id");

            var riskEntity = _riskRepository.Get(riskId);
            _riskMapper.Map(risk, riskEntity);
            MapRiskVulnerabilityEntityList(risk, riskEntity);

            _riskRepository.Save();
        }

        public void Remove(int riskId)
        {
            Guard.ForLessOrEqualZero(riskId, "riskId");

            var associatedVulnerabilities = _riskVulnerabilityRepository.Get().Where(x => x.RiskId == riskId);
            _riskVulnerabilityRepository.RemoveRange(associatedVulnerabilities);
            _riskRepository.Remove(riskId);

            _riskRepository.Save();
        }

        public IEnumerable<Risk> GetExportData(int engagementId)
        {
            var riskEntities = _riskRepository.GetExportData(engagementId).ToList();
            var risks = new List<Risk>();
            foreach (var riskEntity in riskEntities)
            {
                var risk = _riskMapper.Map(riskEntity);
                MapVulnerabilityList(riskEntity, risk);
                risks.Add(risk);
            }
            return risks;
        }

        private void MapVulnerabilityList(RiskEntity source, Risk destination)
        {
            foreach (var sourceRiskVulnerability in source.RiskVulnerabilities)
            {
                var vulnerability = _vulnerabilityMapper.Map(sourceRiskVulnerability.Vulnerability);
                destination.VulnerabilityList.Add(vulnerability);
            }
        }

        private void MapRiskVulnerabilityEntityList(Risk source, RiskEntity destination)
        {
            var destinationRiskVulnerabilities = destination.RiskVulnerabilities.ToList();

            //associations to remove
            foreach (var destinationRiskVulnerability in destinationRiskVulnerabilities)
            {
                if (!source.VulnerabilityList.Exists(v => Convert.ToInt32(v.Id) == destinationRiskVulnerability.VulnerabilityId))
                    _riskVulnerabilityRepository.Remove(destinationRiskVulnerability);
            }

            //associations to add
            foreach (var vulnerability in source.VulnerabilityList)
            {
                var vulnerabilityId = Convert.ToInt32(vulnerability.Id);
                var existingVulnerabilityAssociations = _riskVulnerabilityRepository.Get()
                    .Where(x => x.RiskId == destination.Id && x.VulnerabilityId == vulnerabilityId)
                    .ToList();

                if (existingVulnerabilityAssociations.Any())
                {
                    for (int i = 0; i < existingVulnerabilityAssociations.Count; i++)
                    {
                        var riskVulnerabilityEntity = existingVulnerabilityAssociations[i];
                        if (i == 0)
                        {
                            riskVulnerabilityEntity.Risk = destination;
                        }
                        else
                        {
                            _riskVulnerabilityRepository.Remove(riskVulnerabilityEntity);
                        }
                    }
                }
                else
                {
                    _riskVulnerabilityRepository.Add(new RiskVulnerabilityEntity
                    {
                        Risk = destination,
                        EngagementId = destination.EngagementId,
                        VulnerabilityId = vulnerabilityId
                    });
                }
            }
        }
    }
}