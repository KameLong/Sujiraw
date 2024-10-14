import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import {Backdrop, CircularProgress, Paper, Stack} from "@mui/material";
import {axiosClient} from "../CMN/axiosHook.ts";
import {useEffect, useState} from "react";
import {Company, Company2} from "../DiaData/DiaData.ts";
import {useNavigate} from "react-router-dom";
import {Search, SearchIconWrapper, StyledInputBase} from "../CMN/Styles.ts";
import {Snackbar, useSnackbar} from "../CMN/UseSnackbar.tsx";
import DiamondIcon from '@mui/icons-material/Diamond';
import {styled} from "@mui/material/styles";
import {useTranslation} from "react-i18next";
import {Add} from "@mui/icons-material";

export const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    margin: '10px',
    padding: '30px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

export function CompanyListPage() {
    const [company,setCompany]=useState<Company2[]>([]);
    const [searchText,setSearchText]=useState("");
    const [loading,setLoading]=useState(false);
    const snackbarProps=useSnackbar();
    const {t, i18n} = useTranslation();


    useEffect(()=>{
        setLoading(true);
        axiosClient.get("/api/Company/getAll").then(res=>{
            setCompany(res.data);
            setLoading(false);
        }).catch(err=>{
            console.error(err);
            snackbarProps.show("Fail to get Data "+err);
            setLoading(false);
        })
    },[]);
    const companies=company.filter((c)=>{
        return c.name.includes(searchText);
    });

    const navigate=useNavigate();
    return (
        <div >
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
            <Grid container  style={{backgroundColor: "#000"}}>

                <Grid size={{ xs: 6 }} style={{
                    padding: '10px 0px 10px 20px',
                    fontSize: "16pt",
                    color: '#DDD',
                }}>{t("会社を探す")}</Grid>
                <Grid
                    size={{ xs: 6 }}
                    style={{
                            padding: '10px 10px 10px 10px',
                            fontSize: "20pt",
                            color: '#000'}}>
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

                </Grid>
                <Grid size={{ xs: 12, sm: 6  }} style={{
                    padding: '0px 10px 5px 50px',
                    fontSize: "12pt",
                    color: '#DDD',
                }}>{t("会社検索検索結果", { length: companies.length })}</Grid>

            </Grid>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 , lg: 4 }}
            >
                <Item elevation={3} sx={{mt:5}}
                      onClick={()=>navigate(`/Oudia`)}>
                    <Stack direction="row">
                        <Add></Add>
                    <Typography
                        style={{
                            color: 'black',
                            fontWeight: 700,
                            fontSize: '12pt',
                        }}>
                        {t("新規作成")}
                    </Typography>
                    </Stack>
                    <Typography
                        style={{
                            color: '#222',
                            fontSize: '10pt',
                            textAlign: 'right',
                            paddingRight: '10px',

                        }}>
                        {/*駅:10&emsp;路線:4*/}
                    </Typography>

                </Item>
            </Grid>
                {companies.map((c)=>{
                    return <Grid size={{ xs: 12, sm: 6 , lg: 4 }}
                    >
                        <Item elevation={3} sx={{mt:5}}
                              onClick={()=>navigate(`/Company/${c.companyID}`)}>
                            <Typography
                            style={{
                                color: 'black',
                                fontWeight: 700,
                                fontSize: '12pt',
                            }}>
                                {c.name}
                            </Typography>
                            <Typography
                                style={{
                                    color: '#222',
                                    fontSize: '10pt',
                                    textAlign: 'right',
                                    paddingRight: '10px',

                                }}>
                                {/*駅:10&emsp;路線:4*/}
                            </Typography>

                        </Item>
                    </Grid>
                })}
            </Grid>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar props={snackbarProps}/>

        </div>


    );
}
