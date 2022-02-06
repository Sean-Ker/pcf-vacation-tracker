import { Spin } from "antd";
import React from "react";
import Loading from "./Loading";

const LoadingScreen = () => {
    return (
        <div style={{ textAlign: "center", padding: "130px 50px" }}>
            <Spin size="large" />
        </div>
    );
};

export default LoadingScreen;

// export default function LoadingScreen() {
//     return (
//         <div
//             style={{
//                 position: "absolute",
//                 display: "block",
//                 left: "50%",
//                 top: "50%",
//             }}>
//             <Loading />
//             {/* <div>Loading...</div> */}
//         </div>
//     );
// }
