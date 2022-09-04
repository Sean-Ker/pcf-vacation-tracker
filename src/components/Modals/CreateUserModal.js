import React, { useState, useEffect, useContext } from "react";
import { Modal, Form, message, Select, Checkbox, Alert, Input } from "antd";
import EmployeeName from "../EmployeeName";
import axios from "../../axios";
import { UsersContext } from "../../Contexts";
const _ = require("lodash");

const CreateUserModal = props => {
    const { modalVisible, setModalVisible, departments, leaveTypes } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ visible: false, message: "" });
    const { users, setUsers } = useContext(UsersContext);

    const [form] = Form.useForm();
    const { Option } = Select;

    useEffect(() => {
        setError({ visible: false, message: "" });
        form.setFieldsValue({
            fname: "",
            lname: "",
            email: "",
            department: "",
            manager: "",
            employees: [],
            isAdmin: false,
        });
    }, [form]);

    return (
        <Modal
            visible={modalVisible}
            title="Add New Employee"
            okText="Create"
            form={form}
            width={600}
            getContainer={false}
            loading={loading}
            okButtonProps={{ disabled: loading }}
            onOk={() => {
                form.validateFields()
                    .then(async values => {
                        setLoading(true);
                        if (values["manager"] === "") values["manager"] = null;
                        let axiosData = _.pick(values, ["fname", "lname", "email", "employees"]);
                        axiosData = {
                            ...axiosData,
                            department_id: values["department"],
                            manager_id: values["manager"],
                            is_admin: values["isAdmin"],
                        };

                        try {
                            await axios.post("/users", axiosData);
                            message.success(
                                `Successfully created user ${axiosData["fname"]} ${axiosData["lname"]}`
                            );
                            form.resetFields();
                            const allUsersRes = await axios.get("users");
                            setUsers(allUsersRes["data"]);
                            setModalVisible(false);
                            setError({ visible: false, message: "" });
                            setLoading(false);
                        } catch (res) {
                            setError({ visible: true, message: res["response"]["data"] });
                            setLoading(false);
                        }
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
                <Form.Item
                    name="fname"
                    label="First Name:"
                    rules={[{ required: true, message: "Please input first name!" }]}>
                    <Input size="large" />
                </Form.Item>
                <Form.Item
                    name="lname"
                    label="Last Name:"
                    rules={[{ required: true, message: "Please input last name!" }]}>
                    <Input size="large" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email:"
                    rules={[
                        { required: true, message: "Please input an email!" },
                        { type: "email", message: "Please input a valid email address!" },
                    ]}>
                    <Input size="large" />
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
                        {[...users]
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
                        {[...users]
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
            </Form>
        </Modal>
    );
};

export default CreateUserModal;
