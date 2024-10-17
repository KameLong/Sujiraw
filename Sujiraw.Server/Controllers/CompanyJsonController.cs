using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sujiraw.Server.SignalR;
using Sujiro.Data;
using Sujiro.Data.Common;
using System.Diagnostics;
using Route = Sujiro.Data.Route;

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
            using (var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!))
            {
                Stopwatch sw = new Stopwatch();
                sw.Start();
                service.BeginTransaction();
                try
                {

                    //
                    Company company = new Company();
                    company.CompanyID = companyID;
                    company.Name = oudia.name;
                    service.InsertCompany(new List<Company> { company });
                    //

                    var stations = oudia.stations.Values.Select(item =>
                    {
                        Station station = new Station(companyID);
                        station.StationID = item.stationID;
                        station.CompanyID = companyID;
                        station.Name = item.name;
                        station.Lat = item.lat;
                        station.Lon = item.lon;
                        return station;
                    });
                    service.InsertStation(stations.ToList());
                    Debug.WriteLine("Station Inserted " + sw.ElapsedMilliseconds);
                    var trainTypes = oudia.trainTypes.Values.Select(item =>
                    {
                        TrainType trainType = new TrainType(companyID);
                        trainType.TrainTypeID = item.trainTypeID;
                        trainType.CompanyID = companyID;
                        trainType.Name = item.name;
                        trainType.ShortName = item.shortName;
                        trainType.Color = item.color;
                        trainType.LineBold = item.bold;
                        trainType.LineDashed = item.dot;
                        trainType.FontBold = item.bold;
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
        }

        [HttpGet("Company/{companyID}/{routeID}")]
        public ActionResult GetCompany(long companyID, long routeID)
        {
            using (var service = new PostgresDbService(Configuration["ConnectionStrings:postgres"]!))
            {
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

                    var trainTrip = service.GetTrainTripByRoute( routeID);

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
                        train.tripInfos = (trainTrip[train.trainID]??(new List<Trip>())).Select(trip =>
                        {
                            var tripInfo = new JsonTripInfo();
                            tripInfo.routeID = trip.RouteID;
                            tripInfo.tripID = trip.TripID;
                            tripInfo.depStationID = trip.DepStationID;
                            tripInfo.ariStationID = trip.AriStationID;
                            tripInfo.depTime = trip.DepTime;
                            tripInfo.ariTime = trip.AriTime;
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

        }
    }

    public class JsonCompany
    {
        public Dictionary<string, JsonRouteInfo> routes { get; set; } = new Dictionary<string, JsonRouteInfo>();
        public Dictionary<string, JsonStation> stations { get; set; } = new Dictionary<string, JsonStation>();
        public Dictionary<string, JsonTrainType> trainTypes { get; set; } = new Dictionary<string, JsonTrainType>();
        public Dictionary<string, JsonTrain> trains { get; set; } = new Dictionary<string, JsonTrain>();

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
    }
    public class JsonTrainType
    {
        public long trainTypeID { get; set; } = 0;
        public string name { get; set; } = "";
        public string shortName { get; set; } = "";
        public string color { get; set; } = "";
        public bool bold { get; set; } = false;
        public bool dot { get; set; } = false;
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
    }
    public class JsonTripInfo
    {
        public long routeID { get; set; } = 0;
        public long tripID { get; set; } = 0;
        public long depStationID { get; set; } = 0;
        public long ariStationID { get; set; } = 0;
        public int depTime { get; set; } = 0;
        public int ariTime { get; set; } = 0;
    }
    public class JsonTrip
    {
        public long tripID { get; set; } = 0;
        public long routeID { get; set; } = 0;
        public int direction { get; set; } = 0;
        public long trainID { get; set; } = 0;
        public long trainTypeID { get; set; } = 0;
        public List<JsonStopTime> times { get; set; } = new List<JsonStopTime>();
    }
    public class JsonRouteStation
    {
        public long rsID { get; set; } = 0;
        public long routeID { get; set; } = 0;
        public int stationIndex { get; set; } = 0;
        public long stationID { get; set; } = 0;
        public int showStyle { get; set; } = 0;
        public bool main { get; set; } = false;
    }
    public class JsonStopTime
    {
        public long tripID { get; set; } = 0;
        public long rsID { get; set; } = 0;
        public int stopType { get; set; } = 0;
        public int ariTime { get; set; } = 0;
        public int depTime { get; set; } = 0;
    }

    public class JsonRoute
    {
        public long routeID { get; set; } = 0;
        public string name { get; set; } = "";
        public List<JsonRouteStation> routeStations { get; set; } = new List<JsonRouteStation>();
        public List<JsonTrip> downTrips { get; set; } = new List<JsonTrip>();
        public List<JsonTrip> upTrips { get; set; } = new List<JsonTrip>();
    }

    public class OudRes
    {
        public long companyID { get; set; } = 0;
        public long routeID { get; set; } = 0;

    }
}
