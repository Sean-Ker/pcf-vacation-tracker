import {
    Alert,
    Card,
    Checkbox,
    Typography,
    Form,
    Input,
    InputNumber,
    List,
    message,
    Modal,
    Select,
    Col,
    Row,
} from "antd";
import { useContext, useEffect, useState } from "react";
import axios from "../../axios";
import { UsersContext } from "../../Contexts";
import { renderUser } from "../../utils/renderUtils";
import EmployeeName from "../EmployeeName";
const _ = require("lodash");

const EditUserModal = props => {
    const { user, setUser, departments, leaveTypes } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ visible: false, message: "" });
    const { users, setUsers } = useContext(UsersContext);

    const [form] = Form.useForm();
    const { Option } = Select;

    const usersCopy = [...users];

    useEffect(() => {
        setError({ visible: false, message: "" });
        form.setFieldsValue({
            name: user["fname"] + " " + user["lname"],
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
            visible={!_.isEmpty(user)}
            title="Edit Employee"
            okText="Save"
            form={form}
            width={800}
            getContainer={false}
            loading={loading}
            okButtonProps={{ disabled: loading }}
            onOk={async () => {
                setLoading(true);
                try {
                    const values = await form.validateFields();

                    values["manager"] = _.get(values, "manager", null);
                    let axiosData = _.pick(values, ["employees", "leaves"]);
                    axiosData = {
                        ...axiosData,
                        department_id: values["department"],
                        manager_id: values["manager"],
                        is_admin: values["isAdmin"],
                    };
                    console.log(axiosData);
                    const usersRes = await axios.put(`users/${user["_id"]}`, axiosData);

                    message.success(
                        `Successfully edit ${axiosData["fname"]} ${axiosData["lname"]}'s information`
                    );
                    form.resetFields();
                    setUser(null);
                    setError({ visible: false, message: "" });
                    const allUsersRes = await axios.get("users");
                    setUsers(allUsersRes["data"]);
                } catch (res) {
                    setError({ visible: true, message: res["response"]["data"] });
                    setLoading(false);
                }
            }}
            onCancel={() => {
                setUser(null);
            }}>
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

            <Form form={form} labelCol={{ span: 10 }} size="large">
                <Row justify="space-between">
                    <Col span={12}>
                        <Typography.Title level={3}>General Information</Typography.Title>
                        <Form.Item name="name" label="Employee">
                            {renderUser(user)}
                        </Form.Item>
                        <Form.Item name="email" label="Email:">
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
                                {usersCopy
                                    .sort((a, b) =>
                                        a["fname"] + " " + a["lname"] >
                                        b["fname"] + " " + b["lname"]
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
                                {usersCopy
                                    .sort((a, b) =>
                                        a["fname"] + " " + a["lname"] >
                                        b["fname"] + " " + b["lname"]
                                            ? 1
                                            : -1
                                    )
                                    .map(lt => (
                                        <Option
                                            // disabled={lt["manager"] !== null}
                                            key={lt["_id"]}
                                            value={lt["_id"]}
                                            label={lt["fname"] + " " + lt["lname"]}
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
                        <Form.Item label="Admin Permissions" name="isAdmin" valuePropName="checked">
                            <Checkbox></Checkbox>
                        </Form.Item>
                    </Col>
                    <Col span={11}>
                        <Typography.Title level={3}>Leave Types</Typography.Title>
                        <List
                            dataSource={dataSource}
                            renderItem={item => (
                                <Card title={item["name"]} hoverable={false}>
                                    <Form.Item
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please pick a valid number",
                                            },
                                        ]}
                                        label="Days this year:"
                                        name={["leaves", item["key"], "days_this_year"]}>
                                        <InputNumber max={99} min={0} />
                                    </Form.Item>
                                    <Form.Item
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please pick a valid number",
                                            },
                                        ]}
                                        label="Days per year:"
                                        name={["leaves", item["key"], "days_per_year"]}>
                                        <InputNumber max={99} min={0} />
                                    </Form.Item>
                                </Card>
                            )}
                        />
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default EditUserModal;
