import {Train, Station} from "../../DiaData/NewData.ts";
import {StationDTO, TrainTypeDTO} from "../../DiaData/DiaData.ts";
import {TimeTablePageSetting} from "./TestPage.tsx";
import styles from "./timetable.module.scss"
import React from "react";
import {MatchTextLabel} from "./MatchTextLabel.tsx";

interface TimeTableTrainNameViewProps {
    train:Train;
    routeStation:Station[]
    setting:TimeTablePageSetting;
    stations:{[key:number]:StationDTO}
    types:{[key:number]:TrainTypeDTO}


}

export function TimeTableTrainNameView({train,routeStation,setting,types}:TimeTableTrainNameViewProps){
    const viewHeight=setting.fontSize*4;
    const divWidth=setting.fontSize*2.2;

    const trainTypes=types[train.trips[0].trainTypeId];


    return(
        <div style={{borderRight: '1px solid black', width: divWidth,height:100, color: trainTypes.color,borderBottom: '2px gray solid'}}>
            <MatchTextLabel>
                {"　"}
            </MatchTextLabel>
            <div style={{borderBottom: '1px gray solid'}}></div>
            <MatchTextLabel>
                {trainTypes.name}
            </MatchTextLabel>
            <div style={{borderBottom: '1px gray solid'}}></div>
            <div style={{height: viewHeight}} className={styles.matchTextLabel}>
            </div>
        </div>
    )
}