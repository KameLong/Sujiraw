import {useEffect, useState} from "react";
import {TimeTableServerData} from "../../TimeTablePage/CustomTimeTable/CustomTimeTableData.ts";
import {axiosClient} from "../../CMN/axiosHook.ts";
import {DiagramDataDTO} from "../../DiaData/DiaData.ts";


export function useDiagramServer(routeID:number){

    const [diagramServerData,setDiagramServerData]=useState<DiagramDataDTO>({
        route:{
            routeID:0,
            name:"",
            routeStations:[],
            downTrips:[],
            upTrips:[]
        },
        stations:{},
        trainTypes:{}
    });
    useEffect(() => {
        axiosClient.get(`/api/DiagramData/RouteDiagram/${routeID}`).then((res)=> {
            setDiagramServerData(res.data as DiagramDataDTO);
        }).catch((ex)=>{
            console.error(ex);
        });
    },[routeID]);

    return diagramServerData;

}