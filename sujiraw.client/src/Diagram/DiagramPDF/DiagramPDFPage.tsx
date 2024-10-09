import {useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import {Dialog, Fab} from "@mui/material";
import {Settings} from "@mui/icons-material";
import React, {memo, useEffect, useState} from "react";
import {useDiagramHook} from "../DiagramHook";
import {styled} from "@mui/styles";
import {DiagramPDFSetting, DiagramPDFSettingView} from "./DiagramPDFSetting";
import {DiagramPDFDocument} from "./DiagramPDFDocument";
import {PDFDownloadLink, PDFViewer} from "@react-pdf/renderer";
import {isMobile} from 'react-device-detect';




const CustomDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        width: '800px',
        margin: '5px',
    },
});
const MemoDiagramPDFDocument=memo(DiagramPDFDocument);

export function DiagramPDFPage(){
    const params = useParams<{ routeID: string,companyID:string }>();
    const routeID = Number.parseInt(params.routeID??"0");
    const companyID = Number.parseInt(params.companyID??"0");

    const [layout,setLayout]=React.useState<DiagramPDFSetting>({
        fontSize:3,
        leftPadding:10,
        rightPadding:10,
        topPadding:10,
        stationNameWidth:20,
        diagramHeight:130,
        lineColor:"#888888",
        lineWidth:0.2,
        diagramStartTime:"03:00",
        diagramSpan:"03:00",
        diagramAxisType:4,
        diagramInPage:2

    });
    const [settingOpen,setSettingOpen]=useState(false);

    const {routeStations, downLines, upLines, routeInfo} = useDiagramHook(companyID,routeID);

    if(routeStations.length===0){
        return <div>loading...</div>
    }
    return (
        <div style={{height: '100%', width: '100%'}}>
            <Box sx={{'& > :not(style)': {m: 1}, position: 'fixed', bottom: 20, right: 20}}>
                <Fab color="primary" aria-label="add" onClick={() => setSettingOpen(true)}>
                    <Settings />
                </Fab>
            </Box>
            <CustomDialog
                open={settingOpen} onClose={e=>{
                    setSettingOpen(false);
                }}
                maxWidth="lg"
            >
            <DiagramPDFSettingView
                layout={layout}
                setLayout={(data=>{
                    setLayout(data);
                    setSettingOpen(false);
                })}>
            </DiagramPDFSettingView>
            </CustomDialog>
            {isMobile?
                <PDFDownloadLink
                    style={{fontSize:20}}
                    document={
                        <DiagramPDFDocument upLines={upLines} downLines={downLines} routeStations={routeStations} routeInfo={routeInfo} layout={layout}/>
                    }
                    fileName={`Diagram_${routeInfo[routeID].name}.pdf`}
                >
                    {/*{({ loading }) =>*/}
                    {/*    loading ? "Loading...": "PDF ready for download"*/}
                    {/*}*/}
                </PDFDownloadLink>
                :
                <PDFViewer style={{width: '100%', height: '100%'}}>
                    <MemoDiagramPDFDocument upLines={upLines} downLines={downLines} routeStations={routeStations} routeInfo={routeInfo} layout={layout}/>
                </PDFViewer>
            }
        </div>
    );
}