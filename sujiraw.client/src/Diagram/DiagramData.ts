import {RouteStationDTO, StationDTO, StopTimeDTO, TrainTypeDTO, TripDTO} from "../DiaData/DiaData";

export interface DiagramStation extends RouteStationDTO {
    stationTime: number
    station: StationDTO;
}

export interface DiagramTrip extends TripDTO {
    stopTimes: StopTimeDTO[];
    trainType: TrainTypeDTO;
}

export interface DiagramData {
    stations: DiagramStation[];
    upTrips: DiagramTrip[];
    downTrips: DiagramTrip[];
}
