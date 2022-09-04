import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

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
    let navigate = useNavigate();

    if (isAuthorized) {
        return <Outlet />;
    } else {
        navigate("/");
        return (
            <div>
                <h1>You are not authorized</h1>
            </div>
        );
    }
};

export default PrivateRoute;
