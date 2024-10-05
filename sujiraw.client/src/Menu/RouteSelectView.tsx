import {RouteInfo} from "../DiaData/DiaData";
import {Box, Card, CardContent, List, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";

export interface RouteSelectViewProps {
    routes: { [key: number]: RouteInfo };
    closeModal: () => void;
}

export function RouteSelectView({routes, closeModal}: RouteSelectViewProps) {
    const navigate = useNavigate();
    return (
        <Card style={{margin: '10px 10px 50px 10px', height: 'calc(100% - 60px)'}}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    路線を選択してください
                </Typography>
                <List style={{overflowY: 'auto',maxHeight: 600}}
                >
                    {Object.keys(routes).map((key) =>
                        <div key={key}>
                            <Box key={key} style={{padding: '0px 0px 0px 10px'}}>
                                <Typography  component="div" onClick={() => {
                                    console.log(routes[parseInt(key)]);
                                    navigate(`/TimeTable/${routes[parseInt(key)].routeID}/0`);
                                    closeModal();
                                }
                                }>
                                    {routes[parseInt(key)].name}
                                </Typography>
                            </Box>
                            <hr></hr>
                        </div>
                    )}
                </List>
            </CardContent>
        </Card>
    )
}