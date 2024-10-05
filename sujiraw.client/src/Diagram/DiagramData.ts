import {RouteStation, Station, StopTime, TrainType, Trip} from "../DiaData/DiaData";

export interface DiagramStation extends RouteStation {
    stationTime: number
    station: Station;
}

export interface DiagramTrip extends Trip {
    stopTimes: StopTime[];
    trainType: TrainType;
}

export interface DiagramData {
    stations: DiagramStation[];
    upTrips: DiagramTrip[];
    downTrips: DiagramTrip[];
}
