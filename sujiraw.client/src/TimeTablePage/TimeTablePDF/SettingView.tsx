import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    Radio,
    RadioGroup, Stack,
    TextField
} from "@mui/material";
import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import {Check, CheckBox} from "@mui/icons-material";
import {Controller, Form, SubmitHandler, useForm} from "react-hook-form";



export enum OrderType {
    ALTERNATELY = "alternately",
    ORDER = "order"
}

export type TimetablePDFSetting = {
    fontSize: number,
    tripInParagraph:number,
    lineHeight:number,
    paragraphPerPage:number,
    orderType:OrderType,
    topPadding:number,
    leftPadding:number,
    rightPadding:number,
    paragraphPadding:number,
    stationNameWidth:number
}


export interface TimeTablePDFSettingProps {
    layout: TimetablePDFSetting;
    setLayout: (layout: TimetablePDFSetting) => void;
}

export function SettingView({layout,setLayout}:TimeTablePDFSettingProps){
    const {t, i18n} = useTranslation();
    const {
        control,
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<TimetablePDFSetting>({
        defaultValues: layout
    })

    const validationRules = {
        fontSize: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        tripInParagraph: {
            required: '正の整数を入力してください',
            pattern: {value: /^\d+$/, message: '正の整数を入力してください。'}
        },
        lineHeight: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        paragraphPerPage: {
            required: '正の整数を入力してください',
            pattern: {value: /^\d+$/, message: '正の整数を入力してください。'}
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
        paragraphPadding: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        },
        stationNameWidth: {
            required: '正の数字を入力してください',
            pattern: {value: /^\d+(?:.\d+)?$/, message: '正の数を入力してください。'}
        }


    }

    const onSubmit: SubmitHandler<TimetablePDFSetting> = (data: TimetablePDFSetting) => {
        //stateに保存する
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
                        A4 Paper
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
                        height: 150,
                        border: '1px solid black',
                        position: 'absolute',
                        top: 60,
                        left: 60,
                        backgroundColor: "#FAFAFF"
                    }}>
                    </div>
                    <div style={{
                        width: 60,
                        height: 150,
                        border: '1px solid black',
                        position: 'absolute',
                        top: 60,
                        left: 60,
                        backgroundColor: "#FFFFFA"
                    }}>
                    </div>

                    <div style={{
                        width: 240,
                        height: 150,
                        border: '1px solid black',
                        position: 'absolute',
                        top: 260,
                        left: 60,
                        backgroundColor: "#FAFAFF"
                    }}>
                    </div>
                    <div style={{
                        width: 60,
                        height: 150,
                        border: '1px solid black',
                        position: 'absolute',
                        top: 260,
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
                             top: 215,
                             left: 160,
                             height: 40,
                             borderRight: "1px solid black"
                         }}>
                    </div>
                    <input style={{width: 40, position: 'absolute', top: 225, left: 170,
                        outline:errors.paragraphPadding?'red 1px solid':"",
                        border:errors.paragraphPadding?'red 1px solid':"",
                        backgroundColor:errors.paragraphPadding?'yellow':""}}
                           {...register("paragraphPadding", validationRules.paragraphPadding)}
                        ></input>


                </div>
            </Grid>
            <Grid item xs={12} md={6}>
                <Stack
                    spacing={2}
                    sx={{ m: 'auto', width: '25ch' }}>
                    <Controller
                        name="fontSize"
                        control={control}
                        rules={validationRules.fontSize}
                        render={({ field, fieldState }) => (
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
                        name="tripInParagraph"
                        control={control}
                        rules={validationRules.tripInParagraph}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                type="text"
                                label={t("timetablePDF.tripInParagraph")}
                                error={fieldState.invalid}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="lineHeight"
                        control={control}
                        rules={validationRules.lineHeight}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                type="text"
                                label={t("timetablePDF.lineHeight")}
                                error={fieldState.invalid}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="paragraphPerPage"
                        control={control}
                        rules={validationRules.paragraphPerPage}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                type="text"
                                label={t("timetablePDF.paragraphPerPage")}
                                error={fieldState.invalid}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    <Controller
                        name="orderType"
                        control={control}
                        render={({ field }) => (

                            <RadioGroup
                                name={field.name}
                                onChange={(e) => {
                                        field.onChange(e.target.value);
                                }}
                                value={field.value === undefined ? '' : field.value}
                            >
                                <FormLabel id="demo-radio-buttons-group-label">{t("timetablePDF.arrangement")}</FormLabel>
                                <FormControlLabel
                                    value={OrderType.ALTERNATELY}
                                    control={<Radio />}
                                    label={t("timetablePDF.alternately")}
                                />
                                <FormControlLabel
                                    value={OrderType.ORDER}
                                    control={<Radio />}
                                    label={t("timetablePDF.order")}
                                />
                            </RadioGroup>
                        )}
                    />

                    <Button variant="contained" type="submit"  >
                        決定する
                    </Button>
                </Stack>

            </Grid>

        </Grid>
</Stack>

    )
}