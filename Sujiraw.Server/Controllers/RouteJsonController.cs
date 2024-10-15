using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiro.Data;

namespace Sujiraw.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RouteJsonController : SujiroAPIController
    {
        public RouteJsonController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }


        [HttpGet("{companyID}/{routeID}")]
        public ActionResult GetRoute(long companyID, long routeID)
        {
            try
            {

                JsonRoute jsonRoute = new JsonRoute();
                using (var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!))
                {
                    var route = service.GetRoute(routeID);
                    if (route == null)
                    {
                        return NotFound();
                    }
                    jsonRoute.name = route.Name;
                    jsonRoute.routeID = route.RouteID;
                    jsonRoute.routeStations = service.GetRouteStationByRoute(routeID).Select(item =>
                    {
                        var jsonRoueStation = new JsonRouteStation();
                        jsonRoueStation.routeID = item.RouteID;
                        jsonRoueStation.rsID = item.RouteStationID;
                        jsonRoueStation.stationID = item.StationID;
                        jsonRoueStation.stationIndex = item.Sequence;
                        jsonRoueStation.showStyle = item.ShowStyle;
                        return jsonRoueStation;
                    }).ToList();
                    var st = service.GetStopTimeFromRoute(routeID);
                    jsonRoute.downTrips = service.GetTripByRoute(routeID, 0).Select(item =>
                    {
                        var jsonTrip = new JsonTrip();
                        jsonTrip.tripID = item.TripID;
                        jsonTrip.direction = item.Direction;
                        jsonTrip.routeID = item.RouteID;
                        jsonTrip.trainID = item.TrainID;
                        jsonTrip.trainTypeID = item.TrainTypeID;

                        jsonTrip.times = st[item.TripID].Select(st =>
                        {
                            var jsonTime = new JsonStopTime();
                            jsonTime.rsID = jsonRoute.routeStations[st.Sequence].rsID;
                            jsonTime.tripID = st.TripID;
                            jsonTime.ariTime = st.AriTime;
                            jsonTime.depTime = st.DepTime;
                            jsonTime.stopType = st.StopType;
                            return jsonTime;
                        }).ToList();
                        return jsonTrip;
                    }).ToList();
                    jsonRoute.upTrips = service.GetTripByRoute(routeID, 1).Select(item =>
                        {
                            var jsonTrip = new JsonTrip();
                            jsonTrip.tripID = item.TripID;
                            jsonTrip.direction = item.Direction;
                            jsonTrip.routeID = item.RouteID;
                            jsonTrip.trainID = item.TrainID;
                            jsonTrip.trainTypeID = item.TrainTypeID;

                            jsonTrip.times = st[item.TripID].Select(st =>
                            {
                                var jsonTime = new JsonStopTime();
                                jsonTime.rsID = jsonRoute.routeStations[st.Sequence].rsID;
                                jsonTime.tripID = st.TripID;
                                jsonTime.ariTime = st.AriTime;
                                jsonTime.depTime = st.DepTime;
                                jsonTime.stopType = st.StopType;
                                return jsonTime;
                            }).ToList();
                            return jsonTrip;
                        }).ToList();
                    return Ok(jsonRoute);
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

        }

    }
}