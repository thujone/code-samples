using DataAnnotationsExtensions;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace Xendee.Api.WebApi.BatteryStorage
{
    public class BatteryStorageDetails
    {
        [StringLength(50)]
        public string Name { get; set; }

        [Min(1)]
        [Max(100)]
        public int Lifetime { get; set; }

        [Min(0)]
        [Max(100)]
        public decimal ChargingEfficiency { get; set; }

        [Min(0)]
        [Max(100)]
        public decimal DischargingEfficiency { get; set; }

        [Min(0)]
        [Max(100)]
        public decimal MaxChargeRate { get; set; }

        [Min(0)]
        [Max(100)]
        public decimal MaxDischargeRate { get; set; }

        [Min(0)]
        [Max(100)]
        public decimal MinSOC { get; set; }

        [Min(0)]
        [Max(100)]
        public decimal MaxSOC { get; set; }

        [Min(0)]
        public decimal UnitSize { get; set; }

        public bool ChargeFromUtility { get; set; }

        [Min(0)]
        [Max(100)]
        public decimal? ChargeFromUtilityPercent { get; set; }

        /// <summary>
        /// Returns the value to report for ChargeFromUtility based on the inputs.
        /// </summary>
        [JsonIgnore]
        public decimal ChargeFromUtilityValue
        {
            get
            {
                if (this.ChargeFromUtility)
                {
                    if (this.ChargeFromUtilityPercent.HasValue)
                        return this.ChargeFromUtilityPercent.Value;
                    else
                        return 100M;
                }
                else
                    return 0M;
            }
        }

        [Min(0)]
        public int MaxCyclesPerYear { get; set; }

        public bool Export { get; set; }
    }
}
