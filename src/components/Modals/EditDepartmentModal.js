import React, { useState, useEffect } from "react";
import { Button, List, Typography, Card, Modal, Input, Form, Popover, Spin } from "antd";

import axios from "../../api/axios";
import EmployeeName from "../EmployeeName";
import { Link } from "react-router-dom";

const CreateDepartmentModal = ({ id, modalVisible, setModalVisible }) => {
    const [department, setDepartment] = useState();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartment = async () => {
            setLoading(true);
            const departmentRes = await axios.get(`/departments/${id}`);
            if (departmentRes === null) {
                setDepartment(null);
                return;
            }
            setDepartment(departmentRes["data"]);
            form.setFieldsValue({
                name: departmentRes["data"] ? departmentRes["data"]["name"] : "",
            });
            setLoading(false);
        };
        fetchDepartment();
    }, [id, modalVisible, form]);

    if (loading) {
        return (
            <Modal
                width={800}
                height={400}
                visible={modalVisible}
                confirmLoading={loading}
                okText="Save">
                <div style={{ textAlign: "center", padding: "130px 50px" }}>
                    <Spin size="large" />
                </div>
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
                        await axios.put(`/departments/${department["_id"]}`, {
                            name: new_name,
                        });
                        setDepartment(prevDepartment => ({ ...prevDepartment, name: new_name }));
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
                <Button
                    danger
                    block
                    disabled={department && department["employees"].length !== 0}
                    onClick={async () => {
                        if (department !== null) {
                            await axios.patch(`/departments/${department["_id"]}`);
                            setModalVisible(false);
                        }
                    }}>
                    Delete {department ? department["name"] : ""}
                </Button>
            </Popover>
        </Modal>
    );
};

export default CreateDepartmentModal;
