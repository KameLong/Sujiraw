import {Train, Station } from "../../DiaData/NewData.ts";
import {Station as StatoinInfo} from "../../oud/models/Station.ts";
import {StationDTO, TrainTypeDTO} from "../../DiaData/DiaData.ts";
import {TimeTableTimeView} from "./TimeTableTimeView.tsx";
import {TimeTablePageSetting} from "./TestPage.tsx";


interface TimeTableTrainViewProps {
    train:Train;
    routeStation:Station[]
    setting:TimeTablePageSetting;
    stations:{[key:number]:StationDTO}
    types:{[key:number]:TrainTypeDTO}
    direction:number;


}
export function TimeTableTrainView({train,routeStation,setting,types,direction}:TimeTableTrainViewProps){
    const divWidth=setting.fontSize*2.2;
    const orderedRouteStation=direction===0?routeStation:routeStation.toReversed();
    return(
        <div style={{display:"flex"}}>
            {
                train.trips.map((trip, index)=>{
                    const orderedStationTime=direction===0?trip.stationTime:trip.stationTime.toReversed();
                    return(
                        <div key={index}
                             style={{
                                 color:types[trip.trainTypeId].color,
                                 width:divWidth,
                                 borderRight:'1px solid black',
                                 borderBottom:'2px solid black',
                        }}>
                            {
                                orderedRouteStation.map((station,sIndex)=>{
                                    return(
                                        <TimeTableTimeView key={sIndex} direction={1}
                                                           befTime={orderedStationTime[sIndex-1]} aftTime={orderedStationTime[sIndex+1]}
                                                           station={station} stationTime={orderedStationTime[sIndex]} setting={setting} />
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