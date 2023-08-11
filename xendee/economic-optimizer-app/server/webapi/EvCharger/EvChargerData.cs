using System;
using Xendee.Api.Models;
using Xendee.Api.WebApi.TechDetails;
using Xendee.Framework.Models;

namespace Xendee.Api.WebApi.EvCharger
{
    public class EvChargerData
    {
        public EvChargerData(OptimizationProjectNodeEVChargerDetail evChargerDetail)
        {
            this.TechnologyId = evChargerDetail.OptimizationProjectNodeTechId;

            this.TechDetails = evChargerDetail.OptimizationProjectNodeTech.ToTechDetailsModel();

            this.Costs = new EvChargerCosts
            {
                ChargingStationCost = evChargerDetail.CostPerChargingStation
            };

            this.Details = new EvChargerDetails
            {
                Name = evChargerDetail.OptimizationProjectNodeTech.Name,
                Rating = evChargerDetail.ChargingStationRating,
                Lifetime = evChargerDetail.Lifetime,
                ChargingEfficiency = evChargerDetail.EfficiencyCharge,
                ChargeVoltageLevel = evChargerDetail.ChargeVoltageLevel,
                CustomerCostToCharge = evChargerDetail.CustomerCostToCharge
            };
        }

        public TechDetailsModel TechDetails { get; set; }
        public Guid TechnologyId { get; set; }
        public EvChargerCosts Costs { get; set; }
        public EvChargerDetails Details { get; set; }
    }
}
