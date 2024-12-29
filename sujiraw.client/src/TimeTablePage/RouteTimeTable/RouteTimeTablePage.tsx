import {useLocation} from "react-use";
import {useParams} from "react-router-dom";
import {getStationViewWidth, StationView} from "../StationView.tsx";
import {getTripNameViewHeight, TripNameView} from "../TripNameView.tsx";
import {StationHeaderView} from "../StationHeaderView.tsx";
import {HolizontalBoxList} from "../HolizontalBoxList.tsx";
import {BottomMenu} from "../../Menu/BottomMenu.tsx";
import React, {memo, useEffect, useMemo, useState} from "react";
import {TripView} from "../TripView.tsx";

import {TripDTO} from "../../DiaData/DiaData.ts";
import {useRouteTimeTableData} from "./RouteTimeTableData.ts";
import {TimeTableTrain, TripData} from "../CustomTimeTable/CustomTimeTableData.ts";
import {useMakeRouteTimeTable} from "../NewTimeTable/路線時刻表データ.ts";
import TimeTableView from "../NewTimeTable/TimeTableView.tsx";
import {StationSelectedModal, StationSelectedState} from "./StationSelectedModal.tsx";
import {LineData} from "../../DiaData/NewData.ts";
export interface TimeTablePageSetting{
    fontSize:number,
    lineHeight:number,
}
export default function RouteTimeTablePage(){
    const param = useParams<{ companyID:string,routeID:string,direct: string  }>();

    const companyID=parseInt(param.companyID??"0");
    const routeID=parseInt(param.routeID??"0");
    const direct=parseInt(param.direct??"0");
    const timetableData=useMakeRouteTimeTable(companyID,routeID);
    const [stationSelectedState,setStationSelectedState]=useState<StationSelectedState>({
        open:false,station:undefined,stationIndex:0
    });
    return (
        <>
        <TimeTableView timetableData={timetableData.timeTableData}
                       direction={direct}
                       onStationSelected={(stationId:number,stationIndex:number)=>{
                            setStationSelectedState({
                                open:true,
                                station:timetableData.timeTableData.stationInfo[stationId],
                                stationIndex:stationIndex
                            });
                           console.log(stationId);
                       }}
        />
            <StationSelectedModal state={stationSelectedState}
                                  onClose={()=>setStationSelectedState({open:false,station:undefined,stationIndex:0})}
                                  onSortButtonClicked={()=>{
                                        console.log("sort");
                                        setStationSelectedState({open:false,station:undefined,stationIndex:0});
                                        let stationIndex=stationSelectedState.stationIndex;
                                        if(direct===1){
                                            stationIndex=timetableData.timeTableData.stationList.length-1-stationIndex;
                                        }
                                        timetableData.sortTrain(direct,stationIndex);


                                  }}


            />
        </>
    )
}