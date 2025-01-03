import {useNavigate, useParams} from "react-router-dom";
import React, {memo, useEffect, useMemo, useState} from "react";
import {useMakeRouteTimeTableData} from "../NewTimeTable/MakeRouteTimeTableDataHook.ts";
import TimeTableView from "../NewTimeTable/TimeTableView.tsx";
import {StationSelectedModal, StationSelectedState} from "./StationSelectedModal.tsx";
import {BottomNavigation, BottomNavigationAction} from "@mui/material";
import ArrowCircleDownRoundedIcon from '@mui/icons-material/ArrowCircleDownRounded';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import { GoGraph } from "react-icons/go";
import { BsArrowReturnLeft } from "react-icons/bs";

export interface TimeTablePageSetting {
    fontSize: number,
    lineHeight: number,
}

export default function RouteTimeTablePage() {
    const param = useParams<{ companyID: string, routeID: string, direct: string }>();
    const navigate=useNavigate();

    const companyID = parseInt(param.companyID ?? "0");
    const routeID = parseInt(param.routeID ?? "0");
    const direct = parseInt(param.direct ?? "0");
    const timetableData = useMakeRouteTimeTableData(companyID, routeID);
    const [stationSelectedState, setStationSelectedState] = useState<StationSelectedState>({
        open: false, station: undefined, stationIndex: 0
    });
    return (
        <>
            <div style={{height:'calc(100% - 50px)'}}>
            <TimeTableView
                timetableData={timetableData.timeTableData}
                direction={direct}
                onStationSelected={(stationId: number, stationIndex: number) => {
                    setStationSelectedState({
                        open: true,
                        station: timetableData.timeTableData.stationInfo[stationId],
                        stationIndex: stationIndex
                    });
                }}
            />
            </div>
            <StationSelectedModal
                state={stationSelectedState}
                onClose={() => setStationSelectedState({open: false, station: undefined, stationIndex: 0})}
                onSortButtonClicked={() => {
                    console.log("sort");
                    setStationSelectedState({open: false, station: undefined, stationIndex: 0});
                    let stationIndex = stationSelectedState.stationIndex;
                    if (direct === 1) {
                        stationIndex = timetableData.timeTableData.stationList.length - 1 - stationIndex;
                    }
                    timetableData.sortTrain(direct, stationIndex);
                }}
            />
            <BottomNavigation
                showLabels
                style={{backgroundColor: '#eee'}}
            >
                <BottomNavigationAction
                    label="下り時刻表" icon={<ArrowCircleDownRoundedIcon />}
                    onClick={() => {
                        navigate(`/timetable/${companyID}/${routeID}/0`);
                    }}
                />
                <BottomNavigationAction label="上り時刻表" icon={<ArrowCircleUpRoundedIcon />}
                    onClick={() => {
                        navigate(`/timetable/${companyID}/${routeID}/1`);
                    }}
                />
                <BottomNavigationAction label="ダイヤグラム" icon={<GoGraph/>}
                onClick={() => {
                    navigate(`/diagram/${companyID}/${routeID}`);

                }}
                />
                <BottomNavigationAction
                    label="戻る" icon={<BsArrowReturnLeft />}
                    onClick={() => {
                        navigate(`/company/${companyID}`);
                    }}
                />
            </BottomNavigation>
        </>
    )
}