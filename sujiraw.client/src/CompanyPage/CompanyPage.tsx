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
import {Paper} from "@mui/material";
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
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
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
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
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
    const companyID=parseInt(param.companyID??"0");

    const navigate=useNavigate();

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

    console.log(company.routes);
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
                        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                        {company.name}
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                </Toolbar>
            </AppBar>
            <Grid container spacing={2}>
                {Object.values(company.routes).map((c)=>{
                    return <Grid size={{ xs: 12, sm: 6 , lg: 4 }}>
                        <Item elevation={3}
                              onClick={()=>{
                                    navigate(`/TimeTable/${companyID}/${c.routeID}/0`)

                              }}
                        >
                            {c.name}</Item>
                    </Grid>
                })}
            </Grid>        </div>

    );
}
