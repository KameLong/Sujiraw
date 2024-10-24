import {useEffect, useState} from "react";
import {axiosClient} from "../../CMN/axiosHook.ts";
import {Route, Station, StopTime, Train, TrainType, Trip} from "../../DiaData/DiaData.ts";
import {TimeTable, TimeTableStation} from "../../DiaData/TimeTableData.ts";

interface TimeTableServerData{
    stations:{[key:number]:Station},
    trainTypes:{[key:number]:TrainType},
    trains:{[key:number]:Train},
    trips:{[key:number]:Trip},
    routes:{[key:number]:Route},
    timeTable:TimeTable
}


class StopTimeData implements StopTime{
    ariTime: number;
    depTime: number;
    stopType: number;
    rsID: number;
    tripID: number;
    constructor(stopTime:StopTime|undefined) {
        if(stopTime===undefined){
            this.ariTime=-1;
            this.depTime=-1;
            this.stopType=0;
            this.rsID=0;
            this.tripID=0;
            return;
        }
        this.ariTime = stopTime.ariTime;
        this.depTime = stopTime.depTime;
        this.stopType = stopTime.stopType;
        this.rsID = stopTime.rsID;
        this.tripID = stopTime.tripID;
    }


    public combine(stopTime:StopTimeData){
        if(this.ariTime===-1){
            this.ariTime=stopTime.ariTime;
        }
        if(this.depTime===-1){
            this.depTime=stopTime.depTime;
        }
        if(this.stopType===0){
            this.stopType=stopTime.stopType;
        }
        if(this.tripID===0){
            this.tripID=stopTime.tripID;
        }
        if(this.rsID===0){
            this.rsID=stopTime.rsID;
        }
    }
    get isExist():boolean{
        return this.ariTime!==-1 || this.depTime!==-1;
    }
    get isNull():boolean{
        return this.stopType===0;
    }

    get DepAriTime():number{
        if(this.depTime!==-1){
            return this.depTime;
        }
        return this.ariTime;
    }
    get AriDepTime():number{
        if(this.ariTime!==-1){
            return this.ariTime;
        }
        return this.depTime;
    }





}
class TripData implements Trip{
    direction: number;
    routeID: number;
    times: StopTimeData[];
    trainID: number;
    trainTypeID: number;
    tripID: number;
    constructor(trip: Trip) {
        this.direction = trip.direction;
        this.routeID = trip.routeID;
        this.times = trip.times.map(item=>new StopTimeData(item));
        this.trainID = trip.trainID;
        this.trainTypeID = trip.trainTypeID;
        this.tripID = trip.tripID;
    }
    private get _beginStationIndex():number{
        for(let i=0;i<this.times.length;i++){
            if(this.times[i].isExist){
                return i;
            }
        }
        return -1;
    }
    private get _endStationIndex():number{
        for(let i=this.times.length-1;i>=0;i--){
            if(this.times[i].isExist){
                return i;
            }
        }
        return -1;
    }


    get beginStationIndex():number{
        if(this.direction===0){
            return this._beginStationIndex;
        }else{
            return this._endStationIndex;
        }
    }
    get endStationIndex():number{
        if(this.direction===0){
            return this._endStationIndex;
        }else{
            return this._beginStationIndex;
        }
    }
    get isExist():boolean{
        return this.beginStationIndex!==-1;
    }


}

class OuterTime{
    public time:number;
    public stationID:number;
}

class TimeTableTrain{
    public times:StopTimeData[];
    public trainID:number;
    public trainTypeID:number;
    public name:string;
    public text:string;

    public begTime:OuterTime;
    public endTime:OuterTime;


    constructor(stationLength:number) {
        this.times=new Array(stationLength).fill(1).map(()=>new StopTimeData(undefined));
    }
    public insertStopTime(stopTimes:StopTimeData[],innerBegIndex,innerEndIndex,begStation){
        for(let i=innerBegIndex;i<=innerEndIndex;i++){
            this.times[begStation+i-innerBegIndex]=stopTimes[i];
        }
    }

    //逆順の列車
    public insertStopTime2(stopTimes:StopTimeData[],innerBegIndex,innerEndIndex,begStation){
        for(let i=innerEndIndex;i<=innerBegIndex;i++){
            this.times[begStation+innerBegIndex-i]=stopTimes[i];
        }
    }

    public combineTrain(train:TimeTableTrain){
        for(let i=0;i<this.times.length;i++){
            if(!train.times[i].isNull){
                if(!this.times[i].isNull){
                    this.times[i].combine(train.times[i]);
                }else{
                    this.times[i]=train.times[i];
                }
            }
        }
    }

    get begStationIndex():number{
        for(let i=0;i<this.times.length;i++){
            if(!this.times[i].isNull){
                return i;
            }
        }
        return -1;
    }
    get endStationIndex():number{
        for(let i=this.times.length-1;i>=0;i--){
            if(!this.times[i].isNull){
                return i;
            }
        }
        return -1;
    }

    /* 運用なしや経由なしの整理をします*/
    public format(){
        for(let i=0;i<this.times.length;i++){
            if(this.times[i].stopType===0){
                this.times[i].stopType=3;
            }
        }
        for(let i=0;i<this.times.length;i++){
            if(this.times[i].stopType===3){
                this.times[i].stopType=0;
            }else{
                break;
            }
        }


        for (let i = this.times.length - 1; i >= 0; i--) {
            if (this.times[i].stopType === 3) {
                this.times[i].stopType = 0;
            } else {
                break;
            }
        }
    }
}

export function useTimeTableData(companyID:number,timetableID:number,direct:number){
    const timetableServerData=useTimeTableServerData(timetableID);
    const [timeTableData,setTimeTableData]=useState<{
        timetableServerData:TimeTableServerData,
        trains:TimeTableTrain[]}>(
        {
            timetableServerData:timetableServerData,
            trains:[]
        }
    );

    function GetRouteStation(routeStationID:number){
        return Object.values(timetableServerData.routes).map((route)=>route.routeStations).flat().find((routeStation)=>routeStation.rsID===routeStationID);
    }
    useEffect(() => {
        console.log(timetableServerData);

        if(!timetableServerData.timeTable || timetableServerData.timeTable.timetableStations.length===0){
            return;
        }

        let begStationIndex=0;
        let endStationIndex=0;

        const stations=timetableServerData.timeTable.timetableStations;
        for(let i=0;i<stations.length-1;i++){
            const stationA=stations[i];
            const stationB=stations[i+1];
            if(stationA.depRouteStationID===0||stationB.ariRouteStationID===0){
                stations[i].border=true;
            }
            if(
                stationA.depRouteStationID!==0&&stationB.ariRouteStationID!==0&&
                GetRouteStation(stationA.depRouteStationID).stationIndex+1!==GetRouteStation(stationB.ariRouteStationID).stationIndex){
                stations[i].direction=1;
            }else{
                stations[i].direction=0;
            }
        }
        console.log(stations);



        const trains=[];
        let AAA=0;

        while(begStationIndex<stations.length) {
            AAA++;
            if(AAA>10){
                console.error("AAA>10");
                break;
            }
            endStationIndex=begStationIndex+1;
            //その区間に対してtripsを生成する
            const routeID=GetRouteStation(stations[begStationIndex].depRouteStationID).routeID;
            const route=timetableServerData.routes[routeID];
            const direction=stations[begStationIndex].direction;
            console.log(direction);
            //routeの中でのstartStationIndex
            const innerBegStationIndex=GetRouteStation(stations[begStationIndex].depRouteStationID).stationIndex;



            while (endStationIndex < stations.length && route.routeStations.length > innerBegStationIndex + (endStationIndex - begStationIndex)*(1-direction*2) &&
            0<= innerBegStationIndex + (endStationIndex - begStationIndex)*(1-direction*2) &&
            (stations[endStationIndex].ariRouteStationID===route.routeStations[innerBegStationIndex+(endStationIndex - begStationIndex)*(1-direction*2)].rsID))
            {
                endStationIndex++;
            }
            endStationIndex--;

            console.log(begStationIndex,endStationIndex);
            //startStationIndexからendStationIndexまでの区間が同じrouteに属している
            const innerEndStationIndex=GetRouteStation(stations[endStationIndex].ariRouteStationID).stationIndex;

            const routeTripData:TripData[]=Object.values(timetableServerData.trips).filter((trip)=>{
                return trip.routeID===routeID;
            }).map((trip)=>{
                return new TripData(trip);
            });
            console.log(innerBegStationIndex, innerEndStationIndex,direction)
            let enableTripData=routeTripData.filter((trip)=>{
                if(direct===0) {
                    return (trip.beginStationIndex <= innerEndStationIndex && trip.endStationIndex >= innerBegStationIndex) && trip.direction === 0;
                }else{
                    return (trip.beginStationIndex>=innerBegStationIndex&&trip.endStationIndex<=innerEndStationIndex)&&trip.direction===1;
                }

            });

            if(direction===1){
                console.log(innerEndStationIndex,innerBegStationIndex);
                enableTripData=routeTripData.filter((trip)=>{
                    if(direct===0) {
                        return (trip.beginStationIndex>=innerEndStationIndex&&trip.endStationIndex<=innerBegStationIndex)&&trip.direction===1;
                    }else{
                        return (trip.beginStationIndex <= innerBegStationIndex && trip.endStationIndex >= innerEndStationIndex) && trip.direction === 0;
                    }
                });
            }
            console.log(direct);
            console.log(enableTripData);
            const tmp=enableTripData.map(trip=>{
                const timeTableTrain=new TimeTableTrain(stations.length);
                timeTableTrain.trainID=trip.trainID;
                timeTableTrain.trainTypeID=trip.trainTypeID;
                if(direction===0){
                    timeTableTrain.insertStopTime(trip.times,innerBegStationIndex,innerEndStationIndex,begStationIndex);
                }else{
                    timeTableTrain.insertStopTime2(trip.times,innerBegStationIndex,innerEndStationIndex,begStationIndex);
                }
                return timeTableTrain;
            }).filter(trip=>{
                return trip.begStationIndex!==trip.endStationIndex;
            });
            tmp.sort((a,b)=>{
               return a.trainID-b.trainID;
            })
            tmp.forEach(item=>{
                const train=trains.find((train)=>train.trainID===item.trainID);
                if(train===undefined) {
                    trains.push(item);
                    return;
                };
                train.combineTrain(item);
            })


            console.log(stations[endStationIndex]);
            if(stations[endStationIndex].depRouteStationID===0){
                begStationIndex=endStationIndex+1;
            }else{
                begStationIndex=endStationIndex;
            }

        }

        trains.forEach((train:TimeTableTrain)=>{
            train.format();
        });

        //ここでtrainsをソートする
        const sortTrains=trains.filter((train)=>{
            return train.times[0].DepAriTime!==-1;
        }).sort((a,b)=>{
            return a.times[0].DepAriTime-b.times[0].DepAriTime;
        });
        const noSortTrains=trains.filter((train)=>{
            return train.times[0].DepAriTime===-1;
        });
        for(let i=1;i<stations.length;i++){
            for(let t=0;t<noSortTrains.length;t++){
                if(noSortTrains[t].times[i].DepAriTime!==-1){
                    let f=false;
                    for(let s=sortTrains.length-1;s>=0;s--){
                        if(sortTrains[s].times[i].DepAriTime>=0&&sortTrains[s].times[i].DepAriTime<=noSortTrains[t].times[i].DepAriTime){
                            sortTrains.splice(s+1,0,noSortTrains[t]);
                            noSortTrains.splice(t,1);
                            f=true;
                            break;
                        }
                    }
                    if(!f){
                        if(i==9){
                            console.log(noSortTrains[t]);
                        }
                        sortTrains.splice(0,0,noSortTrains[t]);
                        noSortTrains.splice(t,1);
                    }
                    t--;

                }

            }
        }
        // sortTrains.push(...noSortTrains);

        console.log(sortTrains);

        setTimeTableData({
            timetableServerData:timetableServerData,
            trains:sortTrains
        });
    },[timetableServerData]);
    return timeTableData;
}

export function useTimeTableServerData(timetableID:number){
    const [timetableServerData,setTimetableServerData]=useState<TimeTableServerData>({
        stations:{},
        trainTypes:{},
        trains:{},
        trips:{},
        routes:{},
        timeTable:{
            timeTableID: 0,
            companyID: 0,
            name: "",
            timetableStations: []
        }
    });
    useEffect(() => {
        axiosClient.get(`/api/TimeTableJson/data/${timetableID}`).then((res)=> {
            setTimetableServerData(res.data);
        }).catch((ex)=>{
            console.error(ex);
        });
    },[]);

    return timetableServerData;
}