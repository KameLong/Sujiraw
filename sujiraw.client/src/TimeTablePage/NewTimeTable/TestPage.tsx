import {use路線時刻表データ作成, use路線時刻表データ取得} from "./路線時刻表データ.ts";
import {useEffect} from "react";
import {時刻表列車View} from "./時刻表列車View.tsx";

export default function TestPage() {
    const a=use路線時刻表データ作成(5438111112826774,6052917633425697);
    useEffect(() => {
        console.log(a);

    }, [a]);

    if(a.下り列車.length==0){
        return(<div></div>)
    }
    return(
        <div style={{display:'flex'}}>
            {
                a.下り列車.map((列車,index)=>
                    <時刻表列車View key={index} train={列車} routeStation={a.駅リスト} stations={a.stations}></時刻表列車View>
                )
            }
        </div>
        )



}