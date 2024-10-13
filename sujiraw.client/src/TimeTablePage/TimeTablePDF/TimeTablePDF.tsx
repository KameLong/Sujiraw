import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import PDFStationView from "./PDFStationView";
import PDFTripView from './PDFTripView';
import {isMobile} from 'react-device-detect';

import {Page, PDFViewer, Document, Font, StyleSheet, View, PDFDownloadLink} from "@react-pdf/renderer";
import {
    Alert,
    Backdrop,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    Fab,
    Modal,
    TextField,
    Typography
} from "@mui/material";
import { styled } from '@mui/styles';
import {Settings} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {EditRoute, loadCompany, loadRoute, Route, RouteInfo, Station, Train, TrainType} from "../../DiaData/DiaData";
import {OrderType, SettingView, TimetablePDFSetting} from "./SettingView";
import {ClipLoader} from "react-spinners";
import { TimeTablePDF2 } from './TimeTablePDF2';
import {TimeTablePdfOrder} from "./TimeTablePdfOrder";

const CustomDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        // Add your custom styles here
        width: '800px', // Example: set the width to 80%
        margin: '5px',
    },
});
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const TimeTablePDF22=memo(TimeTablePDF2);
const TimeTablePdfOrder2=memo(TimeTablePdfOrder);
export function TimeTablePDF() {
    const [stations, setStations] = useState<{[key:number]:Station}>({});
    const [trainTypes, setTrainTypes] = useState<{[key:number]:TrainType}>({});
    const [trains, setTrains] = useState<{[key:number]:Train}>({});
    const [routeInfo, setRouteInfo] = useState<{[key:number]:RouteInfo}>({});
    const [routes, setRoutes] = useState<{[key:number]:Route}>({});
    const [loading, setLoading] = useState(true);

    const navigate=useNavigate();
    const [settingOpen,setSettingOpen]=useState(false);

    const param = useParams<{ companyID:string,routeID:string }>();
    const companyID=parseInt(param.companyID??"0");
    const routeID=parseInt(param.routeID??"0");

    const [openDownloadModal, setOpenDownloadModal] = useState(false);



    useEffect(() => {
        loadCompany(companyID,routeID).then((company)=>{
            setStations(company.stations);
            setTrainTypes(company.trainTypes);
            setTrains(company.trains);
            setRouteInfo(company.routes);
        });
    }, []);
    const route=routes[routeID];

    useEffect(() => {
        const res=Object.values(routeInfo).find((routeInfo)=>{
            return routeInfo.name==="阪急宝塚本線";
        });
        if(routeID===0&&res!==undefined){
            navigate(`/TimeTablePDF/${res.routeID}`);
        }
        if(routes[routeID]===undefined){
            loadRoute(companyID,routeID).then((route)=>{
                EditRoute.sortTrips(route,0,0);
                setRoutes((prev)=>{
                    const next  = {...prev};
                    if(route!==undefined){
                        next[route.routeID]=route;
                    }
                    return next;
                })
            });
        }

    }, [routeInfo,routeID]);

    const finishRender=useCallback(()=>{
        setLoading(false);
    },[]);


    const [layout,setLayout]=useState<TimetablePDFSetting>({
        tripInParagraph:20,
        paragraphPerPage:2,
        orderType:OrderType.ALTERNATELY,
        topPadding:15,
        leftPadding:10,
        rightPadding:10,
        paragraphPadding:5,
        stationNameWidth:20,
        fontSize:10,
        lineHeight:1.2,
    });


    useEffect(() => {
        if(!loading){
            setOpenDownloadModal(true);
        }
    }, [loading]);


    useEffect(() => {
        setLoading(true);

    }, [route,layout,stations,trainTypes ,finishRender]);


    if(route===undefined||Object.keys(trainTypes).length===0||Object.keys(stations).length===0){
        console.log(undefined);
        return <div>loading</div>
    }



    return (
        <div style={{height:'100%',width:'100%'}}>
            <Box sx={{ '& > :not(style)': { m: 1 }, position: 'fixed', bottom: 20, right: 20 }}>
                <Fab color="primary" aria-label="add" onClick={()=>setSettingOpen(true)}>
                    <Settings/>
                </Fab>
            </Box>
            <CustomDialog open={settingOpen} onClose={e=>{
                setSettingOpen(false);
            }}
                    maxWidth="lg"
            >

                <SettingView layout={layout}
                setLayout={(data=>{
                    setLayout(data);
                    setSettingOpen(false);
                })}></SettingView>
            </CustomDialog>
            {isMobile?
                <PDFDownloadLink
                    style={{fontSize: 20}}
                    document={layout.orderType === OrderType.ALTERNATELY ?
                        <TimeTablePDF22 route={route} layout={layout} stations={stations} trainTypes={trainTypes}
                                        onRender={finishRender}/>
                        :
                        <TimeTablePdfOrder2 route={route} layout={layout} stations={stations} trainTypes={trainTypes}
                                            onRender={finishRender}/>

                    }
                    fileName={`${route.name}.pdf`}

                >
                    <Alert severity="success" sx={{mt:40}}>
                        Mobile device: Click here to download PDF
                    </Alert>
                </PDFDownloadLink>
                : <PDFViewer style={{height: 'calc(100% - 10px)',width:'100%'}} >
                        {layout.orderType===OrderType.ALTERNATELY?
                            <TimeTablePDF22 route={route} layout={layout} stations={stations} trainTypes={trainTypes} onRender={finishRender}/>
                            :
                            <TimeTablePdfOrder2 route={route} layout={layout} stations={stations} trainTypes={trainTypes} onRender={finishRender}/>
                        }
                    </PDFViewer>
            }
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>


        </div>
    );
}





