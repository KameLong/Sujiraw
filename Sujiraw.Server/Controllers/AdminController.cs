using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiro.Data;
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
//            SqliteConnection.ClearAllPools();
            

//            var DBdir = Configuration["ConnectionStrings:DBdir"];
//            Directory.GetFiles(DBdir).ToList().ForEach(System.IO.File.Delete);
//            MasterData.CreateMasterData(DBdir);
//            Company company = new Company();
//            company.Name = "宝塚";
//            company.UserID = "gVjRyIhAC6d3bRZj1ZKblHhRpCf1";
//            company.CompanyID = 1;
////            Company.InsertCompany(DBdir + MasterData.MASTER_DATA_FILE, company);
//            //CompanySqlite.CreateCompanySqlite(DBdir, company.CompanyID);
//            await OuDia.OuDia2Sujiro.OuDia2Sujiraw(@"C:\Users\kamelong\Downloads\阪急宝塚線.oud", DBdir + $"company_1.sqlite", 1);
            return 0;
        }
    }
}
