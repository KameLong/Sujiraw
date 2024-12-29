import {Station, StationTime} from "../../DiaData/NewData.ts";
import styles from "./timetable.module.scss";
import {TimeTablePageSetting} from "./TestPage.tsx";
import {redirect} from "react-router-dom";
interface TimeTableTimeViewProps {
    direction: number;
    時刻:StationTime
    駅:Station
    // 直前の駅
    befTime?:StationTime
    // 直後の駅
    aftTime?:StationTime
    setting:TimeTablePageSetting


}

function time2Str(time:number):string{
    if(time<0){
        return "⚪︎";
    }
    return `${Math.floor(time/3600)%24}${(Math.floor(time/60)%60).toString().padStart(2,"0")}`;
}
function getBetterTime(time1:number,time2:number):number{
    if(time1 < 0){
        return time2;
    }
    return time1;

}


export function TimeTableTimeView({時刻,befTime,aftTime,駅,setting,direction}:TimeTableTimeViewProps){
    // const divWidth=setting.fontSize*2.2;
    const isBothShow=駅.isShowDep(direction)&&駅.isShowAri(direction);
    const lineHeight=setting.lineHeight*setting.fontSize;

    let ariStr:string="";
    let depStr:string="";

    switch (時刻.stopType){
        case 0:
            depStr="‥";
            ariStr="‥";
            break;
        case 2:
            depStr="⇂";
            ariStr="⇂";
            break;
        case 3:
            depStr="║";
            ariStr="║";
            break;
        default:
            if(isBothShow){
                //発着表示の時
                depStr=time2Str(時刻.depTime.time);
                //発着表示の時、かつ発時刻が存在しないときの処理、aftStationが運行なしなら運行なし、経由なしなら経由なし
                if(時刻.depTime.time<0){
                    if(aftTime){
                        if(aftTime.stopType==0){
                            depStr="‥";
                        }else if (aftTime.stopType==3){
                            depStr="║";
                        }
                    }else{
                        depStr="‥";
                    }
                }

                ariStr=time2Str(時刻.ariTime.time);
                //発着表示の時、かつ着時刻が存在しないときの処理、befStationが運行なしなら運行なし、経由なしなら経由なし
                if(時刻.ariTime.time<0){
                    if(befTime){
                        if(befTime.stopType==0){
                            ariStr="‥";
                        }else if (befTime.stopType==3){
                            ariStr="║";
                        }
                    }else{
                        ariStr="‥";
                    }
                }


            }else{
                depStr=time2Str(getBetterTime(時刻.depTime.time,時刻.ariTime.time));
                ariStr=time2Str(getBetterTime(時刻.ariTime.time,時刻.depTime.time));
            }
            break;
    }

    return <div>
        {駅.isShowAri(direction)?
            <div className={styles.time} style={{
                lineHeight: `${lineHeight}px`,
                height: `${lineHeight}px`}}>
                {ariStr}
            </div>:null
        }
        {駅.isShowAri(direction)&&駅.isShowDep(direction) ?
            <div style={{borderBottom:'1px solid black'}}>
            </div>:null
        }

        {駅.isShowDep(direction)?
            <div className={styles.time} style={{lineHeight: `${lineHeight}px`,height: `${lineHeight}px`}}>
            {depStr}
            </div>:null
        }
    </div>
}