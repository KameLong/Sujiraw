import React, {useState} from "react";
import {
    Autocomplete, Box, Button,
    Dialog,
    DialogActions,
    DialogContent, DialogContentText,
    DialogTitle, FormControl, FormControlLabel, InputLabel,
    MenuItem, Popper,
    Select, Switch,
    TextField
} from "@mui/material";
import {StationDTO} from "../../DiaData/DiaData.ts";

export function useStationSelectorDialog() {
    const [open, setOpen] = useState(true);
    const [selectedStation, setSelectedStation] = useState<StationDTO|undefined>(null);


    const handleClose = () => {
        setOpen(false);
    };
    const [stations,setStations]=useState<StationDTO[]>([]);

    function getDialogProps(){
        return {
            open,
            handleClose,
            stations,
            selectedStation,
            setSelectedStation
        }
    }


    return {
        open,
        setOpen,
        handleClose,
        stations,
        setStations,
        getDialogProps
    }
}
interface StationSelectorDialogProps {
    open: boolean;
    handleClose?: () => void;
    stations: StationDTO[];
    selectedStation: StationDTO|undefined;
    setSelectedStation: (station:StationDTO|undefined)=>void;

    onSelected?: (station:StationDTO|undefined)=>void;
    onBacked?: ()=>void;
}
export function StationSelectorDialog(
    {open,handleClose,stations,selectedStation,setSelectedStation,onSelected,onBacked} : StationSelectorDialogProps) {

    return (
        <Dialog open={open}
                maxWidth={"md"}
        >
            <DialogTitle>駅選択</DialogTitle>
            <DialogContent>
                <Autocomplete
                    sx={{width: 300}}
                    options={stations}
                    getOptionLabel={(option) => option.name}
                    value={selectedStation}
                    onChange={(event, newValue) => {
                        setSelectedStation(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Select Station" />}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={()=>onBacked?.()}
                >BACK</Button>

                <Button
                    onClick={()=>onSelected?.(selectedStation)}
                >OK</Button>
            </DialogActions>
        </Dialog>
    )
}