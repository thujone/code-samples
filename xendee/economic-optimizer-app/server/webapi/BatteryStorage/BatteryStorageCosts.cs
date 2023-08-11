using DataAnnotationsExtensions;
using System.Collections.Generic;
using Xendee.Api.WebApi.NonLinearCosts;

namespace Xendee.Api.WebApi.BatteryStorage
{
    public class BatteryStorageCosts
    {
        [Min(0)]
        public decimal CapitalCostTechnology { get; set; }

        [Min(0)]
        public decimal InverterCost { get; set; }

        [Min(0)]
        public decimal OtherProjectSpecificCosts { get; set; }

        [Min(0)]
        public decimal MaintenanceCosts { get; set; }

        public List<NonLinearCostModel> NonLinearCosts { get; set; }
    }
}
