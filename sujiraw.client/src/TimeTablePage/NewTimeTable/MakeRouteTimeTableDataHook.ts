import {useRouteTimeTableServerData} from "../RouteTimeTable/RouteTimeTableData.ts";
import {useEffect, useState} from "react";
import {LineData, Train, Trip, Station, StopTime, StationTime} from "../../DiaData/NewData.ts";

export function useGetTimeTableData(companyID:number, routeID:number){
    return useRouteTimeTableServerData(routeID);
}
export function useMakeRouteTimeTableData(companyID:number, routeID:number){
    const serverData=useGetTimeTableData(companyID,routeID);
    const [timetableData,setTimeTableData]=useState<LineData>(new LineData());

    useEffect(() => {
        console.log(serverData);
        const lineData=new LineData();
        //駅データ作成
        lineData.stationList=serverData.showStations.map(item=>{
            const station=new Station();
            const routestationId=Math.max(item.depRouteStationID,item.ariRouteStationID);
            station.stationId=serverData.routes[routeID].routeStations.find(rs=>rs.rsID==routestationId).stationID;
            station.stationName=serverData.stations[station.stationId].name;
            station.RouteStationDep[routeID]=item.depRouteStationID;
            station.RouteStationAri[routeID]=item.ariRouteStationID;
            station.showStyle=item.showStyle;
            return station;
        });

        //下り列車
        lineData.downTrains=Object.values(serverData.trips).filter(trip=>trip.direction===0)
            .map(trip=>{
                const train=new Train();
                const trainTrip=new Trip();
                trainTrip.trainTypeId=trip.trainTypeID;
                trainTrip.stationTime=lineData.stationList.map((station, i)=>{
                    const stationTime=new StationTime();
                    const dep=trip.times.find(time=>Object.values(station.RouteStationDep).includes(time.rsID));
                    const ari=trip.times.find(time=>Object.values(station.RouteStationAri).includes(time.rsID));
                    if(dep){
                        stationTime.depTime.time=dep.depTime;
                        stationTime.depTime.routeStationId=dep.rsID;
                        stationTime.stopType=dep.stopType;
                    }
                    if(ari){
                        stationTime.ariTime.time=ari.ariTime;
                        stationTime.ariTime.routeStationId=ari.rsID;
                        stationTime.stopType=ari.stopType;
                    }
                    return stationTime;
                })
                train.trips.push(trainTrip);
                return train;
            })

        lineData.upTrains=Object.values(serverData.trips).filter(trip=>trip.direction===1)
            .map(trip=>{
                const train=new Train();
                const trainTrip=new Trip();
                trainTrip.trainTypeId=trip.trainTypeID;
                trainTrip.stationTime=lineData.stationList.map((station, i)=>{
                    const stationTime=new StationTime();
                    const dep=trip.times.find(time=>Object.values(station.RouteStationDep).includes(time.rsID));
                    const ari=trip.times.find(time=>Object.values(station.RouteStationAri).includes(time.rsID));
                    if(dep){
                        stationTime.depTime.time=dep.depTime;
                        stationTime.depTime.routeStationId=dep.rsID;
                        stationTime.stopType=dep.stopType;
                    }
                    if(ari){
                        stationTime.ariTime.time=ari.ariTime;
                        stationTime.ariTime.routeStationId=ari.rsID;
                        stationTime.stopType=ari.stopType;
                    }
                    return stationTime;
                })
                train.trips.push(trainTrip);
                return train;
            })

        lineData.trainTypes=serverData.trainTypes;
        lineData.stationInfo=serverData.stations;
        lineData.sortTrain(0,0);
        lineData.sortTrain(1,lineData.stationList.length-1);



        setTimeTableData(lineData);

    }, [serverData]);

    function sortTrain(direction:number, stationIndex:number) {
        setTimeTableData(()=>{
            timetableData.sortTrain(direction,stationIndex);
            return timetableData;
        });
    }

    return {timeTableData:timetableData,sortTrain};



}
