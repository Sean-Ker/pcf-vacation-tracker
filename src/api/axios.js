import axios from "axios";
import { FaWindows } from "react-icons/fa";
import { setJwt } from "./api";

const API_URL = process.env.REACT_APP_API_URL;

const defaultOptions = {
    baseURL: API_URL,
    method: "get",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
};

// Create instance
let instance = axios.create(defaultOptions);

const fetchClient = () => {
    // Set the AUTH token for any request
    instance.interceptors.request.use(function (config) {
        const access_token = localStorage.getItem("access_token");
        config.headers.Authorization = access_token ? `Bearer ${access_token}` : "";
        return config;
    });

    instance.interceptors.response.use(response => {
        if (response.status === 401) {
            debugger;
            window.location.replace("/login");
        }

        const refresh_token = localStorage.getItem("refresh_token");
        if (refresh_token === null) {
            return response;
        }
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refresh_token}`,
        };
        axios
            .post(API_URL + "/auth/refresh", { refresh_token: refresh_token }, { headers: headers })
            .then(({ data }) => {
                // debugger;
                const { access_token } = data;
                localStorage.setItem("access_token", access_token);
            })
            .catch(error => {
                console.log(error);
                debugger;
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                // window.location.replace("/login");
            });

        return response;
    });

    return instance;
};

export default fetchClient();
