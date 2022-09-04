import { Card, Col, Form, Row, Tag, Typography } from "antd";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "../axios";
import EmployeeName from "../components/EmployeeName";
import { IdentityContext, UsersContext } from "../Contexts";
import LeavesTable from "./LeavesTable";
import LeaveStatsTable from "./LeaveStatsTable";
import LoadingScreen from "./LoadingScreen";
import NotFound from "./NotFound";
import RuleGroups from "./RuleGroups";

export default function User() {
    const { user: loginUser } = useContext(IdentityContext);
    const { users } = useContext(UsersContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const { userName } = useParams();
    const [ruleGroups, setRuleGroups] = useState([]);

    const { Text } = Typography;

    const [form] = Form.useForm();

    useEffect(() => {
        async function fetchData() {
            const userRes = await axios.get(`/users/username/${userName}`);
            const departmentsRes = await axios.get("/departments");
            const leavesRes = await axios.get("/leave_requests");
            const ruleGroupsRes = await axios.get("/rule_groups");

            setUser(userRes["data"]);
            setDepartments(departmentsRes["data"]);
            setLeaves(leavesRes["data"]);
            setRuleGroups(ruleGroupsRes["data"]);

            setLoading(false);
        }
        fetchData();
    }, [userName, setLoading]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <NotFound />;
    }

    const manager = users.find(u => u["_id"] === user["manager_id"]);
    const managerLink = manager ? (
        <Link to={`/user/${manager["username"]}`}>
            <EmployeeName
                fname={manager.fname}
                lname={manager.lname}
                country_code={manager.country_id}
            />
        </Link>
    ) : (
        "None"
    );

    const department = departments.find(d => d["_id"]["$oid"] === user["department_id"]);
    const role = user.is_admin ? (
        <Text type="danger">Admin</Text>
    ) : user.employees.length > 0 ? (
        <Text type="success">Manager</Text>
    ) : (
        <Text type="secondary">Employee</Text>
    );
    const employees = users.filter(u => user.employees.includes(u["_id"]));
    const employeesNames = employees.map(u => (
        <Link
            to={`/user/${u["username"]}`}
            style={{ display: "inline-block", marginRight: "10px" }}>
            <EmployeeName fname={u.fname} lname={u.lname} country_code={u.country_id} />
        </Link>
    ));

    /* ==================== Left Panel - Leave Requests ==================== */
    const canViewPrivateData = loginUser.is_admin || loginUser.employees.includes(user._id);
    const pendingLeaves = leaves.filter(
        l => l.status === "OPEN" && Object.keys(_.get(user, "leave_requests", {})).includes(l._id)
    );
    const resolvedLeaves = leaves.filter(
        l => l.status !== "OPEN" && Object.keys(_.get(user, "leave_requests", {})).includes(l._id)
    );

    const userRuleGroups = ruleGroups.filter(rg => rg.employee_ids.includes(user._id));

    return (
        <Container>
            <Typography.Title level={1}>{user.fname}'s Profile</Typography.Title>
            <Card>
                <Row justify="space-between">
                    <Col span={10}>
                        <Typography.Title level={2}>General Information</Typography.Title>
                        <Form layout="horizontal" labelCol={{ span: 4 }} size="large">
                            <Form.Item label="Name">
                                <EmployeeName
                                    fname={user.fname}
                                    lname={user.lname}
                                    country_code={user.country_id}
                                />
                            </Form.Item>
                            <Form.Item label="Department">
                                <Tag color="#2db7f5">{department.name}</Tag>
                            </Form.Item>
                            <Form.Item label="Manager">{managerLink}</Form.Item>
                            <Form.Item label="Employees">
                                {!_.isEmpty(employees) ? employeesNames : "N/A"}
                            </Form.Item>
                            <Form.Item label="Username">{user.username}</Form.Item>
                            <Form.Item label="Email">{user.email}</Form.Item>
                            <Form.Item label="Role">{role}</Form.Item>
                            <Form.Item label="Active User">
                                {user.is_active ? (
                                    <Text type="success">Yes</Text>
                                ) : (
                                    <Text type="danger">No</Text>
                                )}
                            </Form.Item>
                        </Form>
                        {!_.isEmpty(userRuleGroups) && (
                            <>
                                <Typography.Title level={2}>
                                    {user.fname}'s Rule Groups
                                </Typography.Title>
                                <RuleGroups ruleGroups={userRuleGroups} renderActions={false} />
                            </>
                        )}
                    </Col>

                    <Col span={14}>
                        <Typography.Title level={2}>Leaves Requests</Typography.Title>
                        <Typography.Title level={3}>Statistics</Typography.Title>
                        {canViewPrivateData ? (
                            <LeaveStatsTable user={user} />
                        ) : (
                            <Text type="secondary">
                                You do not have permission to view this information.
                            </Text>
                        )}
                        <Typography.Title level={3}>Pending Requests</Typography.Title>
                        <LeavesTable leaves={pendingLeaves} hideCols={["requester", "manager"]} />
                        <Typography.Title level={3}>Resolved Leaves</Typography.Title>
                        <LeavesTable leaves={resolvedLeaves} hideCols={["requester", "manager"]} />

                        {/* User Leave requests: */}
                        {/* <pre>{JSON.stringify(user["leave_requests"], null, 2)}</pre> */}
                        {/* All leaves:
                        <pre>{JSON.stringify(leaves, null, 2)}</pre> */}
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}
