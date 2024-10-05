using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;





namespace Sujiraw.Server.Controllers
{
    public class SujiroAPIController:ControllerBase
    {
            protected readonly IConfiguration Configuration;
            protected readonly IHubContext<SujirawHub> _hubContext;
            public SujiroAPIController(IHubContext<SujirawHub> hubContext, IConfiguration configuration)
            {
                _hubContext = hubContext;
                Configuration = configuration;
            }

        }
    }
