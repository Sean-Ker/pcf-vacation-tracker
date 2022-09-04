import KeybindsHelp from "./KeybindsHelp";
import UsersFilters from "./UsersFilters";
import { useContext, useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
// make sure you include the timeline stylesheet or the timeline will not be styled
import { Button, message, Typography, Col, Row, Select, Card } from "antd";
import "react-calendar-timeline/lib/Timeline.css";
import axios from "../axios";
import { IdentityContext, UsersContext, CountriesContext } from "../Contexts";
import Calendar from "./Calendar";
import Container from "./Container";
import NewRequestModal from "./Modals/NewRequestModal";

import styled from "styled-components";
import LoadingScreen from "./LoadingScreen";
import LeavesTable from "./LeavesTable";

const { Option } = Select;

const FlagIcon = styled(ReactCountryFlag)`
    margin-right: 5px;
    font-size: 1.5em;
`;

const isUserUnderManagers = (user, managers, users) => {
    // Foreach loop:
    for (let m of managers) {
        if (m._id === user._id || m.employees.includes(user._id)) return true;

        const newManagers = users.filter(
            u => m.employees.includes(u._id) && u.employees.length > 0
        );

        if (isUserUnderManagers(user, newManagers, users)) return true;
    }
    return false;
};

export default function Home() {
    const { user } = useContext(IdentityContext);
    const { users } = useContext(UsersContext);
    const { countries } = useContext(CountriesContext);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [leaves, setLeaves] = useState([]);

    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedManagerIds, setSelectedManagerIds] = useState([]);
    const [allLeaveTypes, setAllLeaveTypes] = useState([]);
    const [allRuleGroups, setAllRuleGroups] = useState([]);
    const [newRequestVisible, setNewRequestVisible] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const leaveTypes = await axios.get("/leave_types");
            const ruleGroups = await axios.get("/rule_groups");
            const departmentsRes = await axios.get("/departments");
            const leavesRes = await axios.get("/leave_requests");

            setAllLeaveTypes(leaveTypes["data"]);
            setAllRuleGroups(ruleGroups["data"]);
            setDepartments(departmentsRes["data"]);
            setLeaves(leavesRes["data"]);

            if (loading) {
                setSelectedDepartments(departmentsRes["data"].map(d => d["_id"]["$oid"]));

                let allUsersLocationsRaw = users.map(u => u["country_id"]);
                allUsersLocationsRaw = [...countries].filter(l =>
                    allUsersLocationsRaw.includes(l["_id"])
                );
                const allUsersLocations = allUsersLocationsRaw.map(l => l["_id"]);
                setSelectedLocations(allUsersLocations);
            }

            setLoading(false);
        }
        fetchData();
    }, [newRequestVisible, selectedLocations, loading, users, countries]);

    const handleNewRequestClick = () => {
        if (user.manager_id) {
            setNewRequestVisible(true);
        } else {
            message.error("This is an error message");
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    // Create a multi-select dropdown for departments. This will be used to filter the users list based on the department:

    const departmentOptions = [...departments].map(department => {
        const id = department["_id"]["$oid"];
        return (
            <Option key={id} value={id}>
                {department["name"]}
            </Option>
        );
    });

    let allUsersLocationsRaw = users.map(u => u["country_id"]);
    allUsersLocationsRaw = [...countries].filter(l => allUsersLocationsRaw.includes(l["_id"]));

    const locationOptions = allUsersLocationsRaw.map(l => {
        const id = l["_id"];
        const name = l["name"];
        return (
            <Option key={id} value={id}>
                <FlagIcon countryCode={id} svg title={name} aria-label={name} /> <span>{name}</span>
            </Option>
        );
    });

    const selectedManagers = users.filter(u => selectedManagerIds.includes(u["_id"]));
    let selectedUsers = users.filter(u => {
        return (
            selectedDepartments.includes(u["department_id"]) &&
            selectedLocations.includes(u["country_id"]) &&
            isUserUnderManagers(u, selectedManagers, users)
        );
    });
    // Sort the users by the fname + lname:
    selectedUsers = selectedUsers.sort((a, b) => {
        const aName = a["fname"] + " " + a["lname"];
        const bName = b["fname"] + " " + b["lname"];
        return aName.localeCompare(bName);
    });

    const calendarLeaves = leaves.filter(l => l.status !== "CANCELLED" && l.status !== "REJECTED");

    // debugger;
    return (
        <Container style={{ width: "100%" }}>
            <Card border="true" style={{ width: "100%", paddingTop: "0px", margin: "1em 0px" }}>
                <Typography.Title level={2}>Upcoming Leaves</Typography.Title>
                <LeavesTable leaves={leaves} />

                {/* ================= FILTERS =================*/}
                <Typography.Title level={2}>Calendar Filters</Typography.Title>
                <UsersFilters
                    users={users}
                    departmentOptions={departmentOptions}
                    locationOptions={locationOptions}
                    selectedDepartments={selectedDepartments}
                    setSelectedDepartments={setSelectedDepartments}
                    selectedLocations={selectedLocations}
                    setSelectedLocations={setSelectedLocations}
                    selectedManagerIds={selectedManagerIds}
                    setSelectedManagerIds={setSelectedManagerIds}
                />

                {/* ================= CALENDAR =================*/}
                <Row justify="space-between" style={{ alignItems: "flex-end" }}>
                    <Col>
                        <Typography.Title level={2}>Calendar</Typography.Title>
                    </Col>
                    <Col>
                        <Button size="large" type="primary" onClick={handleNewRequestClick}>
                            New Leave Request
                        </Button>
                    </Col>
                </Row>

                <Calendar
                    leaves={calendarLeaves}
                    leaveTypes={allLeaveTypes}
                    selectedUsers={selectedUsers}
                    onClick={leaveId => {}}
                />
                <Typography.Title level={2}>Interactions</Typography.Title>
                <KeybindsHelp />
                {/* <pre>Current User: {JSON.stringify(user, null, 2)}</pre> */}
                {newRequestVisible && (
                    <NewRequestModal
                        modalVisible={newRequestVisible}
                        setModalVisible={setNewRequestVisible}
                        allLeaveTypes={allLeaveTypes}
                        allRuleGroups={allRuleGroups}
                    />
                )}
            </Card>
            <pre>Calendar Leaves: {JSON.stringify(leaves, null, 2)}</pre>
        </Container>
    );
}
