using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xendee.Api.WebApi.EvDemand.Request;
using Xendee.Api.WebApi.EvDemand.Response;
using Xendee.Framework.Importing;
using Xendee.Framework.Models;
using Xendee.Framework.Models.DERCAM;
using Xendee.Framework.Utility;
using Xendee.WebApi.Foundation.ActionFilters;
using Xendee.WebApi.Models.Response.Optimizations;

namespace Xendee.WebApi.Controllers.Optimizations
{
    [OptimizationsApiBasicAuthentication]
    [ValidationAction]
    [LogApiRequest]
    public class EvDemandController : OptimizationsApiController
    {
        /// <summary>
        /// Returns the EV Demand data for a specific project
        /// </summary>
        public OptimizationsApiResponse Get(Guid optimizationProjectId)
        {
            var project = this.OptimizationProjectRepository.Get(optimizationProjectId);
            if (project == null)
                return OptimizationsApiResponse.OptimizationProjectNotFound();

            this.AssertOptimizationProjectBelongsToClient(project);

            OptimizationProjectNode node = this.GetLoadForProject(project);

            if (node.HasEVFleetTech())
            {
                var tsManager = new OptimizationProjectTimeSeriesManager(project);
                return OptimizationsApiResponse.OK(GetEvDemandResponse.Create(project, tsManager, node));
            }
            else // No EV Demand for this project!
                return OptimizationsApiResponse.OK(null);

        }

        /// <summary>
        /// Deletes EV Demand data from a specific project
        /// </summary>
        public async Task<OptimizationsApiResponse> Delete(Guid optimizationProjectId, Guid technologyId)
        {
            var project = this.OptimizationProjectRepository.Get(optimizationProjectId);
            if (project == null)
                return OptimizationsApiResponse.OptimizationProjectNotFound();

            this.AssertOptimizationProjectBelongsToClient(project);

            // Start of thread-safe code
            string lockKey = string.Concat(optimizationProjectId.ToString(), "-", technologyId.ToString());
            SemaphoreSlim semaphore = OptimizationsApiController.Locks.GetOrAdd(lockKey, x => new SemaphoreSlim(1));

            await semaphore.WaitAsync();

            try
            {
                var node = this.GetLoadForProject(project);

                OptimizationProjectNodeTech tech = node.OptimizationProjectNodeTechs.SingleOrDefault(t => t.TechType == OptimizationProjectNodeTech.TECHTYPE_EV && t.OptimizationProjectNodeTechId == technologyId);
                if (tech != null)
                {
                    this.OptimizationProjectRepository.DeleteTechnologyFromNode(project, tech);
                    project.LastModifiedDate = DateTime.UtcNow;
                    this.OptimizationProjectRepository.SaveChanges();
                }
            }
            finally
            {
                semaphore.Release();
            }

            return OptimizationsApiResponse.OK(null);
        }

        /// <summary>
        /// Adds EV Demand data to a specific project
        /// </summary>
        public async Task<OptimizationsApiResponse> Post(AddEvDemandRequest model)
        {
            if (model == null) return OptimizationsApiResponse.MissingInputData();

            var project = this.OptimizationProjectRepository.Get(model.OptimizationProjectId);
            if (project == null)
                return OptimizationsApiResponse.OptimizationProjectNotFound();

            this.AssertOptimizationProjectBelongsToClient(project);

            OptimizationProjectNodeTech tech = null;

            // Start of thread-safe code
            string lockKey = model.OptimizationProjectId.ToString();
            SemaphoreSlim semaphore = OptimizationsApiController.Locks.GetOrAdd(lockKey, x => new SemaphoreSlim(1));

            await semaphore.WaitAsync();

            try
            {
                var node = this.GetLoadForProject(project);

                int existingEvDemandCount = node.OptimizationProjectNodeTechs.Where(t => t.IsEVFleet).Count();
                if (existingEvDemandCount >= OptimizationProjectNodeTech.MAX_TECHS_PER_NODE)
                    return OptimizationsApiResponse.BadRequest("Unable to add additional EVDemand.");

                IEnumerable<decimal> getAvailableLatLng = node.GetAvailableLatLng();

                tech = new OptimizationProjectNodeTech
                {
                    OptimizationProjectNodeTechId = Guid.NewGuid(),
                    Lat = getAvailableLatLng.First(),
                    Lng = getAvailableLatLng.Last(),
                    TechType = OptimizationProjectNodeTech.TECHTYPE_EV,
                    FixedInvest = false,
                    ForcedInvest = 0M,
                    ExistingTech = false,
                    TechAge = 0,
                    Name = this.DetermineNameForTechnology(model.Details.Name, OptimizationProjectNodeTech.TECHTYPE_EV),
                    OptimizationProjectNodeEVFleetDetail = new OptimizationProjectNodeEVFleetDetail()
                };

                if (node.OptimizationProjectNodeTechs == null)
                    node.OptimizationProjectNodeTechs = new List<OptimizationProjectNodeTech>(1);

                // Determine TechNumber
                tech.OptimizationProjectNodeEVFleetDetail.TechNumber = OptimizationProjectHelpers.GetNextTechNumber(OptimizationProjectNodeTech.TECHTYPE_EV, node);

                node.OptimizationProjectNodeTechs.Add(tech);

                Mapper.Map<AddEvDemandRequest, OptimizationProjectNodeEVFleetDetail>(model, tech.OptimizationProjectNodeEVFleetDetail);

                var importEngine = new ImportLoadShapeEngine(model.Details.StartDate.Value, model.Details.Resolution.Value, ProjectLibrary.kW, model.Details.PreservePeak.Value);
                var results = importEngine.Parse(model.Details.TimeSeriesData.Select(elem => elem.ToString()).ToList());

                if (results.Count > 0)
                    return OptimizationsApiResponse.BadRequest(results.Take(10));

                OptimizationProjectHelpers.SaveTimeSeriesLoadProfile(
                    optimizationProjectRepository: this.OptimizationProjectRepository,
                    project: project,
                    node: node,
                    lsType: tech.OptimizationProjectNodeEVFleetDetail.LoadShapeType,
                    startDate: model.Details.StartDate.Value,
                    resolution: model.Details.Resolution.Value,
                    units: ProjectLibrary.kW,
                    preservePeak: model.Details.PreservePeak ?? false,
                    importEngine: importEngine,
                    description: "User-uploaded time series file."
                );

                project.LastModifiedDate = DateTime.UtcNow;
                this.OptimizationProjectRepository.SaveChanges();
            }
            finally
            {
                semaphore.Release();
            }

            return OptimizationsApiResponse.Created(
                new CreateEvDemandResponse
                {
                    TechnologyId = tech.OptimizationProjectNodeTechId
                }
            );
        }
    }
}