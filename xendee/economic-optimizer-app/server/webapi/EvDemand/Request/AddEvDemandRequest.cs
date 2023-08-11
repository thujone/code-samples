using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Xendee.Api.Models;
using Xendee.Api.ModelValidation;
using Xendee.Api.WebApi.TechDetails;

namespace Xendee.Api.WebApi.EvDemand.Request
{
    public class AddEvDemandRequest : ICustomModelValidation
    {
        [Required]
        public Guid OptimizationProjectId { get; set; }

        public EvDemandDetails Details { get; set; }
        public TechDetailsModel TechDetails { get; set; }

        public IEnumerable<CustomModelValidationError> Validate()
        {
            var errors = new List<CustomModelValidationError>();

            errors.ValidateTechDetails(TechDetails);

            if (this.Details == null)
                errors.Add(new CustomModelValidationError("Details", "Details is required."));

            if (this.Details != null)
            {
                if (this.Details.Resolution == null)
                    errors.Add(new CustomModelValidationError("Resolution", "Resolution is required."));
                if (this.Details.StartDate == null)
                    errors.Add(new CustomModelValidationError("StartDate", "StartDate is required."));
                if (this.Details.Resolution.HasValue && this.Details.Resolution > 1 && this.Details.PreservePeak == null)
                    errors.Add(new CustomModelValidationError("PreservePeak", "PreservePeak is required for subhourly resolutions."));
                if (this.Details.TimeSeriesData == null)
                    errors.Add(new CustomModelValidationError("TimeSeriesData", "TimeSeriesData is required."));

                if (this.Details.Resolution != 1 && this.Details.Resolution != 2 && this.Details.Resolution != 4)
                    errors.Add(new CustomModelValidationError("Resolution", "Resolution must have a value of 1, 2 or 4."));

                if (this.Details.StartDate.Value.Year < 2000 || this.Details.StartDate.Value.Year >= 2100)
                    errors.Add(new CustomModelValidationError("StartDate", "StartDate must come on or after January 1, 2000 and before January 1, 2100."));
            }

            return errors;
        }
    }
}
