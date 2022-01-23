import React from "react";
import Loading from "./Loading";

export default function LoadingScreen() {
    return (
        <div
            style={{
                position: "absolute",
                display: "block",
                left: "50%",
                top: "50%",
            }}>
            <Loading />
            {/* <div>Loading...</div> */}
        </div>
    );
}
