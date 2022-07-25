import { Typography, Tabs } from "antd";
import React, { useState, useEffect, useContext } from "react";
import { Container } from "react-bootstrap";
import axios from "../api/axios";
import { useParams } from "react-router-dom";
import EmployeeName from "../components/EmployeeName";
import LoadingScreen from "../components/LoadingScreen";

export default function User() {
    const { userName } = useParams();
    const [user, setUser] = useState(null);
    const { loading, setLoading } = useState(true);

    useEffect(() => {
        async function getUserByUsername() {
            const user_response = await axios.get(`/users/username/${userName}`);
            setUser(user_response["data"]);
        }
        getUserByUsername();
    }, [userName]);

    // if (user === null) {
    //     return <NotFound />;
    // }

    return user ? (
        <Container>
            <br />
            <Typography.Title>{user.fname}'s Profile</Typography.Title>

            <EmployeeName fname={user.fname} lname={user.lname} country_code={user.country_id} />
            <pre>{JSON.stringify(user, null, 2)}</pre>
        </Container>
    ) : (
        <div></div>
    );
}
