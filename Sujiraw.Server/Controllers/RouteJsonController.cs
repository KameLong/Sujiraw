using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiraw.Data;
using Npgsql;

namespace Sujiraw.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RouteJsonController : SujiroAPIController
    {
        public RouteJsonController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }

        [HttpGet("RouteTimeTableData/{companyID}/{routeID}")]
        public ActionResult GetRouteTimeTableData(long companyID, long routeID)
        {
            try
            {
                var result = new TimeTableData();

                using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
                result.Stations = service.GetStationByCompany(companyID).ToDictionary(item => item.StationID, item =>
                {
                    var station = new JsonStation();
                    station.stationID = item.StationID;
                    station.name = item.Name;
                    station.lat = item.Lat;
                    station.lon = item.Lon;
                    return station;
                });
                result.TrainTypes = service.GetTrainTypeByCompany(companyID).ToDictionary(item => item.TrainTypeID, item =>
                {
                    var trainType = new JsonTrainType();
                    trainType.trainTypeID = item.TrainTypeID;
                    trainType.name = item.Name;
                    trainType.color = item.Color;
                    trainType.shortName = item.ShortName;
                    return trainType;
                });
                result.Routes = service.GetRouteByCompany(companyID).ToDictionary(item => item.RouteID, item =>
                {
                    var route = new JsonRoute();
                    route.routeID = item.RouteID;
                    route.name = item.Name;
                    route.routeStations = service.GetRouteStationByRoute(item.RouteID).Select(rs =>
                    {
                        return new JsonRouteStation()
                        {
                            rsID = rs.RouteStationID,
                            routeID = rs.RouteID,
                            stationIndex = rs.Sequence,
                            stationID = rs.StationID,
                            showStyle = rs.ShowStyle,
                        };
                    }).ToList();
                    return route;
                });

                result.Trains = service.GetTrainByCompany(companyID).ToDictionary(item => item.TrainID, item =>
                {
                    var train = new JsonTrain();
                    train.trainID = item.TrainID;
                    train.depStationID = item.DepStationID;
                    train.ariStationID = item.AriStationID;
                    train.depTime = item.DepTime;
                    train.ariTime = item.AriTime;
                    return train;
                });

                using (var command = service.Command)
                {

                    command.CommandText = "select trip.* from trip where RouteID=:routeID";
                    command.Parameters.Add(new NpgsqlParameter("routeID", routeID));
                    using var reader = command.ExecuteReader();
                    while (reader.Read())
                    {
                        var t = new Trip(reader);

                        var trip = new JsonTrip();
                        trip.tripID = t.TripID;
                        trip.routeID = t.RouteID;
                        trip.trainID = t.TrainID;
                        trip.trainTypeID = t.TrainTypeID;
                        trip.direction = t.Direction;
                        trip.times = new List<JsonStopTime>();

                        result.Trips[trip.tripID] = trip;
                    }
                }

                using (var timeCommand = service.CreateCommand())
                {
                    timeCommand.CommandText =
                        "select stoptime.* from stoptime " +
                        "left join trip on trip.tripID = stoptime.tripID " +
                        "where trip.routeID=:routeID";
                        timeCommand.Parameters.Add(new NpgsqlParameter("routeID", routeID));
                    using var timeReader = timeCommand.ExecuteReader();
                    while (timeReader.Read())
                    {
                        var st = new StopTime(timeReader);
                        var stopTime = new JsonStopTime();
                        stopTime.tripID = st.TripID;
                        stopTime.ariTime = st.AriTime;
                        stopTime.depTime = st.DepTime;
                        stopTime.stopType = st.StopType;
                        stopTime.rsID = result.Routes[result.Trips[st.TripID].routeID].routeStations[st.Sequence].rsID;

                        result.Trips[stopTime.tripID].times.Add(stopTime);
                    }
                }

                result.TimeTable.TimetableStations = service.GetRouteStationByRoute(routeID).Select(item =>
                {
                    return new JsonTimeTableStation(item);
                }).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);

            }




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