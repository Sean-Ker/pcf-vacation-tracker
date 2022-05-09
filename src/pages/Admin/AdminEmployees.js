import React, { useContext, useEffect, useState } from "react";
import { getAllUsers } from "../../api/api";
import { Table, Select, Typography, Button, Row, Col, Divider, List, Card } from "antd";
import { Container } from "react-bootstrap";
import { Link as RouterLink } from "react-router-dom";
import EmployeeName from "../../components/EmployeeName";
import axios from "../../api/axios";
import { UserContext } from "../../Contexts";
import CompanyHierarchy from "../../components/CompanyHierarchy";
import CreateUserModal from "../../components/Modals/CreateUserModal";
import CeoSelect from "../../components/CeoSelect";
import EditUserModal from "../../components/Modals/EditUserModal";

const { Option } = Select;
const { Link } = Typography;

const AdminEmployees = () => {
    const [users, setUsers] = useState([]);
    const [leaveType, setLeaveType] = useState("");
    const [allLeaveTypes, setAllLeaveTypes] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [loading, setLoading] = useState(3);
    const [ceoId, setCeoId] = useState(null);

    const { user } = useContext(UserContext);

    const { Text } = Typography;

    useEffect(() => {
        axios.get("/leave_types").then(response => {
            setAllLeaveTypes(response["data"]);
            setLeaveType(response["data"][0]);
            setLoading(prevLoading => prevLoading - 1);
        });
        axios.get("/departments").then(response => {
            setAllDepartments(response["data"]);
            setLoading(prevLoading => prevLoading - 1);
        });
        async function fetchUsers() {
            const allUsers = await getAllUsers(true);
            setUsers(allUsers);
            setLoading(prevLoading => prevLoading - 1);
        }
        fetchUsers();
    }, [createModalVisible, editModalVisible]);

    const allManagersNames = [
        ...new Map(
            users.filter(u => u.manager_id !== null).map(item => [item["manager_id"], item])
        ).values(),
    ]
        .map(user => ({
            text: user.manager.fname + " " + user.manager.lname,
            value: user.manager.fname + " " + user.manager.lname,
        }))
        .sort((a, b) => (a.text === b.text ? 0 : a.text < b.text ? -1 : 1));

    allManagersNames.unshift({ text: "None", value: "None" });

    const usersNoManager = users.filter(user => user.manager_id === null);

    const dataSource = users.map(user => ({
        ...user,
        key: user._id,
        name: user.fname + " " + user.lname,
        manager_name: user.manager ? user.manager.fname + " " + user.manager.lname : "None",
        department: user.department.name,
        status: user.is_active,
        role: user.is_admin ? "Admin" : user.employees.length === 0 ? "Employee" : "Manager",
        edit: "",
        days_this_year: user["leaves"][leaveType["_id"]["$oid"]]["days_this_year"],
        days_per_year: user["leaves"][leaveType["_id"]["$oid"]]["days_per_year"],
    }));

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
            title: "Action",
            dataIndex: "edit",
            key: "edit",
            render: (text, user) => (
                <Link
                    onClick={e => {
                        setEditModalVisible(true);
                        setEditEmployee(user);
                    }}>
                    edit
                </Link>
            ),
        },
    ];

    if (loading > 0) {
        return (
            <Container>
                <Divider orientation="left" style={{ fontWeight: "bold" }}>
                    All Employees
                </Divider>
                <Table loading={true} columns={columns} />
            </Container>
        );
    }

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
                <Col xs={24} md={11}>
                    {users.length !== 0 && (
                        <>
                            <Divider orientation="left" style={{ fontWeight: "bold" }}>
                                Company Hierarchy
                            </Divider>
                            <CompanyHierarchy users={users} />
                        </>
                    )}
                </Col>
                <Col xs={24} md={11}>
                    {usersNoManager.length !== 0 && (
                        <>
                            <Divider orientation="left" style={{ fontWeight: "bold" }}>
                                Employees with No Manager
                            </Divider>
                            {/* <Divider /> */}
                            {/* <Typography.Title level={2}>Users with no Manager</Typography.Title> */}
                            <List
                                loading={loading > 0}
                                grid={{ xs: 1, sm: 2, md: 1, lg: 2, xl: 2, xxl: 2 }}
                                dataSource={usersNoManager}
                                renderItem={user => (
                                    <List.Item>
                                        <div
                                            onClick={e => {
                                                setEditModalVisible(true);
                                                setEditEmployee(user);
                                            }}>
                                            <Card
                                                style={{
                                                    margin: "0px 10px 10px 10px",
                                                    borderRadius: "10px",
                                                    overflow: "hidden",
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                }}
                                                hoverable={true}
                                                actions={["edit"]}>
                                                <RouterLink
                                                    to={`/user/${user.username}`}
                                                    style={{ textDecoration: "none" }}>
                                                    <EmployeeName
                                                        fname={user.fname}
                                                        lname={user.lname}
                                                        country_code={user.country_id}
                                                    />
                                                </RouterLink>
                                            </Card>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </>
                    )}
                </Col>
            </Row>

            <Divider orientation="left" style={{ fontWeight: "bold" }}>
                All Employees
            </Divider>
            {/* <Typography.Title level={2}>All Employees</Typography.Title> */}
            <Button type="primary" size="large" onClick={() => setCreateModalVisible(true)}>
                Add New Employee
            </Button>
            <br />
            <br />
            <Select
                // showSearch
                placeholder="Select a Leave Type"
                optionFilterProp="children"
                onChange={value =>
                    setLeaveType(allLeaveTypes.filter(lt => lt["_id"]["$oid"] === value)[0])
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
                            users={users}
                            leaveTypes={allLeaveTypes}
                            departments={allDepartments}
                        />
                    )}
                    {editModalVisible && (
                        <EditUserModal
                            user={editEmployee}
                            users={users}
                            modalVisible={editModalVisible}
                            setModalVisible={setEditModalVisible}
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
