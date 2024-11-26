import {StationDTO, TrainTypeDTO} from "./DiaData.ts";

export class 時刻表データ{

    public 駅リスト:Array<時刻表駅>=[]

    public 種別:{[key:number]:TrainTypeDTO}={};

    public stations:{[key:number]:StationDTO}={};

    public 下り列車:Array<時刻表列車>=[];
    public 上り列車:Array<時刻表列車>=[];
}

export class 時刻表駅{
    public stationId:number;
    /**
     * 路線別駅[routeId]=その路線に所属しているrouteStationId
     *
     * ただし、その駅を通過しない場合は0
     * その駅は通過する場合は-1
     */
    public 路線別発RouteStation:{[key:number]:number}={}
    public 路線別着RouteStation:{[key:number]:number}={}

    public 表示スタイル:number=0x11;

}

export class 時刻表列車{
    public 列車要素:Array<時刻表列車要素>=[];
}

export class 時刻表列車要素{
    public 列車番号:string="";
    public 列車名:string ="";
    public 備考:string="";
    public 列車種別:number=0;

    //下りでも上りでも、下り基準の順番の配列にすること
    public 駅時刻リスト:Array<駅時刻>=[];
}
export class 駅時刻{
    public 発時刻:発着時刻={time:-1,routeStationId:0}
    public 着時刻:発着時刻={time:-1,routeStationId:0}
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

}
export class 発着時刻{
    public time:number;
    public routeStationId:number;
}
