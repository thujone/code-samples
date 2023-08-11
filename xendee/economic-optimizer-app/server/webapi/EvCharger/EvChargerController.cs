using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xendee.Api.WebApi.EvCharger.Request;
using Xendee.Api.WebApi.EvCharger.Response;
using Xendee.Api.WebApi.TechDetails;
using Xendee.Framework.Models;
using Xendee.Framework.Utility;
using Xendee.WebApi.Foundation.ActionFilters;
using Xendee.WebApi.Models.Response.Optimizations;

namespace Xendee.WebApi.Controllers.Optimizations
{
    [OptimizationsApiBasicAuthentication]
    [ValidationAction]
    [LogApiRequest]
    public class EvChargerController : OptimizationsApiController
    {
        /// <summary>
        /// Returns the EV Charger data for a specific project
        /// </summary>
        public OptimizationsApiResponse Get(Guid optimizationProjectId)
        {
            var project = this.OptimizationProjectRepository.Get(optimizationProjectId);
            if (project == null)
                return OptimizationsApiResponse.OptimizationProjectNotFound();

            this.AssertOptimizationProjectBelongsToClient(project);

            OptimizationProjectNode node = this.GetLoadForProject(project);

            if (node.HasEVChargerTech())
            {
                return OptimizationsApiResponse.OK(GetEvChargerResponse.Create(node));
            }
            else // No EV Charger data for this project!
                return OptimizationsApiResponse.OK(null);
        }

        /// <summary>
        /// Deletes EV Charger data from a specific project.
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

                OptimizationProjectNodeTech tech = node.OptimizationProjectNodeTechs.SingleOrDefault(t => t.TechType == OptimizationProjectNodeTech.TECHTYPE_EVCHARGER && t.OptimizationProjectNodeTechId == technologyId);
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
        /// Adds EV Charger data to a specific project
        /// </summary>
        public async Task<OptimizationsApiResponse> Post(AddEvChargerRequest model)
        {
            if (model == null) return OptimizationsApiResponse.MissingInputData();

            var project = this.OptimizationProjectRepository.Get(model.OptimizationProjectId);
            if (project == null)
                return OptimizationsApiResponse.OptimizationProjectNotFound();

            this.AssertOptimizationProjectBelongsToClient(project);
            var techDetails = model.TechDetails ?? TechDetailsModel.DefaultValues;

            OptimizationProjectNodeTech tech = null;

            // Start of thread-safe code
            string lockKey = model.OptimizationProjectId.ToString();
            SemaphoreSlim semaphore = OptimizationsApiController.Locks.GetOrAdd(lockKey, x => new SemaphoreSlim(1));

            await semaphore.WaitAsync();

            try
            {
                var node = this.GetLoadForProject(project);

                // How many EV Chargers do we have of this type already?
                int existingEvChargerCount = node.OptimizationProjectNodeTechs.Where(t => t.IsEVCharger).Count();
                if (existingEvChargerCount >= OptimizationProjectNodeTech.MAX_TECHS_PER_NODE)
                    return OptimizationsApiResponse.BadRequest("Unable to add additional EVCharger.");

                IEnumerable<decimal> getAvailableLatLng = node.GetAvailableLatLng();

                // We are adding the tech, so create the OptimizationProjectNodeTech object and OptimizationProjectNodeEvChargerDetail child object
                tech = new OptimizationProjectNodeTech
                {
                    OptimizationProjectNodeTechId = Guid.NewGuid(),
                    Lat = getAvailableLatLng.First(),
                    Lng = getAvailableLatLng.Last(),
                    TechType = OptimizationProjectNodeTech.TECHTYPE_EVCHARGER,
                    FixedInvest = false,
                    ForcedInvest = 0M,
                    ExistingTech = false,
                    TechAge = 0,
                    Name = this.DetermineNameForTechnology(model.Details.Name, OptimizationProjectNodeTech.TECHTYPE_EVCHARGER),
                    OptimizationProjectNodeEVChargerDetail = new OptimizationProjectNodeEVChargerDetail()
                };

                if (node.OptimizationProjectNodeTechs == null)
                    node.OptimizationProjectNodeTechs = new List<OptimizationProjectNodeTech>(1);

                // Determine TechNumber
                tech.OptimizationProjectNodeEVChargerDetail.TechNumber = OptimizationProjectHelpers.GetNextTechNumber(OptimizationProjectNodeTech.TECHTYPE_EVCHARGER, node);

                node.OptimizationProjectNodeTechs.Add(tech);

                tech.FixedInvest = techDetails.FixedInvest;
                tech.ForcedInvest = techDetails.ForcedInvest;
                tech.ExistingTech = techDetails.ExistingTech;
                tech.TechAge = techDetails.TechAge;
                tech.MaxNewSize = techDetails.MaxNewSize;

                Mapper.Map<AddEvChargerRequest, OptimizationProjectNodeEVChargerDetail>(model, tech.OptimizationProjectNodeEVChargerDetail);

                // Currently the API supports only one tariff.
                // Assign the default utility tariff to the EV Charger
                tech.OptimizationProjectNodeEVChargerDetail.OptimizationProjectUtilityDataId = project.GetDefaultUtilityTariff().OptimizationProjectUtilityDataId;

                project.LastModifiedDate = DateTime.UtcNow;
                this.OptimizationProjectRepository.SaveChanges();
            }
            finally
            {
                semaphore.Release();
            }

            return OptimizationsApiResponse.Created(
                new CreateEvChargerResponse
                {
                    TechnologyId = tech.OptimizationProjectNodeTechId
                }
            );
        }
    }
}