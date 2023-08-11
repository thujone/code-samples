using System;
using Xendee.Api.Models;
using Xendee.Api.WebApi.NonLinearCosts;
using Xendee.Api.WebApi.TechDetails;
using Xendee.Framework.Models;

namespace Xendee.Api.WebApi.BatteryStorage
{
    public class BatteryStorageData
    {
        public BatteryStorageData(OptimizationProjectNodeStorageDetail storageDetail)
        {
            this.TechnologyId = storageDetail.OptimizationProjectNodeTechId;

            this.TechDetails = storageDetail.OptimizationProjectNodeTech.ToTechDetailsModel();

            this.Costs = new BatteryStorageCosts
            {
                CapitalCostTechnology = storageDetail.EnergyModulesPerkWh,
                InverterCost = storageDetail.InverterPurchaseCost,
                OtherProjectSpecificCosts = storageDetail.InstallationCost,
                MaintenanceCosts = storageDetail.MaintenanceCostPerkWhPerMonth,
                NonLinearCosts = storageDetail.NonLinearPurchasePrice ? NonLinearCostModel.FromPackedString(storageDetail.NonLinearPurchasePriceValues) : null
            };

            this.Incentives = new BatteryStorageIncentives
            {
                FederalITC = storageDetail.ITC,
                FederalAmountDepreciable = storageDetail.AmtDepreciable,
                FederalDepreciationSchedule = storageDetail.MACRSYrs
            };

            // XEN-2359: Return true for Charge From Utility if there is any amount of charging allowed
            bool canChargeFromUtiliy = storageDetail.ChargeFromUtil != 0M;

            this.Details = new BatteryStorageDetails
            {
                Name = storageDetail.OptimizationProjectNodeTech.Name,
                Lifetime = storageDetail.SystemLifetime,
                ChargingEfficiency = storageDetail.ChargingEfficiency,
                DischargingEfficiency = storageDetail.DischargingEfficiency,
                MaxChargeRate = storageDetail.MaxChargeRate,
                MaxDischargeRate = storageDetail.MaxDischargeRate,
                MinSOC = storageDetail.MinStateOfCharge,
                MaxSOC = storageDetail.MaxStateOfCharge,
                UnitSize = storageDetail.DiscreteSize,
                ChargeFromUtility = canChargeFromUtiliy,
                ChargeFromUtilityPercent = storageDetail.ChargeFromUtil,
                Export = storageDetail.Export,
                MaxCyclesPerYear = storageDetail.MaxNumberOfCycles
            };
        }

        public TechDetailsModel TechDetails { get; set; }
        public Guid TechnologyId { get; set; }
        public BatteryStorageCosts Costs { get; set; }
        public BatteryStorageIncentives Incentives { get; set; }
        public BatteryStorageDetails Details { get; set; }
    }
}
