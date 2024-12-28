import {StationDTO, TrainTypeDTO} from "./DiaData.ts";

export class LineData {

    public stationList:Array<Station>=[]

    public trainTypes:{[key:number]:TrainTypeDTO}={};

    public stationInfo:{[key:number]:StationDTO}={};

    public downTrains:Array<Train>=[];
    public upTrains:Array<Train>=[];

    /**
     * 列車の並び替えをします。
     */
    public sortTrain(direction:number,stationIndex:number){
        const trains=this.downTrains;
        //ここでtrainsをソートする
        const sortTrains=trains.filter((train)=>{
            return train.trips[0].stationTime[stationIndex].HasTime;
        }).sort((a,b)=>{
            return a.trips[0].stationTime[stationIndex].DepAriTime-b.trips[0].stationTime[stationIndex].DepAriTime;
        });
        const noSortTrains=trains.filter((train)=>{
            return !train.trips[0].stationTime[stationIndex].HasTime;
        });
        for(let i=stationIndex+1;i<this.stationList.length;i++){
            for(let t=0;t<noSortTrains.length;t++){
                if(noSortTrains[t].trips[0].stationTime[i].HasTime){
                    let f=false;
                    for(let s=sortTrains.length-1;s>=0;s--){
                        if(sortTrains[s].trips[0].stationTime[i].DepAriTime>=0&&sortTrains[s].trips[0].stationTime[i].AriDepTime<=noSortTrains[t].trips[0].stationTime[i].DepAriTime){
                            sortTrains.splice(s+1,0,noSortTrains[t]);
                            noSortTrains.splice(t,1);
                            f=true;
                            break;
                        }
                    }
                    if(!f){
                        sortTrains.splice(0,0,noSortTrains[t]);
                        noSortTrains.splice(t,1);
                    }
                    t--;
                }
            }
        }
        for(let i=stationIndex-1;i>=0;i--){
            for(let t=0;t<noSortTrains.length;t++){
                if(noSortTrains[t].trips[0].stationTime[i].HasTime){
                    let f=false;
                    for(let s=0;s<sortTrains.length;s++){
                        if(sortTrains[s].trips[0].stationTime[i].HasTime
                            &&sortTrains[s].trips[0].stationTime[i].DepAriTime>=noSortTrains[t].trips[0].stationTime[i].AriDepTime){
                            sortTrains.splice(s,0,noSortTrains[t]);
                            noSortTrains.splice(t,1);
                            f=true;
                            break;
                        }
                    }
                    if(!f){
                        sortTrains.splice(sortTrains.length,0,noSortTrains[t]);
                        noSortTrains.splice(t,1);
                    }
                    t--;
                }
            }
        }
        this.downTrains=sortTrains.concat(noSortTrains);
    }
}

export class Station {
    public stationId:number;
    public stationName:string;
    /**
     * 路線別駅[routeId]=その路線に所属しているrouteStationId
     *
     * ただし、その駅を通過しない場合は0
     * その駅は通過する場合は-1
     */
    public RouteStationDep:{[key:number]:number}={}
    public RouteStationAri:{[key:number]:number}={}

    public showStyle:number=0x11;


    /**
     * 時刻表の表示で使う情報
     */
    public isShowDep(direction:number):boolean{
        switch (direction) {
            case 0:
                return (this.showStyle & 0x01)>0;
            case 1:
                return (this.showStyle &0x10)>0;
        }
    }
    public isShowAri(direction:number):boolean{
        switch (direction) {
            case 0:
                return (this.showStyle & 0x02)>0;
            case 1:
                return (this.showStyle &0x20)>0;
        }
    }


}

export class Train {
    public trips:Array<Trip>=[];
}

export class Trip {
    public tripNumber:string="";
    public tripName:string ="";
    public comment:string="";
    public trainTypeId:number=0;

    //下りでも上りでも、下り基準の順番の配列にすること
    public stationTime:Array<StationTime>=[];
}
export class StationTime {
    public depTime:StopTime={time:-1,routeStationId:0}
    public ariTime:StopTime={time:-1,routeStationId:0}
    /**
     *  0:運行なし
     *  1:停車
     *  2:通過
     *  3:経由なし
     *  16:左から切り出し
     *  17:右から切り出し
     *  18:左へ組み入れ
     *  19:右へ組み入れ
     */
    //
    public stopType:number=0;

    public get DepAriTime():number{
        if(this.depTime.time>=0){
            return this.depTime.time;
        }
        return this.ariTime.time;
    }
    public get AriDepTime():number{
        if(this.ariTime.time>=0){
            return this.ariTime.time;
        }
        return this.depTime.time;
    }
    public get DepTime():number{
        return this.depTime.time;
    }
    public get AriTime():number{
        return this.ariTime.time;
    }
    public get HasTime():boolean{
        return this.depTime.time>=0||this.ariTime.time>=0;
    }

}
export class StopTime {
    public time:number;
    public routeStationId:number;
}
