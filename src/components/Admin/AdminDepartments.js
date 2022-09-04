import { Button, Card, List, Typography } from "antd";
import { useEffect, useState } from "react";
import Container from "../Container";
import CreateDepartmentModal from "../Modals/CreateDepartmentModal";
import EditDepartmentModal from "../Modals/EditDepartmentModal";
import axios from "../../axios";

const AdminDepartments = () => {
    const [editDepartment, setEditDepartment] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDepartments() {
            let departmentsRes = await axios.get("/departments");
            setDepartments(departmentsRes["data"]);
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
