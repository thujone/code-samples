using DataAnnotationsExtensions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Xendee.Api.WebApi.EvDemand
{
    public class EvDemandDetails
    {
        [StringLength(50)]
        public string Name { get; set; }

        [Min(1)]
        [Max(3)]
        public int ChargeVoltageLevel { get; set; }

        public int? Resolution { get; set; }
        public DateTime? StartDate { get; set; }
        public bool? PreservePeak { get; set; }
        public IEnumerable<double> TimeSeriesData { get; set; }
    }
}
