import {
    Button,
    FormLabel,
    Grid, MenuItem,
    Select, Stack,
    TextField
} from "@mui/material";
import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import {Controller, SubmitHandler, useForm} from "react-hook-form";

export interface DiagramPDFSetting{
    fontSize:number,
    leftPadding:number,
    rightPadding:number,
    topPadding:number,
    stationNameWidth:number,
    diagramHeight:number,
    diagramStartTime:string,
    diagramSpan:string,
    diagramAxisType:number,
    diagramInPage:number,
    lineColor:string,
    lineWidth:number
}

export interface DiagramPDFSettingProps {
    layout: DiagramPDFSetting;
    setLayout: (layout: DiagramPDFSetting) => void;
}

export function DiagramPDFSettingView({layout,setLayout}:DiagramPDFSettingProps){
    const {t, i18n} = useTranslation();
    const {
        control,
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<DiagramPDFSetting>({
        defaultValues: layout
    })

    const validationRules = {
        fontSize: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        stationNameWidth: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        topPadding: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        leftPadding: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        rightPadding: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        diagramHeight: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        diagramStartTime: {
            required: '時間を入力してください',
        },
        diagramSpan: {
            required: '時間を入力してください',
        },
        lineColor: {
            required: '色を入力してください',
        },
        lineWidth: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
    }

    const onSubmit: SubmitHandler<DiagramPDFSetting> = (data: DiagramPDFSetting) => {
        setLayout(data);
    }
    return (
        <Stack component="form" noValidate
               onSubmit={handleSubmit(onSubmit)}
               >
        <Grid container spacing={2} alignItems='center' justifyContent='center' sx={{py:3}}>
            <Grid item xs={12} md={6}>
                <div style={{width: '360px', height: '510px', margin: '10px auto', position: 'relative'}}>
                    <div style={{position: 'absolute', top: 0, left: 10}}>
                        A4 Paper (210mm x 297mm)
                    </div>

                    <div style={{
                        width: 340,
                        height: 480,
                        border: '1px solid black',
                        position: 'absolute',
                        top: 20,
                        left: 10,
                        backgroundColor: "#F3F3F3"
                    }}>
                    </div>

                    <div style={{
                        width: 240,
                        height: 300,
                        border: '1px solid black',
                        position: 'absolute',
                        top: 60,
                        left: 60,
                        backgroundColor: "#FAFAFF"
                    }}>
                    </div>
                    <div style={{
                        width: 60,
                        height: 300,
                        border: '1px solid black',
                        position: 'absolute',
                        top: 60,
                        left: 60,
                        backgroundColor: "#FFFFFA"
                    }}>
                    </div>
                    {/*左余白*/}
                    <div className={"arrow_row"}
                         style={{position: 'absolute', top: 90, left: 15, width: 40, borderBottom: "1px solid black"}}>
                    </div>
                    <input style={{width: 40, position: 'absolute', top: 100, left: 15,
                        outline:errors.leftPadding?'red 1px solid':"",
                        border:errors.leftPadding?'red 1px solid':"",
                        backgroundColor:errors.leftPadding?'yellow':"",
                    }}
                           {...register("leftPadding", validationRules.leftPadding)}></input>

                    {/*右余白*/}
                    <div className={"arrow_row"}
                         style={{position: 'absolute', top: 90, left: 305, width: 40, borderBottom: "1px solid black"}}>
                    </div>
                    <input style={{width: 40, position: 'absolute', top: 100, left: 305,
                        outline:errors.rightPadding?'red 1px solid':"",
                        border:errors.rightPadding?'red 1px solid':"",
                        backgroundColor:errors.rightPadding?'yellow':""}}
                           {...register("rightPadding", validationRules.rightPadding)}
                    ></input>


                    {/*上余白*/}
                    <div className={"arrow_col"}
                         style={{position: 'absolute', top: 25, left: 160, height: 30, borderRight: "1px solid black"}}>
                    </div>
                    <input style={{width: 40, position: 'absolute', top: 30, left: 170,
                        outline:errors.topPadding?'red 1px solid':"",
                        border:errors.topPadding?'red 1px solid':"",
                        backgroundColor:errors.topPadding?'yellow':""}}
                           {...register("topPadding", validationRules.topPadding)}
                    ></input>


                    {/*StationNameの幅*/}
                    <div className={"arrow_row"}
                         style={{position: 'absolute', top: 110, left: 65, width: 50, borderBottom: "1px solid black"}}>
                    </div>
                    <input style={{width: 40, position: 'absolute', top: 120, left: 70,
                        outline:errors.stationNameWidth?'red 1px solid':"",
                        border:errors.stationNameWidth?'red 1px solid':"",
                        backgroundColor:errors.stationNameWidth?'yellow':""}}
                           {...register("stationNameWidth", validationRules.stationNameWidth)}
                    ></input>


                    <div className={"arrow_col"}
                         style={{
                             position: 'absolute',
                             top: 70,
                             left: 160,
                             height: 280,
                             borderRight: "1px solid black"
                         }}>
                    </div>
                    <input style={{width: 40, position: 'absolute', top: 225, left: 170,
                        outline:errors.diagramHeight?'red 1px solid':"",
                        border:errors.diagramHeight?'red 1px solid':"",
                        backgroundColor:errors.diagramHeight?'yellow':""}}
                           {...register("diagramHeight", validationRules.diagramHeight)}
                        ></input>
                </div>
            </Grid>
            <Grid item xs={12} md={6}>
                <Stack
                    spacing={2}
                    sx={{m: 'auto', width: '25ch'}}>
                    <Controller
                        name="fontSize"
                        control={control}
                        rules={validationRules.fontSize}
                        render={({field, fieldState}) => (
                            <TextField
                                {...field}
                                type="text"
                                label={t("common.fontSize")}
                                error={fieldState.invalid}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="lineWidth"
                        control={control}
                        rules={validationRules.lineWidth}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                type="text"
                                label={t("common.lineWidth")}
                                error={fieldState.invalid}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="diagramStartTime"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                type="time"
                                {...field}
                                label={t("diagram.startTime")}
                                error={fieldState.invalid}
                                helperText={fieldState.error?.message}

                            />
                        )}
                    />
                    <Controller
                        name="diagramSpan"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                type="time"
                                {...field}
                                label={t("diagram.spanTime")}
                                error={fieldState.invalid}
                                helperText={fieldState.error?.message}

                            />
                        )}
                    />

                    <Controller
                        name="lineColor"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                type="color"
                                {...field}
                                label={t("diagram.borderColor")}
                                error={fieldState.invalid}
                                helperText={fieldState.error?.message}

                            />
                        )}
                    />

                    <Controller
                        name="diagramAxisType"
                        control={control}
                        render={({ field }) => (
                            <Select
                                name={field.name}
                                onChange={(e) => {
                                        field.onChange(e.target.value);
                                }}
                                value={field.value === undefined ? '' : field.value}
                            >
                                <FormLabel id="demo-radio-buttons-group-label">{t("diagram.axisType.name")}</FormLabel>
                                <MenuItem value={0}>{t("diagram.axisType.60min")}</MenuItem>
                                <MenuItem value={1}>{t("diagram.axisType.30min")}</MenuItem>
                                <MenuItem value={2}>{t("diagram.axisType.20min")}</MenuItem>
                                <MenuItem value={3}>{t("diagram.axisType.15min")}</MenuItem>
                                <MenuItem value={4}>{t("diagram.axisType.10min")}</MenuItem>
                                <MenuItem value={5}>{t("diagram.axisType.5min")}</MenuItem>


                            </Select>
                        )}
                    />
                    <Button variant="contained" type="submit">
                        決定する
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    </Stack>
)
}