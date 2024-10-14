import {GetTrip, Route, RouteStation, Station, StopTime, Train, TrainType, Trip} from "./DiaData.ts";
import {Station as OudStation} from "../oud/models/Station.ts";
import {O_O} from "../oud";
import {StHandling} from "../oud/models/StHandling.ts";

function stationParser(station:OudStation):Station{
    return {
        name:station.name,
        lat:35,
        lon:135,
        stationID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random())
    }
}



export function oudParser(oud:O_O):string {
    const stations:Station[]=[];
    //oudiaの各駅がどのrouteの何番目の駅かを記録する
    const stationOrder:{routeIndex:number,stationIndex:number}[]=[];

    const trainTypes:TrainType[]=[];
    const routes:Route[]=[];
    const companyID=Math.floor(Number.MAX_SAFE_INTEGER*Math.random());



    oud.stations.forEach((station)=> {
        stations.push(stationParser(station));
    });
    oud.trainTypes.forEach((trainType)=>{
        trainTypes.push({
            name:trainType.name,
            shortName:trainType.shortname,
            trainTypeID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
            bold:trainType.lineWeight>1,
            color:trainType.lineColor.RGB(),
            dot:trainType.lineType===20
        });
    });


    //初期routeを作成
    let route:Route= {
        routeID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
        name:oud.stations[0].name+"~"+oud.stations[oud.stations.length-1].name,
        routeStations:[],
        downTrips:[],
        upTrips:[]
    };
    routes.push(route);
    for(let i=0;i<oud.stations.length;i++) {
        route.routeStations.push({
            stationID:stations[i].stationID,
            rsID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
            stationIndex:route.routeStations.length,
            showStyle:(()=>{
                switch(oud.stations[i].timeType){
                    case 0:
                        return 0b00010001;
                    case 10:
                        return 0b00110011;
                    case 20:
                        return 0b00010010;
                    case 30:
                        return 0b00100001;
                    default:
                        return 0b00010001;
                }
            })(),
            routeID:route.routeID,
            main:oud.stations[i].scale>0
        });
        stationOrder.push({
            routeIndex:routes.length-1,
            stationIndex:route.routeStations.length-1
        });
        if(oud.stations[i].boundary){
            route.name+=oud.stations[i].name;
            route= {
                routeID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
                name:oud.stations[i+1].name+"~",
                routeStations:[],
                downTrips:[],
                upTrips:[]
            };
            routes.push(route);
        }
    }
    route.name+=oud.stations[oud.stations.length-1].name;

    const trains:Train[]=[];
    const downTrips:Trip[]=[];
    const upTrips:Trip[]=[];
    oud.diagrams[0].downStreaks.forEach((oudTrain)=>{
        const trainID=Math.floor(Number.MAX_SAFE_INTEGER*Math.random());
        while(oudTrain.stHandlings.length<stations.length){
            oudTrain.stHandlings.push(
                new StHandling());
        }
        const st=oudTrain.stHandlings;


        const train:Train={
            trainID:trainID,
            name:oudTrain.name,
            remark:oudTrain.comment,
            tripInfos:[],
            ariStationID:0,
            depStationID:0,
            depTime:-1,
            ariTime:-1
        };


        const trips=Array(routes.length).fill(null).map((item,_i)=>({
            tripID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
            trainID:trainID,
            direction:0,
            routeID:routes[_i].routeID,
            trainTypeID:trainTypes[oudTrain.typeIdx].trainTypeID,
            times:[]
        }));
        for(let i=0;i<stations.length;i++){
            const time:StopTime= {
                ariTime:st[i].arrival.getTime(),
                depTime:st[i].departure.getTime(),
                tripID:trips[stationOrder[i].routeIndex].tripID,
                stopType:st[i].type/10,
                rsID:routes[stationOrder[i].routeIndex].routeStations[stationOrder[i].stationIndex].rsID
            };
            trips[stationOrder[i].routeIndex].times.push(time);
        }
        trips.forEach((trip,_i)=>{
            const beginStation=GetTrip.GetBeginStationIndex(trip);
            const endStation=GetTrip.GetEndStationIndex(trip);
            if(beginStation===-1||endStation===-1) {
                return;
            }
            routes[_i].downTrips.push(trip);
            train.tripInfos.push({
                routeID:trip.routeID,
                tripID:trip.tripID,
                ariStationID:stations[endStation].stationID,
                depStationID:stations[beginStation].stationID,
                depTime:trip.times[beginStation].depTime,
                ariTime:trip.times[endStation].ariTime
            });
        });
        const trainBeginIndex=train.tripInfos.indexOf(train.tripInfos.sort((a,b)=>{
            return a.depTime-b.depTime;
        })[0]);
        const trainEndIndex=train.tripInfos.indexOf(train.tripInfos.sort((a,b)=>{
            return -(a.ariTime-b.ariTime);
        })[0]);
        train.ariTime=train.tripInfos[trainEndIndex].ariTime;
        train.depTime=train.tripInfos[trainBeginIndex].depTime;
        train.ariStationID=train.tripInfos[trainEndIndex].ariStationID;
        train.depStationID=train.tripInfos[trainBeginIndex].depStationID;
        trains.push(train);
    });
    oud.diagrams[0].upStreaks.forEach((oudTrain)=> {
        const trainID = Math.floor(Number.MAX_SAFE_INTEGER * Math.random());
        while (oudTrain.stHandlings.length < stations.length) {
            oudTrain.stHandlings.push(
                new StHandling());
        }
        const st = oudTrain.stHandlings.toReversed();
        const train:Train={
            trainID:trainID,
            name:oudTrain.name,
            remark:oudTrain.comment,
            tripInfos:[],
            ariStationID:0,
            depStationID:0,
            depTime:-1,
            ariTime:-1
        };


        const trips=Array(routes.length).fill(null).map((item,_i)=>({
            tripID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
            trainID:trainID,
            direction:1,
            routeID:routes[_i].routeID,
            trainTypeID:trainTypes[oudTrain.typeIdx].trainTypeID,
            times:[]
        }));
        for(let i=0;i<stations.length;i++){
            const time:StopTime= {
                ariTime:st[i].arrival.getTime(),
                depTime:st[i].departure.getTime(),
                tripID:trips[stationOrder[i].routeIndex].tripID,
                stopType:st[i].type/10,
                rsID:routes[stationOrder[i].routeIndex].routeStations[stationOrder[i].stationIndex].rsID
            };
            trips[stationOrder[i].routeIndex].times.push(time);
        }
        trips.forEach((trip,_i)=>{
            const beginStation=GetTrip.GetBeginStationIndex(trip);
            const endStation=GetTrip.GetEndStationIndex(trip);
            if(beginStation===-1||endStation===-1) {
                return;
            }
            routes[_i].upTrips.push(trip);
            train.tripInfos.push({
                routeID:trip.routeID,
                tripID:trip.tripID,
                ariStationID:stations[endStation].stationID,
                depStationID:stations[beginStation].stationID,
                depTime:trip.times[beginStation].depTime,
                ariTime:trip.times[endStation].ariTime
            });
        });
        const trainBeginIndex=train.tripInfos.indexOf(train.tripInfos.sort((a,b)=>{
            return a.depTime-b.depTime;
        })[0]);
        const trainEndIndex=train.tripInfos.indexOf(train.tripInfos.sort((a,b)=>{
            return -(a.ariTime-b.ariTime);
        })[0]);
        train.ariTime=train.tripInfos[trainEndIndex].ariTime;
        train.depTime=train.tripInfos[trainBeginIndex].depTime;
        train.ariStationID=train.tripInfos[trainEndIndex].ariStationID;
        train.depStationID=train.tripInfos[trainBeginIndex].depStationID;
        trains.push(train);



    });
    const company:any= {
        routes: {},
        stations: {},
        trains: {},
        trainTypes: {},
        name:oud.name
    }
    company.stations=stations.reduce((acc:{[key:number]:Station},station)=>{
        acc[station.stationID]=station;
        return acc;
    },{});
    routes.forEach((route)=>{
        company.routes[route.routeID]=route;
    });
    company.trains=trains.reduce((acc:{[key:number]:Train},train)=>{
        acc[train.trainID]=train;
        return acc;
    },{});
    company.trainTypes=trainTypes.reduce((acc:{[key:number]:TrainType},trainType)=>{
        acc[trainType.trainTypeID]=trainType;
        return acc;
    },{});
    console.log(company);

    return JSON.stringify(company);

}