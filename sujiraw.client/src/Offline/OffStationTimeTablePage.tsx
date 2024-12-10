import React, {useEffect, useState} from "react";
import {Autocomplete, createFilterOptions, TextField} from "@mui/material";
import {axiosClient} from "../CMN/axiosHook.ts";
import {StationDTO} from "../DiaData/DiaData.ts";
import {useNavigate, useParams} from "react-router-dom";
export interface OffStation{
    stationName:string;
    pref: string;
    stationId:string;

}
interface TimeTableTrainProps{
    timeStr:string;
    color:string;
    endStation:string;
    fillStyle:boolean;
    trainId:number;
}
function TimeTableTrain({timeStr,color,endStation,fillStyle,trainId}:TimeTableTrainProps){
    const navigate = useNavigate();
    if(fillStyle){

    }else{
        return <div style={{padding:'5px',display:'flex',justifyContent:'center'}}
        onClick={()=>{
            navigate(`../Off/Train/${trainId}`);
        }}>
            <span style={{fontSize:'24px',height:'30px',lineHeight:'30px',padding:'0px 2px',color:color}} >
                {timeStr}
            </span>
            <span>
                <div style={{fontSize:'12px',height:'15px',lineHeight:'15px'}}>
                    {/*⚫︎*/}
                </div>
                <div style={{fontSize:'12px',height:'15px',lineHeight:'15px'}}>
                    {endStation}
                </div>
            </span>
        </div>
    }

}

export function OffStationTimeTablePage() {
    const param = useParams<{ stationId: string,groupId:string }>();

    const [stationData, setStationData] = useState<any[]>([]);
    const [stations,setStations] = useState([]);

    useEffect(() => {
        fetch(`../../../offline/station/${param.stationId}.json`).then(res=>res.json())
            .then(res=>setStationData(res))
        fetch("../../../offline/station.json").then(res => res.json())
            .then(data => {
                const mStations=Object.keys(data).map(key=>{return {...data[key],stationId:key}});
                setStations(mStations);
            });

    }, []);

    const stationName=stations.find(s=>s.stationId===param.stationId)?.stationName;

    const hour=Array(24).fill(0).map((v,i)=>{
        return{
            hour:i+3,
            train:stationData.filter(item=>item.gid==param.groupId&&item.time.split(":")[0]==((i+3)%25))
        }
    });




    return <div >
        <h3 style={{background:"white",padding:"10px",margin:'2px'}} >{stationName}</h3>
        {
            hour.map(h=><div key={h.hour}>
                <p style={{margin:'0px',padding:'3px 15px'}}>{h.hour}時</p>
                <div style={{minHeight:'40px',backgroundColor:'white',display:'flex',flexWrap:'wrap',padding:'0px 10px'}}>
                    {
                        h.train.map(train=>
                            <TimeTableTrain timeStr={train.time.split(":")[1]} color={train.typeColor ??"#000"} endStation={stations.find(s=>s.stationId==train.endStation)?.stationName.slice(0,1)??"▲"} fillStyle={false} trainId={train.trainId}/>
                        )
                    }
                </div>
            </div>)
        }


    </div>


}