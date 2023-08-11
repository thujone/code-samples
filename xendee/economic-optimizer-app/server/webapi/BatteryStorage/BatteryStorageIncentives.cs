using DataAnnotationsExtensions;

namespace Xendee.Api.WebApi.BatteryStorage
{
    public class BatteryStorageIncentives
    {
        [Min(0)]
        public decimal? FederalITC { get; set; }

        [Min(0)]
        public decimal? FederalAmountDepreciable { get; set; }

        public int? FederalDepreciationSchedule { get; set; }
    }
}
