import {時刻表列車, 時刻表駅} from "../../DiaData/NewData.ts";
import {Station} from "../../oud/models/Station.ts";
import {StationDTO, TrainTypeDTO} from "../../DiaData/DiaData.ts";
import {時刻表時刻View} from "./時刻表時刻View.tsx";
import {TimeTablePageSetting} from "./TestPage.tsx";
import styles from "./timetable.module.scss"
import React, {createRef, useEffect} from "react";
import {MatchTextLabel} from "./MatchTextLabel.tsx";

interface 時刻表列車名ViewProps {
    train:時刻表列車;
    routeStation:時刻表駅[]
    setting:TimeTablePageSetting;
    stations:{[key:number]:StationDTO}
    types:{[key:number]:TrainTypeDTO}


}

export function 時刻表列車名View({train,routeStation,setting,types}:時刻表列車名ViewProps){
    const 列車名Height=setting.fontSize*4;
    const divWidth=setting.fontSize*2.2;

    const 種別=types[train.列車要素[0].列車種別];

    // useEffect(() => {
    //         const element = document.getElementById(`text-${station.rsID}`);
    //         if (element && element.parentElement) {
    //             const scale = Math.min(1, element.parentElement.offsetWidth / element.offsetWidth);
    //             element.style.transform = `scaleX(${scale})`;
    //         }
    // }, [types[train.列車要素[0].列車種別]]);


    return(
        <div style={{borderRight: '1px solid black', width: divWidth,height:100, color: 種別.color,borderBottom: '2px gray solid'}}>
            <MatchTextLabel>
                {"　"}
            </MatchTextLabel>
            <div style={{borderBottom: '1px gray solid'}}></div>
            <MatchTextLabel>
                {種別.name}
            </MatchTextLabel>
            <div style={{borderBottom: '1px gray solid'}}></div>
            <div style={{height: 列車名Height}} className={styles.matchTextLabel}>
            </div>
        </div>
    )
}