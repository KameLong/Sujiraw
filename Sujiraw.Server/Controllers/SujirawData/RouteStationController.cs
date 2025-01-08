using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiraw.Data;
using Sujiraw.Data.Entity;

namespace Sujiraw.Server.Controllers.SujirawData
{
    [Route("api/[controller]")]
    [ApiController]

    public class RouteStationController : SujiroAPIController
    {
        public RouteStationController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }
        [HttpGet("{companyID}/{routeID}")]
        public async Task<ActionResult> Get(long companyID, long routeID)
        {
            return NotFound();

        }
        /**
         * 新しいRouteStationを追加します
         **/

        //[HttpPut("{companyID}")]
        //public async Task<ActionResult> Put(long companyID, [FromBody] RouteStation routeStation)
        //{
        //    throw new Exception("Not implemented");

        //}
        [HttpDelete("{companyID}/{routeStationID}")]
        public async Task<ActionResult> Delete(long companyID, long routeStationID)
        {
            return NotFound();

            //if (!AuthService.HasAccessPrivileges(Configuration["ConnectionStrings:DBdir"], User, companyID))
            //{
            //    return Forbid();
            //}
            //try
            //{
            //    string filePath = Configuration["ConnectionStrings:DBdir"] + $"company_{companyID}.sqlite";
            //    if (!System.IO.File.Exists(filePath))
            //    {
            //        return NotFound();
            //    }
            //    using(var conn= new SqliteConnection("Data Source=" + filePath))
            //    {
            //        conn.Open();
            //        var tran = conn.BeginTransaction();
            //        RouteStation.DeleteRouteStation(conn, routeStationID);
            //        tran.Commit();
            //    }
            //    return Ok();
            //}
            //catch (Exception e)
            //{
            //    return BadRequest(e.Message);
            //}
        }
        [HttpGet("DirectConnection/{stationId}")]
        public ActionResult GetByStation(long stationId)
        {
            var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            var routes = service.RouteStation.Where(rs => rs.StationId == stationId)
                .Join(service.Route, rs => rs.RouteId, r => r.RouteId, (rs, r) => r)
                .Distinct();
            var routeStations=service.RouteStation.Join(routes, rs => rs.RouteId, r => r.RouteId, (rs, r) => rs).ToList();
            return Ok(routeStations.Select(rs=>new JsonRouteStation(rs)));
        }

        [HttpGet("GetByRouteAndStation/{routeId}/{stationId}")]
        public ActionResult GetByRouteAndStation(long routeId,long stationId)
        {
            var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            return Ok(service.RouteStation.Where(rs=>rs.RouteId==routeId && rs.StationId==stationId).ToList().Select(rs=>new JsonRouteStation(rs)));
        }

        


    }
}
