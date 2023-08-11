using DataAnnotationsExtensions;

namespace Xendee.Api.WebApi.EvCharger
{
    public class EvChargerCosts
    {
        [Min(0)]
        public decimal ChargingStationCost { get; set; }
    }
}
