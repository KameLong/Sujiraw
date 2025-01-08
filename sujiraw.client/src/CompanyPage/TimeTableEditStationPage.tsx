import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import {
    Autocomplete, Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider, Grid2, MenuItem, Paper, Select, Stack,
    TextField
} from "@mui/material";
import {Fragment, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Snackbar, useSnackbar} from "../CMN/UseSnackbar.tsx";
import {Item, Search, SearchIconWrapper, StyledInputBase} from "../CMN/Styles.ts";
import {useTranslation} from "react-i18next";
import {Add, ArrowDownward, ArrowDownwardOutlined, DoubleArrow, Settings} from "@mui/icons-material";
import {getTimeTable, saveTimeTable, TimeTable, TimeTableStation} from "../DiaData/TimeTableData.ts";
import {DiaData, RouteDTO, RouteInfo, RouteStationDTO} from "../DiaData/DiaData.ts";
import {axiosClient} from "../CMN/axiosHook.ts";
import {StationSelectorDialog, useStationSelectorDialog} from './TimeTableEdit/StationSelectorDialog.tsx';
import {R, RouteSelectorDialog, useRouteSelectorDialog} from "./TimeTableEdit/RouteSelectorDialog.tsx";
interface BorderStation{
    routeID:number;
    routeStationID:number;
    stationID:number;
    stationIDs:number[];
    choiceRS:R[];
}

function getRouteStationByRouteAndStation(routeID:number,stationID:number):Promise<RouteStationDTO[]>{
    return axiosClient.get(`/api/RouteStation/GetByRouteAndStation/${routeID}/${stationID}`).then(res=>{
        return (res.data as RouteStationDTO[]);
    });
}

export function TimeTableEditStationPage() {
    const {t} = useTranslation();
    const [setting,setSetting]=useState<any>([]);

    const [borderStations, setBorderStations] = useState<BorderStation[]>([]);


    const a=useRouteSelectorDialog();
    const b=useStationSelectorDialog();


    const param = useParams<{ companyID: string,timetableID:string }>();
    const companyID = parseInt(param.companyID ?? "0");
    const timetableID = parseInt(param.timetableID ?? "0");

    const [company, setCompany] = useState<DiaData|undefined>(undefined);
    const [timetable, setTimetable] = useState<TimeTable|undefined>(undefined);
    useEffect(() => {
        axiosClient.get(`/api/CompanyJson/${companyID}`).then(res => {
            setCompany(res.data);
            console.log(res.data);
        });
    }, [companyID,timetableID]);
    useEffect(() => {
        if(company===undefined) return;
        b.setStations(Object.values(company.stations));
    }, [company]);

    return(
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" noWrap>
                        {t("TimeTable")}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container>
                <Paper style={{width:"360px",paddingBottom:'300px'}}>
                    <Grid container spacing={2}>
                        <Grid size={12} sx={{px:2,py:1}}>
                                <StationSelectorDialog
                                    {...b.getDialogProps()}
                                    onSelected={(station)=>{
                                        axiosClient.get(`/api/RouteStation/DirectConnection/${station.stationID}`).then(res=>{
                                            console.log(res.data);
                                            const routeStations=(res.data as RouteStationDTO[]).map(rs=>{
                                                return{
                                                    rsID:rs.rsID,
                                                    routeID:rs.routeID,
                                                    name:company.stations[rs.stationID]?.name ?? t("駅名不明"),
                                                    routeName:[company.routes[rs.routeID]?.name ?? t("路線名不明")],
                                                    stationID:rs.stationID,
                                                }
                                            });
                                            setBorderStations([{
                                                routeID:0,
                                                routeStationID:0,
                                                stationID:station?.stationID,
                                                stationIDs:[],
                                                choiceRS:routeStations
                                            }]);
                                        });
                                    }}
                                ></StationSelectorDialog>
                        </Grid>
                        {
                            borderStations.map((_,i)=> {
                                return(
                                    <Fragment key={i}>
                                        <Grid size={12} sx={{px:2,py:0}}>
                                            {_.routeID===0?"":company.routes[_.routeID]?.name??"路線名不明"}
                                        </Grid>
                                        <Grid size={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                            <span className="dli-arrow-down" style={{height:'100%',textAlign:'center'}}></span>
                                        </Grid>
                                        <Grid size={8}>
                                            {
                                                _.stationIDs.map((rs, j)=>{
                                                    return(
                                                        <div key={j}>{company.stations[rs]?.name ?? "不明"}</div>
                                                    )
                                                })
                                            }
                                        </Grid>
                                        <Grid size={12} sx={{px:2,py:1}}>
                                            <RouteSelectorDialog
                                                routes={_.choiceRS}
                                                onSelected={(route)=>{
                                                    axiosClient.get(`/api/RouteStation/DirectConnection/${route.stationID}`).then(res=>{
                                                        console.log(res.data);
                                                        const routeStations=(res.data as RouteStationDTO[]).map(rs=>{
                                                            return{
                                                                rsID:rs.rsID,
                                                                routeID:rs.routeID,
                                                                name:company.stations[rs.stationID]?.name ?? t("駅名不明"),
                                                                routeName:[company.routes[rs.routeID]?.name ?? t("路線名不明")],
                                                                stationID:rs.stationID,
                                                            }
                                                        });
                                                        setBorderStations((prev)=> {
                                                            const next = [...prev].slice(0, i + 1);
                                                            next[i].routeID=route.routeID;
                                                            next[i].routeStationID=route.rsID;
                                                            const m_route=company.routes[route.routeID];
                                                            const startIndex=m_route?.stations.findIndex(s=>s===next[i].stationID)??0;
                                                            const endIndex=m_route?.stations.findIndex(s=>s===route.stationID)??0;
                                                            console.log(startIndex,endIndex);

                                                            let _stations=m_route?.stations.slice(
                                                                Math.min(startIndex,endIndex)+1,Math.max(startIndex,endIndex))??[];
                                                            if(startIndex>endIndex){
                                                                _stations=_stations.reverse();
                                                            }

                                                            next[i].stationIDs=_stations;
                                                            next.push({
                                                                routeID: 0,
                                                                routeStationID: 0,
                                                                stationID: route.stationID,
                                                                stationIDs: [],
                                                                choiceRS: routeStations
                                                            });
                                                            return next;
                                                        });
                                                    });
                                                }}
                                            ></RouteSelectorDialog>
                                        </Grid>
                                    </Fragment>
                                )
                            })
                        }

                    </Grid>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2,mx:3}}>
                        <Button variant="contained" color="inherit" onClick={() => { /* handle cancel action */ }}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={async() => {
                            //timetableの駅一覧を保存し、画面遷移
                            const stations:TimeTableStation[]=[];
                            const rs=await getRouteStationByRouteAndStation(borderStations[0].routeID,borderStations[0].stationID);
                            console.log(rs);
                            let stationID=borderStations[0].stationID;

                            stations.push({
                                depRouteStationID:0,
                                ariRouteStationID:0,
                                main:false,
                                showStyle: 0,
                                direction:0,
                                border:false
                            })
                            for(let _i=0;_i<borderStations.length;_i++) {
                                const bs=borderStations[_i];
                                for(let _j=0;_j<bs.stationIDs.length;_j++) {
                                    const sID = bs.stationIDs[_j];
                                    const rsD = await getRouteStationByRouteAndStation(bs.routeID, stationID);
                                    const rsA = await getRouteStationByRouteAndStation(bs.routeID, sID);
                                    stationID = sID;
                                    stations.slice(-1)[0].depRouteStationID = rsD[0].rsID;
                                    stations.push({
                                        depRouteStationID: 0,
                                        ariRouteStationID: rsA[0].rsID,
                                        main: false,
                                        showStyle: 0,
                                        direction: 0,
                                        border: false
                                    });
                                }
                                if(borderStations[_i+1]===undefined) continue;
                                const rsD=await getRouteStationByRouteAndStation(bs.routeID,stationID);
                                const rsA=await getRouteStationByRouteAndStation(bs.routeID,borderStations[_i+1].stationID);
                                stationID=borderStations[_i+1].stationID;
                                stations.slice(-1)[0].depRouteStationID=rsD[0].rsID;
                                stations.push({
                                    depRouteStationID:0,
                                    ariRouteStationID:rsA[0].rsID,
                                    main:false,
                                    showStyle: 0,
                                    direction:0,
                                    border:false
                                })

                            }

                            console.log(stations);


                        }}>
                            OK
                        </Button>
                    </Box>

                </Paper>

            </Container>
        </div>
    );
}
