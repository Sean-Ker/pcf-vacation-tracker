import React, { useEffect, useState, useContext } from "react";

// make sure you include the timeline stylesheet or the timeline will not be styled
import "react-calendar-timeline/lib/Timeline.css";
import { getAllUsers } from "../api/api";
import { Button, Typography, message } from "antd";
import { Container } from "react-bootstrap";
import NewRequestModal from "../components/Modals/NewRequestModal";
import Calendar from "../components/Calendar";
import axios from "../api/axios";
import { UserContext } from "../Contexts";

export default function Home() {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(1);
    const [users, setUsers] = useState([]);
    const [allLeaveTypes, setAllLeaveTypes] = useState([]);
    const [allRuleGroups, setAllRuleGroups] = useState([]);
    const [newRequestVisible, setNewRequestVisible] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const users = await getAllUsers();
            const leaveTypes = await axios.get("/leave_types");
            const ruleGroups = await axios.get("/rule_groups");
            setUsers(users);
            setAllLeaveTypes(leaveTypes["data"]);
            setAllRuleGroups(ruleGroups["data"]);
            setLoading(prevLoading => prevLoading - 1);
        }
        fetchData();
    }, [newRequestVisible]);

    const handleNewRequestClick = () => {
        if (user.manager_id) {
            setNewRequestVisible(true);
        } else {
            message.error("This is an error message");
        }
    };

    if (loading > 0) {
        return (
            <Container>
                <Typography.Title>Calendar</Typography.Title>
            </Container>
        );
    }

    return (
        <Container>
            <br />
            {/* {JSON.stringify(allRuleGroups)} */}
            <Typography.Title>Calendar</Typography.Title>
            <Button size="large" type="primary" onClick={handleNewRequestClick}>
                New Leave Request
            </Button>

            <Calendar users={users} leaveTypes={allLeaveTypes} />

            <h2 className="mt-2">Interactions</h2>
            <p>
                <kbd>shift + mousewheel</kbd> to move timeline left/right
            </p>
            <p>
                <kbd>alt + mousewheel</kbd> to zoom in/out
            </p>
            <p>
                <kbd>ctrl + mousewheel</kbd> to zoom in/out 10× faster
            </p>
            <p>
                <kbd>(win or cmd) + mousewheel</kbd> to zoom in/out 3x faster
            </p>
            {/* <pre>Current User: {JSON.stringify(user, null, 2)}</pre> */}
            {newRequestVisible && (
                <NewRequestModal
                    modalVisible={newRequestVisible}
                    setModalVisible={setNewRequestVisible}
                    users={users}
                    allLeaveTypes={allLeaveTypes}
                    allRuleGroups={allRuleGroups}
                />
            )}
        </Container>
    );
}
