import { Button, Form, Input, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import axios from "../../axios";
import { UsersContext } from "../../Contexts";
import Container from "../Container";
import EditRuleGroupModal from "../Modals/EditRuleGroupModal";
import RuleGroups from "../RuleGroups";

const AdminRuleGroups = () => {
    const [ruleGroups, setRuleGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitCount, setSubmitCount] = useState(0);
    const [ruleGroup, setRuleGroup] = useState(null);

    // const { users } = useContext(UsersContext);

    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            const rulesGroupsRes = await axios.get("/rule_groups");
            setRuleGroups(rulesGroupsRes["data"]);
            setLoading(false);
        };
        fetchData();
    }, [form, submitCount, ruleGroup]);

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
            <RuleGroups
                ruleGroup={ruleGroup}
                setRuleGroup={setRuleGroup}
                ruleGroups={ruleGroups}
                renderActions={true}
            />
            {ruleGroup && <EditRuleGroupModal ruleGroup={ruleGroup} setRuleGroup={setRuleGroup} />}
        </Container>
    );
};

export default AdminRuleGroups;
