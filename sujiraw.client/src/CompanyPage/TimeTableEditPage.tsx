import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider, MenuItem, Paper, Select, Stack,
    TextField
} from "@mui/material";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Snackbar, useSnackbar} from "../CMN/UseSnackbar.tsx";
import {Item, Search, SearchIconWrapper, StyledInputBase} from "../CMN/Styles.ts";
import {useTranslation} from "react-i18next";
import {Add, Settings} from "@mui/icons-material";
import {getTimeTable, saveTimeTable, TimeTable} from "../DiaData/TimeTableData.ts";
import {Company, Route, RouteInfo, RouteStation} from "../DiaData/DiaData.ts";
import {axiosClient} from "../CMN/axiosHook.ts";




export function TimeTableEditPage() {

    const [company, setCompany] = useState<Company>(
        {
            name: "",
            routes: {},
            stations: {},
            trains: {},
            trainTypes: {}
        }
    );

    const [timetable,setTimeTable]=useState<TimeTable>({timeTableID:0,companyID:0,name:"",timetableStations:[]});
    const param = useParams<{ companyID: string,timetableID:string }>();

    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
    const [openInsertStation, setOpenInsertStation] = useState(true);
    const [startStation,setStartStation]=useState<string>("");
    const [endStation,setEndStation]=useState<string>("");

    const [selectedRoute,setSelectedRoute]=useState<Route>(
        {
            routeID:0,
            name:"",
            routeStations:[],
            downTrips:[],
            upTrips:[]
        }
    );
    const [openSelectStation, setOpenSelectStation] = useState(false);

    const snackbarProps=useSnackbar();
    const companyID = parseInt(param.companyID ?? "0");
    const timetableID = parseInt(param.timetableID ?? "0");

    const navigate = useNavigate();
    const {t, i18n} = useTranslation();

    // const [timetableName,setTimetableName]=useState("");

    const setTimetableName=(name:string)=>{
        setTimeTable({...timetable,name:name});
    }

    const getRouteStation=(rsID:number):RouteStation=>{
        return Object.values(company.routes).map(route=>route.routeStations).flat().find((rs)=>{
            if(rs){
                return rs.rsID===rsID;
            }else{
                return undefined;
            }
        });
    }


    const deleteTimeTable = () => {
        //todo
        // axiosClient.delete(`/api/Company/${companyID}`).then(
        //     res => {
        //         navigate(`/`);
        //     }
        // ).catch(error=>{
        //     console.error(error);
        //     snackbarProps.show(`Fail to Delete ${companyID}`);
        //     setOpenDeleteAlert(false);
        // });
    }

    useEffect(() => {
        if(timetableID===0){
            return;
        }
        getTimeTable(timetableID).then((value) => {
            console.log(value);
            setTimeTable(value);
        });
        axiosClient.get(`/api/CompanyJson/${companyID}`).then(res => {
            setCompany(prev => {
                console.log(res.data);
                return {
                    ...prev,
                    ...res.data
                }
            });
            axiosClient.get(`/api/Route/ByCompany/${companyID}`).then(res => {
                setCompany(prev => {
                    const routes: { [key: number]: RouteInfo } = res.data.reduce((prev: any, route: RouteInfo) => {
                        return {...prev, [route.routeID]: route}
                    }, {});
                    console.log(routes);
                    return {
                        ...prev,
                        routes: routes
                    }
                });
            })

        })

    }, [timetableID]);

    // useEffect(() => {
    //     setTimetableName(timetable.name);
    //
    // }, [timetable]);

    return (
        <div>
            <Grid style={{backgroundColor: "#242"}}>
                <span style={{
                    padding: '10px',
                    fontSize: "28pt",
                    fontFamily: 'serif',
                    color: '#EEE',
                    fontWeight: 900
                }}>すじらう</span>
                <span style={{
                    padding: '10px',
                    fontSize: "16pt",
                    color: '#DDF',
                }}>by Kamelong</span>
            </Grid>

            <Grid size={{ xs: 12, sm: 6  }} style={{
                padding: '10px 20px 10px 20px',
                fontSize: "20pt",
                color: '#DDD',
                backgroundColor: "#000"
            }}>
                {t("カスタム時刻表の設定")}
            </Grid>
            <Stack sx={{ml:3,mr:3,mt:1,mb:1}}>
                <TextField  fullWidth={true}
                            style={{backgroundColor: "#FFF"}}
                            label={t("カスタム時刻表名")}
                            value={timetable.name}
                            onChange={(event) => {
                                setTimetableName(event.target.value);
                            }}
                >
                </TextField>
            </Stack>

            <Paper sx={{ml: 3, mr: 3, mt: 1, mb: 1}}>
                <h4 style={{padding: '10px 50px'}}>
                    {t("駅配置")}
                </h4>
                <Divider></Divider>
                <div style={{padding: '20px'}}>
                    {timetable.timetableStations.map((station) => {
                        return (
                            <div key={station.ariRouteStationID} style={{display:'flex'}}>
                                <div style={{width:'150px'}}>{company.stations[getRouteStation(station.depRouteStationID)?.stationID]?.name ?? "駅名不明"}
                                </div>
                                <span style={{width:'150px'}}>{company.routes[getRouteStation(station.depRouteStationID)?.routeID]?.name ?? "駅名不明"}
                                </span>
                            </div>
                        )
                    })}
                    <Button variant={"outlined"} onClick={()=>{setOpenInsertStation(true)}}>+駅追加</Button>
                </div>
            </Paper>

            <Stack mx={3} my={1} direction="row" justifyContent="end" spacing={1}>
                <Button sx={{m: 1}} color={"primary"} variant={"outlined"}
                        onClick={() => {

                        }}>{t("変更する")}</Button>
            </Stack>


            <Typography variant="h5" noWrap component="div" sx={{m: 1}} >
            </Typography>
            <Button sx={{m: 1}} color={"primary"} variant={"contained"} onClick={() => {
                navigate(`/`)
            }}>{t("戻る")}</Button>


            <Dialog
                open={openDeleteAlert}
                keepMounted
                onClose={() => {
                    setOpenDeleteAlert(false);
                }}
                aria-labelledby="common-dialog-title"
                aria-describedby="common-dialog-description"
            >
                <DialogContent>
                    {t("一度削除されたデータは復元できません。 削除してもよろしいですか？")}
                </DialogContent>
                <DialogActions>
                    <Button sx={{mr: 5}} onClick={() => {
                    }} color="warning">
                        Yes
                    </Button>
                    <Button onClick={() => {
                        setOpenDeleteAlert(false);
                    }} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openInsertStation} onClose={()=>{}}>
                <DialogTitle>路線を選択してください</DialogTitle>
                <DialogContent  sx={{width:'300px'}}
                >

                    {Object.values(company.routes).map((route) => {
                        return (
                            <div>
                                <Button
                                 onClick={()=>{
                                     setSelectedRoute(route as unknown as Route);
                                     setOpenInsertStation(false);

                                     setOpenSelectStation(true);
                                 }}>{route.name}</Button>
                            </div>
                        )
                    })}


                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={()=>{
                        setOpenInsertStation(false);
                    }} >

                    キャンセル
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openSelectStation} onClose={()=>{}}>
                <DialogTitle>追加駅選択</DialogTitle>
                <DialogContent sx={{width:'300px'}}>
                    開始駅
                    <Select label={"開始駅"} fullWidth={true} value={startStation} onChange={
                        (event)=>{
                            console.log(event.target.value);
                            setStartStation(event.target.value as string);
                        }
                    }
                    onSelect={event => console.log(event)}>
                        {selectedRoute.routeStations.map((station,_i)=>{
                            return (
                                    <MenuItem value={_i}>{company.stations[station.stationID].name}</MenuItem>
                            )
                        })}
                    </Select>
                    <Divider sx={{m:2}}></Divider>
                    終了駅
                    <Select label={"終了駅"} fullWidth={true} value={endStation} onChange={
                        (event)=>{
                            console.log(event.target.value);
                            setEndStation(event.target.value as string);
                        }
                    }>
                        {selectedRoute.routeStations.map((station,_i)=>{
                            return (
                                <MenuItem value={_i}>{company.stations[station.stationID].name}</MenuItem>
                            )
                        })}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={()=>{
                            setOpenSelectStation(false);
                            setOpenInsertStation(true);
                        }} >
                        キャンセル
                    </Button>
                    <Button
                        onClick={()=>{
                            setTimeTable((prev:TimeTable)=>{
                                let newStations=selectedRoute.routeStations.slice(parseInt(startStation),parseInt(endStation)+1);
                                const oldStations=prev.timetableStations;
                                if(oldStations.length!==0&&newStations.length!==0&&getRouteStation(oldStations.slice(-1)[0].ariRouteStationID).stationID===newStations[0].stationID) {
                                    oldStations.slice(-1)[0].depRouteStationID=newStations[0].rsID;
                                    newStations = newStations.slice(1);
                                }
                                const newTimetable:TimeTable= {...prev,timetableStations:[...prev.timetableStations,...newStations.map((station)=>{
                                    return {depRouteStationID:station.rsID,ariRouteStationID:station.rsID,showStyle:0,main:false};
                                    })]};
                                newTimetable.timetableStations.slice(-1)[0].ariRouteStationID=0;
                                saveTimeTable(newTimetable);
                                return newTimetable;

                            })
                        setOpenSelectStation(false);
                        setOpenInsertStation(true);
                    }} >
                        確認
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
}
