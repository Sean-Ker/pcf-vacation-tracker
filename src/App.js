import _ from "lodash";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "./axios";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDepartments from "./components/Admin/AdminDepartments";
import AdminEmployees from "./components/Admin/AdminEmployees";
import AdminLeaveTypes from "./components/Admin/AdminLeaveTypes";
import AdminLogs from "./components/Admin/AdminLogs";
import AdminRuleGroups from "./components/Admin/AdminRuleGroups";
import Home from "./components/Home";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Topbar from "./components/Topbar";
import User from "./components/User";
import { CountriesContext, IdentityContext, UsersContext } from "./Contexts";

const getCurrentUser = async () => {
    try {
        const user_req = await axios.get("/auth/me");
        return user_req.data;
    } catch (error) {
        console.log(error);
        debugger;
        return null;
    }
};

const getAllCountries = async () => {
    try {
        const countries = await axios.get("/locations");
        return countries.data;
    } catch (error) {
        console.log(error);
        debugger;
        return [];
    }
};

const App = () => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem("access_token");
            if (_.isEmpty(token)) {
                setLoading(false);
                return;
            }
            const userData = await getCurrentUser();
            const usersRes = await axios.get("/users");
            const allCountries = await getAllCountries();

            setUser(userData);
            setUsers(usersRes["data"]);
            setCountries(allCountries);
            setLoading(false);
        }
        fetchData();
    }, [setLoading]);

    // only change value (on render) if user or setUser changes
    // const userMemo = useMemo(() => ({ user, setUser }), [user, setUser]);

    // debugger;
    if (loading) {
        return <LoadingScreen />;
    }

    if (window.location.pathname !== "/login" && _.isEmpty(user)) {
        window.location.href = "/login";
        return;
    }

    const sortedUsers = _.sortBy(users, ["fname", "lname"]);

    return (
        <IdentityContext.Provider value={{ user, setUser }}>
            <CountriesContext.Provider value={{ countries, setCountries }}>
                <UsersContext.Provider value={{ users: sortedUsers, setUsers }}>
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            paddingTop: "70px",
                            minHeight: "70rem",
                        }}>
                        <Router>
                            <Topbar />
                            <div style={{ height: "100%", minHeight: "100%" }}>
                                <Routes>
                                    <Route path="logout" element={<Login logout={true} />} />
                                    <Route path="login" element={<Login />} />
                                    <Route path="" element={<Home />} />

                                    <Route
                                        path="admin"
                                        element={
                                            <AdminLayout
                                                isAuthorized={user ? user.is_admin : null}
                                            />
                                        }>
                                        <Route index element={<AdminEmployees />} />
                                        <Route path="employees" element={<AdminEmployees />} />
                                        <Route path="leave_types" element={<AdminLeaveTypes />} />
                                        <Route path="departments" element={<AdminDepartments />} />
                                        <Route path="rule_groups" element={<AdminRuleGroups />} />
                                        {/* <Route path="logs" element={<AdminLogs />} /> */}
                                    </Route>

                                    <Route path="user/:userName" element={<User />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </div>
                        </Router>
                    </div>
                </UsersContext.Provider>
            </CountriesContext.Provider>
        </IdentityContext.Provider>
    );
};

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

export default App;
