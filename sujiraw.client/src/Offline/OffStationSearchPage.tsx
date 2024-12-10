import React, {useEffect, useState} from "react";
import {Autocomplete, createFilterOptions, TextField} from "@mui/material";
import {axiosClient} from "../CMN/axiosHook.ts";
import {StationDTO} from "../DiaData/DiaData.ts";
import {useNavigate} from "react-router-dom";
export interface OffStation{
    stationName:string;
    pref: string;
    stationId:string;

}
export function OffStationSearchPage(){
    const [stations,setStations] = useState([]);
    useEffect(() => {
        fetch("..//offline/station.json").then(res => res.json())
            .then(data => {
                const mStations=Object.keys(data).map(key=>{return {...data[key],stationId:key}});
                setStations(mStations);
            })
    },[])
    useEffect(() => {
        console.log(stations);
    }, [stations]);
    const [selectedStation, setSelectedStation] = useState<StationDTO>();
    const navigate = useNavigate();

    const filterOptions = createFilterOptions({
        ignoreCase: true,
        matchFrom: "start",
        limit: 100,
    });



    return<div>
        <h3>駅を検索</h3>
        <Autocomplete
            disablePortal

            options={stations}
            getOptionLabel={(option: any) => option.stationName!}
            sx={{ width: 300 }}
            onChange={(res,value)=>navigate(`/Off/station/${value.stationId}`)}
            renderInput={(params) =>
                <TextField
                    {...params} label="駅を入力" />}
            filterOptions={filterOptions}
        />
    </div>
}