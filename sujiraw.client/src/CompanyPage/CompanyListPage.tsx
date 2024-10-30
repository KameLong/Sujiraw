import * as React from 'react';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid2';
import {Backdrop, CircularProgress, Paper, Stack} from "@mui/material";
import {axiosClient} from "../CMN/axiosHook.ts";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Search, SearchIconWrapper, StyledInputBase} from "../CMN/Styles.ts";
import {Snackbar, useSnackbar} from "../CMN/UseSnackbar.tsx";
import {styled} from "@mui/material/styles";
import {useTranslation} from "react-i18next";
import {Add} from "@mui/icons-material";
import {Company} from "./CompanyData.ts";
import {useLoading} from "../CMN/useLoading.ts";
import {AppBar} from "../CMN/AppBar.tsx";

export const CompanyItem = styled(Paper)(({theme}) => ({
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

export function CompanyView({company}:{company:Company}){
    const navigate=useNavigate()
    return(
        <CompanyItem elevation={3} sx={{mt: 2}}
                     onClick={() => navigate(`/Company/${company.companyID}`)}>
            <Typography
                style={{
                    color: 'black',
                    fontWeight: 700,
                    fontSize: '12pt',
                }}>
                {company.name}
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
        </CompanyItem>
    )
}
export function NewCompanyView(){
    const navigate=useNavigate();
    const {t, i18n} = useTranslation();
    return(<CompanyItem elevation={3} sx={{mt: 2}}
                 onClick={() => navigate(`/Oudia`)}>
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
    </CompanyItem>
    )
}

export function CompanyListPage() {
    const [company, setCompany] = useState<Company[]>([]);
    const [searchText, setSearchText] = useState("");
    const loadingProps = useLoading();
    const snackbarProps = useSnackbar();
    const {t, i18n} = useTranslation();


    useEffect(() => {
        loadingProps.startLoading();
        axiosClient.get("/api/Company/getAll").then(res => {
            setCompany(res.data);
            loadingProps.stopLoading();
        }).catch(err => {
            console.error(err);
            snackbarProps.show("Fail to get Data " + err);
            loadingProps.stopLoading();
        })
    }, []);

    // メモ useStateを使った方がいいか？
    const searchedCompany = company.filter((c) => {
        return c.name.includes(searchText);
    });

    return (
        <div>
            <AppBar></AppBar>

            <Grid container style={{backgroundColor: "#000"}}>
                <Grid size={{xs: 6}} style={{
                    padding: '10px 0px 10px 20px',
                    fontSize: "16pt",
                    color: '#DDD',
                }}>{t("会社を探す")}</Grid>
                <Grid
                    size={{xs: 6}}
                    style={{
                        padding: '10px 10px 10px 10px',
                        fontSize: "20pt",
                        color: '#000'
                    }}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon/>
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            inputProps={{'aria-label': 'search'}}
                        />
                    </Search>

                </Grid>
                <Grid size={{xs: 12, sm: 6}} style={{
                    padding: '0px 10px 5px 50px',
                    fontSize: "12pt",
                    color: '#DDD',
                }}>{t("会社検索検索結果", {length: searchedCompany.length})}</Grid>
            </Grid>

            <Grid container>
                <Grid size={{xs: 12, sm: 6, lg: 4}}
                >
                    <NewCompanyView></NewCompanyView>
                </Grid>
                {searchedCompany.map((c) => {
                    return <Grid size={{xs: 12, sm: 6, lg: 4}} key={c.companyID}>
                        <CompanyView company={c}></CompanyView>
                    </Grid>
                })}
            </Grid>
            <Backdrop
                sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 1})}
                open={loadingProps.loading}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            <Snackbar props={snackbarProps}/>
        </div>

    );
}
