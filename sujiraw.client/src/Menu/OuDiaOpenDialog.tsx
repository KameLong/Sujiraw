import {useNavigate} from "react-router-dom";
import {Box, Card, CardContent, Input, List, Typography} from "@mui/material";
import {ChangeEvent} from "react";
import {O_O} from "@route-builders/oud-operator";
import {
    Company,
    GetTrip, Route,
    RouteInfo,
    RouteStation,
    Station,
    StopTime,
    StopType,
    Train,
    TrainType,
    Trip
} from "../DiaData/DiaData";
import {StHandling} from "@route-builders/oud-operator/src/models/StHandling";

function oudParser(oud:O_O) {
    const stations:Station[]=[];
    const routeStations:RouteStation[]=[];
    const trainTypes:TrainType[]=[];

    const routeID=Math.floor(Number.MAX_SAFE_INTEGER*Math.random());
    const companyID=Math.floor(Number.MAX_SAFE_INTEGER*Math.random());

    oud.stations.forEach((station)=>{
        stations.push({
            name:station.name,
            lat:35,
            lon:135,
            stationID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random())
        });
        routeStations.push({
            stationID:stations.length-1,
            rsID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
            stationIndex:routeStations.length,
            showStyle:(()=>{
                switch(station.timeType){
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
            routeID:routeID,
            main:station.scale>0
        });
        });
    oud.trainTypes.forEach((trainType)=>{
        console.log(trainType);
        trainTypes.push({
            name:trainType.name,
            shortName:trainType.shortname,
            trainTypeID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
            bold:trainType.lineWeight>1,
            color:trainType.lineColor.HEX(),
            dot:trainType.lineType===20
        });
    });
    const trains:Train[]=[];
    const downTrips:Trip[]=[];
    const upTrips:Trip[]=[];
    oud.diagrams[0].downStreaks.forEach((train)=>{
        const trainID=Math.floor(Number.MAX_SAFE_INTEGER*Math.random());
        const tripID=Math.floor(Number.MAX_SAFE_INTEGER*Math.random());
        while(train.stHandlings.length<routeStations.length){
            train.stHandlings.push(
                //@ts-ignore
                new StHandling());
        }

        const trip:Trip={
            trainID:trainID,
            direction:0,
            routeID:routeID,
            tripID:tripID,
            trainTypeID:train.typeIdx,
            times:train.stHandlings.map((st,_i)=>{
                const time:StopTime= {
                    ariTime:st.arrival.getTime(),
                    depTime:st.departure.getTime(),
                    tripID:tripID,
                    stopType:st.type/10,
                    rsID:routeStations[_i].rsID
                };
                return time;
            })
        };
        const beginStation=GetTrip.GetBeginStationIndex(trip);
        const endStation=GetTrip.GetEndStationIndex(trip);
        if(beginStation===-1||endStation===-1) {
            return;
        }
        downTrips.push(trip);

        trains.push({
            trainID:trainID,
            name:train.name,
            remark:train.comment,
            tripInfos:[{
                routeID:routeID,
                tripID:tripID,
                ariStationID:stations[endStation].stationID,
                depStationID:stations[beginStation].stationID,
                depTime:trip.times[beginStation].depTime,
                ariTime:trip.times[endStation].ariTime
            }],
            ariStationID:stations[endStation].stationID,
            depStationID:stations[beginStation].stationID,
            ariTime:trip.times[endStation].ariTime,
            depTime:trip.times[beginStation].depTime
        });
    });
    oud.diagrams[0].upStreaks.forEach((train)=>{
        const trainID=Math.floor(Number.MAX_SAFE_INTEGER*Math.random());
        const tripID=Math.floor(Number.MAX_SAFE_INTEGER*Math.random());
        while(train.stHandlings.length<routeStations.length){
            train.stHandlings.push(
                //@ts-ignore
                new StHandling());
        }
        const trip:Trip={
            trainID:trainID,
            direction:1,
            routeID:routeID,
            tripID:tripID,
            trainTypeID:train.typeIdx,
            times:train.stHandlings.toReversed().map((st,_i)=>{
                const time:StopTime= {
                    ariTime:st.arrival.getTime(),
                    depTime:st.departure.getTime(),
                    tripID:tripID,
                    stopType:st.type/10,
                    rsID:routeStations[_i].rsID
                };
                return time;
            })
        };
        const beginStation=GetTrip.GetBeginStationIndex(trip);
        const endStation=GetTrip.GetEndStationIndex(trip);
        if(beginStation===-1||endStation===-1) {
            return;
        }
        upTrips.push(trip);
        trains.push({
            trainID:trainID,
            name:train.name,
            remark:train.comment,
            tripInfos:[{
                routeID:routeID,
                tripID:tripID,
                ariStationID:stations[endStation].stationID,
                depStationID:stations[beginStation].stationID,
                depTime:trip.times[beginStation].depTime,
                ariTime:trip.times[endStation].ariTime
            }],
            ariStationID:stations[endStation].stationID,
            depStationID:stations[beginStation].stationID,
            ariTime:trip.times[endStation].ariTime,
            depTime:trip.times[beginStation].depTime

        });
    });

    const company:Company= {
        routes: {},
        stations: {},
        trains: {},
        trainTypes: {}
    }
    company.routes[routeID]={
        routeID:routeID,
        name:oud.diagrams[0].name,
        stations:routeStations.map((rs)=> {
            return rs.stationID;
        })
    };
    company.stations=stations.reduce((acc:{[key:number]:Station},station)=>{
        acc[station.stationID]=station;
        return acc;
    },{});
    company.trains=trains.reduce((acc:{[key:number]:Train},train)=>{
        acc[train.trainID]=train;
        return acc;
    },{});
    company.trainTypes=trainTypes.reduce((acc:{[key:number]:TrainType},trainType)=>{
        acc[trainType.trainTypeID]=trainType;
        return acc;
    },{});

    const route:Route= {
        routeStations:routeStations,
        routeID:routeID,
        name:oud.diagrams[0].name,
        downTrips:downTrips,
        upTrips:upTrips
    }
    console.log(JSON.stringify(route));


}
export function OuDiaOpenDialog() {
    const navigate = useNavigate();
    return (
        <Card style={{margin: '10px 10px 50px 10px', height: 'calc(100% - 60px)'}}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    OuDia読み込み
                </Typography>
                <Input
                    inputProps={{ accept: ".oud" }}
                    type="file"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files) {
                            console.log(e.target.files[0]);
                            const reader = new FileReader();
                            reader.onload = e => {
                                const file = e.target?.result as string;
                                const data=file.split('\r\n');
                                console.log(data);
                                const o_o=new O_O();
                                o_o.fromOud(data);
                                console.log(o_o);
                                oudParser(o_o);


                            };

                            // const encoding = Encoder.detect(e.target.files[0], ['SJIS', 'UTF8','SJIS']);
                            // if (!encoding) {
                            //     throw new Error();
                            // }
                            reader.readAsText(e.target.files[0], 'SJIS');
                        }
                    }}>

                </Input>
            </CardContent>
        </Card>
    )
}