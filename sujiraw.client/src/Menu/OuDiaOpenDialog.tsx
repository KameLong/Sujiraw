import {useNavigate} from "react-router-dom";
import {Backdrop, Box, Button, Card, CardContent, CircularProgress, Input, List, Typography} from "@mui/material";
import React, {ChangeEvent, useState} from "react";
import {axiosClient} from "../CMN/axiosHook.ts";
import {oudParser} from "../DiaData/OuDiaData.ts";
import {Snackbar, useSnackbar} from "../CMN/UseSnackbar.tsx";
import {O_O} from "../oud";


export function OuDiaOpenDialog() {
    const navigate = useNavigate();
    const [json,setJson]=useState<string>("");
    const [open, setOpen] = React.useState(false);
    const snackbarProps=useSnackbar();

    return (
        <Card style={{margin: '10px 10px 50px 10px', height: 'calc(100% - 60px)'}}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    OuDia読み込み
                </Typography>
                <Input
                    inputProps={{ accept: ".oud" }}
                    type="file"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files) {
                            console.log(e.target.files[0]);
                            const reader = new FileReader();
                            reader.onload = e => {
                                try {

                                    const file = e.target?.result as string;
                                    const data = file.split('\n').map(item=>{
                                        return item.replace(/\r$/g,'');
                                    });

                                    console.log(data);
                                    const o_o = new O_O();
                                    o_o.fromOud(data);
                                    console.log(o_o);
                                    setJson(oudParser(o_o));
                                }catch (ex){
                                    console.error(ex);
                                    snackbarProps.show("Fail to parse OuDia file\n"+ex.toString());

                                }
                            };

                            // const encoding = Encoder.detect(e.target.files[0], ['SJIS', 'UTF8','SJIS']);
                            // if (!encoding) {
                            //     throw new Error();
                            // }
                            reader.readAsText(e.target.files[0], 'SJIS');
                        }
                    }}>

                </Input>

                <Button onClick={()=>{
                    console.log(json);
                    axiosClient.post(`api/CompanyJson/OuDia/${0}`,json).then((res)=>{
                        navigate(`/TimeTable/${res.data.companyID}/${res.data.routeID}/0`);
                        setOpen(false);
                    }).catch((ex)=>{
                       setOpen(false);
                    });
                    setOpen(true);
                }}
                        disabled={json.length===0}
                >

                    サーバーに送信
                </Button>
                <div>推定所要時間 {Math.round(json.length/500000)}秒</div>
                <Snackbar props={snackbarProps}/>

                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={open}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            </CardContent>
        </Card>
    )
}