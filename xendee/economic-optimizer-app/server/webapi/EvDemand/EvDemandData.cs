using DataAnnotationsExtensions;
using System;
using System.Collections.Generic;
using System.Linq;
using Xendee.Framework.Models;
using Xendee.Framework.Models.DERCAM;

namespace Xendee.Api.WebApi.EvDemand
{
    public class EvDemandData
    {
        public EvDemandData(
            OptimizationProject project,
            OptimizationProjectTimeSeriesManager tsManager,
            OptimizationProjectNodeEVFleetDetail evDemandDetail
        )
        {
            this.TechnologyId = evDemandDetail.OptimizationProjectNodeTechId;

            this.Details = new EvDemandDetails
            {
                Name = evDemandDetail.OptimizationProjectNodeTech.Name,
                ChargeVoltageLevel = evDemandDetail.ChargeVoltageLevel
            };

            string timeSeriesType = DerCamTimeSeriesType.GetTimeSeriesTypeForLoad(TimeSeriesManagerBase.DEFAULT_TIMESERIES_NODENUMBER, evDemandDetail.LoadShapeType);
            OptimizationProjectTimeSeriesFile tsFile = project.OptimizationProjectTimeSeriesFiles.SingleOrDefault(ts => ts.TimeSeriesType == timeSeriesType);
            if (tsFile != null)
            {
                string[] rawEvDemandData = tsManager.ReadFileLines(tsFile);

                this.Details.Resolution = tsFile.ReadingsPerHour;
                this.Details.StartDate = new DateTime(project.SimulationYear, 1, 1);
                this.Details.PreservePeak = tsFile.PreservePeak ?? false;
                this.Details.TimeSeriesData = rawEvDemandData.Select(line => Convert.ToDouble(line));
            }
        }

        public Guid TechnologyId { get; set; }

        public EvDemandDetails Details { get; set; }
    }
}
