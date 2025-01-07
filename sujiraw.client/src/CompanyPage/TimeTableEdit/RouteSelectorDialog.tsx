import React, {useEffect, useState} from "react";
import {
    Autocomplete, Box, Button, Chip,
    Dialog,
    DialogActions,
    DialogContent, DialogContentText,
    DialogTitle, FormControl, FormControlLabel, InputLabel,
    MenuItem, Popper,
    Select, Switch,
    TextField
} from "@mui/material";
import {RouteDTO, StationDTO} from "../../DiaData/DiaData.ts";
interface R{
    rsID: number;
    name: string;
    routeName: string[],
    stationID: number;
}

export function useRouteSelectorDialog() {
    const [open, setOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<R|undefined>(undefined);


    const handleClose = () => {
        setOpen(false);
    };
    const [routes,setRoutes]=useState<R[]>([]);
    useEffect(() => {
        console.log(routes);
    }, [routes]);

    function getDialogProps(){
        return {
            open,
            handleClose,
            routes,
            selectedRoute,
            setSelectedRoute
        }
    }


    return {
        open,
        setOpen,
        handleClose,
        routes,
        setRoutes,
        getDialogProps
    }
}
interface RouteSelectorDialogProps {
    open: boolean;
    handleClose?: () => void;
    routes: R[];
    selectedRoute: R|undefined;
    setSelectedRoute: (station:R|undefined)=>void;

    onSelected?: (station:R|undefined)=>void;
    onBacked?: ()=>void;
}
export function RouteSelectorDialog(
    {open,handleClose,routes,selectedRoute,setSelectedRoute,onSelected,onBacked} : RouteSelectorDialogProps) {

    return (
        <Dialog open={open}
                maxWidth={"md"}
        >
            <DialogTitle>路線選択</DialogTitle>
            <DialogContent>
                <Autocomplete
                    sx={{width: 300}}
                    options={routes}
                    getOptionLabel={(option) => option.name}
                    value={selectedRoute}
                    onChange={(event, newValue) => {
                        setSelectedRoute(newValue);
                    }}
                    renderInput={(params) =>
                        <TextField {...params} label="Select Route" />}
                    renderOption={(props, option) => (
                        <Box key={option.rsID} component="li" {...props} sx={{display: 'flex', alignItems: 'center'}}>
                            <div style={{whiteSpace: "nowrap"}}>{option.name}</div>
                            <div>
                                {
                                    option.routeName.slice(0,1).map((r, i) => (
                                        <Chip color="primary" key={-1} label={r} size="small" style={{marginLeft: '10px'}}/>
                                    ))
                                }
                                {
                                    option.routeName.slice(1).map((r, i) => (
                                        <Chip key={i} label={r} size="small" style={{marginLeft: '10px'}}/>
                                    ))
                                }
                            </div>
                        </Box>
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={()=>onBacked?.()}
                >BACK</Button>

                <Button
                    onClick={()=>onSelected?.(selectedRoute)}
                >OK</Button>
            </DialogActions>
        </Dialog>
    )
}