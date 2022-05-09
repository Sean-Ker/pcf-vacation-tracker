import React, { useState, useEffect } from "react";
import { Button, List, Typography, Card } from "antd";
import { allDepartments } from "../../api/api";
import Container from "../../components/Container";
import CreateDepartmentModal from "../../components/Modals/CreateDepartmentModal";
import EditDepartmentModal from "../../components//Modals/EditDepartmentModal";
import { Link } from "react-router-dom";

const AdminDepartments = () => {
    const [editDepartment, setEditDepartment] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDepartments() {
            let departmentsRes = await allDepartments();
            setDepartments(departmentsRes);
            setLoading(false);
        }
        fetchDepartments();
    }, [createModalVisible, editModalVisible]);

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
                    <div
                        onClick={e => {
                            setEditModalVisible(true);
                            setEditDepartment(item);
                        }}>
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
                            actions={["edit"]}>
                            {item.name}
                        </Card>
                    </div>
                )}
            />
            {createModalVisible && (
                <CreateDepartmentModal
                    modalVisible={createModalVisible}
                    setModalVisible={setCreateModalVisible}
                />
            )}
            {editDepartment && editModalVisible && (
                <EditDepartmentModal
                    department={editDepartment}
                    setDepartment={setEditDepartment}
                    modalVisible={editModalVisible}
                    setModalVisible={setEditModalVisible}
                />
            )}
        </Container>
    );
};

export default AdminDepartments;
