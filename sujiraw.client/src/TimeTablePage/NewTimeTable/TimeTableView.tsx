import {useMakeRouteTimeTable, useGetTimeTableData} from "./路線時刻表データ.ts";
import React, {useEffect, useState} from "react";
import {TimeTableTrainView} from "./TimeTableTrainView.tsx";
import {HolizontalBoxList} from "../HolizontalBoxList.tsx";
import {時刻表駅View} from "./時刻表駅View.tsx";
import {時刻表列車名View} from "./時刻表列車名View.tsx";
import {LineData} from "../../DiaData/NewData.ts";
export interface TimeTablePageSetting{
    fontSize:number,
    lineHeight:number,
}

interface TimeTableViewProp{
    timetableData:LineData;
    direction:number;
    onStationSelected?:(stationId:number,stationIndex:number)=>void;
}

export default function TimeTableView({timetableData,direction,onStationSelected}:TimeTableViewProp) {
    const [timetableSetting,setTimetableSetting] = useState<TimeTablePageSetting>({
        fontSize:13,
        lineHeight:1.1
    });

    let setScrollX:undefined|((scrollX:number)=>void)=undefined;
    let setScrollX2:undefined|((scrollX:number)=>void)=undefined;

    useEffect(() => {
        console.log(timetableData);
    }, [timetableData]);

    const lineHeight=timetableSetting.lineHeight*timetableSetting.fontSize;
    const fontSize=timetableSetting.fontSize;
    const width=2.2*timetableSetting.fontSize;
    const stationNameWidth=4*timetableSetting.fontSize;

    const trains=direction===0?timetableData.downTrains:timetableData.upTrains;


    if(timetableData.downTrains.length==0){
        return(<div></div>)
    }

    const TrainView = ( index:number, style:any) => {
        const train=trains[index];
        const selected=false;
        return (
            <div key={index} className={selected?"selected":""} style={style}>
                <TimeTableTrainView train={train}
                                    direction={direction}
                                    routeStation={timetableData.stationList}
                                    types={timetableData.trainTypes}
                                    stations={timetableData.stationInfo}
                                    setting={timetableSetting}>
                </TimeTableTrainView>
            </div>
        );
    }
    const TrainNameView = ( index:number, style:any) => {
        const trip=trains[index];
        const selected=false;
        return (
            <div key={index} className={selected?"selected":""} style={style}>
                <時刻表列車名View train={trip} routeStation={timetableData.stationList} types={timetableData.trainTypes} stations={timetableData.stationInfo}
                                  setting={timetableSetting}></時刻表列車名View>
            </div>
        );
    }

    return (

        <div style={{
            background: 'white',
            width: '100%',
            height: '100%',
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}px`,

        }}>
            <div style={{
                display: "flex",
                width: '100%',
                height: '100%',
                zIndex: 5,
            }}>
                <div style={{
                    height: '100%',
                    width: `${stationNameWidth}px`,
                    overflow: 'hidden',
                    position: 'relative'
                }}>

                    <div style={{
                        width: `${stationNameWidth}px`,
                        borderRight: "2px solid black",
                        borderBottom: "2px solid black",
                        position: "absolute",
                        height: `${100}px`,
                        background: "white",
                        zIndex: 20
                    }}>
                        {/*<StationHeaderView setting={setting}/>*/}
                    </div>
                    <div style={{
                        width: `${stationNameWidth}px`,
                        borderRight: "2px solid black",
                        position: 'absolute',
                        zIndex: 1,
                        paddingTop: `${100}px`,
                        overflow: 'hidden',
                        background: "white"

                    }} id="stationViewLayout">
                        <時刻表駅View stations={timetableData.stationList}
                                      direction={direction}
                                      lineHeight={lineHeight}
                                      onDblClick={(station, index: number) => {
                                          onStationSelected?.(station.stationId, index);
                                      }}
                        />
                    </div>
                </div>
                <div style={{
                    width: '0px', flexShrink: 1, flexGrow: 1, paddingRight: '10px',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div
                        style={{
                            overflowX: "hidden",
                            width: '100%',
                            height: 100
                        }}
                    >
                        <HolizontalBoxList
                            itemCount={trains.length}
                            itemSize={(fontSize * 2.2)}
                            getSetScrollX={(_setScrollX) => {
                                setScrollX2 = _setScrollX;
                            }}
                            onScroll={(_scrollX, scrollY) => {
                                setScrollX?.(_scrollX);
                            }}
                        >
                            {TrainNameView}
                        </HolizontalBoxList>
                    </div>

                    <div
                        style={{
                            flexGrow: 1,
                            height: 0,
                            overflowX: "hidden",
                            width: '100%',
                        }}
                    >
                        <HolizontalBoxList
                            itemCount={trains.length}
                            itemSize={(fontSize * 2.2)}
                            onScroll={(_scrollX, scrollY) => {
                                const stationViewLayout = document.getElementById("stationViewLayout")
                                if (stationViewLayout !== null) {
                                    stationViewLayout.style.top = -scrollY + "px";
                                }
                                setScrollX2?.(_scrollX);
                            }}
                            getSetScrollX={(_setScrollX) => {
                                setScrollX = _setScrollX;
                            }
                            }

                        >
                            {TrainView}
                        </HolizontalBoxList>
                    </div>

                </div>

            </div>
            <div style={{height: '10px'}}></div>

        </div>


    )


}