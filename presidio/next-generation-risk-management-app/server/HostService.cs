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
    public class HostService : IHostService
    {
        private readonly IHostMapper _hostMapper;
        private readonly IVulnerabilityMapper _vulnerabilityMapper;
        private readonly IHostRepository _hostRepository;
        private readonly IHostVulnerabilityRepository _hostVulnerabilityRepository;
        private readonly IImportRepository _importRepository;
        
        public HostService(
            IHostRepository hostRepository,
            IHostVulnerabilityRepository hostVulnerabilityRepository,
            IImportRepository importRepository,
            IHostMapper hostMapper,
            IVulnerabilityMapper vulnerabilityMapper)
        {
            _hostRepository = hostRepository;
            _hostVulnerabilityRepository = hostVulnerabilityRepository;
            _importRepository = importRepository;
            _hostMapper = hostMapper;
            _vulnerabilityMapper = vulnerabilityMapper;

        }

        public IEnumerable<Host> GetHostsByVulnerability(int vulnerability)
        {
            // TODO:
            // Get all the hosts by vulnerability
            // Figure out which hosts are from the latest import for this vulnerability
            // Figure out which hosts are from the penultimate import for this vulnerability
            // Get all hosts from the latest import for all vulnerabilities
            // Figure out the missing hosts
            // For each missing host:
            //   Map it
            //   Does the host exist in the list of hosts for all vulnerabilities?
            //   If so, set 'isRemediated' for the host.
            return new List<Host>();
        }

        public IEnumerable<Host> GetHosts(int engagementId, int? phaseId = null, int? vulnerabilityId = null, bool isVulnDetailsHostList = false)
        {
            ImportEntity latestImport;

            // 'isHostGrid' => is this list for the host grid page
            // 'isVulnDetailsHostList' => is this list for the vuln details host list

            var isHostGrid = !isVulnDetailsHostList;

            if (!isHostGrid)
                latestImport = _importRepository.GetLatestByPhaseId(phaseId.Value);
            else
                latestImport = _importRepository.GetLatest(engagementId);

            if (latestImport == null)
                return Enumerable.Empty<Host>();

            var hostEntities = new List<HostEntity>();

            if (!isHostGrid)
                hostEntities = _hostRepository.GetByVulnerabilityId(vulnerabilityId.Value).ToList();
            else
                hostEntities = _hostRepository.GetByEngagementId(engagementId).ToList();

            var latestHostVulns = _hostVulnerabilityRepository
                .GetByImportAndPhase((int) latestImport.Id, (int) latestImport.PhaseId)
                .ToList();

            // Get a list of all host entities that are a part of the latest import's phase
            var latestHostEntities = hostEntities
                .Where(x => x.PhaseId == latestImport.PhaseId)
                .ToList();

            // Get a list of all host entities that belong to other phases
            var otherHostEntities = hostEntities
                .Except(latestHostEntities);
            var allHostEntities = new List<Host>();

            foreach (var latestHostEntity in latestHostEntities)
            {
                var host = _hostMapper.Map(latestHostEntity);
                
                if (!isHostGrid)
                {
                    MapVulnerabilityList(latestHostEntity, host, latestImport.Id);

                    // If we can see that another vuln exists on a different host in this import,
                    // then we know this hostVuln is "remediated".
                    // NOT to be confused with the entire vuln being remediated. We're talking about calculating
                    // partial mitigation on the fly to display in the HostList on the Vuln Details page.
                    host.IsPartiallyRemediated = false;
                    foreach (var vulnerability in host.VulnerabilityList)
                    {
                        if (Int32.Parse(vulnerability.Id) != vulnerabilityId && vulnerabilityId != null
                            && !latestHostVulns.Any(x => x.HostId == Int32.Parse(host.Id) && x.VulnerabilityId == vulnerabilityId))
                        {
                            host.IsPartiallyRemediated = true;
                            break;
                        }
                    }

                    host.VulnerabilityList = null; // We only needed this to figure out the partial remediation status
                    allHostEntities.Add(host);
                }
                else
                {
                    allHostEntities.Add(host);
                }
            }

            foreach (var otherHostEntity in otherHostEntities)
            {
                var host = _hostMapper.Map(otherHostEntity);
                var hostPhaseId = otherHostEntity.PhaseId ?? 0;
                var hostLatestImport = _importRepository.GetLatestByPhaseId(hostPhaseId);

                if (!isHostGrid)
                {
                    MapVulnerabilityList(otherHostEntity, host, hostLatestImport.Id);
                    
                    // If we can see that another vuln exists on a different host in this import,
                    // then we know this hostVuln is "remediated".
                    // NOT to be confused with the entire vuln being remediated. We're talking about calculating
                    // partial mitigation on the fly to display in the HostList on the Vuln Details page.
                    host.IsPartiallyRemediated = false;
                    foreach (var vulnerability in host.VulnerabilityList)
                    {
                        if (Int32.Parse(vulnerability.Id) != vulnerabilityId && vulnerabilityId != null)
                        {
                            host.IsPartiallyRemediated = true;
                            break;
                        }
                    }

                    host.VulnerabilityList = null;  // Set back to null
                    allHostEntities.Add(host);
                }
                else
                {
                    allHostEntities.Add(host);
                }
            }
            allHostEntities = allHostEntities.OrderBy(x => x.Status).ToList();
            return allHostEntities;
        }

        public Host Get(int hostId, int phaseId)
        {
            Guard.ForLessOrEqualZero(hostId, "hostId");

            var hostEntity = _hostRepository.Get(hostId);
            if (hostEntity == null)
                return null;

            var latestImportInPhase = _importRepository.GetLatestByPhaseId(phaseId);
            var penultimateImportInPhase = _importRepository.GetPenultimateByPhaseId(phaseId);

            var host = _hostMapper.Map(hostEntity);

            // If no penultimate import exists in phase, then don't try to show HostVuln-level remediation
            if (penultimateImportInPhase == null)
                MapVulnerabilityList(hostEntity, host);
            else
                MapRemediatedVulnerabilityList(hostEntity, host, latestImportInPhase, penultimateImportInPhase);

            return host;
        }

        public void Update(Host host)
        {
            Guard.ForArgumentIsNull(host, nameof(host));

            var hostId = Convert.ToInt32(host.Id);
            Guard.ForLessOrEqualZero(hostId, nameof(hostId));

            var hostEntity = _hostRepository.Get(hostId);
            _hostMapper.Map(host, hostEntity);

            _hostRepository.Save();
        }

        public IEnumerable<Host> GetExportData(int engagementId)
        {
            var hostEntities = _hostRepository.GetByEngagementId(engagementId).ToList();
            var hosts = new List<Host>();
            foreach (var hostEntity in hostEntities)
            {
                var host = _hostMapper.Map(hostEntity);
                MapVulnerabilityList(hostEntity, host);
                hosts.Add(host);
            }
            return hosts;
        }

        private void MapVulnerabilityList(
            HostEntity source,
            Host destination,
            int? latestImportId = null,
            bool includeHistorical = false,
            bool isDistinctVulnList = false)
        {
            var hostVulnerabilities = new List<HostVulnerabilityEntity>();
            if (!isDistinctVulnList)
            {
                hostVulnerabilities = source.HostVulnerabilities.ToList();
            }
            else
            {
                hostVulnerabilities = source.HostVulnerabilities
                    .GroupBy(x => x.VulnerabilityId)
                    .Select(x => x.FirstOrDefault())
                    .Distinct()
                    .ToList();
            }

            foreach (var hostVulnerability in hostVulnerabilities)
            {
                if ( (includeHistorical && hostVulnerability.Vulnerability.IsHistorical)
                    || (includeHistorical && hostVulnerability.Vulnerability.IsStatusUnknown)
                    || latestImportId == null
                    || hostVulnerability.ImportId == latestImportId 
                    || isDistinctVulnList )
                {

                    var vulnerability = _vulnerabilityMapper.Map(hostVulnerability.Vulnerability);
                    MapHostList(hostVulnerability.Vulnerability, vulnerability);
                    vulnerability.IsPartiallyRemediated = false;

                    destination.VulnerabilityList.Add(vulnerability);
                }
            }
        }

        private void MapRemediatedVulnerabilityList(
            HostEntity source,
            Host destination,
            ImportEntity latestImport,
            ImportEntity penultimateImport)
        {
            // Get latest HostVulns for this Host
            var latestHostVulns = _hostVulnerabilityRepository
                .GetByImportAndPhase(latestImport.Id, latestImport.PhaseId.Value)
                .ToList();
            
            // Get all HostVulns that aren't the latest
            var oldHostVulns = _hostVulnerabilityRepository
                .GetByPhaseId(latestImport.PhaseId.Value)
                .Except(latestHostVulns)
                .ToList();

            // Get the list of HostVulns that are missing from the latest import
            var missingHostVulns = new List<HostVulnerabilityEntity>();
            foreach (var oldHostVuln in oldHostVulns)
            {   
                var isMissing = true;
                foreach (var latestHostVuln in latestHostVulns)
                {
                    if (oldHostVuln.HostId == latestHostVuln.HostId && oldHostVuln.VulnerabilityId == latestHostVuln.VulnerabilityId)
                    {
                        isMissing = false;
                        break;
                    }
                }
                if (isMissing)
                    missingHostVulns.Add(oldHostVuln);
            }

            var vulnList = new List<Vulnerability>();

            // Foreach hostVuln in source.hostVulnerabilities:
            foreach (var hostVulnToMap in source.HostVulnerabilities)
            {
                // Map vulnerabilityEntity to vulnerability
                var vulnerability = _vulnerabilityMapper.Map(hostVulnToMap.Vulnerability);

                // Set vulnerability.IsPartiallyRemediated = false
                vulnerability.IsPartiallyRemediated = false;

                // Are any source HostVulns missing from the latest import?
                var isMissing = false;

                foreach (var missingHostVuln in missingHostVulns)
                {
                    if (missingHostVuln.HostId == source.Id)
                    {
                        isMissing = true;
                        break;
                    }
                }

                if (isMissing)
                {
                    // Foreach missingHostVuln in missingHostVulns:
                    foreach (var missingHostVuln in missingHostVulns)
                    {
                        // If missingHostVuln has the same vulnerability but on a different host in the source's hostVulnerabilities:
                        if (missingHostVuln.VulnerabilityId == hostVulnToMap.VulnerabilityId && missingHostVuln.HostId != hostVulnToMap.HostId)
                        {
                            vulnerability.IsPartiallyRemediated = true;
                            break;
                        }
                    }
                }
                vulnList.Add(vulnerability);

            }

            vulnList = vulnList.GroupBy(x => x.Id).Select(y => y.First()).ToList();
            destination.VulnerabilityList.AddRange(vulnList);

        }


        private void MapHostList(VulnerabilityEntity source, Vulnerability destination)
        {
            foreach (var hostVulnerability in source.HostVulnerabilities)
            {
                var host = _hostMapper.Map(hostVulnerability.Host);
                destination.HostList.Add(host);
            }
        }

    }
}