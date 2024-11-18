using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Data;
using Sujiraw.Server.SignalR;
using Route = Sujiraw.Data.Route;

namespace Sujiraw.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImportController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : SujiroAPIController(hubContext, configuration)
    {

        public class CompanyJson
        {
            public string name { get; set; } = "";
            public long companyID { get; set; } = 0;
            public Dictionary<long, JsonStation> stations { get; set; } = new Dictionary<long, JsonStation>();
            public Dictionary<long, JsonTrainType> trainTypes { get; set; } = new Dictionary<long, JsonTrainType>();
            public Dictionary<long, JsonTrain> trains { get; set; } = new Dictionary<long, JsonTrain>();
        }
        [HttpPost("Company")]
        public async Task<ActionResult> ImportCompany(CompanyJson companyJSON)
        {
            try
            {
                using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
                var company = new Company();
                company.CompanyID = companyJSON.companyID;
                company.Name = companyJSON.name;
                service.InsertCompany(new List<Company> { company });
                service.InsertStation(companyJSON.stations.Values.Select(station =>station.GetStation(company.CompanyID)).ToList());
                service.InsertTrainType(companyJSON.trainTypes.Values.Select(trainType =>trainType.GetTrainType(company.CompanyID)).ToList());
                service.InsertTrain(companyJSON.trains.Values.Select(train =>train.GetTrain()).ToList());
                return Ok();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost("Route/{companyID}")]
        public async Task<ActionResult> ImportRoute(long companyID,JsonRoute routeJSON)
        {
            try
            {
                using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
                var route = new Route(companyID);
                route.RouteID = routeJSON.routeID;
                route.Name = routeJSON.name;

                var routeStations = routeJSON.routeStations.Select((station, index) =>station.GetRouteStation()).ToList();
                var downtrips = routeJSON.downTrips.Select(trip => {
                    var res = trip.GetTrip();
                    res.Direction = 0;
                    var startStation = trip.times.FindIndex(st => st.stopType > 0);
                    var endStation = trip.times.FindLastIndex(st => st.stopType > 0);
                    res.AriStationID = routeStations[endStation].StationID;
                    res.DepStationID = routeStations[startStation].StationID;
                    res.AriTime = trip.times[endStation].ariTime;
                    if (res.AriTime < 0)
                    {
                        res.AriTime = trip.times[endStation].depTime;
                    }
                    res.DepTime = trip.times[startStation].depTime;
                    if (res.DepTime < 0)
                    {
                        res.DepTime = trip.times[startStation].ariTime;
                    }
                    return res;
                }).ToList();
                var uptrips = routeJSON.upTrips.Select(trip =>
                {
                    var res = trip.GetTrip();
                    res.Direction = 1;
                    var startStation = trip.times.FindLastIndex(st => st.stopType > 0);
                    var endStation = trip.times.FindIndex(st => st.stopType > 0);
                    res.AriStationID = routeStations[endStation].StationID;
                    res.DepStationID = routeStations[startStation].StationID;
                    res.AriTime = trip.times[endStation].ariTime;
                    if (res.AriTime < 0)
                    {
                        res.AriTime = trip.times[endStation].depTime;
                    }
                    res.DepTime = trip.times[startStation].depTime;
                    if (res.DepTime < 0)
                    {
                        res.DepTime = trip.times[startStation].ariTime;
                    }
                    return res;
                }).ToList();


                var downStopTimes = routeJSON.downTrips.SelectMany(trip => trip.times.Select((stopTime,i) =>
                {
                    var res = stopTime.GetStopTime();
                    res.Sequence = i;
                    return res;
                })).ToList();
                var upStopTimes = routeJSON.upTrips.SelectMany(trip => trip.times.Select((stopTime,i) => 
                {
                    var res = stopTime.GetStopTime();
                    res.Sequence = i;
                    return res;
                })).ToList();

                service.InsertRoute(new List<Route> { route });
                service.InsertRouteStation(routeStations);
                service.InsertTrip(downtrips);
                service.InsertTrip(uptrips);
                service.InsertStopTime(downStopTimes);
                service.InsertStopTime(upStopTimes);





                return Ok();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


    }
}
