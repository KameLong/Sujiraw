import {時刻表駅, 駅時刻} from "../../DiaData/NewData.ts";
import styles from "./timetable.module.scss";
import {TimeTablePageSetting} from "./TestPage.tsx";
import {redirect} from "react-router-dom";
interface 時刻表時刻ViewProps {
    direction: number;
    時刻:駅時刻
    駅:時刻表駅
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


export function 時刻表時刻View({時刻,駅,setting,direction}:時刻表時刻ViewProps){
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
                depStr=time2Str(時刻.発時刻.time);
                ariStr=time2Str(時刻.着時刻.time);

            }else{
                depStr=time2Str(getBetterTime(時刻.発時刻.time,時刻.着時刻.time));
                ariStr=time2Str(getBetterTime(時刻.着時刻.time,時刻.発時刻.time));
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