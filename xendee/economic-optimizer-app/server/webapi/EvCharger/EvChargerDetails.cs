using DataAnnotationsExtensions;
using System.ComponentModel.DataAnnotations;

namespace Xendee.Api.WebApi.EvCharger
{
    public class EvChargerDetails
    {
        [StringLength(50)]
        public string Name { get; set; }

        [Min(1)]
        [Max(100)]
        public int Lifetime { get; set; }

        [Min(0)]
        [Max(100)]
        public decimal ChargingEfficiency { get; set; }

        [Min(1)]
        [Max(3)]
        public int ChargeVoltageLevel { get; set; }

        [Min(0)]
        public decimal Rating { get; set; }

        [Min(0)]
        public decimal CustomerCostToCharge { get; set; }
    }
}
