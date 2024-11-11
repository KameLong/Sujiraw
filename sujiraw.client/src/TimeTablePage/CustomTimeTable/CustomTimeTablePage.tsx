import {useLocation} from "react-use";
import {useTimeTableData} from "./TimeTableData.ts";
import {useParams} from "react-router-dom";
import {getStationViewWidth, StationView} from "../StationView.tsx";
import {getTripNameViewHeight, TripNameView} from "../TripNameView.tsx";
import {StationHeaderView} from "../StationHeaderView.tsx";
import {HolizontalBoxList} from "../HolizontalBoxList.tsx";
import {BottomMenu} from "../../Menu/BottomMenu.tsx";
import React, {memo, useMemo, useState} from "react";
import {TimeTablePageSetting} from "../TimeTablePage.tsx";
import {TripView} from "../TripView.tsx";
import {TripDTO} from "../../DiaData/DiaData.ts";

export function MainTimeTablePage(){
    const param = useParams<{ companyID:string,timetableID:string,direct: string  }>();
    const companyID=parseInt(param.companyID??"0");
    const timetableID=parseInt(param.timetableID??"0");
    const direct=parseInt(param.direct??"0");

    const timetableData=useTimeTableData(companyID,timetableID,direct);

    const [setting,setSetting]=useState<TimeTablePageSetting>({
        fontSize:13,
        lineHeight:1.1
    });

    let setScrollX:undefined|((scrollX:number)=>void)=undefined;
    let setScrollX2:undefined|((scrollX:number)=>void)=undefined;
    const MemoTripView = memo(TripView);
    const MemoTripNameView = memo(TripNameView);


    const getStationProps=useMemo(()=>{
        const timetable=timetableData.timetableServerData.timeTable;
        const stations=timetable.timetableStations;
        function GetRouteStation(routeStationID:number){
            return Object.values(timetableData.timetableServerData.routes).map((route)=>route.routeStations).flat().find((routeStation)=>routeStation.rsID===routeStationID);
        }
        const res= stations.map((station,_i)=>{
            const routeStation=GetRouteStation(station.depRouteStationID===0?station.ariRouteStationID:station.depRouteStationID);
            let border=station.border;
            if(direct===1){
                if(_i===0){
                    border=false;
                }
                else{
                    border=stations[_i-1].border;
                }

            }
            return {
                rsID:routeStation.rsID,
                name:timetableData.timetableServerData.stations[routeStation.stationID]?.name??"",
                style:station.showStyle===0?0b00110011:station.showStyle,
                border:border
            }
        });
        console.log(res);
        return res;
    },[timetableData]);


    const Column = ( index:number, style:any) => {
        const trip=timetableData.trains[index];
        const selected=false;
        return (
            <div key={trip.trainID} className={selected?"selected":""} style={style}>
                <MemoTripView trip={trip as unknown as TripDTO} type={timetableData.timetableServerData.trainTypes[trip.trainTypeID]}
                              setting={setting} stations={getStationProps} allStations={timetableData.timetableServerData.stations}
                              train={timetableData.timetableServerData.trains[trip.trainID]}

                              direction={direct}/>
            </div>
        );
    }
    const Column2 = (index:number, style:any) => {
        const trip=timetableData.trains[index];

        const selected=false;
        return (
            <div className={selected?"selected":""} key={trip.trainID} style={{...style,height:`${getTripNameViewHeight(setting)}px`,borderBottom:'2px solid black'}}>
                <MemoTripNameView trip={trip as unknown as TripDTO} type={timetableData.timetableServerData.trainTypes[trip.trainTypeID]}
                                  setting={setting}
                                  train={timetableData.timetableServerData.trains[trip.trainID]}
                                  stations={timetableData.timetableServerData.stations}
                />

            </div>
        );
    }



    if(timetableData.timetableServerData.timeTable.timetableStations.length===0) {
        return <div>loading</div>
    }
    return (
        <div style={{background:'white',width: '100%',height:'100%',fontSize: `${setting.fontSize}px`, lineHeight: `${setting.fontSize * setting.lineHeight}px`}}>
            <div style={{display: "flex", width: '100%', height: '100%', paddingBottom: "70px",zIndex:5,overflow:'visible'}}>
                <div style={{
                    width: `${getStationViewWidth(setting)}px`,
                    borderRight: "2px solid black",
                    borderBottom: "2px solid black",
                    position: "fixed",
                    height: `${getTripNameViewHeight(setting)}px`,
                    background: "white",
                    zIndex: 20
                }}>
                    <StationHeaderView  setting={setting}/>
                </div>
                <div style={{
                    width: `${getStationViewWidth(setting)}px`,
                    borderRight: "2px solid black",
                    position: 'fixed',
                    zIndex:1,
                    paddingTop: `${getTripNameViewHeight(setting)}px`,
                    background: "white"
                }} id="stationViewLayout">
                    <StationView stations={getStationProps} setting={setting} direction={direct}/>
                </div>
                <div style={{width: '0px', flexShrink: 1, flexGrow: 1, paddingRight: '10px',
                    display:'flex',flexDirection:'column'}}>
                    <div
                        style={{
                            paddingLeft: `${getStationViewWidth(setting)}px`,
                            overflowX: "hidden",
                            width: '100%',
                            height:getTripNameViewHeight(setting)
                        }}
                    >
                        <HolizontalBoxList
                            itemCount={timetableData.trains.length}
                            itemSize={(setting.fontSize * 2.2)}
                            getSetScrollX={(_setScrollX)=> {
                                setScrollX2=_setScrollX;
                            }
                            }
                        >
                            {Column2}
                        </HolizontalBoxList>
                    </div>

                    <div
                        style={{
                            flexGrow: 1,
                            height:0,
                            paddingLeft: `${getStationViewWidth(setting)}px`,
                            // paddingTop: `${getTripNameViewHeight(setting)}px`,
                            overflowX: "hidden",
                            width: '100%',
                        }}
                    >
                        <HolizontalBoxList
                            itemCount={timetableData.trains.length}
                            itemSize={(setting.fontSize * 2.2)}
                            onScroll={(_scrollX, scrollY)=>{
                                const stationViewLayout=document.getElementById("stationViewLayout")
                                if(stationViewLayout!==null){
                                    stationViewLayout.style.top=-scrollY+"px";
                                }
                                if(setScrollX2!==undefined) {
                                    setScrollX2(_scrollX);
                                }
                            }
                            }
                            getSetScrollX={(_setScrollX)=> {
                                setScrollX=_setScrollX;
                            }
                            }

                        >
                            {Column}
                        </HolizontalBoxList>
                    </div>

                </div>
            </div>
        </div>
    );
}