using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Xendee.Api.Models;
using Xendee.Api.ModelValidation;
using Xendee.Api.WebApi.TechDetails;

namespace Xendee.Api.WebApi.BatteryStorage.Request
{
    public class AddBatteryStorageRequest : ICustomModelValidation
    {
        [Required]
        public Guid OptimizationProjectId { get; set; }

        public BatteryStorageCosts Costs { get; set; }
        public BatteryStorageIncentives Incentives { get; set; }
        public BatteryStorageDetails Details { get; set; }
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
                if (this.Details.MaxSOC < this.Details.MinSOC)
                    errors.Add(new CustomModelValidationError("Details", "MaxSOC must be greater than or equal to MinSOC."));

                if (ModelValidationHelpers.NameContainsInvalidCharacters(this.Details.Name))
                    errors.Add(new CustomModelValidationError("Details.Name", "Name includes invalid characters."));
            }

            if (this.Costs != null)
            {
                if (this.Costs.NonLinearCosts != null && this.Costs.NonLinearCosts.Count > 0)
                {
                    if (this.Costs.NonLinearCosts.First().Capacity != 1)
                        errors.Add(new CustomModelValidationError("Costs.NonLinearCosts", "The first capacity entry for non-linear costs must be 1."));

                    if (this.Costs.NonLinearCosts.Count != 7)
                        errors.Add(new CustomModelValidationError("Costs.NonLinearCosts", "There must be exactly seven entries for the non-linear cost curve."));

                    if (this.Costs.NonLinearCosts.Any(c => c.Capacity > 1000000))
                        errors.Add(new CustomModelValidationError("Costs.NonLinearCosts", "The capacity entry for non-linear costs cannot exceed 1000000."));

                    for (int i = 1; i < this.Costs.NonLinearCosts.Count; i++)
                        if (this.Costs.NonLinearCosts[i].Capacity <= this.Costs.NonLinearCosts[i - 1].Capacity)
                            errors.Add(new CustomModelValidationError("Costs.NonLinearCosts", string.Format("The capacity entry for entry {0} must be strictly greater than the entry for {1}.", i + 1, i)));
                }
            }

            if (this.Incentives != null)
            {
                int[] allowedDepreciationScheduleValues = new int[] { 3, 5, 7, 10, 15, 20 };

                var fedDepreciationSchedule = this.Incentives.FederalDepreciationSchedule;
                if (fedDepreciationSchedule != null && !allowedDepreciationScheduleValues.Contains(fedDepreciationSchedule.Value))
                    errors.Add(new CustomModelValidationError("Incentives.FederalDepreciationSchedule", "Invalid value. Expected one of: " + string.Join(", ", allowedDepreciationScheduleValues)));
            }

            return errors;
        }
    }
}
