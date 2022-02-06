import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    message,
    Select,
    Checkbox,
    Alert,
    Input,
    Divider,
    List,
    Card,
    InputNumber,
} from "antd";
import EmployeeName from "../EmployeeName";
import axios from "../../api/axios";
const _ = require("lodash");

const EditUserModal = props => {
    const { modalVisible, setModalVisible, users, user, departments, leaveTypes } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ visible: false, message: "" });

    const [form] = Form.useForm();
    const { Option } = Select;

    useEffect(() => {
        setError({ visible: false, message: "" });
        form.setFieldsValue({
            fname: user["fname"],
            lname: user["lname"],
            email: user["email"],
            username: user["username"],
            department: user["department_id"],
            manager: user["manager_id"],
            employees: user["employees"],
            isAdmin: user["is_admin"],
            leaves: user["leaves"],
        });
    }, [form, user]);

    let dataSource = [];
    for (let l in user["leaves"]) {
        let lt = leaveTypes.find(lt => lt["_id"]["$oid"] === l);
        dataSource.push({ name: lt["name"], key: l, ...user["leaves"][l] });
    }

    return (
        <Modal
            visible={modalVisible}
            title="Edit Employee"
            okText="Save"
            form={form}
            width={600}
            getContainer={false}
            loading={loading}
            okButtonProps={{ disabled: loading }}
            onOk={() => {
                form.validateFields()
                    .then(async values => {
                        console.log(values);
                    })
                    .catch(info => {
                        console.log("Validate Failed:", info);
                    });
            }}
            onCancel={() => {
                setModalVisible(false);
            }}>
            {/* {JSON.stringify(users)} */}
            {error["visible"] && (
                <Alert
                    closable
                    showIcon
                    type="error"
                    onClose={() => setError({ visible: false, message: "" })}
                    message="Error"
                    description={error["message"]}
                />
            )}

            <Form form={form} labelCol={{ span: 8 }} size="large">
                <Divider>General Information</Divider>
                <Form.Item
                    name="fname"
                    label="First Name:"
                    rules={[{ required: true, message: "Please input first name!" }]}>
                    <Input size="large" disabled />
                </Form.Item>
                <Form.Item
                    name="lname"
                    label="Last Name:"
                    rules={[{ required: true, message: "Please input last name!" }]}>
                    <Input size="large" disabled />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email:"
                    rules={[
                        { required: true, message: "Please input an email!" },
                        { type: "email", message: "Please input a valid email address!" },
                    ]}>
                    <Input size="large" disabled />
                </Form.Item>
                <Form.Item name="username" label="Username:">
                    <Input size="large" disabled />
                </Form.Item>
                <Form.Item
                    name="department"
                    label="Department:"
                    rules={[{ required: true, message: "Please choose a department!" }]}>
                    <Select
                        showSearch
                        allowClear
                        filterOption={(input, option) =>
                            option.name.toLowerCase().indexOf(input.toLowerCase()) > -1
                        }>
                        {departments
                            .sort((a, b) => (a["name"] > b["name"] ? 1 : -1))
                            .map(lt => (
                                <Option
                                    key={lt["_id"]["$oid"]}
                                    value={lt["_id"]["$oid"]}
                                    name={lt["name"]}>
                                    {lt["name"]}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
                <Form.Item name="manager" label="Manager:">
                    <Select
                        showSearch
                        allowClear
                        filterOption={(input, option) =>
                            option.name.toLowerCase().indexOf(input.toLowerCase()) > -1
                        }>
                        {users
                            .sort((a, b) =>
                                a["fname"] + " " + a["lname"] > b["fname"] + " " + b["lname"]
                                    ? 1
                                    : -1
                            )
                            .map(lt => (
                                <Option
                                    key={lt["_id"]}
                                    value={lt["_id"]}
                                    name={lt["fname"] + " " + lt["lname"]}>
                                    <EmployeeName
                                        fname={lt["fname"]}
                                        lname={lt["lname"]}
                                        country_code={lt["country_id"]}
                                    />
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
                <Form.Item name="employees" label="Managed Employees:">
                    <Select
                        mode="multiple"
                        showSearch
                        allowClear
                        filterOption={(input, option) =>
                            option.name.toLowerCase().indexOf(input.toLowerCase()) > -1
                        }>
                        {users
                            .sort((a, b) =>
                                a["fname"] + " " + a["lname"] > b["fname"] + " " + b["lname"]
                                    ? 1
                                    : -1
                            )
                            .map(lt => (
                                <Option
                                    disabled={lt["manager"] !== null}
                                    key={lt["_id"]}
                                    value={lt["_id"]}
                                    name={lt["fname"] + " " + lt["lname"]}>
                                    <EmployeeName
                                        fname={lt["fname"]}
                                        lname={lt["lname"]}
                                        country_code={lt["country_id"]}
                                    />
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
                <Form.Item label="Is the employee an admin" name="isAdmin" valuePropName="checked">
                    <Checkbox></Checkbox>
                </Form.Item>

                <Divider>Leave Types</Divider>
                <List
                    dataSource={dataSource}
                    renderItem={item => (
                        <Card title={item["name"]} hoverable={false}>
                            <Form.Item
                                rules={[{ required: true, message: "Please pick a valid number" }]}
                                labelCol={{ span: 5, offset: 0 }}
                                label="Days this year:"
                                name={["leaves", item["key"], "days_this_year"]}>
                                <InputNumber max={99} min={0} />
                            </Form.Item>
                            <Form.Item
                                rules={[{ required: true, message: "Please pick a valid number" }]}
                                labelCol={{ span: 5, offset: 0 }}
                                label="Days per year:"
                                name={["leaves", item["key"], "days_per_year"]}>
                                <InputNumber max={99} min={0} />
                            </Form.Item>
                        </Card>
                    )}
                />
            </Form>
        </Modal>
    );
};

export default EditUserModal;
