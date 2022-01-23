import React, { useContext, useEffect, useState } from "react";
import { LoadingContext, UserContext } from "../Contexts";
import Timeline, {
    TimelineMarkers,
    CustomMarker,
    TodayMarker,
    CursorMarker,
} from "react-calendar-timeline";
// make sure you include the timeline stylesheet or the timeline will not be styled
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import { getAllUsers } from "../api/api";
import EmployeeName from "../components/EmployeeName";
import { Button, Typography } from "antd";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import NewRequestModal from "../components/NewRequest";
import CompanyHierarchy from "../components/CompanyHierarchy";

const items = [
    {
        id: 1,
        group: 1,
        title: "item 1",
        start_time: moment(),
        end_time: moment().add(1, "day"),
    },
    {
        id: 2,
        group: 8,
        title: "item 2",
        start_time: moment().add(-0.5, "hour"),
        end_time: moment().add(0.5, "hour"),
    },
    {
        id: 3,
        group: 10,
        title: "item 3",
        start_time: moment().add(2, "hour"),
        end_time: moment().add(3, "hour"),
    },
];

export default function Home() {
    const { user } = useContext(UserContext);
    const { setLoading } = useContext(LoadingContext);
    const [users, setUsers] = useState([]);
    const [newRequestVisible, setNewRequestVisible] = useState(false);

    const { Text } = Typography;

    const groups = users
        .filter(u => u["is_active"])
        .map(user => ({
            id: user["_id"],
            height: 40,
            title: (
                <Link to={`/user/${user.username}`} style={{ textDecoration: "none" }}>
                    {/* {user.fname} {user.lname} */}
                    <EmployeeName
                        fname={user.fname}
                        lname={user.lname}
                        country_code={user.country_id}
                    />
                </Link>
            ),
        }));

    useEffect(() => {
        async function fetchAllUsers() {
            // setLoading(prevLoading => (prevLoading += 1));
            const users = await getAllUsers();
            setUsers(users);
            // debugger;
            // setLoading(prevLoading => (prevLoading -= 1));
        }
        fetchAllUsers();
        // setUser({ [e.target.name]: e.target.value });
    }, []);

    return (
        <Container>
            <br />

            <Typography.Title>Calendar</Typography.Title>
            {/* {users.map((u) => (
                <div key={u.id}>{u}</div>
            ))} */}
            {/* <div>{JSON.stringify(moment().format("YYYY-MM-DD"))}</div> */}
            <Button type="primary" onClick={() => setNewRequestVisible(true)}>
                New Leave Request
            </Button>
            {users.length === 0 ? (
                ""
            ) : (
                <Timeline
                    groups={groups}
                    items={items}
                    sidebarWidth={200}
                    canSelect={false}
                    defaultTimeStart={moment()}
                    defaultTimeEnd={moment().add(1, "day")}>
                    <TimelineMarkers>
                        <TodayMarker />
                    </TimelineMarkers>
                </Timeline>
            )}
            <h2 className="mt-2">Interactions</h2>
            <p>
                <kbd>shift + mousewheel</kbd> to move timeline left/right
            </p>
            <p>
                <kbd>alt + mousewheel</kbd> to zoom in/out
            </p>
            {/* <pre>Current User: {JSON.stringify(user, null, 2)}</pre> */}
            <NewRequestModal
                modalVisible={newRequestVisible}
                setModalVisible={setNewRequestVisible}
            />
        </Container>
    );
}
