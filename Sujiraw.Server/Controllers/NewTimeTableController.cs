using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Npgsql;
using Sujiraw.Data;
using Sujiraw.Data.Entity;
using Sujiraw.Server.SignalR;
using StopTime = Sujiraw.Data.StopTime;
using Trip = Sujiraw.Data.Trip;

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

                //Route基準なので、Routeに関係ある列車だけ抽出します。
                result.Trains = service.GetTrainByRoute(route.CompanyID,route.RouteID)
                    .ToDictionary(item => item.TrainID, item => new JsonTrain(item));
                
                var stopTimes = service.GetStopTimeFromRoute(routeID);
                var trainTrip = service.GetTrainTripByRoute(routeID);
                result.Trains.Values.ToList().ForEach(train =>
                {
                    train.tripInfos = trainTrip[train.trainID].Select(trip => new JsonTripInfo(trip)).ToList();
                });

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
        [HttpGet("Route2/{routeID}")]
        public ActionResult GetRouteTimeTableData2(long routeID)
        {
            var result = new TimeTableDataDTO();
            try
            {
                var dbContext = new SujirawContext(Configuration["ConnectionStrings:postgres"]!);
                var route = dbContext.Route.Find(routeID);
                if (route == null)
                {
                    return NotFound();
                }
                result.Stations = dbContext.Station.Where(item => item.CompanyId == route.CompanyId)
                    .ToDictionary(item => item.StationId, item => new JsonStation(item));
                result.TrainTypes = dbContext.TrainType.Where(item => item.CompanyId == route.CompanyId)
                    .ToDictionary(item => item.TrainTypeId, item => new JsonTrainType(item));
                var routeStationInCompany = dbContext.RouteStation.Join(dbContext.Route,
                    rs => rs.RouteId,
                    route => route.RouteId,
                    (rs,route)=>new{
                        rs,
                        route})
                    .Where(item => item.route.CompanyId == route.CompanyId)
                    .Select(item=>item.rs)
                    .GroupBy(item=>item.RouteId)
                    .ToDictionary(item=>item.Key,item=>item.OrderBy(item=>item.Sequence).ToList());
                    

                result.Routes= dbContext.Route.Where(item => item.CompanyId == route.CompanyId).ToList().ToDictionary(item => item.RouteId, item =>
                {
                    var r = new JsonRoute(item);
                    r.routeStations = routeStationInCompany[item.RouteId].Select(rs => new JsonRouteStation(rs)).ToList();
                    return r;
                });
                result.Trains= dbContext.Train.Where(item => item.CompanyId == route.CompanyId)
                    .ToDictionary(item => item.TrainId, item => new JsonTrain(item));

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
                    .ToDictionary(item=>item.Key,item=>item.ToList());
                    
               
                var tripInTrain=dbContext.Trip.Join(dbContext.Route,trip=>trip.RouteId,route=>route.RouteId,(trip,route)=>new {trip,route})
                    .Where(item=>item.route.CompanyId==route.CompanyId)
                    .Select(item=>item.trip).GroupBy(item=>item.TrainId)
                    .ToDictionary(item=>item.Key,item=>item);
                result.Trains.Values.ToList().ForEach(train =>
                    {
                        train.tripInfos=tripInTrain[train.trainID].Select(trip=>new JsonTripInfo(trip)).ToList();
                    }
                );
                result.Trips=dbContext.Trip.Where(item => item.RouteId == route.RouteId).ToDictionary(item => item.TripId, item =>
                {
                    var trip = new JsonTrip(item);
                    trip.times=stopTimes[item.TripId].Select(st=>new JsonStopTime(st)).ToList();
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
            /**
             *<summary>
             *時刻表に表示されるべき駅のリストです。
             *下り時刻表で表示されるべき順番にしてください。
             *途中で分岐を含んでもOKです。
             *</summary>
             */
            public List<ShowStationDTO> ShowStations { get; set; } = new List<ShowStationDTO>();

            /**
             *　駅一覧です。
             *　Campanyのすべての駅が含まれている必要はありません。
             *　時刻表表示に十分な駅が連想配列に含まれている必要があります。
             */
            public Dictionary<long, JsonStation> Stations { get; set; } = new Dictionary<long, JsonStation>();
            /**
             *列車種別はCompanyに含まれているものすべてを返すべきです。
             */
            public Dictionary<long, JsonTrainType> TrainTypes { get; set; } = new Dictionary<long, JsonTrainType>();
            public Dictionary<long, JsonRoute> Routes { get; set; } = new Dictionary<long, JsonRoute>();

            public JsonTimeTable TimeTable { get; set; } = new JsonTimeTable();


            public Dictionary<long, JsonTrain> Trains { get; set; } = new Dictionary<long, JsonTrain>();
            public Dictionary<long, JsonTrip> Trips { get; set; } = new Dictionary<long, JsonTrip>();




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
