import {Train, Station } from "../../DiaData/NewData.ts";
import {Station as StatoinInfo} from "../../oud/models/Station.ts";
import {StationDTO, TrainTypeDTO} from "../../DiaData/DiaData.ts";
import {時刻表時刻View} from "./時刻表時刻View.tsx";
import {TimeTablePageSetting} from "./TestPage.tsx";


interface 時刻表列車ViewProps {
    train:Train;
    routeStation:Station[]
    setting:TimeTablePageSetting;
    stations:{[key:number]:StationDTO}
    types:{[key:number]:TrainTypeDTO}


}
export function 時刻表列車View({train,routeStation,setting,types}:時刻表列車ViewProps){
    const divWidth=setting.fontSize*2.2;

    return(
        <div style={{display:"flex"}}>
            {
                train.trips.map((trip, index)=>{
                    return(
                        <div key={index} style={{color:types[trip.trainTypeId].color,width:divWidth,borderRight:'1px solid black'}}>
                            {
                                routeStation.map((駅,駅順)=>{
                                    return(
                                        <時刻表時刻View key={駅順} direction={0} 駅={駅} 時刻={trip.stationTime[駅順]} setting={setting}/>
                                    )
                                })
                            }
                        </div>
                    )
                })
            }

        </div>
    )
}