import React from "react";
import { Outlet } from "react-router";
import { Navigate } from "react-router-dom";

// export default function PrivateRoute({
//     element: Element = <Home />,
//     isAuthorized,
//     path,
//     ...props
// }) {
//     if (isAuthorized()) {
//         return <Route {...props} path={path} element={Element} />;
//     }

//     return <Navigate to="/" from={path} element={<Home />} />;
// }

const PrivateRoute = ({ isAuthorized }) => {
    // debugger;
    return isAuthorized ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
