using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Sujiraw.Server.SignalR;
using Npgsql;
using Sujiraw.Data.Entity;

namespace Sujiraw.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeTableJsonController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) :  SujiroAPIController(hubContext, configuration)
    {
        [HttpDelete("{timetableID}")]
        public ActionResult DeleteTimeTable(long timetableID)
        {
            using var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            service.TimeTable.RemoveRange(service.TimeTable.Where(item=>item.TimeTableID==timetableID));
            service.TimeTableStation.RemoveRange(service.TimeTableStation.Where(item => item.TimeTableID == timetableID));
            service.SaveChanges();
            return Ok();

        }


            [HttpPut("{timetableID}")]
        public ActionResult PutTimeTable(long timetableID, JsonTimeTable timetable)
        {
            using var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            Stopwatch sw = new Stopwatch();
            sw.Start();
            try
            {
                service.TimeTable.Add(
                    new TimeTable()
                    {
                        CompanyID = timetable.CompanyID,
                        TimeTableID = timetable.TimeTableID,
                        Name = timetable.Name
                    });
                service.TimeTableStation.AddRange(
                    timetable.TimetableStations.Select((item, i) =>
                    {
                        return new TimeTableStation()
                        {
                            TimeTableID = timetable.TimeTableID,
                            AriRouteStationID = item.AriRouteStationID,
                            DepRouteStationID = item.DepRouteStationID,
                            Sequence = i,
                            ShowStyle = item.ShowStyle,
                        };
                    }).ToList());
                service.SaveChanges();
                Debug.WriteLine("Commit " + sw.ElapsedMilliseconds);
                return Ok(timetable.TimeTableID);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{timetableID}")]
        public ActionResult GetTimeTable(long timetableID)
        {
            using var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            Stopwatch sw = new Stopwatch();
            sw.Start();
            try
            {
                var timetable = service.TimeTable.Where(item => item.TimeTableID == timetableID).First();
                Debug.WriteLine("Commit " + sw.ElapsedMilliseconds);
                var timetableJson = new JsonTimeTable()
                {
                    CompanyID = timetable.CompanyID,
                    Name = timetable.Name,
                    TimeTableID = timetable.TimeTableID,
                    TimetableStations = service.TimeTableStation.Where(item => item.TimeTableID == timetableID).ToList()
                    .Select(item =>
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

            var service = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
            
            var timetable= service.TimeTable
                .Include(t=>t.TimeTableStations)
                
                .FirstOrDefault(item=>item.TimeTableID==timetableID);
            if(timetable==null)
            {
                return NotFound();
            }
            result.Stations = service.Station.Where(s=>s.CompanyId==timetable.CompanyID)
                .ToDictionary(item => item.StationId, item =>
            {
                var station = new JsonStation();
                station.stationID = item.StationId;
                station.name = item.Name;
                station.lat = item.Lat;
                station.lon = item.Lon;
                return station;
            });
            result.TrainTypes=service.TrainType.Where(tt=>tt.CompanyId==timetable.CompanyID)
                .ToDictionary(item => item.TrainTypeId, item =>
            {
                var trainType = new JsonTrainType();
                trainType.trainTypeID = item.TrainTypeId;
                trainType.name = item.Name;
                trainType.color = item.Color;
                trainType.shortName = item.ShortName;
                return trainType;
            });

            Debug.WriteLine("140 " + sw.ElapsedMilliseconds);

            var routes = service.Route
                .Where(r => r.CompanyId == timetable.CompanyID)
                .Include(r => r.RouteStations)
                .Include(r => r.Trips);
            Debug.WriteLine("146 " + sw.ElapsedMilliseconds);

            var st = service.StopTime.Join(
                    service.Trip,
                    st => st.TripId,
                    t => t.TripId,
                    (st, t) => new { st, t.RouteId }
                ).Join(
                    service.Route,
                    stt => stt.RouteId,
                    r => r.RouteId,
                    (str, r) => new { str.st, r.CompanyId }
                ).Where(item => item.CompanyId == timetable.CompanyID).Join(
                    service.RouteStation,
                    stt => stt.st.RouteStationId,
                    rs => rs.RouteStationId,
                    (stt, rs) => new { stt.st, rs.Sequence }
                )
                .GroupBy(item => item.st.TripId)
                .ToDictionary(item => item.Key,
                    item => item.OrderBy(st => st.Sequence).Select(st => st.st));
            Debug.WriteLine("167 " + sw.ElapsedMilliseconds);

            var routes2 = routes.ToList();

            Debug.WriteLine("167 " + sw.ElapsedMilliseconds);

            result.Routes = routes2
                .ToDictionary(item => item.RouteId, item =>
            {
                var route = new JsonRoute();
                route.routeID = item.RouteId;
                route.name = item.Name;
                route.routeStations = item.RouteStations.OrderBy(item=>item.Sequence).Select(rs =>
                {
                    return new JsonRouteStation(rs);
                }).ToList();
                route.downTrips = item.Trips.Where(t=>t.Direction==0).Select(t =>
                {
                    t.StopTimes=st[t.TripId].ToList();
                    return new JsonTrip(t);
                }).ToList();
                route.upTrips = item.Trips.Where(t=>t.Direction==1).Select(t =>
                {
                    t.StopTimes=st[t.TripId].ToList();
                    return new JsonTrip(t);
                }).ToList();
                return route;
            });
            Debug.WriteLine("191 " + sw.ElapsedMilliseconds);

            result.Trains= service.Train.Where(t=>t.CompanyId==timetable.CompanyID)
                .ToDictionary(item => item.TrainId, item =>
            {
                var train = new JsonTrain();
                train.trainID = item.TrainId;
                train.depStationID = item.DepStationId;
                train.ariStationID = item.AriStationId;
                train.depTime = item.DepTime;
                train.ariTime = item.AriTime;
                return train;
            });

            // using (var command = service.Command)
            // {
            //
            //     command.CommandText = "select trip.* from trip left join route on route.routeID = trip.routeID left join (select routeID,routestationid from timetablestation left join routestation on routestation.routestationid = timetablestation.depRouteStationID and timetablestation.timetableID=@timetableID) as A on A.routeID=route.routeID where A.routeID is not null";
            //     command.Parameters.Add(new NpgsqlParameter("timetableID", timetableID));
            //     using var reader = command.ExecuteReader();
            //     while (reader.Read())
            //     {
            //         var t = new Trip(reader);
            //
            //         var trip = new JsonTrip();
            //         trip.tripID = t.TripID;
            //         trip.routeID = t.RouteID;
            //         trip.trainID = t.TrainID;
            //         trip.trainTypeID = t.TrainTypeID;
            //         trip.direction = t.Direction;
            //         trip.times = new List<JsonStopTime>();
            //
            //         result.Trips[trip.tripID] = trip;
            //     }
            // }
            //
            // using (var timeCommand = service.CreateCommand())
            // {
            //     timeCommand.CommandText = "select stoptime.* from stoptime left join trip on trip.tripID = stoptime.tripID left join route on route.routeID = trip.routeID join (select routeID from timetablestation left join routestation on routestation.routestationid = timetablestation.depRouteStationID and timetablestation.timetableID=@timetableID group by routeid) as A on A.routeID=route.routeID where A.routeID is not null order by sequence";
            //     timeCommand.Parameters.Add(new NpgsqlParameter("timetableID", timetableID));
            //     using var timeReader = timeCommand.ExecuteReader();
            //     while (timeReader.Read())
            //     {
            //         var st = new StopTime(timeReader);
            //         var stopTime = new JsonStopTime();
            //         stopTime.tripID = st.TripID;
            //         stopTime.ariTime = st.AriTime;
            //         stopTime.depTime = st.DepTime;
            //         stopTime.stopType = st.StopType;
            //         stopTime.rsID= result.Routes[result.Trips[st.TripID].routeID].routeStations[st.Sequence].rsID;
            //
            //         result.Trips[stopTime.tripID].times.Add(stopTime);
            //     }
            // }
            //
            result.TimeTable=new JsonTimeTable(
                timetable
            );
            result.TimeTable.TimetableStations=timetable.TimeTableStations.Select(item =>
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


    }
}
