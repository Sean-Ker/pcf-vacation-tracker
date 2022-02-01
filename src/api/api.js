import jwt_decode from "jwt-decode";
import axios from "./axios";
// import { useState } from "react";
// import useLocalStorage from "./useLocalStorage";

export const setJwt = (access_token, refresh_token) => {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
};

export const getAccessToken = () => localStorage.getItem("access_token");

const getUserId = () => {
    let jwt = getAccessToken();
    return jwt ? jwt_decode(jwt).id : null;
};

// const getUserRulesGroup = async (id) => {
//     const [allEmployeeRulesGroups, allRulesGroups] = await Promise.all([
//         () => {
//             axios.get("/EmployeeRulesGroups");
//         },
//         () => {
//             axios.get("/RulesGroups/");
//         },
//     ]);
//     debugger;
//     let rulesGroupsIds = allEmployeeRulesGroups.data.filter((e) => e.employeeId === id);
//     let rulesGroups = rulesGroupsIds.map((a) => );
// };

export const getUser = async userId => {
    if (userId == null) {
        return null;
    }

    debugger;
    // const employeeReq = axios.get("/Employees/" + userId);
    // const managedReq = axios.get("/Employees/GetManagedEmployees?id=" + userId);

    const user = await axios.get("/me").data;
    return user;

    // try {
    //     const [employee, managedEmployees] = await Promise.all([employeeReq, managedReq]);
    //     let user = employee.data;
    //     user.managedEmployees = managedEmployees.data;

    //     let department = await axios.get("/Departments/" + user.departmentId);
    //     user.department = department.data.name;

    //     let allEvents = await axios.get("/Events/");
    //     user.events = allEvents.data.filter((m) => m.employeeId === userId);

    //     // user.allRulesGroups = await getAllRulesGroups();
    //     // user.rulesGroups = await getUserRulesGroup(userId);
    //     return user;
    // } catch (err) {
    //     console.log("here", err);
    // }
};

export const getCurrentUser = async () => {
    try {
        const user = await axios.get("/auth/me");
        return user.data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getAllUsers = async (allInfo = false) => {
    try {
        const users = await axios.get(`/users${allInfo ? "/all" : ""}`);
        return users.data;
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const allLeaveTypes = async () => {
    const leaveTypes = await axios.get("/leave_types");
    return leaveTypes.data;
};

export const allDepartments = async () => {
    const leaveTypes = await axios.get("/departments");
    return leaveTypes.data;
};

export const createNewDepartment = async name => {
    const new_department = await axios.post("/departments", { name: name });
    // console.log(new_department);
    return new_department;
};
