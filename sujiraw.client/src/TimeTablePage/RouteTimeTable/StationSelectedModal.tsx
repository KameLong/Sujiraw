/**
 * 路線時刻表で駅が選択されたときに表示するモーダルです。
 */

import {Button, Modal } from "@mui/material";
import Box from "@mui/material/Box";
import {StationDTO} from "../../DiaData/DiaData.ts";
import Typography from "@mui/material/Typography";
import React from "react";

export interface StationSelectedState{
    /**
     *  モーダルの開閉状態
     */
    open: boolean;
    /**
     * 選択された駅
     */
    station?: StationDTO;
    stationIndex:number;


}
export interface StationSelectedModalProps {
    state: StationSelectedState;
    /**
     * モーダルを閉じる関数
     */
    onClose: () => void;
    onSortButtonClicked?:(station:StationDTO)=>void;
}
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
export function StationSelectedModal({state,onClose,onSortButtonClicked}:StationSelectedModalProps){
   return(
        <Modal
            open={state.open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {state.station?.name}
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    <Button onClick={()=>{
                        onSortButtonClicked?.(state.station);

                    }}>この駅を基準に並び替える</Button>
                </Typography>
            </Box>
        </Modal>
    )
}