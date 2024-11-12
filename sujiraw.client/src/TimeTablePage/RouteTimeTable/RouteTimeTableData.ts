import {useEffect, useState} from "react";
import {
    TimeTableServerData,
    TimeTableTrain,
    TripData, useTimeTableServerData,
} from "../CustomTimeTable/CustomTimeTableData.ts";
import {axiosClient} from "../../CMN/axiosHook.ts";



export function useRouteTimeTableData(companyID:number,routeID:number,direct:number){
    const timetableServerData=useRouteTimeTableServerData(routeID);
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

        if(timetableServerData.showStations.length===0){
            return;
        }

        let begStationIndex=0;
        let endStationIndex=0;

        // const stations=timetableServerData.timeTable.timetableStations;
        const stations=timetableServerData.showStations;
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


export function useRouteTimeTableServerData(routeID:number){
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
        },
        showStations:[]

    });
    useEffect(() => {
        console.log("test")
        axiosClient.get(`/api/NewTimeTable/Route/${routeID}`).then((res)=> {
            console.log(res)
            setTimetableServerData(res.data);
        }).catch((ex)=>{
            console.error(ex);
        });
    },[]);

    return timetableServerData;
}

