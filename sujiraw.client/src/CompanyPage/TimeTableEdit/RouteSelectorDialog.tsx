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
export interface R{
    rsID: number;
    name: string;
    routeID: number;
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
    routes: R[];
    onSelected?: (station:R|undefined)=>void;
}
export function RouteSelectorDialog(
    {routes,onSelected} : RouteSelectorDialogProps) {
    const [selectedRoute, setSelectedRoute] = useState<R|undefined>(null);

    return (
        <Autocomplete
            options={routes}
            getOptionLabel={(option) => option.name}
            value={selectedRoute}
            onChange={(event, newValue) => {
                setSelectedRoute(newValue);
                onSelected?.(newValue);
            }}
            renderInput={(params) =>
                <TextField {...params} label="Select Route" />}
            renderOption={(props, option) => (
                <Box  component="li" {...props} key={option.rsID} sx={{display: 'flex', alignItems: 'center'}}>
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
    )
}