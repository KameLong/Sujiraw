import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    Divider, Stack,
    TextField
} from "@mui/material";
import {axiosClient} from "../CMN/axiosHook.ts";
import {useEffect, useState} from "react";
import {DiaData, RouteInfo} from "../DiaData/DiaData.ts";
import {useNavigate, useParams} from "react-router-dom";
import {Snackbar, useSnackbar} from "../CMN/UseSnackbar.tsx";
import {Item} from "../CMN/Styles.ts";
import {useTranslation} from "react-i18next";
import {Add, Settings} from "@mui/icons-material";
import {createNewTimeTable} from "../DiaData/TimeTableData.ts";
import {AppBar} from "../CMN/AppBar.tsx";

export function CompanyPage() {
    const [company, setCompany] = useState<DiaData>(
        {
            name: "",
            routes: {},
            stations: {},
            trains: {},
            trainTypes: {}
        }
    );
    const param = useParams<{ companyID: string }>();
    const [searchText, setSearchText] = useState("");
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
    const snackbarProps=useSnackbar();
    const companyID = parseInt(param.companyID ?? "0");
    const navigate = useNavigate();
    const {t, i18n} = useTranslation();


    const routes = () => {
        return Object.values(company.routes).filter((route) => {
            return route.name.includes(searchText);
        });
    }
    const deleteCompany = () => {
        axiosClient.delete(`/api/Company/${companyID}`).then(
            res => {
                navigate(`/`);
            }
        ).catch(error=>{
            console.error(error);
            snackbarProps.show(`Fail to Delete ${companyID}`);
            setOpenDeleteAlert(false);
        });
    }

    useEffect(() => {
        axiosClient.get(`/api/Company/get/${companyID}`).then(res => {
            setCompany(prev => {
                return {
                    ...prev,
                    name: res.data.name,
                }
            });
        })
        axiosClient.get(`/api/CompanyJson/${companyID}`).then(res => {
            setCompany(prev => {
                return {
                    ...prev,
                    timetables: res.data.timetables,
                }
            });
        })
        axiosClient.get(`/api/Route/ByCompany/${companyID}`).then(res => {
            setCompany(prev => {
                const routes: { [key: number]: RouteInfo } = res.data.reduce((prev: any, route: RouteInfo) => {
                    return {...prev, [route.routeID]: route}
                }, {});
                return {
                    ...prev,
                    routes: routes
                }
            });
        })
    }, [companyID]);

    return (
        <div>
            <AppBar></AppBar>
            <Grid size={{ xs: 12, sm: 6  }} style={{
                padding: '10px 20px 10px 20px',
                fontSize: "20pt",
                color: '#DDD',
                backgroundColor: "#000"
            }}>
                {t("ダイヤの設定")}
            </Grid>
            <Stack sx={{ml:3,mr:3,mt:1,mb:1}}>
                <TextField  fullWidth={true} value={company.name} disabled={true}>
                </TextField>
            </Stack>
            <Stack mx={3} my={1} direction="row" justifyContent="end" spacing={1}>
                <Button sx={{m: 1}} color={"warning"} variant={"outlined"}
                        onClick={() => {
                            setOpenDeleteAlert(true);
                        }}>{t("削除する")}</Button>
            </Stack>
            <Grid size={{ xs: 12, sm: 6  }} style={{
                padding: '10px 20px 10px 20px',
                fontSize: "20pt",
                color: '#DDD',
                backgroundColor: "#000"
            }}>
                {t("路線一覧")}
            </Grid>
                <Grid container spacing={2}>
                    {routes().map((c) => {
                        return <Grid size={{xs: 12, sm: 6, lg: 4}}>
                            <Item elevation={3}
                                  style={{
                                      color: 'black',
                                      fontWeight: 700,
                                      fontSize: '12pt',
                                  }}
                                  onClick={() => {
                                      navigate(`/TimeTable/${companyID}/${c.routeID}/0`)
                                  }}
                            >
                                {c.name}
                                </Item>
                        </Grid>
                    })}
                </Grid>
            <Grid size={{ xs: 12, sm: 6  }} style={{
                padding: '10px 20px 10px 20px',
                fontSize: "20pt",
                color: '#DDD',
                backgroundColor: "#000"
            }}>
                {t("カスタム時刻表")}
            </Grid>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 , lg: 4 }}
                >
                    <Item elevation={3} sx={{mt:5}}
                          onClick={()=>{
                              createNewTimeTable(companyID).
                                then(res=>{
                                    if(res.status===200){
                                        navigate(`/TimeTableEdit/${companyID}/${res.data}`)
                                    }else{
                                        snackbarProps.show(`Fail to create TimeTable ${res.status}`)
                                    }
                              })
                          }}>
                        <Stack direction="row">
                            <Add></Add>
                            <Typography
                                style={{
                                    color: 'black',
                                    fontWeight: 700,
                                    fontSize: '12pt',
                                }}>
                                {t("新規作成(現在開発中の機能です)")}
                            </Typography>
                        </Stack>
                    </Item>
                </Grid>

                {
                        Object.values(company.timetables ?? {}).map((timetable)=>{
                            return(
                            <Grid size={{ xs: 12, sm: 6 , lg: 4 }}
                            >
                                <Item elevation={3} sx={{mt:5}}
                                         onClick={()=>{
                                             navigate(`/TimeTableEdit/${companyID}/${timetable.timeTableID}`)
                                         }}>
                                <Stack direction="row">
                                    <Typography
                                        style={{
                                            color: 'black',
                                            fontWeight: 700,
                                            fontSize: '12pt',
                                        }}>
                                        {timetable.name.length===0?"(名称未設定)":timetable.name}
                                    </Typography>
                                </Stack>
                            </Item>
                            </Grid>
                            )
                        })
                    }

            </Grid>
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
                        deleteCompany();
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
            <Snackbar props={snackbarProps}/>
        </div>
    );
}
