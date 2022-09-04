import { Spin } from "antd";
import React from "react";
import Loading from "./Loading";

const LoadingScreen = () => {
    return (
        <div
            style={{
                textAlign: "center",
                width: "100%",
                height: "100%",
                minHeight: "400px",
                position: "relative",
            }}>
            <Spin size="large" style={{ position: "absolute", top: "50%", left: "50%" }} />
        </div>
    );
};

export default LoadingScreen;
