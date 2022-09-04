import { Card, Col, Divider, Form, Input, Modal, Row, Switch, Typography } from "antd";
import _ from "lodash";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import axios from "../../axios";
import { IdentityContext, UsersContext } from "../../Contexts";
import { renderDate, renderLeaveType, renderStatus, renderUser } from "../../utils/renderUtils";
import LoadingScreen from "../LoadingScreen";
import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai";

const LeaveModal = ({ leave, setLeave, leaveTypes }) => {
    const { users, setUsers } = useContext(UsersContext);
    const { user: loginUser, setUser: setLoginUser } = useContext(IdentityContext);
    // const [user, setUser] = useState(null);
    const [loading, setLoading] = React.useState(false);

    const [form] = Form.useForm();

    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true);
    //         const userRes = await axios.get(`/leave_requests/${leave._id}`);
    //         setUser(userRes["data"]);
    //         setLoading(false);
    //     };
    //     fetchData();
    // }, [leave._id]);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        const values = await form.validateFields();
        // const res = await axios.put(`/leaves/${leave.id}`, leave);
        // setLeave(res.data);
        setLoading(false);
    };

    const handleCancel = () => {
        setLeave(null);
    };

    if (loading) {
        return (
            <Modal
                width={800}
                visible={!_.isEmpty(leave)}
                confirmLoading={loading}
                title={<Typography.Title level={4}>Loading User's Leave...</Typography.Title>}
                okText="Save"
                getContainer={false}>
                <LoadingScreen />
            </Modal>
        );
    }
    const user = leave.requester;
    const manager = users.find(u => u["_id"] === user["manager_id"]);
    const leaveType = leave.leave_type;
    const canRespond = user.employees.includes(loginUser["_id"]) || loginUser.is_admin;

    if (_.isEmpty(leave) || _.isEmpty(user)) {
        return null;
    }

    const responseForm = (
        <Card bordered>
            <Typography.Title level={3}>Respond to {user.fname}'s Request</Typography.Title>

            <Form form={form} onFinish={handleSubmit} labelCol={{ span: 4 }}>
                <Form.Item label="Approve Request" name="approve" valuePropName="checked">
                    <Switch
                        checkedChildren={<AiOutlineCheck />}
                        unCheckedChildren={<AiOutlineClose />}
                        defaultChecked
                    />
                </Form.Item>
                <Form.Item label="Response" name="response">
                    <Input.TextArea rows={3} />
                </Form.Item>
                {/* <Divider>
                Days Missing:
            </Divider> */}
            </Form>
        </Card>
    );

    const basicDetails = (
        <>
            <Typography.Title level={3}>Leave Request Details</Typography.Title>
            <Row justify="space-between">
                <Col span={12}>
                    <Form labelCol={{ span: 8 }} autoComplete="off">
                        <Form.Item label="Requested By">{renderUser(user)}</Form.Item>
                        <Form.Item label="Leave Type">
                            {renderLeaveType(leave.leave_type)}
                        </Form.Item>
                        <Form.Item label="Start Date">{renderDate(leave.start_date)}</Form.Item>
                        <Form.Item label="Total Leave Days">
                            {moment(leave.end_date).diff(moment(leave.start_date), "days") + 1}
                        </Form.Item>
                        <Form.Item label="Reason">{_.get(leave, "reason", "N/A")}</Form.Item>
                    </Form>
                </Col>
                <Col span={12}>
                    <Form labelCol={{ span: 8 }} autoComplete="off">
                        <Form.Item label="Manager">{renderUser(manager)}</Form.Item>
                        <Form.Item label="Status">{renderStatus(leave.status)}</Form.Item>
                        <Form.Item label="End Date">{renderDate(leave.end_date)}</Form.Item>
                        <Form.Item label="Leave Balance">
                            {leave.requester.leaves[leaveType._id.$oid].days_this_year}
                        </Form.Item>
                        <Form.Item label="Requested On">
                            {moment(leave.request_date).format("MMMM Do YYYY, h:mma")}
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </>
    );

    const additionalDetails = (
        <>
            <Divider>Additional Details</Divider>
        </>
    );

    return (
        <Modal
            width={800}
            visible={!_.isEmpty(leave)}
            confirmLoading={loading}
            title={
                <Typography.Title level={4}>
                    {user.fname}'s {leave.leave_type.name} Leave
                </Typography.Title>
            }
            okText="Save"
            getContainer={false}
            onOk={handleSubmit}
            onCancel={handleCancel}>
            {/* ========================== Response Form ========================== */}
            {canRespond && responseForm}
            {/* ========================== Leave Request Details ========================== */}
            {basicDetails}

            {/* ========================== Additional Details ========================== */}
            {leave.status !== "OPEN" && additionalDetails}

            <pre>{JSON.stringify(leave, null, 2)}</pre>
        </Modal>
    );
};

export default LeaveModal;
