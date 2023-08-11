using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Xendee.Api.Models;
using Xendee.Api.ModelValidation;
using Xendee.Api.WebApi.TechDetails;

namespace Xendee.Api.WebApi.EvCharger.Request
{
    public class AddEvChargerRequest : ICustomModelValidation
    {
        [Required]
        public Guid OptimizationProjectId { get; set; }

        public EvChargerCosts Costs { get; set; }
        public EvChargerDetails Details { get; set; }
        public TechDetailsModel TechDetails { get; set; }

        public IEnumerable<CustomModelValidationError> Validate()
        {
            var errors = new List<CustomModelValidationError>();

            errors.ValidateTechDetails(TechDetails);

            if (this.Costs == null)
                errors.Add(new CustomModelValidationError("Costs", "Costs is required."));

            if (this.Details == null)
                errors.Add(new CustomModelValidationError("Details", "Details is required."));

            if (this.Details != null)
            {
                if (this.Details.Rating == 0)
                    errors.Add(new CustomModelValidationError("Details", "Rating must be greater than 0."));

                if (ModelValidationHelpers.NameContainsInvalidCharacters(this.Details.Name))
                    errors.Add(new CustomModelValidationError("Details.Name", "Name includes invalid characters."));
            }

            return errors;
        }
    }
}
