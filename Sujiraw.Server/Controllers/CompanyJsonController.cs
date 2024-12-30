using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiraw.Data;
using Sujiraw.Data.Common;
using System.Diagnostics;
using Route = Sujiraw.Data.Route;

namespace Sujiraw.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyJsonController : SujiroAPIController
    {
        public CompanyJsonController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }

        [HttpPost("OuDia/{companyID}")]
        public ActionResult PostOuDia(long companyID, OuDiaCompanyJson oudia)
        {
            //とりあえず直接DBに突っ込む
            companyID = MyRandom.NextSafeLong();
            using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
            Stopwatch sw = new Stopwatch();
            sw.Start();
            service.BeginTransaction();
            try
            {

                var company = new Company
                {
                    CompanyID = companyID,
                    Name = oudia.name
                };
                service.InsertCompany([company]);

                var stations = oudia.stations.Values.Select(item =>
                {
                    var station = new Station(companyID)
                    {
                        StationID = item.stationID,
                        CompanyID = companyID,
                        Name = item.name,
                        Lat = item.lat,
                        Lon = item.lon
                    };
                    return station;
                });
                service.InsertStation(stations.ToList());
                Debug.WriteLine("Station Inserted " + sw.ElapsedMilliseconds);
                var trainTypes = oudia.trainTypes.Values.Select(item =>
                {
                    var trainType = new TrainType(companyID)
                    {
                        TrainTypeID = item.trainTypeID,
                        CompanyID = companyID,
                        Name = item.name,
                        ShortName = item.shortName,
                        Color = item.color,
                        LineBold = item.bold,
                        LineDashed = item.dot,
                        FontBold = item.bold
                    };
                    return trainType;
                });
                service.InsertTrainType(trainTypes.ToList());
                Debug.WriteLine("TrainType Inserted " + sw.ElapsedMilliseconds);
                var trains = oudia.trains.Values.Select(item =>
                {
                    Train train = new Train(companyID);
                    train.TrainID = item.trainID;
                    train.CompanyID = companyID;
                    train.DepStationID = item.depStationID;
                    train.AriStationID = item.ariStationID;
                    train.DepTime = item.depTime;
                    train.AriTime = item.ariTime;
                    return train;
                });
                service.InsertTrain(trains.ToList());
                Debug.WriteLine("Train Inserted " + sw.ElapsedMilliseconds);
                //routeの処理
                foreach (var Jroute in oudia.routes.Values)
                {

                    Route route = new Route(companyID);
                    route.RouteID = Jroute.routeID;
                    route.Name = Jroute.name;
                    service.InsertRoute(new List<Route> { route });
                    long routeID = route.RouteID;
                    //routeStationsの処理
                    var routeStations = Jroute.routeStations.Select(item =>
                    {
                        RouteStation rs = new RouteStation(routeID, item.stationID);
                        rs.RouteStationID = item.rsID;
                        rs.RouteID = routeID;
                        rs.Sequence = item.stationIndex;
                        rs.ShowStyle = item.showStyle;
                        return rs;
                    });
                    service.InsertRouteStation(routeStations.ToList());
                    Debug.WriteLine("RouteStation Inserted " + sw.ElapsedMilliseconds);
                    var stopTimes = new List<StopTime>();

                    //tripの処理
                    var trips = Jroute.downTrips.Concat(Jroute.upTrips).Select(item =>
                    {
                        Trip trip = new Trip(routeID, item.trainID, item.trainTypeID);
                        trip.TripID = item.tripID;
                        trip.Direction = item.direction;
                        trip.TrainID = item.trainID;


                        var times = item.times.Select((time, i) =>
                        {
                            StopTime stopTime = new StopTime(time.tripID);
                            stopTime.Sequence = i;
                            stopTime.StopType = time.stopType;
                            if (time.ariTime >= 0)
                            {
                                stopTime.AriTime = (time.ariTime + 86400 - 3 * 3600) % 86400 + 3 * 3600;
                            }
                            if (time.depTime >= 0)
                            {
                                stopTime.DepTime = (time.depTime + 86400 - 3 * 3600) % 86400 + 3 * 3600;
                            }
                            return stopTime;
                        });
                        stopTimes.AddRange(times);

                        //trip.TrainID = item.trainID;
                        return trip;
                    });
                    service.InsertTrip(trips.ToList());
                    Debug.WriteLine("Trip Inserted " + sw.ElapsedMilliseconds);

                    service.InsertStopTime(stopTimes);
                    Debug.WriteLine("StopTime Inserted " + sw.ElapsedMilliseconds);
                }
                service.Commit();
                Debug.WriteLine("Commit " + sw.ElapsedMilliseconds);

                var res = new OudRes();
                res.companyID = companyID;
                res.routeID = oudia.routes.Values.First().routeID;

                return Ok(res);
            }
            catch (Exception ex)
            {
                service.Rollback();
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("Company/{companyID}/{routeID}")]
        public ActionResult GetCompany(long companyID, long routeID)
        {
            using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
            Stopwatch sw = new Stopwatch();
            sw.Start();
            service.BeginTransaction();
            try
            {
                var company = service.GetCompany(companyID);
                var jsonCompany = new JsonCompany();
                jsonCompany.routes = service.GetRouteByCompany(companyID).ToDictionary(item => item.RouteID.ToString(), item =>
                {
                    var route = new JsonRouteInfo();
                    route.routeID = item.RouteID;
                    route.name = item.Name;
                    route.stations = service.GetRouteStationByRoute(item.RouteID).Select(rs => rs.StationID).ToList();
                    return route;
                });
                jsonCompany.stations = service.GetStationByCompany(companyID).ToDictionary(item => item.StationID.ToString(), item =>
                {
                    var station = new JsonStation();
                    station.stationID = item.StationID;
                    station.name = item.Name;
                    station.lat = item.Lat;
                    station.lon = item.Lon;
                    return station;
                });
                jsonCompany.trainTypes = service.GetTrainTypeByCompany(companyID).ToDictionary(item => item.TrainTypeID.ToString(), item =>
                {
                    var trainType = new JsonTrainType();
                    trainType.trainTypeID = item.TrainTypeID;
                    trainType.name = item.Name;
                    trainType.shortName = item.ShortName;
                    trainType.color = item.Color;
                    trainType.bold = item.LineBold;
                    trainType.dot = item.LineDashed;
                    return trainType;
                });

                var trainTrip = service.GetTrainTripByRoute(routeID);

                jsonCompany.trains = service.GetTrainByRoute(companyID, routeID).ToList().ToDictionary(item => item.TrainID.ToString(), item =>
                {
                    var train = new JsonTrain();
                    train.companyID = companyID;
                    train.trainID = item.TrainID;
                    train.name = "";
                    train.remark = "";
                    train.depStationID = item.DepStationID;
                    train.ariStationID = item.AriStationID;
                    train.depTime = item.DepTime;
                    train.ariTime = item.AriTime;
                    train.tripInfos = (trainTrip[train.trainID] ?? (new List<Trip>())).Select(trip =>
                    {
                        var tripInfo = new JsonTripInfo(trip);
                        return tripInfo;
                    }).ToList();
                    return train;

                });
                return Ok(jsonCompany);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("{companyID}")]
        public ActionResult GetCompany(long companyID)
        {
            using var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!);
            Stopwatch sw = new Stopwatch();
            sw.Start();
            service.BeginTransaction();
            try
            {
                var company = service.GetCompany(companyID);
                var jsonCompany = new JsonCompany();
                jsonCompany.routes = service.GetRouteByCompany(companyID).ToDictionary(item => item.RouteID.ToString(), item =>
                {
                    var route = new JsonRouteInfo();
                    route.routeID = item.RouteID;
                    route.name = item.Name;
                    route.stations = service.GetRouteStationByRoute(item.RouteID).Select(rs => rs.StationID).ToList();
                    return route;
                });
                jsonCompany.stations = service.GetStationByCompany(companyID).ToDictionary(item => item.StationID.ToString(), item =>
                {
                    var station = new JsonStation();
                    station.stationID = item.StationID;
                    station.name = item.Name;
                    station.lat = item.Lat;
                    station.lon = item.Lon;
                    return station;
                });
                jsonCompany.trainTypes = service.GetTrainTypeByCompany(companyID).ToDictionary(item => item.TrainTypeID.ToString(), item =>
                {
                    var trainType = new JsonTrainType();
                    trainType.trainTypeID = item.TrainTypeID;
                    trainType.name = item.Name;
                    trainType.shortName = item.ShortName;
                    trainType.color = item.Color;
                    trainType.bold = item.LineBold;
                    trainType.dot = item.LineDashed;
                    return trainType;
                });
                jsonCompany.timetables = service.GetTimeTableByCompany(companyID).ToDictionary(item => item.TimeTableID, item =>
                {
                    return new JsonTimeTable(item);
                });

                return Ok(jsonCompany);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
    }

    public class JsonCompany
    {
        public Dictionary<string, JsonRouteInfo> routes { get; set; } = new Dictionary<string, JsonRouteInfo>();
        public Dictionary<string, JsonStation> stations { get; set; } = new Dictionary<string, JsonStation>();
        public Dictionary<string, JsonTrainType> trainTypes { get; set; } = new Dictionary<string, JsonTrainType>();
        public Dictionary<string, JsonTrain> trains { get; set; } = new Dictionary<string, JsonTrain>();
        public Dictionary<long, JsonTimeTable> timetables { get; set; } = new Dictionary<long, JsonTimeTable>();

    }
    public class JsonRouteInfo
    {
        public long routeID { get; set; } = 0;
        public string name { get; set; } = "";
        public List<long> stations { get; set; } = new List<long>();
    }

    public class OuDiaCompanyJson
    {
        public string name { get; set; } = "";
        public Dictionary<string, JsonRoute> routes { get; set; } = new Dictionary<string, JsonRoute>();
        public Dictionary<string, JsonStation> stations { get; set; } = new Dictionary<string, JsonStation>();
        public Dictionary<string, JsonTrainType> trainTypes { get; set; } = new Dictionary<string, JsonTrainType>();
        public Dictionary<string, JsonTrain> trains { get; set; } = new Dictionary<string, JsonTrain>();
    }

    public class JsonStation
    {
        public long stationID { get; set; } = 0;
        public string name { get; set; } = "";
        public float lat { get; set; } = 0;
        public float lon { get; set; } = 0;

        public JsonStation() { }
        public JsonStation(Station station)
        {
            this.stationID = station.StationID;
            this.name = station.Name;
            this.lat = station.Lat;
            this.lon = station.Lon;
        }
        public JsonStation(Sujiraw.Data.Entity.Station station)
        {
            this.stationID = station.StationId;
            this.name = station.Name;
            this.lat = station.Lat;
            this.lon = station.Lon;
        }

        public Station GetStation(long companyID)
        {
            var station = new Station(companyID);
            station.StationID = this.stationID;
            station.Name = this.name;
            station.Lat = this.lat;
            station.Lon = this.lon;
            return station;
        }
    }
    public class JsonTrainType
    {
        public long trainTypeID { get; set; } = 0;
        public string name { get; set; } = "";
        public string shortName { get; set; } = "";
        public string color { get; set; } = "";
        public bool bold { get; set; } = false;
        public bool dot { get; set; } = false;

        public JsonTrainType() { }
        public JsonTrainType(TrainType trainType)
        {
            this.trainTypeID = trainType.TrainTypeID;
            this.name = trainType.Name;
            this.shortName = trainType.ShortName;
            this.color = trainType.Color;
            this.bold = trainType.LineBold;
            this.dot = trainType.LineDashed;
        }
        public JsonTrainType(Sujiraw.Data.Entity.TrainType trainType)
        {
            this.trainTypeID = trainType.TrainTypeId;
            this.name = trainType.Name;
            this.shortName = trainType.ShortName;
            this.color = trainType.Color;
            this.bold = trainType.LineBold;
            this.dot = trainType.LineDashed;
        public TrainType GetTrainType(long companyID)
        {
            TrainType trainType = new TrainType(companyID);
            trainType.TrainTypeID = this.trainTypeID;
            trainType.Name = this.name;
            trainType.ShortName = this.shortName;
            trainType.Color = this.color;
            trainType.LineBold = this.bold;
            trainType.LineDashed = this.dot;
            return trainType;
        }
    }
    public class JsonTrain
    {
        public long companyID { get; set; } = 0;
        public long trainID { get; set; } = 0;
        public string name { get; set; } = "";
        public string remark { get; set; } = "";
        public long depStationID { get; set; } = 0;
        public long ariStationID { get; set; } = 0;
        public int depTime { get; set; } = 0;
        public int ariTime { get; set; } = 0;
        public List<JsonTripInfo> tripInfos { get; set; } = new List<JsonTripInfo>();
        public JsonTrain() { }
        public JsonTrain(Train train)
        {
            this.companyID = train.CompanyID;
            this.trainID = train.TrainID;
            this.depStationID = train.DepStationID;
            this.ariStationID = train.AriStationID;
            this.depTime = train.DepTime;
            this.ariTime = train.AriTime;
        }
        public JsonTrain(Sujiraw.Data.Entity.Train train)
        {
            this.companyID = train.CompanyId;
            this.trainID = train.TrainId;
            this.depStationID = train.DepStationId;
            this.ariStationID = train.AriStationId;
            this.depTime = train.DepTime;
            this.ariTime = train.AriTime;

        public Train GetTrain()
        {
            var train = new Train(this.companyID);
            train.TrainID = this.trainID;
            train.DepStationID = this.depStationID;
            train.AriStationID = this.ariStationID;
            train.DepTime = this.depTime;
            train.AriTime = this.ariTime;
            return train;
        }

    }
    public class JsonTripInfo
    {
        public long routeID { get; set; } = 0;
        public long tripID { get; set; } = 0;
        public long depStationID { get; set; } = 0;
        public long ariStationID { get; set; } = 0;
        public int depTime { get; set; } = 0;
        public int ariTime { get; set; } = 0;

        public JsonTripInfo(Trip trip)
        {
            this.tripID = trip.TripID;
            this.routeID = trip.RouteID;
            this.depStationID = trip.DepStationID;
            this.ariStationID = trip.AriStationID;
            this.depTime = trip.DepTime;
            this.ariTime = trip.AriTime;
        }
        public JsonTripInfo(Sujiraw.Data.Entity.Trip trip)
        {
            this.tripID = trip.TripId;
            this.routeID = trip.RouteId;
            this.depStationID = trip.DepStationId;
            this.ariStationID = trip.AriStationId;
            this.depTime = trip.DepTime;
            this.ariTime = trip.AriTime;
        }

    }
    public class JsonTrip
    {
        public long tripID { get; set; } = 0;
        public long routeID { get; set; } = 0;
        public int direction { get; set; } = 0;
        public long trainID { get; set; } = 0;
        public long trainTypeID { get; set; } = 0;
        public List<JsonStopTime> times { get; set; } = new List<JsonStopTime>();

        public JsonTrip() { }
        public JsonTrip(Trip trip)
        {
            this.tripID = trip.TripID;
            this.routeID = trip.RouteID;
            this.direction = trip.Direction;
            this.trainID = trip.TrainID;
            this.trainTypeID = trip.TrainTypeID;
        }

        public JsonTrip(Sujiraw.Data.Entity.Trip trip)
        {
            this.tripID = trip.TripId;
            this.routeID = trip.RouteId;
            this.direction = trip.Direction;
            this.trainID = trip.TrainId;
            this.trainTypeID = trip.TrainTypeId;
        public Trip GetTrip()
        {
            var trip = new Trip(this.routeID, this.trainID, this.trainTypeID);
            trip.TripID = this.tripID;
            trip.Direction = this.direction;
            trip.TrainID = this.trainID;
            trip.TrainTypeID = this.trainTypeID;
            return trip;
        }
    }
    public class JsonRouteStation
    {
        public long rsID { get; set; } = 0;
        public long routeID { get; set; } = 0;
        public int stationIndex { get; set; } = 0;
        public long stationID { get; set; } = 0;
        public int showStyle { get; set; } = 0;
        public bool main { get; set; } = false;
        public JsonRouteStation() { }
        public JsonRouteStation(RouteStation rs)
        {
            this.rsID = rs.RouteStationID;
            this.routeID = rs.RouteID;
            this.stationIndex = rs.Sequence;
            this.stationID = rs.StationID;
            this.showStyle = rs.ShowStyle;
        }
        public RouteStation GetRouteStation()
        {
            var routeStation=new RouteStation(this.routeID, this.stationID);
            routeStation.RouteStationID = this.rsID;
            routeStation.Sequence = this.stationIndex;
            routeStation.ShowStyle = this.showStyle;
            return routeStation;
        }
        public JsonRouteStation(Sujiraw .Data.Entity.RouteStation rs)
        {
            this.rsID = rs.RouteStationId;
            this.routeID = rs.RouteId;
            this.stationIndex = rs.Sequence;
            this.stationID = rs.StationId;
            this.showStyle = rs.ShowStyle;

        }
    }
    public class JsonStopTime
    {
        public long tripID { get; set; } = 0;
        public long rsID { get; set; } = 0;
        public int stopType { get; set; } = 0;
        public int ariTime { get; set; } = 0;
        public int depTime { get; set; } = 0;
        public JsonStopTime() { }
        public JsonStopTime(StopTime st)
        {
            this.tripID = st.TripID;
            this.stopType = st.StopType;
            this.ariTime = st.AriTime;
            this.depTime = st.DepTime;
        }
        public JsonStopTime(Sujiraw.Data.Entity.StopTime st)
        {
            this.rsID = st.RouteStationId;
            this.tripID = st.TripId;
            this.stopType = st.StopType;
            this.ariTime = st.AriTime;
            this.depTime = st.DepTime;
        public StopTime GetStopTime()
        {
            var st=new StopTime(this.tripID);
            st.StopType = this.stopType;
            st.AriTime = this.ariTime;
            st.DepTime = this.depTime;
            return st;
        }
    }

    public class JsonRoute
    {
        public long routeID { get; set; } = 0;
        public string name { get; set; } = "";
        public List<JsonRouteStation> routeStations { get; set; } = new List<JsonRouteStation>();
        public List<JsonTrip> downTrips { get; set; } = new List<JsonTrip>();
        public List<JsonTrip> upTrips { get; set; } = new List<JsonTrip>();
        public JsonRoute() { }
        public JsonRoute(Route route)
        {
            this.routeID = route.RouteID;
            this.name = route.Name;
        }
        public JsonRoute(Sujiraw.Data.Entity.Route route)
        {
            this.routeID = route.RouteId;
            this.name = route.Name;
        }

    }

    public class OudRes
    {
        public long companyID { get; set; } = 0;
        public long routeID { get; set; } = 0;

    }
}
