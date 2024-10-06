import axios from 'axios'
const BaseUrl = "http://localhost:5000";

// デフォルト config の設定
export const axiosClient = axios.create({
    baseURL: BaseUrl,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

