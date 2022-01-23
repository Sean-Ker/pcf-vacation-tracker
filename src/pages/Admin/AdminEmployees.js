import React, { useContext, useEffect, useState } from "react";
import { getAllUsers } from "../../api/api";
import { Table, Select, Typography, Button } from "antd";
import { Container } from "react-bootstrap";
import { Link as RouterLink } from "react-router-dom";
import EmployeeName from "../../components/EmployeeName";
import axios from "../../api/axios";
import { UserContext } from "../../Contexts";
import CompanyHierarchy from "../../components/CompanyHierarchy";
import CreateUserModal from "../../components/Modals/CreateUserModal";

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

    const handleEditClick = employee => {
        setEditModalVisible(true);
        setEditEmployee(employee);
    };

    const dataSource = users.map(user => ({
        ...user,
        key: user._id,
        name: user.fname + " " + user.lname,
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
            render: (text, user) => (
                <RouterLink to={`/user/${user.username}`} style={{ textDecoration: "none" }}>
                    <EmployeeName
                        fname={user.fname}
                        lname={user.lname}
                        country_code={user.country_id}
                    />
                </RouterLink>
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
            render: (text, user) => <Link onClick={e => handleEditClick(user)}>edit</Link>,
        },
    ];

    if (loading > 0) {
        return (
            <Container>
                <Typography.Title>Company Hierarchy</Typography.Title>
                <Typography.Title>All Employees</Typography.Title>
                <br />
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

    console.log(dataSource);
    console.log(allLeaveTypes);
    console.log(leaveType);

    return (
        <Container>
            <Typography.Title>Company Hierarchy</Typography.Title>
            {user && users.length !== 0 && <CompanyHierarchy users={users} ceo_id="41" />}
            <br />
            <Typography.Title>All Employees</Typography.Title>
            <Button type="primary" size="large" onClick={() => setCreateModalVisible(true)}>
                Create Employee
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
                <CreateUserModal
                    modalVisible={createModalVisible}
                    setModalVisible={setCreateModalVisible}
                    users={users}
                    leaveTypes={allLeaveTypes}
                    departments={allDepartments}
                />
            )}
        </Container>
    );
};

export default AdminEmployees;
