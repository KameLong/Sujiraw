import {axiosClient} from "../CMN/axiosHook.ts";

export interface TimeTable {
    timeTableID: number;
    companyID: number;
    name: string;
    timetableStations: TimeTableStation[];
}
export interface TimeTableStation{
    ariRouteStationID: number;
    depRouteStationID: number;
    showStyle: number;
    main: boolean;
    direction:number;
    border:boolean;
}

/**
 * 新しい時刻表を作成し、サーバーに登録します。
 * @param companyID
 */
export async function createNewTimeTable(companyID:number){
    const newTimeTable:TimeTable={
        timeTableID:Math.floor(Number.MAX_SAFE_INTEGER*Math.random()),
        companyID:companyID,
        name:"",
        timetableStations:[]
    }
    return await axiosClient.put(`/api/TimeTableJson/${newTimeTable.timeTableID}`,newTimeTable);
}

export async function getTimeTable(timeTableID:number):Promise<TimeTable>{
    const res= await axiosClient.get(`/api/TimeTableJson/${timeTableID}`);
    switch (res.status) {
        case 200:
            return res.data as TimeTable;
        case 404:
            throw new Error("TimeTableData Not Found");
        default:
            throw new Error("TimeTableData Not Found");
    }
}

export async function saveTimeTable(timeTable:TimeTable){
    return await axiosClient.put(`/api/TimeTableJson/${timeTable.timeTableID}`,timeTable);
}