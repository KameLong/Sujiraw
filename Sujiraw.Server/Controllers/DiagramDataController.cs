namespace Sujiraw.Server.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Npgsql;
using Sujiraw.Data;
using Sujiraw.Data.Entity;
using Sujiraw.Server.SignalR;
using StopTime = Sujiraw.Data.StopTime;
using Trip = Sujiraw.Data.Trip;



/**
 *Routeの時刻表もTimeTableの時刻表も両方同格に扱います。
 */

[Route("api/[controller]")]
[ApiController]
public class DiagramDataController : SujiroAPIController
{
    public DiagramDataController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
    {
    }

    [HttpGet("RouteDiagram/{routeID}")]
    public ActionResult GetRouteDiagramData(long routeID)
    {
        var result = new DiagramDataDTO();
        try
        {
            
            var dbContext = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            var route = dbContext.Route.Find(routeID);
            if(route==null){
                return NotFound();
            }
            
            var companyId = route.CompanyId;
            result.Route = new JsonRoute(route);
            //routeStationnの取得
            result.Route.routeStations=dbContext.RouteStation.Where(rs => rs.RouteId == routeID)
                    .OrderBy(rs => rs.Sequence)
                    .Select(rs=>new JsonRouteStation(rs)).ToList();
            var stationIndex=result.Route.routeStations.ToDictionary(rs=>rs.rsID,rs=>result.Route.routeStations.IndexOf(rs));

            var stopTimes = dbContext.StopTime.Join(dbContext.Trip,
                    st => st.TripId,
                    trip => trip.TripId,
                    (st, trip) => new
                    {
                        st,
                        trip
                    }).Where(item => item.trip.RouteId == route.RouteId)
                .Select(item => item.st)
                .GroupBy(item => item.TripId)
                .ToDictionary(item=>item.Key,item=>item.OrderBy(item=>stationIndex[item.RouteStationId]).ToList());
            
            result.Route.downTrips = dbContext.Trip.Where(t => t.RouteId == routeID && t.Direction == 0).ToList()
                .Select(t =>
                {
                    var trip = new JsonTrip(t);
                    trip.times = stopTimes[t.TripId].Select(st => new JsonStopTime(st)).ToList();
                    return trip;

                }).ToList();
            result.Route.upTrips = dbContext.Trip.Where(t => t.RouteId == routeID && t.Direction == 1).ToList()
                .Select(t =>
                {
                    var trip = new JsonTrip(t);
                    trip.times = stopTimes[t.TripId].Select(st => new JsonStopTime(st)).ToList();
                    return trip;

                }).ToList();
            
            //stationの取得
            result.Stations = dbContext.Station.Where(item=>item.CompanyId==companyId)
                .ToDictionary(s => s.StationId, s => new JsonStation(s));
            //trainTypeの取得
            result.TrainTypes = dbContext.TrainType.Where(item=>item.CompanyId==companyId)
                .ToDictionary(t => t.TrainTypeId, t => new JsonTrainType(t));
            
            

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }

    public class DiagramDataDTO
    {
        public JsonRoute Route { get; set; } = new JsonRoute();
        public Dictionary<long,JsonStation> Stations { get; set; } = new Dictionary<long, JsonStation>();
        public Dictionary<long,JsonTrainType> TrainTypes { get; set; } = new Dictionary<long, JsonTrainType>();
        
        
        
    }

}
