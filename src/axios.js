import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const getAccessToken = () => {
    if (localStorage.getItem("access_token")) {
        return localStorage.getItem("access_token");
    }
    return "";
};

const getAxiosInstance = () => {
    // Create axios instance:
    const axiosInstance = axios.create({
        baseURL: API_URL,
        method: "[GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS]",
        headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            ContentType: "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "1728000",
            "Access-Control-Expose-Headers": "*",
        },
    });

    // Set the AUTH token for any request
    axiosInstance.interceptors.request.use(config => {
        if (getAccessToken()) {
            config.headers.Authorization = `Bearer ${getAccessToken()}`;
        }
        return config;
    });

    axiosInstance.interceptors.response.use(
        response => {
            return response;
        },
        error => {
            debugger;
            if (error.response.status === 401) {
                // Use the "/auth/refresh" endpoint to get a new token if the old one has expired:
                const refresh = async () => {
                    debugger;
                    // post to refresh endpoint and set the Authorization header with the refreshed token:
                    const headers = {
                        Authorization: `Bearer ${refreshToken}`,
                        ContentType: "application/json",
                        Accept: "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Methods": "*",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Max-Age": "1728000",
                        "Access-Control-Expose-Headers": "*",
                    };
                    const newTokenRes = await axios.post(
                        `${API_URL}/auth/refresh`,
                        {},
                        { headers: headers }
                    );
                    debugger;
                    localStorage.setItem("access_token", newTokenRes.data.access_token);
                    return axiosInstance(error.config);
                };

                const refreshToken = localStorage.getItem("refresh_token");
                if (refreshToken) {
                    return refresh();
                } else {
                    window.location.href.replace("/logout");
                }
            }
            return Promise.reject(error);
        }
    );

    return axiosInstance;
};

// How to export the axios instance so that it can be used in other files:
export default getAxiosInstance();
