import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Link } from "react-router-dom";
import Topbar from "./components/Topbar";
import { IdentityContext, CountriesContext, UsersContext } from "./Contexts";
import { getAccessToken, getAllUsers, getCurrentUser } from "./api/api";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Managment from "./pages/Managment";
import Admin from "./pages/Admin/Admin";
import User from "./pages/User";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import PrivateRoute from "./components/PrivateRoute";
import AdminEmployees from "./pages/Admin/AdminEmployees";
import AdminDepartments from "./pages/Admin/AdminDepartments";
import AdminLeaveTypes from "./pages/Admin/AdminLeaveTypes";
import AdminLogs from "./pages/Admin/AdminLogs";
import AdminRuleGroups from "./pages/Admin/AdminRuleGroups";
import axios from "./api/axios";
import Register from "./pages/Register";

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countries, setCountries] = useState([]);
    const [users, setUsers] = useState([]);

    const access_token = getAccessToken();

    useEffect(() => {
        async function fetchData() {
            const user = await getCurrentUser();
            const allCountries = await axios.get(`/locations`);
            const allUsers = await getAllUsers(true);
            setUser(user);
            setCountries(allCountries["data"]);
            setUsers(allUsers);
            setLoading(false);
        }
        fetchData();
    }, []);

    // only change value (on render) if user or setUser changes
    const userMemo = useMemo(() => ({ user, setUser }), [user, setUser]);

    // console.log(window.location.href);
    if (!access_token && !window.location.href.toLowerCase().includes("/register")) {
        return (
            <IdentityContext.Provider value={userMemo}>
                <Login />;
            </IdentityContext.Provider>
        );
    }
    //  else if (loading !== 0) {
    //     return <LoadingScreen />;
    // }
    else if (!user && !loading && !window.location.href.toLowerCase().includes("/register")) {
        return (
            <IdentityContext.Provider value={userMemo}>
                <Login />;
            </IdentityContext.Provider>
        );
    } else if (window.location.href.toLowerCase().includes("/register/")) {
        return <Register />;
    }

    return (
        <div style={{ width: "100%", height: "100%", paddingTop: "70px", minHeight: "70rem" }}>
            <IdentityContext.Provider value={userMemo}>
                <CountriesContext.Provider value={{ countries }}>
                    <UsersContext.Provider value={{ users }}>
                        <Router>
                            <Topbar />
                            <div style={{ height: "100%", minHeight: "100%" }}>
                                <Routes>
                                    <Route path="login" element={<Login />} />
                                    <Route path="logout" element={<Login forceLogout={true} />} />
                                    <Route path="" element={<Home />} />
                                    <Route
                                        path="managment"
                                        element={
                                            <PrivateRoute
                                                isAuthorized={
                                                    user ? user.employees.length > 0 : true
                                                }
                                            />
                                        }>
                                        <Route index element={<Managment />} />
                                    </Route>

                                    <Route
                                        path="admin"
                                        element={
                                            <PrivateRoute
                                                isAuthorized={user ? user.is_admin : true}
                                            />
                                        }>
                                        <Route path="/admin/" element={<Admin />}>
                                            <Route index element={<AdminEmployees />} />
                                            <Route path="employees" element={<AdminEmployees />} />
                                            <Route
                                                path="leave_types"
                                                element={<AdminLeaveTypes />}
                                            />
                                            <Route
                                                path="departments"
                                                element={<AdminDepartments />}
                                            />
                                            <Route
                                                path="rule_groups"
                                                element={<AdminRuleGroups />}
                                            />
                                            <Route path="logs" element={<AdminLogs />} />
                                        </Route>
                                    </Route>
                                    <Route path="user/:userName" element={<User />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </div>
                        </Router>
                    </UsersContext.Provider>
                </CountriesContext.Provider>
            </IdentityContext.Provider>
        </div>
    );
}

// const Wrapper = styled.div`
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: center;
//     width: 100%;
//     padding: 50px;
//     color: #444;
//     border: 1px solid #1890ff;
// `;
