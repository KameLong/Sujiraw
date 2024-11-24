import axios from 'axios'


// let BaseUrl = "http://100.64.1.16:5000";
let BaseUrl = "http://localhost:80";
//@ts-ignore
if(import.meta.env.MODE==='production'){
    BaseUrl = "https://sujiraw.kamelong.com";
}

// デフォルト config の設定
export const axiosClient = axios.create({
    baseURL: BaseUrl,
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json'
    }
});

