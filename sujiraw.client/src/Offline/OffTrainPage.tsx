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
export function OffTrainPage(){
    const param = useParams<{ trainId: string }>();
    const navigate = useNavigate();
    const [train,setTrain] = useState<any>({time:[]});
    const [stations,setStations]=useState<any>({});


    useEffect(() => {
        fetch(`../../offline/train/${param.trainId}.json`).then(res=>res.json())
            .then(res=>setTrain(res));
        fetch(`../../offline/station.json`).then(res=>res.json())
            .then(res=>setStations(res));

    }, []);
    console.log(train,stations);



    return <div >
        {train.time.map(r=>
            <div style={{display: 'flex', justifyContent: 'left',marginTop:'20px'}}>
                <div style={{lineHeight: '20px', paddingLeft: '15px'}}>
                    <div>{r.ariTime.length === 0 ? "　" : (r.ariTime + "着")}</div>
                    <div>{r.depTime.length === 0 ? "　" : (r.depTime + "発")}</div>
                </div>
                <div style={{lineHeight: '40px', fontSize: '24px', color: 'blue',paddingLeft:'20px',fontWeight:'bold'}} onClick={()=>{
                    navigate(`../Off/station/${r.stationID}`);
                }}>
                    {stations[r.stationID]?.stationName??""}
                </div>
            </div>
        )}

    </div>


}