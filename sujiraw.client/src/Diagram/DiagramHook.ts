import {useEffect, useState} from "react";
import {GetStopTime, loadCompany, loadRoute, RouteInfo, StopTime, StopType} from "../DiaData/DiaData";
import {DiagramStation, DiagramTrip} from "./DiagramData";
import {DiagramLine} from "./DiagramCanvas";

const getAD = (stopTime: StopTime) => {
    if (stopTime.ariTime >= 0) {
        return stopTime.ariTime;
    }
    return stopTime.depTime;
}
const getDA=(stopTime:StopTime)=>{
    if(stopTime.depTime>=0){
        return stopTime.depTime;
    }
    return stopTime.ariTime;
}

const makeDiagramLine=(trips:DiagramTrip[],routeStations:DiagramStation[]):DiagramLine[]=>{
    const diagramLines:DiagramLine[]=[];
    trips.forEach(trip=>{

        let diagramLine:DiagramLine={
            color:trip.trainType.color,
            points:[],
            number:"",
        };
        const stopTimes=trip.direction===0?trip.stopTimes:trip.stopTimes.slice().reverse();
        for(let i=0;i<stopTimes.length;i++){
            const st=stopTimes[i];
            if(st.ariTime>=0){
                diagramLine.points.push({
                    x:st.ariTime,
                    y:routeStations.filter(item=>item.rsID===st.rsID)[0].stationTime
                });
            }
            if(st.depTime>=0) {
                diagramLine.points.push({
                    x: st.depTime,
                    y:routeStations.filter(item=>item.rsID===st.rsID)[0].stationTime
                });
            }
        }
        diagramLines.push(diagramLine);
    })
    return diagramLines;

}

export function useDiagramHook(routeID:number){
    const [routeStations, setRouteStations] = useState<DiagramStation[]>([]);
    const [downLines,setDownLines]=useState<DiagramLine[]>([]);
    const [upLines,setUpLines]=useState<DiagramLine[]>([]);
    const [routeInfo, setRouteInfo] = useState<{[key:number]:RouteInfo}>({});
    useEffect(() => {
        loadCompany().then(async(company)=>{
            const stations=company.stations;
            const trainTypes=company.trainTypes;

            const trains=company.trains;
            setRouteInfo(company.routes);

            const route=await loadRoute(routeID);
            //routeの処理
            const rs:DiagramStation[]=[];
            rs.push({...route.routeStations[0],stationTime:0,station:stations[route.routeStations[0].stationID]});
            let nowStationTime=0;
            for(let i=1;i<route.routeStations.length;i++){
                const stationID=route.routeStations[i].stationID;
                const station=stations[stationID];
                let minTime=24*3600;
                //downTripの中で所要時間探索
                for(let j=0;j<route.downTrips.length;j++){
                    const trip=route.downTrips[j];
                    const stopTimes=trip.times;
                    if(GetStopTime.TimeExist(stopTimes[i])&&GetStopTime.TimeExist(stopTimes[i-1])){
                        let t=GetStopTime.GetAriDepTime(trip.times[i])-GetStopTime.GetDepAriTime(trip.times[i-1]);
                        if(trip.times[i].stopType!==StopType.STOP){
                            t+=30;
                        }
                        if(trip.times[i-1].stopType!==StopType.STOP){
                            t+=30;
                        }
                        minTime=Math.min(minTime,t);
                    }
                }
                //upTripの中で所要時間探索
                for(let j=0;j<route.upTrips.length;j++){
                    const trip=route.upTrips[j];
                    const stopTimes=trip.times;
                    if(GetStopTime.TimeExist(stopTimes[i])&&GetStopTime.TimeExist(stopTimes[i-1])){
                        let t=GetStopTime.GetAriDepTime(trip.times[i-1])-GetStopTime.GetDepAriTime(trip.times[i]);
                        if(trip.times[i].stopType!==StopType.STOP){
                            t+=30;
                        }
                        if(trip.times[i-1].stopType!==StopType.STOP){
                            t+=30;
                        }
                        minTime=Math.min(minTime,t);
                    }
                }
                if(minTime===24*3600){
                    minTime=90;
                }
                if(minTime<90){
                    minTime=90;
                }
                nowStationTime=nowStationTime+minTime;



                rs.push({...route.routeStations[i],stationTime:nowStationTime,station:station});
            }



            setRouteStations(rs);
            const downTrips=route.downTrips.map(item=>{
                return {...item,stopTimes:item.times.map(item=>{
                        return {...item,depTime:getDA(item),ariTime:getAD(item)}
                    }),trainType:trainTypes[item.trainTypeID]
                }
            });
            const upTrips=route.upTrips.map(item=>{
                return {...item,stopTimes:item.times.map(item=>{
                        return {...item,depTime:getDA(item),ariTime:getAD(item)}
                    }),trainType:trainTypes[item.trainTypeID]
                }
            });

            setDownLines(makeDiagramLine(downTrips,rs));
            setUpLines(makeDiagramLine(upTrips,rs));
        });
    }, [routeID]);
    return {routeStations,downLines,upLines,routeInfo};
}