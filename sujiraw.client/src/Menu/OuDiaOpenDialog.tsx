import {useNavigate} from "react-router-dom";
import {Backdrop, Box, Button, Card, CardContent, CircularProgress, Input, List, Typography} from "@mui/material";
import React, {ChangeEvent, useState} from "react";
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
import * as axios from "axios";
import {StHandling} from "@route-builders/oud-operator/src/models/StHandling";
import {axiosClient} from "../CMN/axiosHook.ts";

function oudParser(oud:O_O):string {
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
            stationID:stations[stations.length-1].stationID,
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
                //@ts-expect-error oud-operatorの型定義依存
                new StHandling());
        }

        const trip:Trip={
            trainID:trainID,
            direction:0,
            routeID:routeID,
            tripID:tripID,
            trainTypeID:trainTypes[train.typeIdx].trainTypeID,

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
                //@ts-expect-error oud-operatorの型定義依存
                new StHandling());
        }
        const trip:Trip={
            trainID:trainID,
            direction:1,
            routeID:routeID,
            tripID:tripID,
            trainTypeID:trainTypes[train.typeIdx].trainTypeID,
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
    const company:any= {
        routes: {},
        stations: {},
        trains: {},
        trainTypes: {},
        name:oud.name
    }
    company.routes[routeID]={
        routeID:routeID,
        name:oud.stations[0].name+"~"+oud.stations[oud.stations.length-1].name,
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
        name:oud.stations[0].name+"~"+oud.stations[oud.stations.length-1].name,
        downTrips:downTrips,
        upTrips:upTrips
    }
    company.routes[routeID]=route;
    return JSON.stringify(company);
    //サーバーに送信する。
    // axiosClient.post(`api/CompanyJson/OuDia/${companyID}`,company).then((res)=>{
    //     console.log(res);
    // });



}
export function OuDiaOpenDialog() {
    const navigate = useNavigate();
    const [json,setJson]=useState<string>("");
    const [open, setOpen] = React.useState(false);

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
                                setJson(oudParser(o_o));
                            };

                            // const encoding = Encoder.detect(e.target.files[0], ['SJIS', 'UTF8','SJIS']);
                            // if (!encoding) {
                            //     throw new Error();
                            // }
                            reader.readAsText(e.target.files[0], 'SJIS');
                        }
                    }}>

                </Input>

                <Button onClick={()=>{
                    console.log(json);
                    axiosClient.post(`api/CompanyJson/OuDia/${0}`,json).then((res)=>{
                        navigate(`/TimeTable/${res.data.companyID}/${res.data.routeID}/0`);
                        setOpen(false);
                    }).catch((ex)=>{
                       setOpen(false);
                    });
                    setOpen(true);
                }}
                        disabled={json.length===0}
                >

                    サーバーに送信
                </Button>
                <div>推定所要時間 {Math.round(json.length/500000)}秒</div>
                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={open}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            </CardContent>
        </Card>
    )
}