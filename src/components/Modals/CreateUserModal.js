import React, { useState } from "react";
import { Modal, Form, Button, Select } from "antd";
import EmployeeName from "../EmployeeName";

const CreateUserModal = props => {
    const { modalVisible, setModalVisible, users, departments, leaveTypes } = props;
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();
    const { Option } = Select;

    form.setFieldsValue({
        fname: "",
        lname: "",
        email: "",
        department: "",
        manager: "",
        employees: [],
        is_adming: false,
    });

    return (
        <Modal
            visible={modalVisible}
            title="New New User"
            okText="Create"
            getContainer={false}
            onOk={() => {}}
            onCancel={() => {
                setModalVisible(false);
            }}>
            <Form form={form} labelCol={{ span: 3 }} size="large">
                <Form.Item
                    name="fname"
                    label="First Name:"
                    rules={[{ required: true, message: "Please input first name!" }]}>
                    <input />
                </Form.Item>
                <Form.Item
                    name="lname"
                    label="Last Name:"
                    rules={[{ required: true, message: "Please input last name!" }]}>
                    <input />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email:"
                    rules={[
                        { required: true, message: "Please input an email!" },
                        { type: "email", message: "Please input a valid email address!" },
                    ]}>
                    <input />
                </Form.Item>
                <Form.Item
                    name="department"
                    lable="Department:"
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
                                <Option key={lt["_id"]} value={lt["_id"]} name={lt["name"]}>
                                    {lt["name"]}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
                <Form.Item>
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
            </Form>
        </Modal>
    );
};

export default CreateUserModal;
