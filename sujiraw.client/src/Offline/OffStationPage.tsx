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
export function OffStationPage(){
    const param = useParams<{ stationId: string }>();
    const navigate = useNavigate();
    const [stationData, setStationData] = useState<any[]>([]);
    const [stations,setStations] = useState([]);

    useEffect(() => {
        fetch(`../../offline/station/${param.stationId}.json`).then(res=>res.json())
            .then(res=>setStationData(res));
        fetch("../../offline/station.json").then(res => res.json())
            .then(data => {
                const mStations=Object.keys(data).map(key=>{return {...data[key],stationId:key}});
                setStations(mStations);
            });

    }, []);
    const stationName=stations.find(s=>s.stationId===param.stationId)?.stationName;

    const gid=Array.from(new Set(stationData.map(item=>item.gid)));
    const gid2=Array.from(new Set(gid.map(item=>Math.floor(Number.parseInt(item)/10))));
    const route=gid2.map(item=>{
        return {
            routeName:item,
            direction:gid.filter(g=>Math.floor(Number.parseInt(g)/10)==item).map(item=>Number.parseInt(item))
        }
    })
    console.log(route);
    // const route=[{routeName:"南武線",direction:["立川方面"]},{routeName:"京浜東北線",direction:["大宮方面","大船方面"]}]

    console.log(gid);

    return <div >
        <h3 style={{background:"white",padding:"10px",margin:'2px'}} >{stationName}</h3>
        {route.map(r=>
            <div>
                <p style={{padding:"5px",margin:'2px'}}>{r.routeName}</p>
                {r.direction.map(direction =>
                    <p style={{background:"white",padding: "10px",margin:'2px'}}
                    onClick={()=>navigate(`../Off/stationTimeTable/${param.stationId}/${direction}`)}>{direction}</p>
                )}
            </div>
        )}

    </div>


}