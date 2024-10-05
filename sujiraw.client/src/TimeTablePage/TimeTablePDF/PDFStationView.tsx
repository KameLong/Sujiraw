import React from "react";

import {Text, View} from "@react-pdf/renderer";
import {TimeTablePageSetting} from "../TimeTablePage";
import {StationProps} from "../StationView";
import {stationStyle} from "../Util";
import { TimetablePDFSetting} from "./SettingView";

interface PDFStationViewProps {
    stations: StationProps[];
    setting: TimetablePDFSetting;
    direction: number;
}

function PDFStationView({stations,setting,direction}:PDFStationViewProps){
    const showStations=(direction===0)?stations: stations.slice().reverse();

    const lineHeight=(setting.lineHeight*setting.fontSize)+'px';
    const linePaddingTop=(setting.lineHeight/2-0.7)*setting.fontSize+'px';

    const linePaddingBottom=-(setting.fontSize*2)+'px';


    return (
        <View style={{width: '100%', borderRight: "1px solid black"}}>
            <div style={{borderBottom: "1px solid #000"}}></div>
            <div>
                <Text style={{
                    textAlign: 'center',
                    width: "100%",
                    height: lineHeight,
                    paddingTop: linePaddingTop,
                    paddingBottom: linePaddingBottom
                }}>列車番号</Text>
            </div>
            <div style={{borderBottom: "0.5px solid #000"}}></div>
            <div>
                <Text style={{
                    textAlign: 'center',
                    width: "100%",
                    height: lineHeight,
                    paddingTop: linePaddingTop,
                    paddingBottom: linePaddingBottom
                }}>列車種別</Text>
            </div>
            <div style={{borderBottom: "1px solid #000"}}></div>

            {
                showStations.map((station, _i) => {
                    switch (stationStyle(station, direction)) {
                        case 1:
                        case 2:
                            return (
                                <div style={{
                                    whiteSpace: 'nowrap',
                                    overflow: "hidden",
                                }} key={station.rsID}>
                                    <Text style={{
                                        paddingLeft: '2px',
                                        overflow: 'hidden',
                                        height: lineHeight,
                                        paddingTop: linePaddingTop,
                                        paddingBottom: linePaddingBottom
                                    }}>
                                        {station.name}
                                    </Text>
                                </div>
                            );
                        case 3:
                            return (
                                <div style={{
                                    whiteSpace: 'nowrap',
                                    overflow: "hidden",
                                }} key={station.rsID}>
                                    <Text style={{
                                        paddingLeft: '2px',
                                        verticalAlign: 'sub',
                                        height: (setting.lineHeight*setting.fontSize*2)+'px',
                                        paddingTop: (setting.lineHeight-0.9)*setting.fontSize+'px',
                                        paddingBottom: linePaddingBottom,

                                    }}>{station.name}</Text>
                                </div>
                            );
                    }
                })
            }
            <div style={{borderBottom: "1px solid #000"}}></div>
        </View>
    );
}

export default PDFStationView;