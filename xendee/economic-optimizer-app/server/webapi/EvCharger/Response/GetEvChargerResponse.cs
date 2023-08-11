using System.Collections.Generic;
using System.Linq;
using Xendee.Framework.Models;

namespace Xendee.Api.WebApi.EvCharger.Response
{
    public class GetEvChargerResponse
    {
        public static IEnumerable<EvChargerData> Create(OptimizationProjectNode node)
        {
            var data = new List<EvChargerData>();

            foreach (OptimizationProjectNodeTech tech in node.OptimizationProjectNodeTechs.Where(t => t.IsEVCharger))
                data.Add(new EvChargerData(tech.OptimizationProjectNodeEVChargerDetail));

            return data;
        }
    }
}
