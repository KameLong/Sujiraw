export async function fetchGzipJson(url: string): Promise<any> {
    const response = await fetch(url);
    //@ts-ignore
    if(import.meta.env.MODE==='production'){
        //@ts-ignore
        const rstream = response.body.pipeThrough(new DecompressionStream('gzip'));
        // ReadableStream を Response に変換
        const response2 = new Response(rstream);
        // Response を JSON に変換
        return  await response2.json();
    }else{
       return response.json();
    }
}
export async function  loadRoute(id:number):Promise<Route>{
    try{
    return await fetchGzipJson(`/route_${id}.json.gz`) as Route;
}catch(ex){
        console.error(ex);
        return new Promise((resolve, reject) => {
            resolve({routeID: id, name: "読み込みエラー", routeStations: [], downTrips: [], upTrips: []});
        });
    }
}
export async function loadCompany():Promise<Company>{
    try{
    return await fetchGzipJson(`/company.json.gz`);
    }catch(ex){
        console.error(ex);
        return new Promise((resolve, reject) => {
            resolve({routes: {}, stations: {}, trains: {}, trainTypes: {}});
        });
    }
}


export enum StopType {
    NONE = 0,
    STOP = 1,
    PASS = 2,
    NO_VIA = 3
}

export interface StopTime {
    tripID: number;
    rsID: number;
    stopType: StopType;
    ariTime: number;
    depTime: number;
}

export interface Route {
    routeID: number;
    name: string;
    routeStations: RouteStation[];
    downTrips: Trip[];
    upTrips: Trip[];
}

export class EditRoute {
    static sortTrips(route: Route, sortIndex: number, direction: number) {
        switch (direction) {
            case 0:
                const newTrips = route.downTrips.filter(trip => {
                    return GetTrip.GetStopType(trip, sortIndex) === StopType.STOP && GetTrip.TimeExist(trip, sortIndex);
                }).sort((a, b) => {
                    return GetTrip.GetDATime(a, sortIndex) - GetTrip.GetDATime(b, sortIndex);
                });
                let oldTrains = route.downTrips.filter(trip => {
                    return GetTrip.GetStopType(trip, sortIndex) !== StopType.STOP || !GetTrip.TimeExist(trip, sortIndex);
                });
                for (let i = sortIndex + 1; i < route.routeStations.length; i++) {

                    const tmp = oldTrains.filter(trip => GetTrip.GetStopType(trip, i) === StopType.STOP && GetTrip.TimeExist(trip, i));
                    for (const appendTrip of tmp) {
                        let isAppend = false;
                        for (let j = newTrips.length - 1; j >= 0; j--) {
                            if (GetTrip.GetStopType(newTrips[j], i) === StopType.STOP
                                && GetTrip.TimeExist(newTrips[j], i)
                                && GetTrip.GetADTime(newTrips[j], i) < GetTrip.GetDATime(appendTrip, i)) {
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

    }
}

export interface Station {
    stationID: number;
    name: string;
    lat: number;
    lon: number;
}

export interface RouteStation {
    rsID: number;
    routeID: number;
    stationIndex: number;
    stationID: number;
    showStyle: number;
    main: boolean;
}

export interface TrainType {
    trainTypeID: number;
    name: string;
    shortName: string;
    color: string;
    bold: boolean;
    dot: boolean;
}

export interface Trip {
    tripID: number;
    routeID: number;
    direction: number;
    trainID: number;
    trainTypeID: number;
    times: StopTime[];
}

export class GetStopTime {
    public static TimeExist(time: StopTime) {
        return time.ariTime >= 0 || time.depTime >= 0;
    }

    public static GetDepAriTime(time: StopTime) {
        if (time.depTime >= 0) {
            return time.depTime;
        }
        return time.ariTime;
    }

    public static GetAriDepTime(time: StopTime) {
        if (time.ariTime >= 0) {
            return time.ariTime;
        }
        return time.depTime;
    }
}

export interface Train {
    trainID: number;
    name: string;
    remark: string;
    depStationID: number;
    ariStationID: number;
    depTime: number;
    ariTime: number;
    tripInfos: TripInfo[];

}
export interface TripInfo {
    routeID: number;
    tripID: number;
    depStationID: number;
    ariStationID: number;
    depTime: number;
    ariTime: number;
}

export class GetTrip {
    private static getFirstStopIndex(trip: Trip): number {
        for (let i = 0; i < trip.times.length; i++) {
            if (trip.times[i].stopType === StopType.STOP || trip.times[i].stopType === StopType.PASS) {
                return i;
            }
        }
        return -1;
    }

    private static getLastStopIndex(trip: Trip): number {
        for (let i = trip.times.length - 1; i >= 0; i--) {
            if (trip.times[i].stopType === StopType.STOP || trip.times[i].stopType === StopType.PASS) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Tripの中の始発駅を返します。
     * return routeStationのindex
     */
    public static GetBeginStationIndex(trip: Trip) {
        switch (trip.direction) {
            case 0:
                return GetTrip.getFirstStopIndex(trip);
            case 1:
                return GetTrip.getLastStopIndex(trip);
        }
        return -1;
    }

    /**
     * Tripの中の終着駅を返します。
     * return routeStationのindex
     */
    public static GetEndStationIndex(trip: Trip) {
        switch (trip.direction) {
            case 0:
                return GetTrip.getLastStopIndex(trip);
            case 1:
                return GetTrip.getFirstStopIndex(trip);
        }
        return -1;
    }

    public static TimeExist(trip: Trip, stationIndex: number) {
        return GetStopTime.TimeExist(trip.times[stationIndex]);
    }

    public static GetStopType(trip: Trip, stationIndex: number) {
        return trip.times[stationIndex].stopType;
    }

    public static GetDATime(trip: Trip, stationIndex: number) {
        return GetStopTime.GetDepAriTime(trip.times[stationIndex]);
    }

    public static GetADTime(trip: Trip, stationIndex: number) {
        return GetStopTime.GetAriDepTime(trip.times[stationIndex]);
    }


}


export interface RouteInfo {
    routeID: number;
    name: string;
    stations: number[];
}

export interface Company {
    routes: { [key: number]: RouteInfo };
    stations: { [key: number]: Station };
    trains: { [key: number]: Train };
    trainTypes: { [key: number]: TrainType };
}
