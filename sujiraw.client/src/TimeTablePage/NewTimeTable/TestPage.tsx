import {useMakeRouteTimeTableData, useGetTimeTableData} from "./MakeRouteTimeTableDataHook.ts";
import React from "react";
import TimeTableView from "./TimeTableView.tsx";
export interface TimeTablePageSetting{
    fontSize:number,
    lineHeight:number,
}

export default function TestPage() {
    const a=useMakeRouteTimeTableData(5438111112826774,6052917633425697);
    return (
        <TimeTableView
            timetableData={a.timeTableData}
            direction={0}
        />
    )


}