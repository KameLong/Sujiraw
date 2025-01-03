import {useEffect, useState} from "react";
import {
    TimeTableServerData,
} from "../CustomTimeTable/CustomTimeTableData.ts";
import {axiosClient} from "../../CMN/axiosHook.ts";


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
        axiosClient.get(`/api/NewTimeTable/Route/${routeID}`).then((res)=> {
            setTimetableServerData(res.data);
        }).catch((ex)=>{
            console.error(ex);
        });
    },[]);
    return timetableServerData;
}

