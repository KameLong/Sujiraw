import {useCallback, useState} from "react";
import {Snackbar as MuiSnackbar} from "@mui/material";

interface SnackbarHandles {
    message: string;
    open: boolean;

    show: (message: string) => void;
    close: () => void;
}


export function useSnackbar() {
    const [message, setMessage] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const show = useCallback((message: string) => {
        setMessage(message);
        setOpen(true);
    }, [setMessage, setOpen]);
    const close = useCallback(() => {
        setOpen(false);
    }, [setOpen]);
    return  {message, open, show, close};
}




export function Snackbar ({props}: {props: SnackbarHandles}) {


    return (
        <MuiSnackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={3000}
            message={props.message}
            open={props.open}
            onClose={props.close}
        />
    );
}