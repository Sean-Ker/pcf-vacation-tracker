import React, { useContext, useEffect, useState } from "react";
import { Table, Select, Typography, Button, Row, Col, Divider, List, Card, Form } from "antd";
import { Container } from "react-bootstrap";
import { Link as RouterLink } from "react-router-dom";
import EmployeeName from "../EmployeeName";
import axios from "../../axios";
import { UsersContext } from "../../Contexts";
import CompanyHierarchy from "../CompanyHierarchy";
import CreateUserModal from "../Modals/CreateUserModal";
import CeoSelect from "../CeoSelect";
import EditUserModal from "../Modals/EditUserModal";
import LoadingScreen from "../LoadingScreen";
import EmployeesNoManager from "../EmployeesNoManager";
import _ from "lodash";

const { Option } = Select;
const { Link } = Typography;

const AdminEmployees = () => {
    const { users, setUsers } = useContext(UsersContext);
    const [leaveType, setLeaveType] = useState("");
    const [allLeaveTypes, setAllLeaveTypes] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    // const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const { Text } = Typography;

    useEffect(() => {
        const fetchData = async () => {
            const leavesRes = await axios.get("/leave_types");
            const depRes = await axios.get("/departments");
            const usersRes = await axios.get("/users");

            setAllLeaveTypes(leavesRes["data"]);
            setLeaveType(leavesRes["data"][0]);
            setAllDepartments(depRes["data"]);
            setUsers(usersRes["data"]);

            setLoading(false);
        };
        fetchData();
    }, [createModalVisible, setUsers]);

    const managerFromUser = user => users.find(u => u.employees.includes(user._id));

    const allManagersNames = [
        ...new Map(
            users.filter(u => u.manager_id !== null).map(item => [item["manager_id"], item])
        ).values(),
    ].map(user => {
        return {
            text: user.manager.fname + " " + user.manager.lname,
            value: user.manager.fname + " " + user.manager.lname,
        };
    });

    allManagersNames.unshift({ text: "None", value: "None" });

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text, user) =>
                user["username"] ? (
                    <RouterLink to={`/user/${user.username}`} style={{ textDecoration: "none" }}>
                        <EmployeeName
                            fname={user.fname}
                            lname={user.lname}
                            country_code={user.country_id}
                        />
                    </RouterLink>
                ) : (
                    <EmployeeName
                        fname={user.fname}
                        lname={user.lname}
                        country_code={user.country_id}
                    />
                ),
            filters: users.map(user => ({
                text: user.fname + " " + user.lname,
                value: user.fname + " " + user.lname,
            })),
            onFilter: (value, record) => record.name.indexOf(value) === 0,
            filterSearch: true,
            sorter: (a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1),
        },
        {
            title: "Department",
            dataIndex: "department",
            key: "department",
            filters: allDepartments.map(d => ({
                text: d.name,
                value: d.name,
            })),
            onFilter: (value, record) => record.department.indexOf(value) === 0,
            filterSearch: true,
            sorter: (a, b) =>
                a.department === b.department ? 0 : a.department < b.department ? -1 : 1,
        },
        {
            title: "Manager",
            dataIndex: "manager_id",
            key: "manager_id",
            render: (text, user) =>
                user["manager"] ? (
                    <RouterLink
                        to={`/user/${user["manager"]["username"]}`}
                        style={{ textDecoration: "none" }}>
                        <EmployeeName
                            fname={user["manager"].fname}
                            lname={user["manager"].lname}
                            country_code={user["manager"].country_id}
                        />
                    </RouterLink>
                ) : (
                    "None"
                ),
            filters: allManagersNames,
            filterSearch: true,
            onFilter: (value, record) => record.manager_name.indexOf(value) === 0,
            sorter: (a, b) =>
                a.manager_name === b.manager_name ? 0 : a.manager_name < b.manager_name ? -1 : 1,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (text, user) => (
                <Text type={user.is_active ? "success" : "danger"}>
                    {user.is_active ? "Active" : "Inactive"}
                </Text>
            ),
            filters: [
                { text: "Active", value: true },
                { text: "Inactive", value: false },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (text, user) => (
                <Text
                    type={
                        user.is_admin
                            ? "danger"
                            : user.employees.length === 0
                            ? "secondary"
                            : "warning"
                    }>
                    {text}
                </Text>
            ),
            filters: [
                { text: "Employee", value: "Employee" },
                { text: "Manager", value: "Manager" },
                { text: "Admin", value: "Admin" },
            ],
            onFilter: (value, record) => record.role.indexOf(value) === 0,
        },
        {
            title: "Days This Year",
            dataIndex: "days_this_year",
            key: "days_this_year",
            sorter: (a, b) => a.days_this_year - b.days_this_year,
        },
        {
            title: "Days Per Year",
            dataIndex: "days_per_year",
            key: "days_per_year",
            sorter: (a, b) => a.days_per_year - b.days_per_year,
        },
        {
            title: "Actions",
            dataIndex: "edit",
            key: "edit",
            render: (text, user) => (
                <Link
                    onClick={e => {
                        setSelectedUser(user);
                    }}>
                    View
                </Link>
            ),
        },
    ];

    if (loading) {
        return <LoadingScreen />;
    }

    const usersNoManager = users.filter(user => _.isEmpty(user.manager_id));

    const dataSource = users.map(user => {
        const manager = managerFromUser(user);

        return {
            ...user,
            key: user._id,
            name: user.fname + " " + user.lname,
            manager_name: manager ? manager.fname + " " + manager.lname : "None",
            department: user.department.name,
            status: user.is_active,
            role: user.is_admin ? "Admin" : user.employees.length === 0 ? "Employee" : "Manager",
            edit: "",
            days_this_year: user["leaves"][leaveType["_id"]["$oid"]]["days_this_year"],
            days_per_year: user["leaves"][leaveType["_id"]["$oid"]]["days_per_year"],
        };
    });

    if (allLeaveTypes.length === 0) {
        return (
            <Typography.Text type="danger">
                To view employees, please first create a new Leave Type
            </Typography.Text>
        );
    }

    // console.log(dataSource);
    // console.log(allLeaveTypes);
    // console.log(leaveType);

    return (
        <Container>
            <Row justify="space-between">
                <Col xs={24} md={6}>
                    {users.length !== 0 && (
                        <>
                            <Divider orientation="left" style={{ fontWeight: "bold" }}>
                                Company Hierarchy
                            </Divider>
                            <CompanyHierarchy users={users} />
                        </>
                    )}
                </Col>
                {usersNoManager.length >= 0 && (
                    <Col xs={24} md={10}>
                        <EmployeesNoManager
                            users={usersNoManager}
                            setSelectedUser={setSelectedUser}
                        />
                    </Col>
                )}
            </Row>

            <Divider orientation="left" style={{ fontWeight: "bold" }}>
                All Employees
            </Divider>
            {/* <Typography.Title level={2}>All Employees</Typography.Title> */}
            <Row justify="space-between" style={{ width: "100%", alignItems: "flex-end" }}>
                <Col xs={24} md={6}>
                    <Form.Item label="Leave Type">
                        <Select
                            // showSearch

                            placeholder="Select a Leave Type"
                            optionFilterProp="children"
                            onChange={value =>
                                setLeaveType(
                                    allLeaveTypes.filter(lt => lt["_id"]["$oid"] === value)[0]
                                )
                            }
                            defaultValue={allLeaveTypes[0]["_id"]["$oid"]}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }>
                            {allLeaveTypes.map(lt => (
                                <Option key={lt["_id"]["$oid"]} value={lt["_id"]["$oid"]}>
                                    {lt["name"]}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                    {/* Make the button below be a block button */}

                    <Button
                        block
                        type="primary"
                        size="large"
                        onClick={() => setCreateModalVisible(true)}>
                        Add New Employee
                    </Button>
                </Col>
            </Row>

            <Table
                loading={loading}
                dataSource={dataSource}
                columns={columns}
                pagination={{
                    defaultPageSize: "15",
                    showSizeChanger: true,
                    pageSizeOptions: [10, 15, 20, 50],
                }}
            />
            {loading <= 0 && (
                <>
                    {createModalVisible && (
                        <CreateUserModal
                            modalVisible={createModalVisible}
                            setModalVisible={setCreateModalVisible}
                            leaveTypes={allLeaveTypes}
                            departments={allDepartments}
                        />
                    )}
                    {!_.isEmpty(selectedUser) && (
                        <EditUserModal
                            user={selectedUser}
                            setUser={setSelectedUser}
                            leaveTypes={allLeaveTypes}
                            departments={allDepartments}
                        />
                    )}
                </>
            )}
        </Container>
    );
};

export default AdminEmployees;
