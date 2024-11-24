import {use路線時刻表データ作成, use路線時刻表データ取得} from "./路線時刻表データ.ts";
import {useEffect} from "react";

export default function TestPage() {
    const a=use路線時刻表データ作成(8080870390724686,4818713511260499);
    useEffect(() => {
        console.log(a);

    }, [a]);
    return (<div></div>)
}