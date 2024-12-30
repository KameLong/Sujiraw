


import {axiosClient} from "../CMN/axiosHook.ts";
import {TimeTable} from "./TimeTableData.ts";

export async function fetchGzipJson(url: string): Promise<any> {
    const response = await fetch(url);
    //@ts-expect-error import meta 
    if(import.meta.env.MODE==='production'){
        const rstream = response.body.pipeThrough(new DecompressionStream('gzip'));
        // ReadableStream を Response に変換
        const response2 = new Response(rstream);
        // Response を JSON に変換
        return  await response2.json();
    }else{
       return response.json();
    }
}
export async function  loadRoute(companyID:number,routeID:number):Promise<RouteDTO>{
    try{
        return (await axiosClient.get(`/api/RouteJson/${companyID}/${routeID}`)).data;
    }catch(ex){
        console.error(ex);
        return new Promise((resolve, reject) => {
            resolve({routeID: routeID, name: "読み込みエラー", routeStations: [], downTrips: [], upTrips: []});
        });
    }
}
export async function loadCompany(companyID:number,routeID:number|undefined):Promise<DiaData>{
    try{
        return (await axiosClient.get(`/api/CompanyJson/Company/${companyID}/${routeID??0}`)).data;
    }catch(ex){
        console.error(ex);
        return new Promise((resolve, reject) => {
            resolve({name:"error",routes: {}, stations: {}, trains: {}, trainTypes: {}});
        });
    }
}


export enum StopType {
    NONE = 0,
    STOP = 1,
    PASS = 2,
    NO_VIA = 3
}

export interface StopTimeDTO {
    tripID: number;
    rsID: number;
    stopType: StopType;
    ariTime: number;
    depTime: number;
}

export interface RouteDTO {
    routeID: number;
    name: string;
    routeStations: RouteStationDTO[];
    downTrips: TripDTO[];
    upTrips: TripDTO[];
}

export class EditRouteDepreacted {
    static sortTrips(route: RouteDTO, sortIndex: number, direction: number) {
        switch (direction) {
            case 0:{
                const newTrips = route.downTrips.filter(trip => {
                    return GetTripDeprecated.GetStopType(trip, sortIndex) === StopType.STOP && GetTripDeprecated.TimeExist(trip, sortIndex);
                }).sort((a, b) => {
                    return GetTripDeprecated.GetDATime(a, sortIndex) - GetTripDeprecated.GetDATime(b, sortIndex);
                });
                let oldTrains = route.downTrips.filter(trip => {
                    return GetTripDeprecated.GetStopType(trip, sortIndex) !== StopType.STOP || !GetTripDeprecated.TimeExist(trip, sortIndex);
                });
                for (let i = sortIndex + 1; i < route.routeStations.length; i++) {

                    const tmp = oldTrains.filter(trip => GetTripDeprecated.GetStopType(trip, i) === StopType.STOP && GetTripDeprecated.TimeExist(trip, i));
                    for (const appendTrip of tmp) {
                        let isAppend = false;
                        for (let j = newTrips.length - 1; j >= 0; j--) {
                            if (GetTripDeprecated.GetStopType(newTrips[j], i) === StopType.STOP
                                && GetTripDeprecated.TimeExist(newTrips[j], i)
                                && GetTripDeprecated.GetADTime(newTrips[j], i) < GetTripDeprecated.GetDATime(appendTrip, i)) {
                                newTrips.splice(j + 1, 0, appendTrip);
                                isAppend = true;
                                break;
                            }
                        }
                        if (!isAppend) {
                            newTrips.splice(0, 0, appendTrip);
                        }
                        oldTrains = oldTrains.filter(trip => trip.tripID !== appendTrip.tripID);
                    }

                }
                route.downTrips = newTrips.concat(oldTrains);
                break;
            }

            default:
                break;


        }

    }
}

export interface StationDTO {
    stationID: number;
    name: string;
    lat: number;
    lon: number;
}

export interface RouteStationDTO {
    rsID: number;
    routeID: number;
    stationIndex: number;
    stationID: number;
    showStyle: number;
    main: boolean;
}

export interface TrainTypeDTO {
    trainTypeID: number;
    name: string;
    shortName: string;
    color: string;
    bold: boolean;
    dot: boolean;
}

export interface TripDTO {
    tripID: number;
    routeID: number;
    direction: number;
    trainID: number;
    trainTypeID: number;
    times: StopTimeDTO[];
}

export class GetStopTimeDepreacted {
    public static TimeExist(time: StopTimeDTO) {
        return time.ariTime >= 0 || time.depTime >= 0;
    }

    public static GetDepAriTime(time: StopTimeDTO) {
        if (time.depTime >= 0) {
            return time.depTime;
        }
        return time.ariTime;
    }

    public static GetAriDepTime(time: StopTimeDTO) {
        if (time.ariTime >= 0) {
            return time.ariTime;
        }
        return time.depTime;
    }
}

export interface TrainDTO {
    companyID:number;
    trainID: number;
    name: string;
    remark: string;
    depStationID: number;
    ariStationID: number;
    depTime: number;
    ariTime: number;
    tripInfos: TripInTrainDTO[];

}
export interface TripInTrainDTO {
    routeID: number;
    tripID: number;
    depStationID: number;
    ariStationID: number;
    depTime: number;
    ariTime: number;
}

export class GetTripDeprecated {
    private static getFirstStopIndex(trip: TripDTO): number {
        for (let i = 0; i < trip.times.length; i++) {
            // if (trip.times[i].stopType === StopType.STOP || trip.times[i].stopType === StopType.PASS) {
            //     return i;
            // }
            if (GetStopTimeDepreacted.TimeExist(trip.times[i])) {
                return i;
            }
        }
        return -1;
    }

    private static getLastStopIndex(trip: TripDTO): number {
        for (let i = trip.times.length - 1; i >= 0; i--) {
            // if (trip.times[i].stopType === StopType.STOP || trip.times[i].stopType === StopType.PASS) {
            //     return i;
            // }
            if (GetStopTimeDepreacted.TimeExist(trip.times[i])) {
                return i;
            }

        }
        return -1;
    }

    /**
     * Tripの中の始発駅を返します。
     * return routeStationのindex
     */
    public static GetBeginStationIndex(trip: TripDTO) {
        switch (trip.direction) {
            case 0:
                return GetTripDeprecated.getFirstStopIndex(trip);
            case 1:
                return GetTripDeprecated.getLastStopIndex(trip);
        }
        return -1;
    }

    /**
     * Tripの中の終着駅を返します。
     * return routeStationのindex
     */
    public static GetEndStationIndex(trip: TripDTO) {
        switch (trip.direction) {
            case 0:
                return GetTripDeprecated.getLastStopIndex(trip);
            case 1:
                return GetTripDeprecated.getFirstStopIndex(trip);
        }
        return -1;
    }

    public static TimeExist(trip: TripDTO, stationIndex: number) {
        return GetStopTimeDepreacted.TimeExist(trip.times[stationIndex]);
    }

    public static GetStopType(trip: TripDTO, stationIndex: number) {
        return trip.times[stationIndex].stopType;
    }

    public static GetDATime(trip: TripDTO, stationIndex: number) {
        return GetStopTimeDepreacted.GetDepAriTime(trip.times[stationIndex]);
    }

    public static GetADTime(trip: TripDTO, stationIndex: number) {
        return GetStopTimeDepreacted.GetAriDepTime(trip.times[stationIndex]);
    }


}


export interface RouteInfo {
    routeID: number;
    name: string;
    stations: number[];
    routeStations?: RouteStationDTO[];
}

export interface DiaData {
    name:string;
    routes: { [key: number]: RouteInfo };
    stations: { [key: number]: StationDTO };
    trains: { [key: number]: TrainDTO };
    trainTypes: { [key: number]: TrainTypeDTO };
    timetables?: { [key: number]: TimeTable };
}

export interface DiagramDataDTO{
    route:RouteDTO;
    stations:{[key:number]:StationDTO};
    trainTypes:{[key:number]:TrainTypeDTO};
}

// export class DiagramData{
//     public stations:DiagramStation[]=[];
//     public upTrips:DiagramTrip[]=[];
//     public downTrips:DiagramTrip[]=[];
// }
// export class DiagramStation implements RouteStationDTO{
//     public main: boolean;
//     public routeID: number;
//     public rsID: number;
//     public showStyle: number;
//     public stationID: number;
//     public stationIndex: number;
//
//     public stationTime: number;
//     public station: StationDTO;
//
//     static fromRouteStationDTO(routeStationDTO:RouteStationDTO,station:StationDTO):DiagramStation{
//         return {
//             ...routeStationDTO,
//             stationTime:0,
//             station:station
//         }
//     }
//
// }