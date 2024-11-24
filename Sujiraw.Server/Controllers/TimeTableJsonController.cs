using Microsoft.AspNetCore.Mvc;
using Sujiraw.Data;
using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Npgsql;

namespace Sujiraw.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeTableJsonController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) :  SujiroAPIController(hubContext, configuration)
    {
        [HttpDelete("{timetableID}")]
        public ActionResult DeleteTimeTable(long timetableID)
        {
            using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
            service.BeginTransaction();
            service.DeleteTimeTable(timetableID);
            service.Commit();
            return Ok();

        }


            [HttpPut("{timetableID}")]
        public ActionResult PutTimeTable(long timetableID, JsonTimeTable timetable)
        {
            using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
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
                    timetable.TimetableStations.Select((item, i) =>
                    {
                        return new TimeTableStation(timetableID)
                        {
                            TimeTableID = timetable.TimeTableID,
                            AriRouteStationID = item.AriRouteStationID,
                            DepRouteStationID = item.DepRouteStationID,
                            Sequence = i,
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
        [HttpGet("{timetableID}")]
        public ActionResult GetTimeTable(long timetableID)
        {
            using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
            Stopwatch sw = new Stopwatch();
            sw.Start();
            try
            {
                service.BeginTransaction();
                var timetable = service.GetTimeTable(timetableID);
                service.Commit();
                Debug.WriteLine("Commit " + sw.ElapsedMilliseconds);
                var timetableJson = new JsonTimeTable()
                {
                    CompanyID = timetable.CompanyID,
                    Name = timetable.Name,
                    TimeTableID = timetable.TimeTableID,
                    TimetableStations = service.GetTimeTableStationByTimeTable(timetableID).Select(item =>
                    {
                        return new JsonTimeTableStation()
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
                    trainType.color = item.Color;
                    trainType.shortName = item.ShortName;


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
                        stopTime.rsID= result.Routes[result.Trips[st.TripID].routeID].routeStations[st.Sequence].rsID;

                        result.Trips[stopTime.tripID].times.Add(stopTime);
                    }
                }
 
                result.TimeTable=new JsonTimeTable(
                    service.GetTimeTable(timetableID)
                );
                result.TimeTable.TimetableStations=service.GetTimeTableStationByTimeTable(timetableID).Select(item =>
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


    }


    /**
     * 時刻表を作成するために必要なデータです。
     */

    public class TimeTableData
    {
        public Dictionary<long, JsonStation> Stations { get; set; }= new Dictionary<long, JsonStation>();
        public Dictionary<long, JsonTrainType> TrainTypes { get; set; }= new Dictionary<long, JsonTrainType>();
        public Dictionary<long, JsonRoute> Routes { get; set; } = new Dictionary<long, JsonRoute>();

        public Dictionary<long,JsonTrain> Trains { get; set; } = new Dictionary<long, JsonTrain>();
        public Dictionary<long,JsonTrip>  Trips { get; set; } = new Dictionary<long, JsonTrip>();


        public JsonTimeTable TimeTable { get; set; } = new JsonTimeTable();

        public List<JsonTimeTableStation> TimetableStations { get; set; } = new List<JsonTimeTableStation>();

    }



    public class JsonTimeTable
    {
        public long TimeTableID { get; set; } = 0;
        public long CompanyID { get; set; } = 0;
        public string Name { get; set; } = "";

        public List<JsonTimeTableStation> TimetableStations { get; set; } = new List<JsonTimeTableStation>();

        public JsonTimeTable()
        {
        }
        public JsonTimeTable(TimeTable db)
        {
            TimeTableID = db.TimeTableID;
            CompanyID = db.CompanyID;
            Name = db.Name;
        }
    }

    public class JsonTimeTableInfo
    {
        public long RouteID { get; set; } = 0;
        public long TimeTableID { get; set; } = 0;
        public long CompanyID { get; set; } = 0;
        public string Name { get; set; } = "";

        public JsonTimeTableInfo()
        {
        }
        public JsonTimeTableInfo(TimeTable db)
        {
            TimeTableID = db.TimeTableID;
            CompanyID = db.CompanyID;
            Name = db.Name;
        }
    }

    public class JsonTimeTableStation
    {
        public long AriRouteStationID { get; set; }
        public long DepRouteStationID { get; set; }
        public int ShowStyle { get; set; }
        public bool Main { get; set; }

        public JsonTimeTableStation()
        {

        }
        public JsonTimeTableStation(TimeTableStation timeTableStation)
        {
            AriRouteStationID = timeTableStation.AriRouteStationID;
            DepRouteStationID = timeTableStation.DepRouteStationID;
            ShowStyle = timeTableStation.ShowStyle;
        }
        public JsonTimeTableStation(RouteStation routeStation)
        {
            AriRouteStationID = routeStation.RouteStationID;
            DepRouteStationID = routeStation.RouteStationID;
            ShowStyle = routeStation.ShowStyle;
        }
    }
}
