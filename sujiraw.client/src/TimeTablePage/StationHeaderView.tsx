import { TimeTablePageSetting } from "./TimeTablePage";

interface StationHeaderViewProps{
    setting: TimeTablePageSetting;
}

export function StationHeaderView({setting}:StationHeaderViewProps){
    return(
        <div style={{
            width: '100%',
            height:'100%',
            flexShrink: 0,
            textAlign: "center",
            fontSize: `${setting.fontSize}px`,
            lineHeight: `${setting.fontSize * setting.lineHeight}px`,
            display: 'flex',
            flexDirection: 'column',

    }}
    >
    <div style={{height: (setting.fontSize * setting.lineHeight)}}>
        列車番号
    </div>
    <div style={{borderTop: '1px solid black'}}/>
    <div style={{height: (setting.fontSize * setting.lineHeight)}}>
    列車種別</div>
    <div style={{borderTop: '2px solid black'}}>
    </div>
    <div style={{flexGrow:1}}></div>
    <div style={{borderTop: '2px solid black'}}>
    </div>
    <div className={"nowrap"}
         style={{lineHeight: `${setting.fontSize * setting.lineHeight*2}px`}}
    >
    始発
        </div>

        </div>
    )
}