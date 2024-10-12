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
    Divider,
    TextField
} from "@mui/material";
import {axiosClient} from "../CMN/axiosHook.ts";
import {useEffect, useState} from "react";
import {Company, RouteInfo} from "../DiaData/DiaData.ts";
import {useNavigate, useParams} from "react-router-dom";
import {Snackbar, useSnackbar} from "../CMN/UseSnackbar.tsx";
import {Item, Search, SearchIconWrapper, StyledInputBase} from "../CMN/Styles.ts";
import {useTranslation} from "react-i18next";

export function CompanyPage() {
    const [company, setCompany] = useState<Company>(
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
    }, []);

    return (
        <div>

            <AppBar position="static">
                <Toolbar>
                    {/*<IconButton*/}
                    {/*    size="large"*/}
                    {/*    edge="start"*/}
                    {/*    color="inherit"*/}
                    {/*    aria-label="open drawer"*/}
                    {/*    sx={{ mr: 2 }}*/}
                    {/*>*/}
                    {/*    <MenuIcon />*/}
                    {/*</IconButton>*/}
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{flexGrow: 1, display: {xs: 'block', sm: 'block'}}}
                    >
                        {company.name}
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon/>
                        </SearchIconWrapper>
                        <StyledInputBase
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search…"
                            inputProps={{'aria-label': 'search'}}
                        />
                    </Search>
                </Toolbar>
            </AppBar>
            <Container>
                <Typography variant="h5" noWrap component="div" sx={{m: 1}}
                >
                    {t("ダイヤの設定")}
                </Typography>
                <TextField sx={{m: 1}} fullWidth={true} value={company.name} disabled={true}>
                </TextField>
                <Button sx={{m: 1}} color={"warning"} variant={"outlined"}
                        onClick={() => {
                            setOpenDeleteAlert(true);
                        }}>{t("削除する")}</Button>
                <Divider sx={{m: 2}}/>
                <Typography variant="h5" noWrap component="div" sx={{m: 1}} >
                    {t("路線一覧")}
                </Typography>
                <Grid container spacing={2}>
                    {routes().map((c) => {
                        return <Grid size={{xs: 12, sm: 6, lg: 4}}>
                            <Item elevation={3}
                                  onClick={() => {
                                      navigate(`/TimeTable/${companyID}/${c.routeID}/0`)
                                  }}
                            >
                                {c.name}</Item>
                        </Grid>
                    })}
                </Grid>
                <Divider sx={{m: 2}}/>
                <Typography variant="h5" noWrap component="div" sx={{m: 1}} >
                </Typography>
                <Button sx={{m: 1}} color={"primary"} variant={"contained"} onClick={() => {
                    navigate(`/`)
                }}>{t("戻る")}</Button>
            </Container>
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
