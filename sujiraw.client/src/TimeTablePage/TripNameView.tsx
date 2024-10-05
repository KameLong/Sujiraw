import {Station, Train, TrainType, Trip} from "../DiaData/DiaData";
import {TimeTablePageSetting} from "./TimeTablePage";
import {useEffect, useRef} from "react";
import {timeIntStr} from "./Util";
import {useNavigate} from "react-router-dom";

interface TripNameViewProps {
    trip: Trip;
    type: TrainType;
    train:Train;
    setting: TimeTablePageSetting;
    stations:{[key:number]:Station};
}

export function getTripNameViewHeight(setting: TimeTablePageSetting) {
    return setting.fontSize * 9;
}

export function TripNameView({trip,train, type, setting,stations}: TripNameViewProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const navigate=useNavigate();


    function hasOuterStation(){
        const routeID=trip.routeID;
        const tripInfo=train.tripInfos.find((value)=>value.routeID===routeID);
        if(tripInfo===undefined){
            return false;
        }
        return tripInfo.depStationID!==train.depStationID||tripInfo.depTime!==train.depTime;
    }
    function outerStationName(){
        if(!hasOuterStation()) {
            return "‥";
        }
         return stations[train.depStationID]?.name??"　";
    }
    function outerStationTime(){
        if(!hasOuterStation()) {
            return "‥";
        }
        return timeIntStr(train.depTime);
    }
    useEffect(() => {
        const element = ref.current?.querySelector(`#startStationName`) as HTMLDivElement | null;

        if (element && element.parentElement) {
            const scale = Math.min(1, element.parentElement.offsetWidth / element.offsetWidth);
            element.style.transform = `scaleX(${scale})`;
        }
    }, [stations, train,ref]);
    if(type===undefined){
        return <div>error</div>
    }

    return (
        <div style={{
            color: type.color,
            borderRight: '1px solid gray',
            width: (setting.fontSize * 2.2) + 'px',
            flexShrink: 0,
            height: '100%',
            textAlign: "center",
            fontSize: `${setting.fontSize}px`,
            lineHeight: `${setting.fontSize * setting.lineHeight}px`,
            display: 'flex',
            flexDirection: 'column',

        }} ref={ref}
        >
            <div style={{height: (setting.fontSize * setting.lineHeight)}}></div>
            <div style={{borderTop: '1px solid black'}}/>
            <div style={{height: (setting.fontSize * setting.lineHeight)}}>
                {type.shortName.length === 0 ? "　" : type.shortName}</div>
            <div style={{borderTop: '2px solid black'}}>
            </div>
            <div style={{flexGrow:1}}></div>
            <div style={{borderTop: '2px solid black'}}>
            </div>
            <div onClick={()=>{
                if(hasOuterStation()) {
                    const tripInfos=train.tripInfos.sort((a,b)=>a.ariTime-b.ariTime);
                    const index=tripInfos.findIndex((value)=>value.routeID===trip.routeID);
                    if(index===-1||index===0){
                        return;
                    }
                    navigate(`/timetable/${tripInfos[index-1].routeID}/0?tripID=${tripInfos[index-1].tripID}`)
                }
            }}>

            {hasOuterStation()?(
                <div className={"nowrap"}
                >
                    <span id="startStationName" className="text">{outerStationName()}</span>
                </div>

            ): (
                <div className={"DiaPro"}
                >
                    {outerStationName()}
                </div>

            )}
            <div className={"DiaPro"}
            >
                {outerStationTime()}
            </div>
            </div>


        </div>
    )
}