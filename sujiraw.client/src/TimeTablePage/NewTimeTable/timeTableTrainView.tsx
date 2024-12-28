import {Train, Station } from "../../DiaData/NewData.ts";
import {Station as StatoinInfo} from "../../oud/models/Station.ts";
import {StationDTO, TrainTypeDTO} from "../../DiaData/DiaData.ts";
import {TimeTableTimeView} from "./timeTableTimeView.tsx";
import {TimeTablePageSetting} from "./TestPage.tsx";


interface TimeTableTrainViewProps {
    train:Train;
    routeStation:Station[]
    setting:TimeTablePageSetting;
    stations:{[key:number]:StationDTO}
    types:{[key:number]:TrainTypeDTO}


}
export function TimeTableTrainView({train,routeStation,setting,types}:TimeTableTrainViewProps){
    const divWidth=setting.fontSize*2.2;

    return(
        <div style={{display:"flex"}}>
            {
                train.trips.map((trip, index)=>{
                    return(
                        <div key={index} style={{color:types[trip.trainTypeId].color,width:divWidth,borderRight:'1px solid black'}}>
                            {
                                routeStation.map((station,sIndex)=>{
                                    return(
                                        <TimeTableTimeView key={sIndex} direction={0} 駅={station} 時刻={trip.stationTime[sIndex]} setting={setting}/>
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