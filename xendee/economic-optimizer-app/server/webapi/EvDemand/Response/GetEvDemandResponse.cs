using System.Collections.Generic;
using System.Linq;
using Xendee.Framework.Models;
using Xendee.Framework.Models.DERCAM;

namespace Xendee.Api.WebApi.EvDemand.Response
{
    public class GetEvDemandResponse
    {
        public static IEnumerable<EvDemandData> Create(
            OptimizationProject project,
            OptimizationProjectTimeSeriesManager tsManager,
            OptimizationProjectNode node
        )
        {
            var data = new List<EvDemandData>();

            foreach (OptimizationProjectNodeTech tech in node.OptimizationProjectNodeTechs.Where(t => t.IsEVFleet))
                data.Add(new EvDemandData(project, tsManager, tech.OptimizationProjectNodeEVFleetDetail));

            return data;
        }
    }
}
