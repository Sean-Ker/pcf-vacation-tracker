import React, { useState, useEffect } from "react";
import { Modal, Input, Form, Checkbox, InputNumber, Typography, Popover, Button } from "antd";
import { TwitterPicker } from "react-color";
import axios from "../../axios";

const EditLeaveTypeModal = ({ leaveType, modalVisible, setModalVisible }) => {
    const [form] = Form.useForm();
    const [color, setColor] = useState("#FF6900");

    useEffect(() => {
        leaveType && setColor(leaveType["color"]);
        leaveType &&
            form.setFieldsValue({
                name: leaveType["name"],
                default_value: leaveType["default_value"],
                rolled_over: leaveType["rolled_over"],
                needs_approval: leaveType["needs_approval"],
                reason_required: leaveType["reason_required"],
            });
    }, [leaveType, form]);

    if (!leaveType) {
        return <div></div>;
    }

    return (
        <Modal
            visible={modalVisible}
            title={`Edit ${leaveType["name"]}`}
            okText="Save"
            getContainer={false}
            onOk={() => {
                form.validateFields()
                    .then(async values => {
                        const formValues = { ...values, color: color };
                        console.log(formValues);
                        debugger;
                        await axios.put(`/leave_types/${leaveType["key"]}`, formValues);
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
            <Typography.Title level={2}>Leave Type Info</Typography.Title>
            <Form form={form} name="modalForm" autoComplete="off">
                <Form.Item
                    label="Leave Type Name:"
                    name="name"
                    rules={[{ required: true, message: "Please input leave type name!" }]}>
                    <Input size="large" />
                </Form.Item>
                <Form.Item
                    name="default_value"
                    label="Default Number of Days per Year:"
                    rules={[{ required: true, message: "Please input number of days!" }]}>
                    <InputNumber min={0} max={99} />
                </Form.Item>
                <Form.Item valuePropName="checked" name="rolled_over">
                    <Checkbox>Rolls Over to Next Year</Checkbox>
                </Form.Item>
                <Form.Item valuePropName="checked" name="needs_approval">
                    <Checkbox>Needs Approval</Checkbox>
                </Form.Item>
                <Form.Item valuePropName="checked" name="reason_required">
                    <Checkbox>Reason Required</Checkbox>
                </Form.Item>
                <Typography.Title level={2}>Color</Typography.Title>
                <TwitterPicker color={color} onChangeComplete={color => setColor(color.hex)} />
                <Popover
                    content={`Warning: It would delete all employees data with ${leaveType["name"]}!`}>
                    <Button
                        danger
                        block
                        onClick={async () => {
                            await axios.patch(`/leave_types/${leaveType["key"]}`);
                            setModalVisible(false);
                        }}>
                        Delete {leaveType["name"]}
                    </Button>
                </Popover>
            </Form>
        </Modal>
    );
};

export default EditLeaveTypeModal;
