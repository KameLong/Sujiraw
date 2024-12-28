import {useRouteTimeTableServerData} from "../RouteTimeTable/RouteTimeTableData.ts";
import {useEffect, useState} from "react";
import {LineData, Train, Trip, Station, StopTime, StationTime} from "../../DiaData/NewData.ts";

export function useGetTimeTableData(companyID:number, routeID:number){
    return useRouteTimeTableServerData(routeID);
}
export function useMakeRouteTimeTable(companyID:number, routeID:number){
    const serverData=useGetTimeTableData(companyID,routeID);
    const [データ,set時刻表]=useState<LineData>(new LineData());

    useEffect(() => {
        console.log(serverData);
        const 作成中時刻表データ=new LineData();
        //駅データ作成
        作成中時刻表データ.stationList=serverData.showStations.map(item=>{
            const 駅=new Station();
            const 暫定routestationId=Math.max(item.depRouteStationID,item.ariRouteStationID);
            駅.stationId=serverData.routes[routeID].routeStations.find(rs=>rs.rsID==暫定routestationId).stationID;
            駅.stationName=serverData.stations[駅.stationId].name;
            駅.RouteStationDep[routeID]=item.depRouteStationID;
            駅.RouteStationAri[routeID]=item.ariRouteStationID;
            駅.showStyle=item.showStyle;
            return 駅;
        });

        //下り列車
        作成中時刻表データ.downTrains=Object.values(serverData.trips).filter(trip=>trip.direction===0)
            .map(trip=>{
                const 列車=new Train();
                const 列車要素=new Trip();
                列車要素.trainTypeId=trip.trainTypeID;
                列車要素.stationTime=作成中時刻表データ.stationList.map((駅, i)=>{
                    const 時刻=new StationTime();
                    const dep=trip.times.find(time=>Object.values(駅.RouteStationDep).includes(time.rsID));
                    const ari=trip.times.find(time=>Object.values(駅.RouteStationAri).includes(time.rsID));
                    if(dep){
                        時刻.depTime.time=dep.depTime;
                        時刻.depTime.routeStationId=dep.rsID;
                        時刻.stopType=dep.stopType;
                    }
                    if(ari){
                        時刻.ariTime.time=ari.ariTime;
                        時刻.ariTime.routeStationId=ari.rsID;
                        時刻.stopType=ari.stopType;
                    }
                    return 時刻;
                })
                列車.trips.push(列車要素);
                return 列車;
            })

        作成中時刻表データ.upTrains=Object.values(serverData.trips).filter(trip=>trip.direction===1)
            .map(trip=>{
                const 列車=new Train();
                const 列車要素=new Trip();
                列車要素.trainTypeId=trip.trainTypeID;
                列車要素.stationTime=作成中時刻表データ.stationList.map((駅, i)=>{
                    const 時刻=new StationTime();
                    const dep=trip.times.find(time=>Object.values(駅.RouteStationDep).includes(time.rsID));
                    const ari=trip.times.find(time=>Object.values(駅.RouteStationAri).includes(time.rsID));
                    if(dep){
                        時刻.depTime.time=dep.depTime;
                        時刻.depTime.routeStationId=dep.rsID;
                        時刻.stopType=dep.stopType;
                    }
                    if(ari){
                        時刻.ariTime.time=ari.ariTime;
                        時刻.ariTime.routeStationId=ari.rsID;
                        時刻.stopType=ari.stopType;
                    }
                    return 時刻;
                })
                列車.trips.push(列車要素);
                return 列車;
            })

        作成中時刻表データ.trainTypes=serverData.trainTypes;
        作成中時刻表データ.stationInfo=serverData.stations;
        作成中時刻表データ.sortTrain(0,40);



        set時刻表(作成中時刻表データ);

    }, [serverData]);

    return データ;



}
