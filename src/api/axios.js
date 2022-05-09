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

    // response interceptors =================================================
    // let isRefreshing = false;
    // let refreshSubscribers = [];

    // function subscribeTokenRefresh(cb) {
    //     refreshSubscribers.push(cb);
    // }

    // function onRrefreshed(accessToken) {
    //     refreshSubscribers.map(cb => cb(accessToken));
    // }
    // // instance.interceptors.response.use(
    //     response => {
    //         return response;
    //     },
    //     error => {
    //         const {
    //             config,
    //             response: { status },
    //         } = error;
    //         const originalRequest = config;
    //         debugger;
    //         if (status === 401) {
    //             if (!isRefreshing) {
    //                 isRefreshing = true;
    //                 const refresh_token = localStorage.getItem("refresh_token");
    //                 if (refresh_token === null) {
    //                     return Promise.reject(error);
    //                 }
    //                 const headers = {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${refresh_token}`,
    //                 };
    //                 axios
    //                     .post("/auth/refresh", {}, { headers: headers })
    //                     .then(({ data }) => {
    //                         debugger;
    //                         isRefreshing = false;
    //                         const { accessToken, refreshToken } = data;
    //                         localStorage.setItem("access_token", accessToken);
    //                         localStorage.setItem("refresh_token", refreshToken);
    //                         onRrefreshed(data.accessToken);
    //                     })
    //                     .catch(e => {
    //                         console.log(e);
    //                         debugger;
    //                         // window.location = "/login";
    //                     });
    //             }

    //             const retryOrigReq = new Promise((resolve, reject) => {
    //                 subscribeTokenRefresh(accessToken => {
    //                     // replace the expired accessToken and retry
    //                     originalRequest.headers["Authorization"] = "Bearer " + accessToken;
    //                     resolve(axios(originalRequest));
    //                 });
    //             });
    //             return retryOrigReq;
    //         } else {
    //             return Promise.reject(error);
    //         }
    //     }
    // );

    return instance;
};

export default fetchClient();
