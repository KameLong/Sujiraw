using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sujiraw.Data;

namespace Sujiraw.Server.Controllers.SujirawData
{



    [Route("api/[controller]")]
    [ApiController]
    public class TrainTypeController : ControllerBase
    {
        private readonly IConfiguration Configuration;
        public TrainTypeController(IConfiguration configuration)
        {
            Configuration = configuration;
        }

//        [HttpGet("{companyID}")]

        //public IEnumerable<TrainType> Get(long companyID)
        //{
        //    string dbpath = Configuration["ConnectionStrings:DBdir"] + "company_" + companyID + ".sqlite";
        //    var trainTypes = new List<TrainType>();
        //    using (var conn = new SqliteConnection("Data Source=" + dbpath))
        //    {
        //        conn.Open();
        //        var tran = conn.BeginTransaction();
        //        var command = conn.CreateCommand();

        //        command = conn.CreateCommand();
        //        command.CommandText = $"SELECT * FROM {TrainType.TABLE_NAME}";

        //        using (var reader = command.ExecuteReader())
        //        {
        //            while (reader.Read())
        //            {
        //                trainTypes.Add(new TrainType(reader));
        //            }
        //        }
        //    }
        //    return trainTypes;
        //}

    }
}
