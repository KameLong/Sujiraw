import {useLocation} from "react-use";
import {useParams} from "react-router-dom";
import {getStationViewWidth, StationView} from "../StationView.tsx";
import {getTripNameViewHeight, TripNameView} from "../TripNameView.tsx";
import {StationHeaderView} from "../StationHeaderView.tsx";
import {HolizontalBoxList} from "../HolizontalBoxList.tsx";
import {BottomMenu} from "../../Menu/BottomMenu.tsx";
import React, {memo, useMemo, useState} from "react";
import {TripView} from "../TripView.tsx";

import {TripDTO} from "../../DiaData/DiaData.ts";
import {useRouteTimeTableData} from "./RouteTimeTableData.ts";
import {TimeTableTrain, TripData} from "../CustomTimeTable/CustomTimeTableData.ts";
import {useMakeRouteTimeTable} from "../NewTimeTable/路線時刻表データ.ts";
import TimeTableView from "../NewTimeTable/TimeTableView.tsx";
export interface TimeTablePageSetting{
    fontSize:number,
    lineHeight:number,
}
export default function RouteTimeTablePage(){
    const param = useParams<{ companyID:string,routeID:string,direct: string  }>();
    const companyID=parseInt(param.companyID??"0");
    const routeID=parseInt(param.routeID??"0");
    const direct=parseInt(param.direct??"0");
    const a=useMakeRouteTimeTable(companyID,routeID);
    return (
        <TimeTableView timetableData={a}  direction={direct}/>
    )
}