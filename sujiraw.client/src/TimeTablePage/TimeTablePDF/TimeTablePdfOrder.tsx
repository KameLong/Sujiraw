import {Document, Font, Page, StyleSheet, View,Text} from "@react-pdf/renderer";
import PDFStationView from "./PDFStationView";
import PDFTripView from "./PDFTripView";
import React from "react";
import {TimetablePDFSetting} from "./SettingView";
import {Route, Station, TrainType} from "../../DiaData/DiaData";


interface TimeTablePDF2Props {
    route: Route;
    layout: TimetablePDFSetting;
    trainTypes: {[key:number]:TrainType};
    stations:{[key:number]:Station};
    onRender:()=>void;
}
export function TimeTablePdfOrder(
    {layout,route,trainTypes,stations,onRender}:TimeTablePDF2Props
){
    function getStationProps(){
        return route.routeStations.map((item)=>{
            return {
                rsID:item.rsID,
                name:stations[item.stationID]?.name??"",
                style:item.showStyle
            }
        });
    }
    const getPage=(page:number)=>{
        const tripnum=Math.max(route.upTrips.length,route.downTrips.length);
        const paraNum=Math.ceil(tripnum/layout.tripInParagraph);
        return [...Array(Math.min(layout.paragraphPerPage,paraNum-page*layout.paragraphPerPage))].map((_, i) => i)
    }
    const getPage2=()=>{
        const tripnum=Math.max(route.upTrips.length,route.downTrips.length);
        const a= [...Array(Math.ceil(tripnum/layout.tripInParagraph/layout.paragraphPerPage))].map((_, i) => i)
        console.log(a);
        return a;

    }

    // ttfファイルのフォント定義
    Font.register({
        family: "NotoSansJP",
        src: "/font/NotoSansJP.ttf",
    });
    Font.register({
        family: "DiaPro",
        src: "/font/DiaPro-Regular.ttf",
    });
    const styles = StyleSheet.create({
        tableCell: {
            fontSize: (layout.fontSize)+'pt',
            fontFamily: "NotoSansJP",
        },
    });

    return(
        <Document
            onRender={() => {
                console.log("render");
                    onRender();
            }}
        >{
            getPage2().map(page=>

            <Page size="A4" style={styles.tableCell}>

            {
                getPage(page).map((_,i)=> {
                    return(
                            <View wrap={false} key={i} style={{
                                marginTop:layout.topPadding+'mm',
                                marginLeft:layout.leftPadding+'mm',
                                marginRight:layout.rightPadding+'mm',
                                display:"flex",flexDirection: "row"
                            }}>
                                <View style={{alignItems:'stretch',borderLeft:"1px solid black"}}/>
                                <div style={{width:layout.stationNameWidth+'mm'}}>
                                    <PDFStationView   stations={getStationProps()} direction={0} setting={layout}/>
                                </div>
                                <View style={{display:"flex",flexDirection: "row"}}>
                                    {route.downTrips.slice((page*layout.paragraphPerPage+i)*layout.tripInParagraph,(page*layout.paragraphPerPage+i+1)*layout.tripInParagraph).map((trip) => {
                                        return (
                                            <PDFTripView  key={trip.tripID} trip={trip} stations={getStationProps()}
                                                          direction={0} setting={layout} type={trainTypes[trip.trainTypeID]}
                                            />
                                        )
                                    })}
                                    <View style={{alignItems:'stretch',borderLeft:"0.5px solid black"}}/>
                                </View>
                            </View>


                    )
                })
            }
            </Page>
            )
        }
            {
                getPage2().map(page=>

                    <Page size="A4" style={styles.tableCell}>

                        {
                            getPage(page).map((_,i)=> {
                                return(
                                        <View key={i} wrap={false} style={{
                                            marginTop: layout.paragraphPadding + 'mm',
                                            marginLeft: layout.leftPadding + 'mm',
                                            marginRight: layout.rightPadding + 'mm',
                                            display: "flex", flexDirection: "row"
                                        }}>
                                            <View style={{alignItems: 'stretch', borderLeft: "1px solid black"}}/>
                                            <div style={{width: layout.stationNameWidth + 'mm'}}>
                                                <PDFStationView   stations={getStationProps()} direction={1} setting={layout}/>
                                            </div>
                                            <View>
                                                <View style={{display: "flex", flexDirection: "row"}}>
                                                    {route.upTrips.slice((page*layout.paragraphPerPage+i)*layout.tripInParagraph,(page*layout.paragraphPerPage+i+1)*layout.tripInParagraph).map((trip) => {
                                                        return (
                                                            <PDFTripView   key={trip.tripID} trip={trip}
                                                                           stations={getStationProps()}
                                                                           direction={1}
                                                                           setting={layout}
                                                                           type={trainTypes[trip.trainTypeID]}

                                                            />
                                                        )
                                                    })}
                                                </View>
                                            </View>
                                            <View style={{alignItems: 'stretch', borderLeft: "0.5px solid black"}}/>
                                        </View>
                                )
                            })
                        }
                    </Page>
                )
            }

        </Document>
    )
}