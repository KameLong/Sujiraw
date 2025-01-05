using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiraw.Data.Entity;

namespace Sujiraw.Server.Controllers.SujirawData
{
    [Route("api/[controller]")]
    [ApiController]
    //    [Authorize]

    public class CompanyController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : SujiroAPIController(hubContext,configuration)
    {
        [HttpGet("{companyID}")]
        public ActionResult GetCompany(long companyID)
        {
            using var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            var company = service.Company.Find(companyID);
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
                using var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
                var companies = service.Company.ToList();
                return Ok(companies);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }


        }
        public void _DeleteCompany(long companyID)
        {
            using var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            //Delete StopTime
            var deleteStopTime = from stopTime in service.StopTime
                                 join trip in service.Trip on stopTime.TripId equals trip.TripId
                                 join route in service.Route on trip.RouteId equals route.RouteId
                                 where route.CompanyId == companyID
                                 select stopTime;
            service.StopTime.RemoveRange(deleteStopTime);
            //Delete Trip
            var deleteTrip = from trip in service.Trip
                             join route in service.Route on trip.RouteId equals route.RouteId
                             where route.CompanyId == companyID
                             select trip;
            service.Trip.RemoveRange(deleteTrip);
            //Delete RouteStation
            var deleteRouteStation = from routeStation in service.RouteStation
                                     join route in service.Route on routeStation.RouteId equals route.RouteId
                                     where route.CompanyId == companyID
                                     select routeStation;
            service.RouteStation.RemoveRange(deleteRouteStation);
            //Delete Route
            var deleteRoute = from route in service.Route
                              where route.CompanyId == companyID
                              select route;
            service.Route.RemoveRange(deleteRoute);
            //Delete Station
            var deleteStation = from station in service.Station
                                where station.CompanyId == companyID
                                select station;
            service.Station.RemoveRange(deleteStation);
            //Delete TrainType
            var deleteTrainType = from trainType in service.TrainType
                                  where trainType.CompanyId == companyID
                                  select trainType;
            service.TrainType.RemoveRange(deleteTrainType);
            //Delete Company
            var deleteCompany = from company in service.Company
                                where company.CompanyId == companyID
                                select company;
            service.Company.RemoveRange(deleteCompany);
            service.SaveChanges();

        }

        [HttpDelete("{companyID}")]

        public ActionResult DeleteCompany(long companyID)
        {
            _DeleteCompany(companyID);
            return Ok();


        }

    }
}
