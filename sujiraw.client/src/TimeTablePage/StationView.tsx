import React, {useEffect} from "react";
import {TimeTablePageSetting} from "./RouteTimeTable/RouteTimeTablePage.tsx";
import {stationStyle} from "./Util";

export interface StationProps {
    rsID: number;
    name: string;
    style: number;
    border: boolean;
}

interface StationViewProps {
    stations: StationProps[];
    setting: TimeTablePageSetting;
    direction: number;
}

export function getStationViewWidth(setting: TimeTablePageSetting) {
    return setting.fontSize * 4 + 10;
}

export function StationView({stations, setting, direction}: StationViewProps) {
    useEffect(() => {
        stations.forEach((station) => {
            const element = document.getElementById(`text-${station.rsID}`);
            if (element && element.parentElement) {
                const scale = Math.min(1, element.parentElement.offsetWidth / element.offsetWidth);
                element.style.transform = `scaleX(${scale})`;
            }
        });
    }, [stations, direction]);

    function stationList() {
        if (direction === 0) {
            return stations;
        } else {
            return stations.slice().reverse();
        }
    }


    return (
        <div>
            <div style={{
                flexShrink: 0,
                textAlign: "center",
                fontSize: `${setting.fontSize}px`,
                lineHeight: `${setting.fontSize * setting.lineHeight}px`
            }}>
                {
                    stationList().map((station, _i) => {
                        switch (stationStyle(station, direction)) {
                            case 1:
                            case 2:
                                return (
                                    <div key={station.rsID}>
                                        <div style={{
                                            height: `${setting.fontSize * setting.lineHeight}px`,
                                            lineHeight: `${setting.fontSize * setting.lineHeight}px`,
                                            padding: '0px 5px',
                                        }}
                                             className={"nowrap"}
                                             >
                                        <span id={`text-${station.rsID}`} className="text">
                                       {station.name}
                                        </span>
                                        </div>
                                        {
                                            station.border ? <div
                                                style={{borderTop: '2px solid black', width: '100%'}}></div> : null
                                        }
                                    </div>
                                );
                            case 3:
                                return (
                                    <div key={station.rsID}>
                                    <div style={{
                                        whiteSpace: 'nowrap',
                                        overflow: "hidden",
                                        height: `${setting.fontSize * setting.lineHeight * 2}px`,
                                        lineHeight: `${setting.fontSize * setting.lineHeight * 2}px`,
                                        padding: '0px 5px',


                                    }}>
                                        <span id={`text-${station.rsID}`} className="text">{station.name}</span>

                                    </div>
                                        {
                                            station.border ? <div
                                                style={{borderTop: '2px solid black', width: '100%'}}></div> : null
                                        }


                                    </div>
                                );
                        }
                    })
                }
            </div>
            <div style={{borderTop: '2px solid black'}}>
            </div>

            <div className={"nowrap"}
                 style={{
                     lineHeight: `${setting.fontSize * setting.lineHeight * 2}px`, textAlign: "center",
                 }}
            >
                終着
            </div>
            <div style={{borderTop: '2px solid black'}}>
            </div>

        </div>
    )
}