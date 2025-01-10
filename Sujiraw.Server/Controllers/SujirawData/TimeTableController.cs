using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.Service.AuthService;
using Sujiraw.Server.SignalR;
using Sujiraw.Data;
using Sujiraw.Data.Entity;

namespace Sujiraw.Server.Controllers.SujirawData
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeTableController : SujiroAPIController
    {
        public TimeTableController(IHubContext<SujirawHub> hubContext, IConfiguration configuration):base(hubContext, configuration)
        {
        }
        [HttpGet]
        public ActionResult Get(long timetableId)
        {
            var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            var timetable = service.TimeTable.Find(timetableId);
            if (timetable != null)
            {
                return Ok(timetable);
            }
            return NotFound();
        }
        [HttpPost]
        public ActionResult Post(TimeTable timetable)
        {
            return Ok();
        }
        

        //[HttpGet]
        //public IEnumerable<Trip> Get(int direct)
        //{
        //    throw new Exception("Not implemented");
        //}
    }
}