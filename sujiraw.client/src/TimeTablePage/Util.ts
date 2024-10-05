import {StationProps} from "./StationView";

export function stationStyle(station: StationProps,direction:number):number {
    if (direction === 0) {
        return (station.style % 16);
    } else {
        return (Math.floor(station.style / 16) % 16);
    }
}
export function timeIntStr(time: number) {
    const ss = time % 60;
    time -= ss;
    time /= 60;
    const mm = time % 60;
    time -= mm;
    time /= 60;
    const hh = time % 24;
    return `${hh.toString().padStart(1, '0')}${mm.toString().padStart(2, '0')}`;
}
