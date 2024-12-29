import {Station} from "../../DiaData/NewData.ts";
import {TimeTableTimeView} from "./TimeTableTimeView.tsx";
import {MatchTextLabel} from "./MatchTextLabel.tsx";


interface TimeTableStationViewProp{
    stations:Station[]
    direction:number,
    lineHeight:number,

    onDblClick?:(station:Station,index:number)=>void
}

export function 時刻表駅View({stations,direction,lineHeight,onDblClick}:TimeTableStationViewProp){
    const stationList=direction===0?stations:stations.toReversed();
    const 駅View=(駅:Station,index:number)=>{
        if (駅.isShowAri(direction)&&駅.isShowDep(direction)) {
            return (
                <div key={駅.stationId}
                     style={{
                        height: `${lineHeight * 2 + 1}px`,
                        lineHeight: `${lineHeight * 2 + 1}px`,
                        overflow: "hidden",
                        whiteSpace: 'nowrap',
                        margin:'0px 3px'
                }}
                     onDoubleClick={()=>onDblClick?.(駅,index)}
                ><MatchTextLabel>
                        {駅.stationName}
                </MatchTextLabel></div>
            )
        }else{
            return (
                <div key={駅.stationId}
                     style={{
                        lineHeight: `${lineHeight }px`,
                        height: `${lineHeight }px`,
                         overflow: "hidden",
                        whiteSpace: 'nowrap',
                        margin:'0px 3px',
                    }}
                        onDoubleClick={()=>onDblClick?.(駅,index)}
                ><MatchTextLabel>
                    {駅.stationName}
                </MatchTextLabel></div>
            )
        }
    }

    return (
        <div>
            {
                stationList.map((駅, 駅順) => 駅View(駅,駅順))
            }
        </div>
    )
}