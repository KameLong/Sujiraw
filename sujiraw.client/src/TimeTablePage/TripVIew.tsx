import {GetStopTime, Station, StopTime, Train, TrainType, Trip} from "../DiaData/DiaData";
import React, {useEffect, useRef} from "react";
import {TimeTablePageSetting} from "./TimeTablePage";
import {StationProps} from "./StationView";
import {timeIntStr} from "./Util";
import {useNavigate} from "react-router-dom";

interface TripViewProps {
    trip: Trip;
    type: TrainType;
    stations: StationProps[];
    setting: TimeTablePageSetting;
    direction: number;
    train:Train;
    allStations:{[key:number]:Station};
}



export function TripView({trip, type, setting, stations, direction,train,allStations}: TripViewProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const navigate=useNavigate();



    useEffect(() => {
        const element = ref.current?.querySelector(`#endStationName`) as HTMLDivElement | null;

        if (element && element.parentElement) {
            const scale = Math.min(1, element.parentElement.offsetWidth / element.offsetWidth);
            element.style.transform = `scaleX(${scale})`;
        }
    }, [allStations, train,ref]);


    function depTimeStr(time: StopTime, _i: number) {
        switch (time.stopType) {
            case 0:
                return "‥";
            case 2:
                return "⇂";
            case 3:
                return "║";
            default:
                if (showAri(_i)) {
                    if (_i < stations.length - 1) {
                        switch (getTimes()[_i + 1].stopType) {
                            case 0:
                                return "‥";
                            case 3:
                                return "║";
                        }
                    } else {
                        return "‥";
                    }
                }
                return timeIntStr(GetStopTime.GetDepAriTime(time));
        }
    }

    function ariTimeStr(time: StopTime, _i: number) {
        switch (time.stopType) {
            case 0:
                return "‥";
            case 2:
                return "⇂";
            case 3:
                return "║";
            default:
                if (showDep(_i)) {
                    if (_i > 0) {
                        switch (getTimes()[_i - 1].stopType) {
                            case 0:
                                return "‥";
                            case 3:
                                return "║";
                        }
                    } else {
                        return "‥";
                    }
                }
                return timeIntStr(GetStopTime.GetAriDepTime(time));
        }
    }

    function showAri(index: number): boolean {
        if(direction===0){
            return ((getStations()[index].style % 16) & 0b0010) !== 0;
        }
        return ((Math.floor(getStations()[index].style/16) % 16) & 0b0010) !== 0;
    }

    function showDep(index: number): boolean {
        if(direction===0){
            return ((getStations()[index].style % 16) & 0b0001) !== 0;
        }
        return ((Math.floor(getStations()[index].style/16) % 16) & 0b0001) !== 0;

    }

    //方向を考慮した駅一覧
    function getStations() {
        if (direction === 0) {
            return stations;
        } else {
            return stations.slice().reverse();
        }
    }
    //方向を考慮した駅時刻一覧
    function getTimes() {
        if (direction === 0) {
            return trip.times;
        } else {
            return trip.times.slice().reverse();
        }
    }

    function hasOuterStation(){
        const routeID=trip.routeID;
        const tripInfo=train.tripInfos.find((value)=>value.routeID===routeID);
        if(tripInfo===undefined){
            return false;
        }


        return tripInfo.ariStationID!==train.ariStationID||tripInfo.ariTime!==train.ariTime;
    }

    function outerEndName(){
        if(!hasOuterStation()) {
            return "‥";
        }

        return allStations[train.ariStationID]?.name??"　";
    }
    function outerEndTime(){
        if(!hasOuterStation()) {
            return "‥";
        }
        return timeIntStr(train.ariTime);
    }
    if(type===undefined){
        return <div>error</div>
    }



    return (
        <div className={"DiaPro"} style={{
            color: type.color,
            borderRight: '1px solid gray',
            width: (setting.fontSize * 2.2) + 'px',
            // flexShrink: 0,
            textAlign: "center",
            fontSize: `${setting.fontSize}px`,
            lineHeight: `${setting.fontSize * setting.lineHeight}px`

        }}
             ref={ref}>
            {
                getTimes().map((time, _i) => {
                    return (
                        <div key={time.rsID}>
                            {
                                (showAri(_i) && showDep(_i)) ?
                                    <div style={{
                                        borderBottom: '1px black solid',
                                        height: `${setting.fontSize * setting.lineHeight}px`,
                                        lineHeight: `${setting.fontSize * setting.lineHeight}px`
                                    }}>
                                        {ariTimeStr(time, _i)}
                                    </div> : null
                            }
                            {
                                (showAri(_i) && !showDep(_i)) ?
                                    <div style={{
                                        height: `${setting.fontSize * setting.lineHeight}px`,
                                        lineHeight: `${setting.fontSize * setting.lineHeight}px`
                                    }}>
                                        {ariTimeStr(time, _i)}
                                    </div> : null
                            }
                            {
                                (showDep(_i)) ?
                                    <div style={{
                                        height: `${setting.fontSize * setting.lineHeight}px`,
                                        lineHeight: `${setting.fontSize * setting.lineHeight}px`
                                    }}>
                                        {depTimeStr(time, _i)}
                                    </div> : null
                            }
                        </div>
                    )
                })
            }
            <div style={{borderTop: '2px solid black'}}>
            </div>
            <div onClick={()=>{
                if(hasOuterStation()) {
                    const tripInfos=train.tripInfos.sort((a,b)=>a.ariTime-b.ariTime);
                    const index=tripInfos.findIndex((value)=>value.routeID===trip.routeID);
                    if(index===-1||index===tripInfos.length-1){
                        return;
                    }
                    navigate(`/timetable/${tripInfos[index+1].routeID}/0?tripID=${tripInfos[index+1].tripID}`)
                }
            }}>
                {hasOuterStation() ? (
                    <div className={"nowrap"}
                    >
                        <span id="endStationName" className="text">{outerEndName()}</span>
                    </div>
                ) : (
                    <div className={"DiaPro"}
                    >
                        {outerEndName()}
                    </div>
                )
                }
                <div className={"DiaPro"}
                >
                    {outerEndTime()}
                </div>
            </div>
            <div style={{borderTop: '2px solid black'}}>
            </div>

        </div>
    )
}