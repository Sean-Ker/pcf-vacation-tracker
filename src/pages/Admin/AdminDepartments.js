import React, { useState, useEffect } from "react";
import { Button, List, Typography, Card } from "antd";
import { allDepartments } from "../../api/api";
import Container from "../../components/Container";
import CreateDepartmentModal from "../../components/Modals/CreateDepartmentModal";
import EditDepartmentModal from "../../components//Modals/EditDepartmentModal";

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editDepartmentId, setEditDepartmentId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDepartments() {
            let departmentsRes = await allDepartments();
            setDepartments(departmentsRes);
            setLoading(false);
        }
        fetchDepartments();
    }, [createModalVisible, editModalVisible]);

    const handleEditClick = department => {
        setEditModalVisible(true);
        setEditDepartmentId(department["_id"]);
    };

    return (
        <Container>
            <br />
            <Typography.Title>Departments</Typography.Title>
            <Button type="primary" onClick={() => setCreateModalVisible(true)}>
                New Department
            </Button>

            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 6 }}
                dataSource={departments}
                loading={loading}
                renderItem={item => (
                    <Card
                        style={{
                            margin: "10px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            textAlign: "center",
                            marginTop: 12,
                            fontWeight: "bold",
                        }}
                        hoverable={true}
                        actions={[
                            <Button type="link" onClick={e => handleEditClick(item)}>
                                edit
                            </Button>,
                        ]}>
                        {item.name}
                    </Card>
                )}
            />
            <CreateDepartmentModal
                modalVisible={createModalVisible}
                setModalVisible={setCreateModalVisible}
            />
            <EditDepartmentModal
                id={editDepartmentId}
                modalVisible={editModalVisible}
                setModalVisible={setEditModalVisible}
            />
        </Container>
    );
};

export default AdminDepartments;
