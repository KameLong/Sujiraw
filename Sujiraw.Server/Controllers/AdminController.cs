using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Data;
using System.Diagnostics;
using Sujiraw.Server.SignalR;
namespace Sujiraw.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController :SujiroAPIController
    {
        public AdminController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }
        [HttpGet("Reset")]
        public async Task<int> Get()
        {
            Debug.WriteLine("Reset");
            return 0;
        }
    }
}
