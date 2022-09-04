import React, { useState } from "react";
import { Modal, Input, Form, Checkbox, InputNumber, Typography } from "antd";
import { TwitterPicker } from "react-color";
import axios from "../../axios";

const CreateLeaveTypeModal = ({ modalVisible, setModalVisible }) => {
    const [form] = Form.useForm();
    const [color, setColor] = useState("#FF6900");

    return (
        <Modal
            visible={modalVisible}
            title="New Leave Type"
            okText="Create"
            getContainer={false}
            onOk={() => {
                form.validateFields()
                    .then(async values => {
                        const formValues = { ...values, color: color };
                        await axios.post("/leave_types", formValues);
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
            <Form
                form={form}
                name="modalForm"
                // labelCol={{ span: 8 }}
                // wrapperCol={{ span: 16 }}
                initialValues={{
                    name: "",
                    default_value: 0,
                    rolled_over: true,
                    needs_approval: true,
                    reason_required: true,
                }}
                autoComplete="off">
                <Form.Item
                    name="name"
                    label="Leave Type Name:"
                    rules={[{ required: true, message: "Please input department name!" }]}>
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
                <Typography.Title level={3}>Color</Typography.Title>
                <TwitterPicker color={color} onChangeComplete={color => setColor(color.hex)} />
            </Form>
        </Modal>
    );
};

export default CreateLeaveTypeModal;
