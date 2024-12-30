

import React, { useEffect} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {DiagramView} from "./DiagramView.tsx";
import {useDiagramServer} from "./hook/DiagramServerHook.ts";
import {useDiagramViewHook2} from "./hook/DiagramHook.ts";
import {BottomNavigation, BottomNavigationAction} from "@mui/material";
import ArrowCircleDownRoundedIcon from "@mui/icons-material/ArrowCircleDownRounded";
import ArrowCircleUpRoundedIcon from "@mui/icons-material/ArrowCircleUpRounded";
import {GoGraph} from "react-icons/go";
import {BsArrowReturnLeft} from "react-icons/bs";





export function DiagramPage() {
    const params = useParams<{ routeID: string,companyID:string }>();
    const routeID = Number.parseInt(params.routeID??"0");
    const companyID = Number.parseInt(params.companyID??"0");
    const lineData=useDiagramServer(routeID);
    const {routeStations, downLines, upLines} = useDiagramViewHook2(lineData);
    const navigate=useNavigate();

    useEffect(() => {

    }, [lineData]);


    return (
        <>
            <div style={{height:'calc(100% - 50px)',
            overflow:'hidden'}}>
            <DiagramView
                routeStations={routeStations}
                upLines={upLines}
                downLines={downLines}
            ></DiagramView>
            </div>

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


    );
}





