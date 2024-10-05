import React from "react";
import {Text, View} from "@react-pdf/renderer";
import {GetStopTime, StopTime, TrainType, Trip} from "../../DiaData/DiaData";
import {StationProps} from "../StationView";
import {TimeTablePageSetting} from "../TimeTablePage";
import {timeIntStr} from "../Util";
import { TimetablePDFSetting} from "./SettingView";

interface PDFTripViewProps {
    trip: Trip;
    type: TrainType;
    stations: StationProps[];
    setting: TimetablePDFSetting;
    direction: number;
}
function PDFTripView({trip,type,stations,setting,direction}:PDFTripViewProps) {
    function depTimeStr(time: StopTime, _i: number) {
        switch (time.stopType) {
            case 0:
                return "‥";
            case 2:
                return "⇂";
            case 3:
                return "║";
            default:
                if (showAri(_i)) {
                    if (_i < stations.length - 1) {
                        switch (getTimes()[_i + 1].stopType) {
                            case 0:
                                return "‥";
                            case 3:
                                return "║";
                        }
                    } else {
                        return "‥";
                    }
                }
                return timeIntStr(GetStopTime.GetDepAriTime(time));
        }
    }

    function ariTimeStr(time: StopTime, _i: number) {
        switch (time.stopType) {
            case 0:
                return "‥";
            case 2:
                return "⇂";
            case 3:
                return "║";
            default:
                if (showDep(_i)) {
                    if (_i > 0) {
                        switch (getTimes()[_i - 1].stopType) {
                            case 0:
                                return "‥";
                            case 3:
                                return "║";
                        }
                    } else {
                        return "‥";
                    }
                }
                return timeIntStr(GetStopTime.GetAriDepTime(time));
        }
    }

    function showAri(index: number): boolean {
        if(direction===0){
            return ((getStations()[index].style % 16) & 0b0010) !== 0;
        }
        return ((Math.floor(getStations()[index].style/16) % 16) & 0b0010) !== 0;
    }

    function showDep(index: number): boolean {
        if(direction===0){
            return ((getStations()[index].style % 16) & 0b0001) !== 0;
        }
        return ((Math.floor(getStations()[index].style/16) % 16) & 0b0001) !== 0;

    }

    //方向を考慮した駅一覧
    function getStations() {
        if (direction === 0) {
            return stations;
        } else {
            return stations.slice().reverse();
        }
    }
    //方向を考慮した駅時刻一覧
    function getTimes() {
        if (direction === 0) {
            return trip.times;
        } else {
            return trip.times.slice().reverse();
        }
    }

    const lineHeight=(setting.lineHeight*setting.fontSize)+'px';
    const linePaddingTop=(setting.lineHeight/2-0.7)*setting.fontSize+'px';
    const linePaddingBottom=-(setting.fontSize*2)+'px';
    return (

        <View
            style={{
                color: type.color,
                width: ((210-setting.leftPadding-setting.rightPadding-setting.stationNameWidth-1)/setting.tripInParagraph) + 'mm',
                borderRight: '0.5px solid #000',
                textAlign: 'center'
            }}
        >
            <div style={{borderBottom: "1px solid #000"}}></div>
            <div>
                <Text style={{
                    textAlign: 'center',
                    width: "100%",
                    height: lineHeight,
                    paddingTop: linePaddingTop,
                    paddingBottom: linePaddingBottom

                }}> </Text>
            </div>
            <div style={{borderBottom: "0.5px solid #000"}}></div>
            <div>
                <Text style={{
                    textAlign: 'center',
                    width: "100%",
                    height: lineHeight,
                    paddingTop: linePaddingTop,
                    paddingBottom: linePaddingBottom
                }}>{type.shortName.length === 0 ? "　" : type.shortName}</Text>
            </div>
            <div style={{borderBottom: "1px solid #000"}}></div>

            {
                getTimes().map((time, _i) => {
                    return (
                        <div key={time.rsID}>
                            {
                                (showAri(_i) && showDep(_i)) ?
                                    <Text style={{
                                        fontFamily: "DiaPro",
                                        width: '100%',
                                        textAlign: 'center',
                                        borderBottom: '0.5px solid black',
                                        height: lineHeight,
                                        paddingTop: linePaddingTop,
                                        paddingBottom: linePaddingBottom
                                    }}>
                                        {ariTimeStr(time, _i)}
                                    </Text> : null
                            }
                            {
                                (showAri(_i) && !showDep(_i)) ?
                                    <Text style={{
                                        fontFamily: "DiaPro",
                                        width: '100%',
                                        textAlign: 'center',
                                        height: lineHeight,
                                        paddingTop: linePaddingTop,
                                        paddingBottom: linePaddingBottom

                                    }}>
                                        {ariTimeStr(time, _i)}
                                    </Text> : null
                            }
                            {
                                (showDep(_i)) ?
                                    <Text style={{
                                        fontFamily: "DiaPro",
                                        width: '100%',
                                        textAlign: 'center',
                                        height: lineHeight,
                                        paddingTop: linePaddingTop,
                                        paddingBottom: linePaddingBottom

                                    }}>
                                        {depTimeStr(time, _i)}
                                    </Text> : null
                            }
                        </div>
                    )
                })
            }
            <div style={{borderBottom: "1px solid #000"}}></div>

        </View>
    );
}


export default PDFTripView;