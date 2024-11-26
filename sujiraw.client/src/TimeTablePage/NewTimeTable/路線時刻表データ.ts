import {useRouteTimeTableServerData} from "../RouteTimeTable/RouteTimeTableData.ts";
import {useEffect, useState} from "react";
import {時刻表データ, 時刻表列車, 時刻表列車要素, 時刻表駅, 発着時刻, 駅時刻} from "../../DiaData/NewData.ts";

export function use路線時刻表データ取得(companyID:number,routeID:number){
    return useRouteTimeTableServerData(routeID);
}
export function use路線時刻表データ作成(companyID:number,routeID:number){
    const サーバーデータ=use路線時刻表データ取得(companyID,routeID);
    const [データ,set時刻表]=useState<時刻表データ>(new 時刻表データ());

    useEffect(() => {
        console.log(サーバーデータ);
        const 作成中時刻表データ=new 時刻表データ();
        //駅データ作成
        作成中時刻表データ.駅リスト=サーバーデータ.showStations.map(item=>{
            const 駅=new 時刻表駅();
            const 暫定routestationId=Math.max(item.depRouteStationID,item.ariRouteStationID);
            駅.stationId=サーバーデータ.routes[routeID].routeStations.find(rs=>rs.rsID==暫定routestationId).stationID;
            駅.路線別発RouteStation[routeID]=item.depRouteStationID;
            駅.路線別着RouteStation[routeID]=item.ariRouteStationID;
            駅.表示スタイル=item.showStyle;
            return 駅;
        });

        //下り列車
        作成中時刻表データ.下り列車=Object.values(サーバーデータ.trips).filter(trip=>trip.direction===0)
            .map(trip=>{
                const 列車=new 時刻表列車();
                const 列車要素=new 時刻表列車要素();
                列車要素.列車種別=trip.trainTypeID;
                列車要素.駅時刻リスト=作成中時刻表データ.駅リスト.map((駅,i)=>{
                    const 時刻=new 駅時刻();
                    const dep=trip.times.find(time=>Object.values(駅.路線別発RouteStation).includes(time.rsID));
                    const ari=trip.times.find(time=>Object.values(駅.路線別着RouteStation).includes(time.rsID));
                    if(dep){
                        時刻.発時刻.time=dep.depTime;
                        時刻.発時刻.routeStationId=dep.rsID;
                        時刻.stopType=dep.stopType;
                    }
                    if(ari){
                        時刻.着時刻.time=ari.ariTime;
                        時刻.着時刻.routeStationId=ari.rsID;
                        時刻.stopType=ari.stopType;
                    }
                    return 時刻;
                })
                列車.列車要素.push(列車要素);
                return 列車;
            })

        作成中時刻表データ.上り列車=Object.values(サーバーデータ.trips).filter(trip=>trip.direction===1)
            .map(trip=>{
                const 列車=new 時刻表列車();
                const 列車要素=new 時刻表列車要素();
                列車要素.列車種別=trip.trainTypeID;
                列車要素.駅時刻リスト=作成中時刻表データ.駅リスト.map((駅,i)=>{
                    const 時刻=new 駅時刻();
                    const dep=trip.times.find(time=>Object.values(駅.路線別発RouteStation).includes(time.rsID));
                    const ari=trip.times.find(time=>Object.values(駅.路線別着RouteStation).includes(time.rsID));
                    if(dep){
                        時刻.発時刻.time=dep.depTime;
                        時刻.発時刻.routeStationId=dep.rsID;
                        時刻.stopType=dep.stopType;
                    }
                    if(ari){
                        時刻.着時刻.time=ari.ariTime;
                        時刻.着時刻.routeStationId=ari.rsID;
                        時刻.stopType=ari.stopType;
                    }
                    return 時刻;
                })
                列車.列車要素.push(列車要素);
                return 列車;
            })

        作成中時刻表データ.種別=サーバーデータ.trainTypes;
        作成中時刻表データ.stations=サーバーデータ.stations;



        set時刻表(作成中時刻表データ);

    }, [サーバーデータ]);

    return データ;



}
