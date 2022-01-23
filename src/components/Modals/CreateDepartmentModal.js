import React from "react";
import { Modal, Input, Form } from "antd";
import { createNewDepartment } from "../../api/api";

const CreateDepartmentModal = ({ modalVisible, setModalVisible }) => {
    const [form] = Form.useForm();

    return (
        <Modal
            visible={modalVisible}
            title="New Department"
            okText="Create"
            getContainer={false}
            onOk={() => {
                // console.log("form values", form.getFieldsValue());
                form.validateFields()
                    .then(async values => {
                        await createNewDepartment(values["name"]);
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
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ name: "" }}
                autoComplete="off">
                <Form.Item
                    label="Department Name:"
                    name="name"
                    rules={[{ required: true, message: "Please input department name!" }]}>
                    <Input size="large" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateDepartmentModal;
