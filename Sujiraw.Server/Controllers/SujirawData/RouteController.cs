using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiraw.Data;
using Route = Sujiraw.Data.Route;
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
                string connectionString = Configuration["ConnectionStrings:postgres"]!;
                using (var service = new PostgresDbService(connectionString))
                {
                    var routes= service.GetRouteByCompany(companyID);
                    var stations = service.GetRouteStationByCompany(companyID);
                    var res = routes.Select(item =>
                    {
                        return new JsonRoute()
                        {
                            name = item.Name,
                            routeID = item.RouteID,
                            routeStations = stations[item.RouteID].Select(rs =>
                            {
                                return new JsonRouteStation()
                                {
                                    rsID=rs.RouteStationID,
                                    routeID=rs.RouteID,
                                    stationIndex = rs.Sequence,
                                    stationID = rs.StationID,
                                    showStyle=rs.ShowStyle,
                                };
                            }).ToList(),
                            upTrips = [],
                            downTrips = []
                        };
                    });
                    return Ok(res);
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{companyID}")]
        public async Task<ActionResult> Update(long companyID, [FromBody] Route route)
        {
            return NotFound();
        }
        [HttpDelete("{companyID}/{routeID}")]
        public async Task<ActionResult> Delete(long companyID, long routeID)
        {
            return NotFound();
            // todo

            //if (!AuthService.HasAccessPrivileges(Configuration["ConnectionStrings:DBdir"], User, companyID))
            //{
            //    return Forbid();
            //}
            try
            {

                string connectionString = Configuration["ConnectionStrings:postgres"]!;
                using (var service = new PostgresDbService(connectionString))
                {
                    var companies = service.GetAllCompany();
                    return Ok(companies);
                }
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

    }
}
