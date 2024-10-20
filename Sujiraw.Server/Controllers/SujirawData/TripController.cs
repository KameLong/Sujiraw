using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.Service.AuthService;
using Sujiraw.Server.SignalR;
using Sujiraw.Data;

namespace Sujiraw.Server.Controllers.SujirawData
{
    [Route("api/[controller]")]
    [ApiController]
    public class TripController : ControllerBase
    {
        private readonly IConfiguration Configuration;
        private readonly IHubContext<SujirawHub> _hubContext;
        public TripController(IHubContext<SujirawHub> hubContext, IConfiguration configuration)
        {
            _hubContext = hubContext;
            Configuration = configuration;

        }

        [HttpGet]
        public IEnumerable<Trip> Get(int direct)
        {
            throw new Exception("Not implemented");
        }
    }
}
