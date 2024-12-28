import {useMakeRouteTimeTable, useGetTimeTableData} from "./路線時刻表データ.ts";
import React, {useEffect, useState} from "react";
import {TimeTableTrainView} from "./timeTableTrainView.tsx";
import {HolizontalBoxList} from "../HolizontalBoxList.tsx";
import {時刻表駅View} from "./時刻表駅View.tsx";
import {時刻表列車名View} from "./時刻表列車名View.tsx";
import TimeTableView from "./TimeTableView.tsx";
export interface TimeTablePageSetting{
    fontSize:number,
    lineHeight:number,
}

export default function TestPage() {
    const a=useMakeRouteTimeTable(5438111112826774,6052917633425697);
    return (
        <TimeTableView timetableData={a}  direction={0}/>
    )


}