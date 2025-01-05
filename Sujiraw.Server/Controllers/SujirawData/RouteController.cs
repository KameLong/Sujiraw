using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiraw.Data;
using Sujiraw.Data.Entity;
using System.Runtime.InteropServices;
namespace Sujiraw.Server.Controllers.SujirawData
{
    [Route("api/[controller]")]
    [ApiController]
//    [Authorize]

    public class RouteController : SujiroAPIController
    {
        public RouteController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }
        [HttpGet("ByCompany/{companyID}")]
        public async Task<ActionResult> Get(long companyID)
        {
            try
            {
                using var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
                var company = service.Company.Find(companyID);
                if (company == null)
                {
                    return NotFound();
                }
                var routes = service.Route.Where(Route => Route.CompanyId == companyID).ToList();
                var s = from rs in service.RouteStation
                                join r in service.Route on rs.RouteId equals r.RouteId
                                where r.CompanyId == companyID
                                select rs;


                var stations = s.ToList();
                //var routes= service.GetRouteByCompany(companyID);
                    var res = routes.Select(item =>
                    {
                        return new JsonRoute()
                        {
                            name = item.Name,
                            routeID = item.RouteId,
                            routeStations = stations.Where(s=>s.RouteId==item.RouteId).OrderBy(s=>s.Sequence).ToList().Select(rs =>
                            {
                                return new JsonRouteStation()
                                {
                                    rsID=rs.RouteStationId,
                                    routeID=rs.RouteId,
                                    stationIndex = rs.Sequence,
                                    stationID = rs.StationId,
                                    showStyle=rs.ShowStyle,
                                };
                            }).ToList(),
                            upTrips = [],
                            downTrips = []
                        };
                    });
                    return Ok(res);
            }
            catch (Exception e)
            {
                6return BadRequest(e.Message);
            }
        }

        //[HttpPut("{companyID}")]
        //public async Task<ActionResult> Update(long companyID, [FromBody] Route route)
        //{
        //    return NotFound();
        //}
        [HttpDelete("{companyID}/{routeID}")]
        public async Task<ActionResult> Delete(long companyID, long routeID)
        {
            return NotFound();
            // todo

        }

    }
}
