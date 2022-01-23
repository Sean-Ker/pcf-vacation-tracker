import React, { useState, useEffect } from "react";
import { Button, List, Typography, Card, Modal, Input, Form, Popover } from "antd";
import { allDepartments } from "../api/api";

import axios from "../api/axios";
import EmployeeName from "./EmployeeName";
import { Link } from "react-router-dom";

const NewRequestModal = ({ modalVisible, setModalVisible }) => {
    const [department, setDepartment] = useState();
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchDepartment = async () => {
            const departmentRes = null;
            if (departmentRes === null) {
                setDepartment(null);
                return;
            }
            setDepartment(departmentRes["data"]);
            console.log(departmentRes["data"]);
            form.setFieldsValue({
                name: departmentRes["data"] ? departmentRes["data"]["name"] : "",
            });
        };
        fetchDepartment();
    }, [modalVisible, form]);

    return (
        <Modal
            width={800}
            visible={modalVisible}
            title={`${department && department.name} Department`}
            okText="Apply"
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

export default NewRequestModal;
