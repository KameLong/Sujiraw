

import React, {Profiler, useCallback, useEffect, useRef, useState} from 'react';
import {useParams} from "react-router-dom";
import {DiaData, fetchGzipJson, RouteDTO, RouteInfo, StationDTO, StopTimeDTO, TrainDTO, TrainTypeDTO} from "../DiaData/DiaData";
import {useMakeRouteTimeTable} from "../TimeTablePage/NewTimeTable/路線時刻表データ.ts";
import {DiagramView} from "./DiagramView.tsx";
import {useDiagramServer} from "./hook/DiagramServerHook.ts";
import {useDiagramViewHook2} from "./hook/DiagramHook.ts";





function DiagramPage() {
    const params = useParams<{ routeID: string,companyID:string }>();
    const routeID = Number.parseInt(params.routeID??"0");
    const companyID = Number.parseInt(params.companyID??"0");
    const lineData=useDiagramServer(routeID);
    const {routeStations, downLines, upLines} = useDiagramViewHook2(lineData);

    useEffect(() => {
        console.log(lineData);
    }, [lineData]);
    console.log("AAAA");

    function onRenderCallback(
        id, // the "id" prop of the Profiler tree that has just committed
        phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
        actualDuration, // time spent rendering the committed update
        baseDuration, // estimated time to render the entire subtree without memoization
        startTime, // when React began rendering this update
        commitTime, // when React committed this update
    ) {
        // Aggregate or log render timings...
    }

    return (
        <Profiler id="MyComponent" onRender={onRenderCallback}>
        <DiagramView
            lineData={lineData}
            routeStations={routeStations}
            upLines={upLines}
            downLines={downLines}
        ></DiagramView>
        </Profiler>


    );
}

export default DiagramPage;


const hasTime=(stopTime:StopTimeDTO)=>{
    return stopTime.depTime>=0||stopTime.ariTime>=0;
}


