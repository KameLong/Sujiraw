import {Station} from "../../DiaData/NewData.ts";
import {TimeTableTimeView} from "./TimeTableTimeView.tsx";
import {MatchTextLabel} from "./MatchTextLabel.tsx";


interface TimeTableStationViewProp{
    stations:Station[]
    direction:number,
    lineHeight:number,

    onDblClick?:(station:Station,index:number)=>void
}

export function TimeTableStationView({stations,direction,lineHeight,onDblClick}:TimeTableStationViewProp){
    const stationList=direction===0?stations:stations.toReversed();
    const StationView=(station:Station,index:number)=>{
        if (station.isShowAri(direction)&&station.isShowDep(direction)) {
            return (
                <div key={station.stationId}
                     style={{
                        height: `${lineHeight * 2 + 1}px`,
                        lineHeight: `${lineHeight * 2 + 1}px`,
                        overflow: "hidden",
                        whiteSpace: 'nowrap',
                        margin:'0px 3px'
                }}
                     onDoubleClick={()=>onDblClick?.(station,index)}
                ><MatchTextLabel>
                        {station.stationName}
                </MatchTextLabel></div>
            )
        }else{
            return (
                <div key={station.stationId}
                     style={{
                        lineHeight: `${lineHeight }px`,
                        height: `${lineHeight }px`,
                         overflow: "hidden",
                        whiteSpace: 'nowrap',
                        margin:'0px 3px',
                    }}
                        onDoubleClick={()=>onDblClick?.(station,index)}
                ><MatchTextLabel>
                    {station.stationName}
                </MatchTextLabel></div>
            )
        }
    }

    return (
        <div>
            {
                stationList.map((station, stationIndex) => StationView(station,stationIndex))
            }
        </div>
    )
}