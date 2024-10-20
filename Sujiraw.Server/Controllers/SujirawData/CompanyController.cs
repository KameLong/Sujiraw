using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiraw.Data;

namespace Sujiraw.Server.Controllers.SujirawData
{
    [Route("api/[controller]")]
    [ApiController]
    //    [Authorize]

    public class CompanyController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : SujiroAPIController(hubContext,configuration)
    {
        [HttpGet("get/{companyID}")]
        public ActionResult GetCompany(long companyID)
        {
            string connectionString = Configuration["ConnectionStrings:postgres"]!;
            using var service = new PostgresDbService(connectionString);
                var company = service.GetCompany(companyID);
                if (company == null)
                {
                    return NotFound();
                }
                return Ok(company);
        }
        [HttpGet("getAll")]
        public ActionResult GetAllCompany()
        {
            try
            {
                string connectionString = Configuration["ConnectionStrings:postgres"]!;
                using var service = new PostgresDbService(connectionString);
                    var companies = service.GetAllCompany();
                    return Ok(companies);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }


        }

        [HttpDelete("{companyID}")]

        public ActionResult DeleteCompany(long companyID)
        {
            string connectionString = Configuration["ConnectionStrings:postgres"]!;
            using var service = new PostgresDbService(connectionString);
                var result = service.DeleteCompany(companyID);
                switch(result)
                {
                    case DeleteResult.SUCCESS:
                        return Ok();
                    case DeleteResult.NOT_FOUND:
                        return NotFound();
                    case DeleteResult.DELETE_ERROR:
                        return BadRequest();
                    default:
                        return BadRequest();
                }
            
        }


        //[HttpPut]
        //public async Task<ActionResult> PutCompany(Company company)
        //{
        //    try
        //    {

        //        string dbPath = Configuration["ConnectionStrings:DBdir"] + MasterData.MASTER_DATA_FILE;
        //        string? userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        //        if (userId == null)
        //        {
        //            return Unauthorized();
        //        }

        //        using (var conn = new SqliteConnection("Data Source=" + dbPath))
        //        {
        //            conn.Open();

        //            var command = conn.CreateCommand();
        //            command.CommandText = $"SELECT count(*) FROM {Data.User.TABLE_NAME} where userID=:userID";
        //            command.Parameters.Add(new SqliteParameter(":userID", AuthService.GetUserID(User)));
        //            if ((long)command.ExecuteScalar() == 0)
        //            {
        //                return Unauthorized();
        //            }
        //        }

        //        Company? oldCompany = Company.GetCompany(dbPath, company.CompanyID);
        //        if (oldCompany == null)
        //        {
        //            //新規追加
        //            Company.InsertCompany(dbPath, company);
        //            CompanySqlite.CreateCompanySqlite(Configuration["ConnectionStrings:DBdir"], company.CompanyID);
        //            return Created();
        //        }
        //        if (oldCompany.UserID != userId)
        //        {
        //            //すでに違う人が作成している。
        //            return Forbid();
        //        }
        //        //新しい情報で更新する。
        //        Company.UpdateCompany(dbPath, company);
        //        return Ok();

        //    }
        //    catch (Exception ex)
        //    {
        //        Debug.WriteLine(ex);
        //        return BadRequest(ex.Message);

        //    }



        //}
    }
}
