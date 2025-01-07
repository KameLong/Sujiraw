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
import {getTimeTable, saveTimeTable, TimeTable, TimeTableStation} from "../DiaData/TimeTableData.ts";
import {DiaData, RouteDTO, RouteInfo, RouteStationDTO} from "../DiaData/DiaData.ts";
import {axiosClient} from "../CMN/axiosHook.ts";
import {StationSelectorDialog, useStationSelectorDialog} from './TimeTableEdit/StationSelectorDialog.tsx';
import {RouteSelectorDialog, useRouteSelectorDialog} from "./TimeTableEdit/RouteSelectorDialog.tsx";

export function TimeTableEditPage() {
    const [company, setCompany] = useState<DiaData>(
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
    const dialogSetting=useStationSelectorDialog();
    useEffect(() => {
        dialogSetting.setStations(Object.values(company.stations));
    }, [company.stations]);
    const dialogSetting2=useRouteSelectorDialog();


    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

    const snackbarProps=useSnackbar();
    const companyID = parseInt(param.companyID ?? "0");
    const timetableID = parseInt(param.timetableID ?? "0");

    const navigate = useNavigate();
    const {t, i18n} = useTranslation();


    const setTimetableName=(name:string)=>{
        setTimeTable({...timetable,name:name});
    }

    const getRouteStation=(rsID:number):RouteStationDTO=>{
        return Object.values(company.routes).map(route=>route.routeStations).flat().find((rs)=>{
            if(rs){
                return rs.rsID===rsID;
            }else{
                return undefined;
            }
        });
    }


    const deleteTimeTable = () => {
        axiosClient.delete(`/api/TimeTableJson/${timetableID}`).then(
            res => {
                navigate(`/Company/${companyID}`);
            }
        ).catch(error=>{
            console.error(error);
            snackbarProps.show(`Fail to Delete ${companyID}`);
            setOpenDeleteAlert(false);
        });
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

    function getStationName(station:TimeTableStation):string{
        let rsID=station.depRouteStationID;
        if(rsID===0){
            rsID=station.ariRouteStationID;
        }
        return company.stations[getRouteStation(rsID)?.stationID]?.name ?? t("駅名不明");
    }
    function getRouteName(station:TimeTableStation):string{
        let rsID=station.depRouteStationID;
        if(rsID===0){
            rsID=station.ariRouteStationID;
        }
        return company.routes[getRouteStation(rsID)?.routeID]?.name ?? t("駅名不明");
    }

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
            <Paper sx={{ml: 3, mr: 3, mt: 1, mb: 1,py:2}}>
                <h4 style={{padding: '0px 50px'}}>
                    {t("表示名")}
                </h4>

                <Stack sx={{ml: 3, mr: 3, mt: 1, mb: 1}}>
                    <TextField fullWidth={true}
                               style={{backgroundColor: "#FFF"}}
                               label={t("カスタム時刻表名")}
                               value={timetable.name}
                               onChange={(event) => {
                                   setTimetableName(event.target.value);
                               }}
                    >
                    </TextField>
                </Stack>

                <Divider></Divider>
                <h4 style={{padding: '0px 50px'}}>
                    {t("駅配置")}
                </h4>
                <div style={{padding: '0px 20px'}}>
                    {timetable.timetableStations.map((station,_i) => {
                        return (
                            <div key={station.ariRouteStationID} style={{display: 'flex',marginBottom:'5px'}}>
                                <div style={{width: '150px'}}>{getStationName(station)}
                                </div>
                                <div style={{width: '150px'}}>{getRouteName(station)}
                                </div>
                                <Select style={{width: '150px'}}
                                        value={station.showStyle} variant={'outlined'}
                                        onChange={(event) => {
                                            setTimeTable((prev: TimeTable) => {
                                                const newStations = prev.timetableStations.map((st, i) => {
                                                    if (i === _i) {
                                                        return {...st, showStyle: event.target.value as number}
                                                    } else {
                                                        return st;
                                                    }
                                                });
                                                return {...prev, timetableStations: newStations};
                                            });
                                        }}
                                >
                                    <MenuItem value={0b00010001}>発時刻</MenuItem>
                                    <MenuItem value={0b00110011}>発着</MenuItem>
                                    <MenuItem value={0b00010010}>下り着時刻</MenuItem>
                                    <MenuItem value={0b00100001}>上り着時刻</MenuItem>
                                </Select>
                            </div>
                        )
                    })}
                    <Button variant={"outlined"} onClick={() => {
                        dialogSetting.setOpen(true);
                    }}>+駅追加</Button>
                </div>

                <Stack mx={3} my={1} direction="row" justifyContent="end" spacing={1}>
                    <Button sx={{m: 1}} color={"primary"} variant={"contained"}
                            onClick={() => {
                                saveTimeTable(timetable).then(res => {
                                    snackbarProps.show(`Success to Save`);
                                }).catch(err => {
                                    snackbarProps.show(`Fail to Save`);
                                })
                            }}>{t("変更する")}</Button>
                </Stack>
            </Paper>
            <Stack mx={3} my={1} direction="row" justifyContent="start" spacing={1}>
                <Button sx={{m: 1}} color={"warning"} variant={"contained"}
                        onClick={() => {
                            setOpenDeleteAlert(true);

                        }}>{t("削除する")}</Button>
            </Stack>


            <Typography variant="h5" noWrap component="div" sx={{m: 1}} >
            </Typography>
            <Button sx={{m: 1}} color={"primary"} variant={"contained"} onClick={() => {
                navigate(`/`)
            }}>{t("戻る")}</Button>
            <Button sx={{m: 1}} color={"primary"} variant={"contained"} onClick={() => {
                navigate(`/MainTimeTable/${companyID}/${timetableID}/0`)
            }}>{t("下りカスタム時刻表へ移動する")}</Button>
            <StationSelectorDialog
                {...dialogSetting.getDialogProps()}
                onSelected={(station)=>{
                    dialogSetting.handleClose();
                    console.log(station);
                    //その駅が含まれる路線を選択するダイアログを開く
                    //路線一覧を取得
                    axiosClient.get(`/api/RouteStation/DirectConnection/${station.stationID}`).then(res=>{
                        console.log(res.data);
                        const routeStations=(res.data as RouteStationDTO[]).map(rs=>{
                            return{
                                rsID:rs.rsID,
                                name:company.stations[rs.stationID]?.name ?? t("駅名不明"),
                                routeName:[company.routes[rs.routeID]?.name ?? t("路線名不明")],
                                stationID:rs.stationID,
                            }
                        });
                        dialogSetting2.setRoutes(routeStations);
                        dialogSetting2.setOpen(true);
                    });

                }}
                onBacked={()=>{
                    dialogSetting.handleClose();
                }}
            >
            </StationSelectorDialog>
            <RouteSelectorDialog
                {...dialogSetting2.getDialogProps()}
                onBacked={()=>{
                    dialogSetting2.handleClose();
                }}
                onSelected={(routeStation)=>{
                    dialogSetting2.handleClose();
                    axiosClient.get(`/api/RouteStation/DirectConnection/${routeStation.stationID}`).then(res=>{
                        console.log(res.data);
                        const routeStations=(res.data as RouteStationDTO[]).map(rs=>{
                            return{
                                rsID:rs.rsID,
                                name:company.stations[rs.stationID]?.name ?? t("駅名不明"),
                                routeName:[company.routes[rs.routeID]?.name ?? t("路線名不明")],
                                stationID:rs.stationID,
                            }
                        });
                        dialogSetting2.setRoutes(routeStations);
                        dialogSetting2.setOpen(true);
                    });

                }}
            ></RouteSelectorDialog>

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
                        deleteTimeTable();
                        setOpenDeleteAlert(false);
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

            {/*ここにダイアログを追加します。
            まず、路線を選択して、
            その後どの駅から開始するか選びます。

            その後は、到着駅、その駅から延びる路線、次の路線の到着駅
            の順に選んでいきます。
            */}



        </div>
    );
}
