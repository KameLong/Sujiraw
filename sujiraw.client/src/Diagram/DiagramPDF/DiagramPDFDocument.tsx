import {useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import {Fab} from "@mui/material";
import {Settings} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {Document, Font, Line, Page, PDFDownloadLink, PDFViewer, Rect, StyleSheet, Svg, Text, View} from "@react-pdf/renderer";
import {OrderType} from "../../TimeTablePage/TimeTablePDF/SettingView";
import {loadCompany, loadRoute, Route, RouteInfo, Station, Train, TrainType} from "../../DiaData/DiaData";
import {useDiagramHook} from "../DiagramHook";
import {DiagramLine} from "../DiagramCanvas";
import {DiagramStation} from "../DiagramData";
import {DiagramPDFSetting} from "./DiagramPDFSetting";

export interface DiagramPDFDocumentProps{
    layout:DiagramPDFSetting,
    routeStations:DiagramStation[],
    downLines:DiagramLine[],
    upLines:DiagramLine[],
    routeInfo:{[key:number]:RouteInfo}
}

export  function DiagramPDFDocument({layout,routeStations,downLines,upLines,routeInfo}:DiagramPDFDocumentProps){
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
        main: {
            fontSize: (layout.fontSize)+'pt',
            fontFamily: "NotoSansJP",
            backgroundColor:"#FFFFFF",
        },
    });
    const xTime=layout.diagramSpan.split(":").map((item)=>parseInt(item)).reduce((acc,cur)=>acc*60+cur)*60;
    const startTime=layout.diagramStartTime.split(":").map((item)=>parseInt(item)).reduce((acc,cur)=>acc*60+cur)*60;

    const diagramXratio:number=(210-layout.leftPadding-layout.rightPadding-layout.stationNameWidth-layout.lineWidth*2)/xTime;
    const diagramYratio:number=(layout.diagramHeight-layout.fontSize*1.2-0.5)/(routeStations.slice(-1)[0].stationTime);
    const xpos=(time:number,sTime:number):number=>{
        return (time-sTime)*diagramXratio+layout.stationNameWidth;
    }
    const ypos=(time:number):number=>{
        return (time)*diagramYratio+layout.fontSize*1.2;
    }

    const TripLine=(lines:DiagramLine[],startTime:number,endTime:number):any[]=>{
        const res:any[]=[];
        lines.map(line=>{
            for(let i=0;i<line.points.length-1;i++){
                if(line.points[i].x>endTime&&line.points[i+1].x>endTime){
                    continue;
                }
                if(line.points[i].x<startTime&&line.points[i+1].x<startTime){
                    continue;
                }
                res.push(
                    <Line x1={xpos(line.points[i].x,startTime)} x2={xpos(line.points[i+1].x,startTime)} y1={ypos(line.points[i].y)} y2={ypos(line.points[i+1].y)}
                          stroke={line.color} strokeWidth={layout.lineWidth}></Line>
                )
            }
        });
        return res;
    }
    const StationNameView=():React.JSX.Element[]=>{
        return routeStations.map(station=> {
            return(
                <Text
                    x={layout.fontSize*0.2}
                    y={ypos(station.stationTime)+layout.fontSize*(1.2-1.4)}
                    style={{fontSize:layout.fontSize,fontFamily:"NotoSansJP"}}
                >
                    {station.station.name}
                </Text>
            )
        });
    }
    const StationLine=():React.JSX.Element[]=>{
        return routeStations.map(station=> {
            return(
                <Line
                    x1={0} x2={210-layout.leftPadding-layout.rightPadding} y1={ypos(station.stationTime)} y2={ypos(station.stationTime)}
                    stroke={layout.lineColor} strokeWidth={station.main?2*layout.lineWidth:layout.lineWidth}
                >
                </Line>
            )
        });
    }
    const AxisText=(sTime:number,endTime:number):React.JSX.Element[]=>{
        const axisType:number=0;
        const BoldText=((time:number)=>
                <Text
                    x={xpos(time,sTime)+layout.fontSize*0}
                    y={layout.fontSize*1}
                    style={{fontSize:layout.fontSize,fontFamily:"NotoSansJP"}}
                >
                    {Math.floor(time/3600).toString()}
                </Text>
        )
        const NormalText=((time:number)=>
                <Text
                    x={xpos(time,sTime)-layout.fontSize*0.5}
                    y={layout.fontSize*1.2}
                    style={{fontSize:layout.fontSize,fontFamily:"NotoSansJP"}}
                >
                    {time/3600}
                </Text>
        )

        switch (axisType) {
            case 0:
                return new Array(24).fill(0).map((_, i) => {
                    return (
                        BoldText(Math.ceil(startTime/3600)*3600 + i * 3600)
                    )
                });
                break;

        }
        return [];

    }
    const AxisLine=(sTime:number,endTime:number):React.JSX.Element[]=>{
        // 60分目:0 30分目;1 20分目:2 15分目:3 10分目:4 5分目:5 2分目:6 1分目:7
        const axisType:number=layout.diagramAxisType;
        const BoldLine=((_time:number)=>{
            const time=(_time-startTime+86400)%86400+startTime;
            return(
                <Line x1={xpos(time,sTime)} x2={xpos(time,sTime)} y1={ypos(0)} y2={ypos(routeStations.slice(-1)[0].stationTime)}
                      stroke={layout.lineColor} strokeWidth={layout.lineWidth*2}/>
            )

        }
        )
        const NormalLine=((_time:number)=>{
            const time=(_time-startTime+86400)%86400+startTime;
            return(
                <Line x1={xpos(time,sTime)} x2={xpos(time,sTime)} y1={ypos(0)} y2={ypos(routeStations.slice(-1)[0].stationTime)}
                      stroke={layout.lineColor} strokeWidth={layout.lineWidth}/>
            )
        })
        const DashLine=((_time:number)=>{
                const time=(_time-startTime+86400)%86400+startTime;
            return(
                <Line x1={xpos(time,sTime)} x2={xpos(time,sTime)} y1={ypos(0)} y2={ypos(routeStations.slice(-1)[0].stationTime)}
                      stroke={layout.lineColor} strokeWidth={layout.lineWidth}
                      strokeDasharray={`${layout.lineWidth*7}`}/>
            )
        }
        )
        switch (axisType){
            case 0:
                return new Array(25).fill(0).map((_,i)=>{
                    return(
                        BoldLine(i*3600)
                )
                });
                break;
            case 1:
                return new Array(25).fill(0).map((_,i)=>
                        [BoldLine(startTime+i*3600),
                            NormalLine(startTime+i*3600+30*60)]

                ).flat();
                break;
            case 2:
                return new Array(25).fill(0).map((_,i)=>
                    [BoldLine(startTime+i*3600),
                        NormalLine(startTime+i*3600+20*60),
                    NormalLine(startTime+i*3600+40*60)]

                ).flat();
                break;
            case 3:
                return new Array(25).fill(0).map((_,i)=>
                    [BoldLine(startTime+i*3600),
                        NormalLine(startTime+i*3600+15*60),
                        NormalLine(startTime+i*3600+30*60),
                        NormalLine(startTime+i*3600+45*60)]

                ).flat();
                break;
            case 4:
                return new Array(25).fill(0).map((_,i)=>
                    [
                        BoldLine(i*3600),
                        DashLine(i*3600+10*60),
                        DashLine(i*3600+20*60),
                        NormalLine(i*3600+30*60),
                        DashLine(i*3600+40*60),
                        DashLine(i*3600+50*60)]
                ).flat();
                break;
            case 5:
                return new Array(25).fill(0).map((_,i)=>
                    [
                        BoldLine(i*3600),
                        NormalLine(i*3600+10*60),
                        NormalLine(i*3600+20*60),
                        BoldLine(i*3600+30*60),
                        NormalLine(i*3600+40*60),
                        NormalLine(i*3600+50*60),
                        DashLine(i*3600+5*60),
                        DashLine(i*3600+15*60),
                        DashLine(i*3600+25*60),
                        DashLine(i*3600+35*60),
                        DashLine(i*3600+45*60),
                        DashLine(i*3600+55*60),
                    ]
                ).flat();
                break;
            case 5:
                return new Array(25).fill(0).map((_,i)=>{
                    const res=[
                        BoldLine(i*3600),
                        NormalLine(i*3600+10*60),
                        NormalLine(i*3600+20*60),
                        BoldLine(i*3600+30*60),
                        NormalLine(i*3600+40*60),
                        NormalLine(i*3600+50*60),
                    ]
                    for(let mm=0;mm<6;mm++){
                        res.push(DashLine(i*3600+(mm*10+2)*60));
                        res.push(DashLine(i*3600+(mm*10+4)*60));
                        res.push(DashLine(i*3600+(mm*10+6)*60));
                        res.push(DashLine(i*3600+(mm*10+8)*60));
                    }
                    return res;
                    }
                ).flat();
                break;
        }
        return [];
    }
    const pageNum=Math.ceil(24*3600/xTime);


    return(
                <Document >
                                <Page size="A4" style={styles.main}
                                      wrap={true}>
                                    {new Array(pageNum).fill(0).map((_,j)=>{
                                    return(
                                <Svg key={j}
                                     width={`${210-layout.leftPadding-layout.rightPadding}mm`} style={{
                                    height:`${layout.diagramHeight}mm`,
                                    marginTop:`${layout.topPadding}mm`,
                                    marginLeft:`${layout.leftPadding}mm`,
                                    marginRight:`${layout.rightPadding}mm`,
                                    backgroundColor:"white",
                                    fontFamily:"NotoSansJP"
                                }}
                                     viewBox={`0 0 ${210-layout.leftPadding-layout.rightPadding} ${layout.diagramHeight}`}
                                >
                                    {
                                        AxisLine(startTime+xTime*(j),startTime+xTime*(j)).map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    {
                                        TripLine(downLines,startTime+xTime*(j),startTime+xTime*(j+1)).map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    {
                                        TripLine(upLines,startTime+xTime*(j),startTime+xTime*(j+1)).map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    <Rect x={0} y={0} width={layout.stationNameWidth} height={layout.diagramHeight} fill="white"/>
                                    {
                                        StationNameView().map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    {
                                        StationLine().map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    {
                                        AxisText(startTime+xTime*(j),startTime+xTime*(j+1)).map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    <Line x1={layout.lineWidth} y1={ypos(0)} x2={layout.lineWidth} y2={ypos(routeStations.slice(-1)[0].stationTime)} stroke="gray" strokeWidth={layout.lineWidth*2}/>
                                    <Line x1={layout.stationNameWidth} y1={ypos(0)} x2={layout.stationNameWidth} y2={ypos(routeStations.slice(-1)[0].stationTime)} stroke="gray" strokeWidth={layout.lineWidth*2}/>
                                    {
                                        (j===pageNum-1)?
                                            <Rect x={xpos(startTime+24*3600,startTime+xTime*j)} y={0} width={210} height={layout.diagramHeight} fill="white"/>
                                            :null
                                    }
                                    {
                                        (j===pageNum-1)?
                                            <Line x1={xpos(startTime+24*3600,startTime+xTime*j)} y1={ypos(0)} x2={xpos(startTime+24*3600,startTime+xTime*j)} y2={ypos(routeStations.slice(-1)[0].stationTime)} stroke="gray" strokeWidth={layout.lineWidth*2}/>
                                            :null
                                    }


                                </Svg>
                                );})}
                                </Page>
            </Document>

)
}