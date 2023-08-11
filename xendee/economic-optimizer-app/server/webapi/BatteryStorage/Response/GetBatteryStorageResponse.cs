using System.Collections.Generic;
using System.Linq;
using Xendee.Framework.Models;

namespace Xendee.Api.WebApi.BatteryStorage.Response
{
    public class GetBatteryStorageResponse
    {
        public static IEnumerable<BatteryStorageData> Create(OptimizationProjectNode node)
        {
            var data = new List<BatteryStorageData>();

            foreach (OptimizationProjectNodeTech tech in node.OptimizationProjectNodeTechs.Where(t => t.IsBESS))
                data.Add(new BatteryStorageData(tech.OptimizationProjectNodeStorageDetail));

            return data;
        }
    }
}
