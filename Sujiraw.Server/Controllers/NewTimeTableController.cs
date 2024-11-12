﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Npgsql;
using Sujiraw.Data;
using Sujiraw.Server.SignalR;

namespace Sujiraw.Server.Controllers
{
    /**
     *Routeの時刻表もTimeTableの時刻表も両方同格に扱います。
     */

    [Route("api/[controller]")]
    [ApiController]
    public class NewTimeTableController : SujiroAPIController
    {
        public NewTimeTableController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }

        [HttpGet("TimeTable/{timetableID}")]
        public ActionResult GetTimeTableData(long timetableID)
        {
            var result = new TimeTableDataDTO();
            try
            {
                using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
                var timetable = service.GetTimeTable(timetableID);
                if (timetable == null)
                {
                    return NotFound();
                }
                result.Stations = service.GetStationByCompany(timetable.CompanyID)
                    .ToDictionary(item => item.StationID, item => new JsonStation(item));

                result.TrainTypes = service.GetTrainTypeByCompany(timetable.CompanyID)
                    .ToDictionary(item => item.TrainTypeID, item => new JsonTrainType(item));

                result.Routes = service.GetRouteByCompany(timetable.CompanyID).ToDictionary(item => item.RouteID, item =>
                {
                    var route = new JsonRoute(item);
                    route.routeStations = service.GetRouteStationByRoute(item.RouteID)
                        .Select(rs => new JsonRouteStation(rs)).ToList();
                    return route;
                });

                result.Trains = service.GetTrainByCompany(timetable.CompanyID)
                    .ToDictionary(item => item.TrainID, item => new JsonTrain(item));

                using (var command = service.Command)
                {

                    command.CommandText = "select trip.* from trip left join route on route.routeID = trip.routeID left join (select routeID,routestationid from timetablestation left join routestation on routestation.routestationid = timetablestation.depRouteStationID and timetablestation.timetableID=@timetableID) as A on A.routeID=route.routeID where A.routeID is not null";
                    command.Parameters.Add(new NpgsqlParameter("timetableID", timetableID));
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
                    timeCommand.CommandText = "select stoptime.* from stoptime left join trip on trip.tripID = stoptime.tripID left join route on route.routeID = trip.routeID join (select routeID from timetablestation left join routestation on routestation.routestationid = timetablestation.depRouteStationID and timetablestation.timetableID=@timetableID group by routeid) as A on A.routeID=route.routeID where A.routeID is not null order by sequence";
                    timeCommand.Parameters.Add(new NpgsqlParameter("timetableID", timetableID));
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

                result.TimeTable = new JsonTimeTable(
                    service.GetTimeTable(timetableID)
                );
                result.TimeTable.TimetableStations = service.GetTimeTableStationByTimeTable(timetableID).Select(item =>
                {
                    return new JsonTimeTableStation(item);
                }).ToList();

                result.ShowStations = result.TimeTable.TimetableStations.Select(item => new ShowStationDTO(item)).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
        [HttpGet("Route/{routeID}")]
        public ActionResult GetRouteTimeTableData(long routeID)
        {
            var result = new TimeTableDataDTO();
            try
            {
                using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
                var route = service.GetRoute(routeID);
                if (route == null)
                {
                    return NotFound();
                }
                result.Stations = service.GetStationByCompany(route.CompanyID)
                    .ToDictionary(item => item.StationID, item => new JsonStation(item));

                result.TrainTypes = service.GetTrainTypeByCompany(route.CompanyID)
                    .ToDictionary(item => item.TrainTypeID, item => new JsonTrainType(item));

                result.Routes = service.GetRouteByCompany(route.CompanyID).ToDictionary(item => item.RouteID, item =>
                {
                    var route = new JsonRoute(item);
                    route.routeStations = service.GetRouteStationByRoute(item.RouteID)
                        .Select(rs => new JsonRouteStation(rs)).ToList();
                    return route;
                });

                result.Trains = service.GetTrainByCompany(route.CompanyID)
                    .ToDictionary(item => item.TrainID, item => new JsonTrain(item));
                var stopTimes = service.GetStopTimeFromRoute(routeID);

                result.Trips=service.GetTripByRoute(routeID).ToDictionary(item => item.TripID, item =>
                {
                    var trip = new JsonTrip(item);
                    trip.times = stopTimes[trip.tripID].Select(st=>new JsonStopTime(st)).ToList();
                    return trip;
                }
                );

                result.ShowStations = result.Routes[routeID].routeStations.Select(item => new ShowStationDTO(item)).ToList();
                result.ShowStations.First().AriRouteStationID = 0;
                result.ShowStations.Last().DepRouteStationID = 0;

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }

        }

        class TimeTableDataDTO
        {

            public Dictionary<long, JsonStation> Stations { get; set; }=new Dictionary<long, JsonStation>();
            public Dictionary<long, JsonTrainType> TrainTypes { get; set; }= new Dictionary<long, JsonTrainType>();
            public Dictionary<long, JsonRoute> Routes { get; set; } = new Dictionary<long, JsonRoute>();

            public JsonTimeTable TimeTable { get; set; }= new JsonTimeTable();


            public Dictionary<long, JsonTrain> Trains { get; set; } = new Dictionary<long, JsonTrain>();
            public Dictionary<long, JsonTrip> Trips { get; set; } = new Dictionary<long, JsonTrip>();

            

            public List<ShowStationDTO> ShowStations { get; set; } = new List<ShowStationDTO>();

            public TimeTableDataDTO() { }


        }
        class ShowStationDTO
        {
            public long AriRouteStationID { get; set; }
            public long DepRouteStationID { get; set; }
            public int ShowStyle { get; set; }
            public bool Main { get; set; }

            public ShowStationDTO()
            {

            }
            public ShowStationDTO(JsonTimeTableStation timeTableStation)
            {
                AriRouteStationID = timeTableStation.AriRouteStationID;
                DepRouteStationID = timeTableStation.DepRouteStationID;
                ShowStyle = timeTableStation.ShowStyle;
            }
            public ShowStationDTO(JsonRouteStation routeStation)
            {
                AriRouteStationID = routeStation.rsID;
                DepRouteStationID = routeStation.rsID;
                ShowStyle = routeStation.showStyle;
            }
        }

    }
}