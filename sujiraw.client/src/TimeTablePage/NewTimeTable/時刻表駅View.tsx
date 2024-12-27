import {Station} from "../../DiaData/NewData.ts";
import {時刻表時刻View} from "./時刻表時刻View.tsx";
import {MatchTextLabel} from "./MatchTextLabel.tsx";


interface TimeTableStationViewProp{
    stations:Station[]
    direction:number,
    lineHeight:number
}

export function 時刻表駅View({stations,direction,lineHeight}:TimeTableStationViewProp){
    const stationList=direction===0?stations:stations.toReversed();
    const 駅View=(駅:Station)=>{
        if (駅.isShowAri(direction)&&駅.isShowDep(direction)) {
            return (
                <div key={駅.stationId} style={{
                    height: `${lineHeight * 2 + 1}px`,
                    lineHeight: `${lineHeight * 2 + 1}px`,
                    overflowX: "hidden",
                    whiteSpace: 'nowrap',
                    margin:'0px 3px'

                }}><MatchTextLabel>
                        {駅.stationName}
                    </MatchTextLabel></div>
            )
        }else{
            return (
                <div key={駅.stationId} style={{
                    lineHeight: `${lineHeight }px`,
                    height: `${lineHeight }px`,
                    whiteSpace: 'nowrap',
                    margin:'0px 3px',
                }}><MatchTextLabel>
                    {駅.stationName}
                </MatchTextLabel></div>
            )
        }
    }

    return (
        <div>
            {
                stationList.map((駅, 駅順) => 駅View(駅))
            }
        </div>
    )
}