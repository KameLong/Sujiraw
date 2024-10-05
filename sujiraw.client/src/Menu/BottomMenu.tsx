import {Button, Card, CardContent, List, ListItem, Modal} from "@mui/material";
import React, {forwardRef, useState} from "react";
import {RouteSelectView, RouteSelectViewProps} from "./RouteSelectView";
import {useNavigate} from "react-router-dom";
import {RouteInfo} from "../DiaData/DiaData";
import css from './menu.module.scss';

interface BottomMenuProps {
    routeID:number|undefined;
    routeInfo:{[key:number]:RouteInfo}|undefined;
}


const cardStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    // boxShadow: 24,
    p: 4,
};

export function BottomMenu({routeID,routeInfo}:BottomMenuProps){
    const [openRouteSelect,setOpenRouteSelect]=useState<boolean>(false);
    const [openMainMenu,setOpenMainMenu]=useState<boolean>(false);
    const navigate=useNavigate();

    const RouteSelectViewWithRef = forwardRef((props: RouteSelectViewProps, ref) => {
        return <RouteSelectView {...props}  />;
    });

    return (
        <div style={{display: "flex", position: 'fixed', zIndex:100,bottom: 0, width: '100%', backgroundColor: "#FFF"}}>
            <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                    onClick={() => setOpenMainMenu(true)}>
                メニュー
            </Button>
            <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                    disabled={routeID===undefined}
                    onClick={() => {
                        navigate(`/TimeTable/${routeID}/0`);
                    }}>
                下り
            </Button>
            {/*<svg viewBox="0 0 64 64" width="48" height="48" stroke={"#52a8ff"} strokeWidth={2} style={{backgroundColor:'black'}}>*/}
            {/*    <rect width="36" height="32" x="7" y="21" rx="4"></rect>*/}
            {/*    <rect width="28" height="18" x="11" y="24" rx="4"></rect>*/}
            {/*    <circle cx="36" cy="47" r="2.5"></circle>*/}
            {/*    <circle cx="14" cy="47" r="2.5"></circle>*/}
            {/*    <line x1="57" x2="42" y1="11" y2="22"></line>*/}
            {/*    <line x1="57" x2="42" y1="41" y2="52"></line>*/}
            {/*    <line x1="23" x2="8" y1="11" y2="22"></line>*/}
            {/*</svg>*/}
            <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                    disabled={routeID===undefined}
                    onClick={() => {
                        navigate(`/TimeTable/${routeID}/1`);
                    }}>
                上り
            </Button>
            {/*<svg viewBox="0 0 64 64" width="48" height="48" stroke={"#52a8ff"} strokeWidth={2} style={{backgroundColor:'black'}}>*/}
            {/*    <rect width="36" height="32" x="21" y="21" rx="4"></rect>*/}
            {/*    <rect width="28" height="18" x="25" y="24" rx="4"></rect>*/}
            {/*    <circle cx="28" cy="47" r="2.5"></circle>*/}
            {/*    <circle cx="50" cy="47" r="2.5"></circle>*/}
            {/*    <line x1="7" x2="22" y1="11" y2="22"></line>*/}
            {/*    <line x1="7" x2="22" y1="41" y2="52"></line>*/}
            {/*    <line x1="41" x2="56" y1="11" y2="22"></line>*/}
            {/*</svg>*/}
            <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                    disabled={routeID===undefined}
                    onClick={() => {
                        navigate(`/Diagram/${routeID}`);
                    }}>
                ダイヤ
            </Button>
            {/*<svg viewBox="0 0 64 64" width="48" height="48" stroke={"#52a8ff"} strokeWidth={2} style={{backgroundColor:'black'}}>*/}
            {/*    <path d="M8 8 l10 12 l12 0 l26 36 M56 8 l-12 24 l-8 0 l-12 24 M8 30 l12 0l11 -22" ></path>*/}
            {/*</svg>*/}
            <Modal
                id={"mainMenu"}
                open={openMainMenu}
                onClose={() => setOpenMainMenu(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Card
                     // style={{margin: '10px 10px 50px 10px', height: 'calc(100% - 60px)'}}
                    style={cardStyle}
                >
                    <CardContent>

                    <List>
                        {
                            routeInfo!==undefined?
                                <ListItem
                                    onClick={()=>{
                                        setOpenRouteSelect(true);
                                        setOpenMainMenu(false);
                                    }}
                                    className={css.menuItem}>
                                    路線選択
                                </ListItem> :null
                        }
                        <ListItem
                            onClick={()=>{
                                // setOpenRouteSelect(true);
                                setOpenMainMenu(false);
                            }}
                            className={css.menuItem}>
                            OuDiaファイルを開く(未実装)
                        </ListItem>
                        {routeID!==undefined?
                            <ListItem
                                onClick={()=>{
                                    navigate(`/TimeTablePDF/${routeID}`);

                                }}
                                className={css.menuItem}>
                                時刻表をPDFにする
                            </ListItem>:null
                        }
                        {routeID!==undefined?
                            <ListItem
                                onClick={()=>{
                                    navigate(`/DiagramPDF/${routeID}`);

                                }}
                                className={css.menuItem}>
                                ダイヤグラムをPDFにする
                            </ListItem>:null
                        }

                        <ListItem
                            onClick={()=>{
                                navigate(`/LICENSE`);

                            }}
                            className={css.menuItem}>
                            LICENSE
                        </ListItem>

                </List>
                    </CardContent>
                </Card>

            </Modal>
            {routeInfo!==undefined?
                <Modal
                    id={"routeSelect"}
                    open={openRouteSelect}
                    onClose={() => setOpenRouteSelect(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <RouteSelectViewWithRef routes={routeInfo} closeModal={() => {
                        setOpenRouteSelect(false)
                    }}/>
                </Modal>
                :null
            }

        </div>
)
}