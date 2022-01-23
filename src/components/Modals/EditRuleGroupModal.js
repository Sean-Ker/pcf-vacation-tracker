import React, { useEffect } from "react";
import { Modal, Form, Select, Button, Typography, Input, Popconfirm } from "antd";
import axios from "../../api/axios";
import EmployeeName from "../EmployeeName";

const { Option } = Select;

const EditRuleGroupModal = ({ modalVisible, setModalVisible, users, ruleGroup }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({ name: ruleGroup["name"], employees: ruleGroup["employee_ids"] });
    }, [form, ruleGroup]);

    return (
        <Modal
            width={600}
            visible={modalVisible}
            title={`Edit ${ruleGroup["name"]}`}
            okText="Save"
            getContainer={false}
            onOk={() => {
                form.validateFields()
                    .then(async values => {
                        await axios.put(`/rule_groups/${ruleGroup["_id"]["$oid"]}`, {
                            employee_ids: values["employees"],
                        });
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
            <Typography.Title level={2}>Rule Group Info</Typography.Title>
            <Form form={form} name="modalForm" autoComplete="off">
                <Form.Item
                    label="Rule Group Name:"
                    name="name"
                    rules={[{ required: true, message: "Please input rule group name!" }]}>
                    <Input size="large" />
                </Form.Item>
                <Form.Item label="Employees:" name="employees">
                    <Select
                        size="large"
                        allowClear
                        mode="multiple"
                        placeholder={`Select employees in ${ruleGroup["name"]}`}
                        filterOption={(input, option) =>
                            option.name.toLowerCase().indexOf(input.toLowerCase()) > -1
                        }>
                        {users.map(u => (
                            <Option
                                key={u["_id"]}
                                name={u["fname"] + " " + u["lname"]}
                                value={u["_id"]}
                                label={
                                    <EmployeeName
                                        fname={u["fname"]}
                                        lname={u["lname"]}
                                        country_code={u["country_id"]}
                                    />
                                }>
                                <EmployeeName
                                    fname={u["fname"]}
                                    lname={u["lname"]}
                                    country_code={u["country_id"]}
                                />
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
            <Popconfirm
                title="Are you sure to delete this rule group?"
                onConfirm={async () => {
                    await axios.patch(`/rule_groups/${ruleGroup["_id"]["$oid"]}`);
                    setModalVisible(false);
                }}
                okText="Yes"
                cancelText="No">
                <Button danger block>
                    Delete {ruleGroup["name"]}
                </Button>
            </Popconfirm>
        </Modal>
    );
};

export default EditRuleGroupModal;
