using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.Sqlite;
using Sujiraw.Server.SignalR;
using Sujiro.Data;
using Route = Sujiro.Data.Route;

namespace Sujiraw.Server.Controllers.SujirawData
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

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

        [HttpPut("{companyID}")]
        public async Task<ActionResult> Put(long companyID, [FromBody] RouteStation routeStation)
        {
            throw new Exception("Not implemented");

        }
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

    }
}
