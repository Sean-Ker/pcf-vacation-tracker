import React, { useState, useEffect } from "react";
import {
    Button,
    List,
    Typography,
    Card,
    Modal,
    Input,
    Form,
    Popover,
    Spin,
    Popconfirm,
} from "antd";

import axios from "../../axios";
import EmployeeName from "../EmployeeName";
import { Link } from "react-router-dom";
import LoadingScreen from "../LoadingScreen";

const CreateDepartmentModal = ({ department, setDepartment, modalVisible, setModalVisible }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartment = async () => {
            const id = department["_id"]["$oid"];
            let departmentRes = await axios.get(`/departments/${id}`);
            if (!departmentRes) {
                return;
            }
            setDepartment(departmentRes["data"]);
            form.setFieldsValue({
                name: departmentRes["data"] ? departmentRes["data"]["name"] : "",
            });
            setLoading(false);
        };
        fetchDepartment();
    }, [modalVisible, form]);

    if (loading) {
        return (
            <Modal width={800} visible={modalVisible} confirmLoading={loading} okText="Save">
                <LoadingScreen />
            </Modal>
        );
    }

    return (
        <Modal
            width={800}
            visible={modalVisible}
            confirmLoading={loading}
            title={`${department && department.name} Department`}
            okText="Save"
            getContainer={false}
            onOk={() => {
                form.validateFields()
                    .then(async values => {
                        if (!department) return;
                        const new_name = values["name"];
                        await axios.put(`/departments/${department["_id"]["$oid"]}`, {
                            name: new_name,
                        });
                        // setDepartment(prevDepartment => ({ ...prevDepartment, name: new_name }));
                        form.resetFields();
                        setModalVisible(false);
                    })
                    .catch(info => {
                        console.log("Validate Failed:", info);
                    });
            }}
            onCancel={() => {
                setModalVisible(false);
            }}>
            <Typography.Title level={2}>Department Info</Typography.Title>
            <Form form={form} name="modalForm" wrapperCol={{ span: 8 }} autoComplete="off">
                <Form.Item
                    label="Edit Department Name:"
                    name="name"
                    rules={[{ required: true, message: "Please input department name!" }]}>
                    <Input
                        onFocus={e => {
                            e.target.select();
                        }}
                    />
                </Form.Item>
            </Form>
            <Typography.Title level={2}>
                Employees in {department ? department["name"] : ""}
            </Typography.Title>
            <List
                grid={{ gutter: 16 }}
                size="large"
                dataSource={department ? department["employees"] : []}
                renderItem={item => (
                    <Link to={`/user/${item.username}`} style={{ textDecoration: "none" }}>
                        <Card
                            hoverable
                            style={{
                                width: 300,
                                margin: "10px",
                                borderRadius: "20px",
                                overflow: "hidden",
                            }}>
                            <EmployeeName
                                fname={item.fname}
                                lname={item.lname}
                                country_code={item.country_id}
                            />
                        </Card>
                    </Link>
                )}
            />
            <Popover content="You can only delete a department with no employees!">
                <Popconfirm
                    title="Are you sure to delete this department?"
                    onConfirm={async () => {
                        if (department !== null) {
                            await axios.patch(`/departments/${department["_id"]["$oid"]}`);
                            setModalVisible(false);
                        }
                    }}
                    okText="Yes"
                    cancelText="No">
                    <Button danger block disabled={department["employees"].length !== 0}>
                        Delete {department ? department["name"] : ""}
                    </Button>
                </Popconfirm>
            </Popover>
        </Modal>
    );
};

export default CreateDepartmentModal;
