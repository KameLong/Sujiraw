import {時刻表列車, 時刻表駅} from "../../DiaData/NewData.ts";
import {Station} from "../../oud/models/Station.ts";
import {StationDTO} from "../../DiaData/DiaData.ts";


interface 時刻表列車ViewProps {
    train:時刻表列車;
    routeStation:時刻表駅[]
    stations:{[key:number]:StationDTO}
}
export function 時刻表列車View({train,routeStation,stations}:時刻表列車ViewProps){
    return(
        <div style={{display:"flex"}}>
            {
                train.列車要素.map((trip,index)=>{
                    return(
                        <div key={index} style={{width:50,borderRight:'1px solid black'}}>
                            {
                                routeStation.map((駅,駅順)=>{
                                    return(
                                        <div>
                                            {trip.駅時刻リスト[駅順].発時刻.time}
                                        </div>)
                                })
                            }
                        </div>
                    )
                })
            }

        </div>
    )
}