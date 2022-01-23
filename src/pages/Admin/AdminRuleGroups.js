import { Form, Input, Typography, Button, List, Card, Skeleton } from "antd";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import Container from "../../components/Container";
import EmployeeName from "../../components/EmployeeName";
import EditRuleGroupModal from "../../components/Modals/EditRuleGroupModal";

const AdminRuleGroups = () => {
    const [ruleGroups, setRuleGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitCount, setSubmitCount] = useState(0);
    const [users, setUsers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [ruleGroup, setRuleGroup] = useState(null);

    const [form] = Form.useForm();

    useEffect(() => {
        setLoading(true);
        axios.get("/rule_groups").then(response => {
            setRuleGroups(response["data"]);
        });
        axios.get("/users").then(res => {
            setUsers(res["data"]);
            setLoading(false);
        });
    }, [form, submitCount, modalVisible]);

    return (
        <Container>
            <Typography.Title>Rule Groups</Typography.Title>
            <Form
                form={form}
                layout="inline"
                name="ruleGroup"
                onFinish={() => {
                    // console.log("form values", form.getFieldsValue());
                    form.validateFields().then(async values => {
                        await axios.post("/rule_groups", values);
                        form.resetFields();
                        setSubmitCount(prevCount => prevCount + 1);
                    });
                }}
                initialValues={{ name: "" }}
                autoComplete="off">
                <Form.Item
                    label="Rule Group Name:"
                    name="name"
                    rules={[{ required: true, message: "Please input rule group name!" }]}>
                    <Input size="large" style={{ width: 300 }} />
                </Form.Item>
                <Form.Item name="submitBtn">
                    <Button
                        block={true}
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}>
                        Create
                    </Button>
                </Form.Item>
            </Form>
            <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
                dataSource={ruleGroups}
                loading={loading}
                renderItem={item => (
                    <Card
                        style={{
                            margin: "10px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            textAlign: "center",
                            marginTop: 12,
                            fontWeight: "bold",
                        }}
                        title={item.name}
                        hoverable={true}
                        actions={[
                            <Button
                                type="link"
                                onClick={() => {
                                    setRuleGroup(item);
                                    setModalVisible(true);
                                }}>
                                edit
                            </Button>,
                        ]}>
                        <List
                            dataSource={users.filter(u => item["employee_ids"].includes(u["_id"]))}
                            renderItem={employee => (
                                <List.Item>
                                    <Link
                                        to={`/user/${employee.username}`}
                                        style={{ textDecoration: "none" }}>
                                        <EmployeeName
                                            fname={employee["fname"]}
                                            lname={employee["lname"]}
                                            country_code={employee["country_id"]}
                                        />
                                    </Link>
                                </List.Item>
                            )}></List>
                    </Card>
                )}
            />
            {ruleGroup && (
                <EditRuleGroupModal
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    users={users}
                    ruleGroup={ruleGroup}
                />
            )}
        </Container>
    );
};

export default AdminRuleGroups;
