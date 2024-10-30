import Grid from "@mui/material/Grid2";
import * as React from "react";
import cmnStyles from "../scss/CMN.module.scss";

export function AppBar(){
    return(
        <Grid className={cmnStyles.menuBar}>
            <span className={cmnStyles.appName}>すじらう</span>
            <span className={cmnStyles.userName}>by Kamelong</span>
        </Grid>
    );
}