import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {BottomMenu} from "../Menu/BottomMenu";


export function LicensePage(){
    const {t, i18n} = useTranslation();
    const [npmLicense,setNpmLicense]=useState<any>("")
    useEffect(() => {
        fetch("/dependent_package.json")
            .then(res=>res.json())
            .then((result)=> {
                    setNpmLicense(result);
                }
            );

    }, []);

    return(
        <div>

        <div style={{marginLeft: '20px',paddingBottom:'100px'}}>
            <h1>{t("license.license")}</h1>
            <p>{t("common.appName")}{t("license.thisLicense")}<br/>
                source:<a href={"https://github.com/KameLong/Sujiraw"}>https://github.com/KameLong/Sujiraw</a></p>
            <h3>FONT LICENSE</h3>
            <TableContainer sx={{ maxWidth: 600 }} component={Paper}>
                <Table  aria-label="customized table">
                    <TableHead>
                        <TableRow >
                            <TableCell style={{fontWeight:'bold'}}>FontName</TableCell>
                            <TableCell style={{fontWeight:'bold'}}>LICENSE</TableCell>
                            <TableCell style={{fontWeight:'bold'}}>URL</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                            <TableRow >
                                <TableCell>DiaPro</TableCell>
                                <TableCell >SIL Open Font License</TableCell>
                                <TableCell ><a href={"https://but.tw/font/"}>https://but.tw/font/</a></TableCell>
                            </TableRow>
                        <TableRow >
                            <TableCell>NotoSansJP</TableCell>
                            <TableCell >SIL Open Font License</TableCell>
                            <TableCell ><a href={"https://github.com/notofonts/noto-fonts/blob/main"}>https://github.com/notofonts/noto-fonts/blob/main</a></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <h3>other LICENSE</h3>
            <ul>
                {
                    Object.keys(npmLicense).map((key) => {
                        return <li key={key}><a href={npmLicense[key].repository}>{key} {npmLicense[key].licenses} </a>
                        </li>
                    })
                }
            </ul>
        </div>

            <BottomMenu routeID={undefined} routeInfo={undefined}/>

        </div>

    )
}