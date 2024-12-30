import {useLocation} from "react-use";
import {useNavigate, useParams} from "react-router-dom";
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
import {BottomNavigation, BottomNavigationAction} from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowCircleDownRoundedIcon from '@mui/icons-material/ArrowCircleDownRounded';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import { GoGraph } from "react-icons/go";
import { BsGraphDown } from "react-icons/bs";
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
    const timetableData = useMakeRouteTimeTable(companyID, routeID);
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
                    console.log(stationId);
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

                // value={value}
                // onChange={(event, newValue) => {
                //     setValue(newValue);
                // }}
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