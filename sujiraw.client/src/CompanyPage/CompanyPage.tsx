import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import {Button, Container, Dialog, DialogActions, DialogContent, Divider, Paper, TextField} from "@mui/material";
import {axiosClient} from "../CMN/axiosHook.ts";
import {useEffect, useState} from "react";
import {Company, Company2, Route, RouteInfo} from "../DiaData/DiaData.ts";
import {useNavigate, useParams} from "react-router-dom";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: theme.spacing(1),
    width: 'auto',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('xs')]: {
            width: '0ch',
            '&:focus': {
                width: '25ch',
            },
        },
        [theme.breakpoints.up('sm')]: {
            width: '8ch',
            '&:focus': {
                width: '25ch',
            },
        },
    },
}));

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    margin: '10px',
    padding: '30px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));


export function CompanyPage() {
    const [company,setCompany]=useState<Company>(
        {
            name: "",
            routes: {},
            stations: {},
            trains:{},
            trainTypes:{}
        }
    );
    const param = useParams<{ companyID:string }>();
    const [searchText,setSearchText]=useState("");
    const [openDeleteAlart,setOpenDeleteAlart]=useState(false);

    const companyID=parseInt(param.companyID??"0");

    const navigate=useNavigate();

    const routes=()=>{
        return Object.values(company.routes).filter((route)=>{
            return route.name.includes(searchText);
        });
    }
    const deleteCompany=()=> {
        axiosClient.delete(`/api/Company/${companyID}`).then(
            res=>{
                navigate(`/`);
            }
        );
    }

    useEffect(()=>{
        axiosClient.get(`/api/Company/get/${companyID}`).then(res=>{
            setCompany(prev=>{
            return {...prev,
                name: res.data.name,
            }});
        })
        axiosClient.get(`/api/Route/ByCompany/${companyID}`).then(res=>{
            setCompany(prev=>{
                const routes:{[key:number]:RouteInfo}=res.data.reduce((prev:any,route:RouteInfo)=>{
                    return {...prev,[route.routeID]:route}
                },{});
                return {
                    ...prev,
                    routes:routes
                }
            });
        })
    },[]);

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
                        sx={{ flexGrow: 1, display: { xs: 'block' , sm: 'block' } }}
                    >
                        {company.name}
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            value={searchText}
                            onChange={(e)=>setSearchText(e.target.value)}
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                </Toolbar>
            </AppBar>
            <Container>
            <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{m:1}}
            >
                ダイヤの設定
            </Typography>
                <TextField  sx={{m:1}}  fullWidth={true} value={company.name} disabled={true}>
                </TextField>
                <Button sx={{m:1}} color={"warning"} variant={"outlined"}
                    onClick={()=>{
                        setOpenDeleteAlart(true);

                    }}>削除する</Button>
                <Divider sx={{m:2}}/>
            <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{m:1}}
            >
                路線一覧
            </Typography>
            <Grid container spacing={2}>
                {routes().map((c)=>{
                    return <Grid size={{ xs: 12, sm: 6 , lg: 4 }}>
                        <Item elevation={3}
                              onClick={()=>{
                                    navigate(`/TimeTable/${companyID}/${c.routeID}/0`)
                              }}
                        >
                            {c.name}</Item>
                    </Grid>
                })}
            </Grid>
                <Divider sx={{m:2}}/>
                <Typography
                    variant="h5"
                    noWrap
                    component="div"
                    sx={{m:1}}
                >
                </Typography>
                <Button sx={{m:1}} color={"primary"} variant={"contained"} onClick={()=>{
                    navigate(`/`)
                }}>戻る</Button>


            </Container>
            <Dialog
                open={openDeleteAlart}
                keepMounted
                onClose={() => {
                    setOpenDeleteAlart(false);
                }}
                aria-labelledby="common-dialog-title"
                aria-describedby="common-dialog-description"
            >
                <DialogContent>
                    一度削除されたデータは復元できません。
                    削除してもよろしいですか？
                </DialogContent>
                <DialogActions>
                    <Button sx={{mr:5}} onClick={() => {
                        deleteCompany();
                    }} color="warning">
                        Yes
                    </Button>
                    <Button  onClick={() => {
                        setOpenDeleteAlart(false);
                    }} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

        </div>

    );
}
