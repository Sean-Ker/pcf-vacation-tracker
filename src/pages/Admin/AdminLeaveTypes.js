import { Table, Typography, Tag, Button } from "antd";
import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import Container from "../../components/Container";
import CreateLeaveTypeModal from "../../components/Modals/CreateLeaveTypeModal";
import EditLeaveTypeModal from "../../components/Modals/EditLeaveTypeModal";

const { Text, Link } = Typography;

const AdminLeaveTypes = () => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editLeaveType, setEditLeaveType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            const leaveTypesRes = await axios.get("/leave_types");
            setLeaveTypes(leaveTypesRes["data"]);
            setLoading(false);
        };
        fetchLeaveTypes();
    }, [createModalVisible, editModalVisible, editLeaveType]);

    const dataSource = leaveTypes.map(lt => ({
        key: lt["_id"]["$oid"],
        name: lt.name,
        rolled_over: lt.rolled_over,
        needs_approval: lt.needs_approval,
        reason_required: lt.reason_required,
        default_value: lt.default_value,
        color: lt.color,
    }));

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: text => <Text strong>{text}</Text>,
        },
        {
            title: "Rolls Over",
            dataIndex: "rolled_over",
            key: "rolled_over",
            render: value => <Tag color={value ? "green" : "red"}>{value ? "Yes" : "No"}</Tag>,
        },
        {
            title: "Needs Approval",
            dataIndex: "needs_approval",
            key: "needs_approval",
            render: value => <Tag color={value ? "green" : "red"}>{value ? "Yes" : "No"}</Tag>,
        },
        {
            title: "Reason Required",
            dataIndex: "reason_required",
            key: "reason_required",
            render: value => <Tag color={value ? "green" : "red"}>{value ? "Yes" : "No"}</Tag>,
        },
        {
            title: "Default Value",
            dataIndex: "default_value",
            key: "default_value",
        },
        {
            title: "Color",
            dataIndex: "color",
            key: "color",
            render: color => <Tag color={color}>{color}</Tag>,
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            render: (text, record) => (
                <Link
                    onClick={() => {
                        setEditModalVisible(true);
                        setEditLeaveType(record);
                    }}>
                    edit
                </Link>
            ),
        },
    ];

    return (
        <Container>
            <Typography.Title>Leave Types</Typography.Title>
            <Button type="primary" onClick={() => setCreateModalVisible(true)}>
                New Leave Type
            </Button>{" "}
            <br />
            <Table dataSource={dataSource} columns={columns} loading={loading} />
            <CreateLeaveTypeModal
                modalVisible={createModalVisible}
                setModalVisible={setCreateModalVisible}
            />
            <EditLeaveTypeModal
                leaveType={editLeaveType}
                modalVisible={editModalVisible}
                setModalVisible={setEditModalVisible}
            />
        </Container>
    );
};

export default AdminLeaveTypes;
