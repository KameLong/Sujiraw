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
import {Company, Company2} from "../DiaData/DiaData.ts";
import {useNavigate} from "react-router-dom";
import {Item, Search, SearchIconWrapper, StyledInputBase} from "../CMN/Styles.ts";



export function CompanyListPage() {
    const [company,setCompany]=useState<Company2[]>([]);
    const [searchText,setSearchText]=useState("");

    useEffect(()=>{
        axiosClient.get("/api/Company/getAll").then(res=>{
            console.log(res.data);
            setCompany(res.data);
        })
    },[]);
    const companies=company.filter((c)=>{
        return c.name.includes(searchText);
    });

    const navigate=useNavigate();
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
                    sx={{ flexGrow: 1, display: { xs: 'block', sm: 'block' } }}
                >
                    ダイヤ一覧
                </Typography>
                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search…"
                        value={searchText}
                        onChange={(e)=>setSearchText(e.target.value)}
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </Search>
            </Toolbar>
        </AppBar>
            <Grid container spacing={2}>
                {companies.map((c)=>{
                    return <Grid size={{ xs: 12, sm: 6 , lg: 4 }}
                    >
                        <Item elevation={3}
                              onClick={()=>navigate(`/Company/${c.companyID}`)}
                        >{c.name}</Item>
                    </Grid>
                })}
            </Grid>        </div>

    );
}
