using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sujiraw.Data.Common;
using Sujiraw.Data;
using Sujiraw.Data.Action;
using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using System.ComponentModel.Design;
using Npgsql;

namespace Sujiraw.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeTableJsonController :  SujiroAPIController
    {
        public TimeTableJsonController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }

        [HttpPut("{timetableID}")]
        public ActionResult PutTimeTable(long timetableID, TimeTableJson timetable)
        {
            using (var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!))
            {
                Stopwatch sw = new Stopwatch();
                sw.Start();
                try
                {
                    service.BeginTransaction();
                    service.DeleteTimeTable(timetable.TimeTableID);

                    service.InsertTimeTable(new List<TimeTable>{new TimeTable(timetable.CompanyID) {
                        CompanyID = timetable.CompanyID,
                        TimeTableID=timetable.TimeTableID,
                        Name = timetable.Name
                    } });
                    service.InsertTimeTableStation(
                        timetable.TimetableStations.Select((item,i) =>
                        {
                            return new TimeTableStation(timetableID)
                            {
                                TimeTableID = timetable.TimeTableID,
                                AriRouteStationID = item.AriRouteStationID,
                                DepRouteStationID = item.DepRouteStationID,
                                Sequence=i,
                                ShowStyle = item.ShowStyle,
                            };
                        }).ToList());
                    service.Commit();
                    Debug.WriteLine("Commit " + sw.ElapsedMilliseconds);
                    return Ok(timetable.TimeTableID);
                }
                catch (Exception ex)
                {
                    service.Rollback();
                    return BadRequest(ex.Message);
                }
            }
        }
        [HttpGet("{timetableID}")]
        public ActionResult GetTimeTable(long timetableID)
        {
            using (var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!))
            {
                Stopwatch sw = new Stopwatch();
                sw.Start();
                try
                {
                    service.BeginTransaction();
                    var timetable=service.GetTimeTable(timetableID);
                    service.Commit();
                    Debug.WriteLine("Commit " + sw.ElapsedMilliseconds);
                    var timetableJson = new TimeTableJson()
                    {
                        CompanyID = timetable.CompanyID,
                        Name = timetable.Name,
                        TimeTableID = timetable.TimeTableID,
                        TimetableStations = service.GetTimeTableStationByTimeTable(timetableID).Select(item =>
                        {
                            return new TimeTableStationJson()
                            {
                                AriRouteStationID = item.AriRouteStationID,
                                DepRouteStationID = item.DepRouteStationID,
                                ShowStyle = item.ShowStyle,
                                Main = false
                            };
                        }).ToList()
                    };

                    return Ok(timetableJson);
                }
                catch (Exception ex)
                {
                    service.Rollback();
                    return BadRequest(ex.Message);
                }
            }
        }
        [HttpGet("data/{timetableID}")]
        public ActionResult GetTimeTableData(long timetableID)
        {
            try
            {
                var sw = new Stopwatch();
                sw.Start();
                var result=new TimeTableData();

                using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
                var timetable= service.GetTimeTable(timetableID);
                var timetableStation = service.GetTimeTableStationByTimeTable(timetableID);
                result.Stations = service.GetStationByCompany(timetable.CompanyID).ToDictionary(item => item.StationID, item =>
                {
                    var station = new JsonStation();
                    station.stationID = item.StationID;
                    station.name = item.Name;
                    station.lat = item.Lat;
                    station.lon = item.Lon;
                    return station;
                });
                result.TrainTypes=service.GetTrainTypeByCompany(timetable.CompanyID).ToDictionary(item => item.TrainTypeID, item =>
                {
                    var trainType = new JsonTrainType();
                    trainType.trainTypeID = item.TrainTypeID;
                    trainType.name = item.Name;
                    return trainType;
                });
                result.Routes = service.GetRouteByCompany(timetable.CompanyID).ToDictionary(item => item.RouteID, item =>
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

                result.Trains= service.GetTrainByCompany(timetable.CompanyID).ToDictionary(item => item.TrainID, item =>
                {
                    var train = new JsonTrain();
                    train.trainID = item.TrainID;
                    train.depStationID = item.DepStationID;
                    train.ariStationID = item.AriStationID;
                    train.depTime = item.DepTime;
                    train.ariTime = item.AriTime;
                    return train;
                });
                Debug.WriteLine("157 "+sw.ElapsedMilliseconds);

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

                        result.TripTypes[trip.tripID] = trip;
                    }
                }
                Debug.WriteLine("180 " + sw.ElapsedMilliseconds);

                using var timeCommand = service.CreateCommand();
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
                   
                    result.TripTypes[stopTime.tripID].times.Add(stopTime);
                }
                Debug.WriteLine("196 " + sw.ElapsedMilliseconds);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);

            }

        }


    }

    //public class  TimeTableTrip
    //{
    //    public long TripID { get; set; }
    //    public long TrainID { get; set; }
    //    public long TrainTypeID { get; set; }
    //    public int Direction { get; set; }
    //    public List<TimeTableStopTime> Times { get; set; }

    //}

    public class TimeTableData
    {
        public Dictionary<long, JsonStation> Stations { get; set; }= new Dictionary<long, JsonStation>();
        public Dictionary<long, JsonTrainType> TrainTypes { get; set; }= new Dictionary<long, JsonTrainType>();
        public Dictionary<long, JsonRoute> Routes { get; set; } = new Dictionary<long, JsonRoute>();

        public Dictionary<long,JsonTrain> Trains { get; set; } = new Dictionary<long, JsonTrain>();
        public Dictionary<long,JsonTrip>  TripTypes { get; set; } = new Dictionary<long, JsonTrip>();

    }



    public class TimeTableJson
    {
        public long TimeTableID { get; set; }
        public long CompanyID { get; set; }
        public string Name { get; set; } = "";
        public List<TimeTableStationJson> TimetableStations { get; set; } = new List<TimeTableStationJson>();

    }

    public class TimeTableStationJson
    {
        public long AriRouteStationID { get; set; }
        public long DepRouteStationID { get; set; }
        public int ShowStyle { get; set; }
        public bool Main { get; set; }
    }
}
