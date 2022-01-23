import React, { useEffect, useState } from "react";
import { Form, Button, Input, Spin, Typography, Select, message } from "antd";
import Container from "../components/Container";
import axios from "../api/axios";
import CountryName from "../components/CountryName";
import { PasswordInput } from "antd-password-input-strength";
import { Link } from "react-router-dom";

const Register = () => {
    const [user, setUser] = useState(null);
    const [allLocations, setAllLocations] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(0);
    const [formLoading, setFormLoading] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(false);

    const [form] = Form.useForm();
    const { Option } = Select;

    const url_array = window.location.href.split("/");
    const uuid = url_array[url_array.length - 1];

    useEffect(() => {
        setLoading(prevLoading => prevLoading + 1);
        axios
            .get("/locations")
            .then(res => {
                setAllLocations(res["data"]);
                setLoading(prevLoading => prevLoading - 1);
            })
            .catch(res => {
                setError(res["response"]["data"]);
                setLoading(prevLoading => prevLoading - 1);
            });
        axios
            .get("/users/uuid/" + uuid)
            .then(res => {
                const userRes = res["data"];
                setUser(userRes);
                setLoading(prevLoading => prevLoading - 1);

                form.setFieldsValue({
                    name: userRes["fname"] + " " + userRes["lname"],
                    email: userRes["email"],
                    location: "",
                });
            })
            .catch(res => {
                setError(res["response"]["data"]);
                setLoading(prevLoading => prevLoading - 1);
            });
    }, []);

    if (registeredUser) {
        debugger;
        return (
            <Container>
                <br />
                <Typography.Title level={2} type="success">
                    Thank you for registering. You may login now:
                </Typography.Title>
                <br />

                <Button href="/login" type="primary" size="large">
                    Login
                </Button>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <br />
                <Typography.Title level={2} type="danger">
                    {error}
                </Typography.Title>
            </Container>
        );
    }

    if (loading >= 0)
        return (
            <div style={{ textAlign: "center", padding: "130px 50px" }}>
                <Spin size="large" />
            </div>
        );

    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 8,
            },
            md: {
                span: 8,
                offset: 1,
            },
        },
    };

    return (
        <Container>
            {JSON.stringify(user)}
            <Typography.Title>Finish Setting up Your Account</Typography.Title>
            <Form
                form={form}
                name="form"
                autoComplete="false"
                labelCol={{ span: 4 }}
                onFinish={() =>
                    form.validateFields().then(values => {
                        console.log(values);
                        setFormLoading(true);
                        const submitValues = {
                            username: values["username"],
                            password: values["password"],
                            country_id: values["location"],
                        };
                        axios
                            .put(`/users/uuid/${uuid}`, submitValues)
                            .then(res => {
                                message.success(res["data"]);
                                setRegisteredUser(true);
                            })
                            .catch(res => {
                                message.error(res["response"]["data"]);
                            })
                            .finally(() => setFormLoading(false));
                    })
                }>
                <Form.Item name="name" label="Name:" {...tailFormItemLayout}>
                    <Input disabled style={{ width: "300px" }} />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="E-mail"
                    {...tailFormItemLayout}
                    rules={[
                        {
                            type: "email",
                            message: "The input is not valid E-mail!",
                        },
                    ]}>
                    <Input disabled style={{ width: "300px" }} />
                </Form.Item>
                <Form.Item
                    name="username"
                    label="Username"
                    {...tailFormItemLayout}
                    rules={[
                        {
                            required: true,
                            message: "Please input your username!",
                        },
                        { min: 4, message: "Username must be minimum 4 characters." },
                        {
                            pattern: new RegExp(/^[a-zA-Z0-9]+$/),
                            message: "Username must only contain numbers and letters!",
                        },
                    ]}>
                    <Input style={{ width: "300px" }} />
                </Form.Item>
                <Form.Item
                    {...tailFormItemLayout}
                    name="location"
                    label="Where are you located:"
                    rules={[
                        {
                            required: true,
                            message: "Please input choose your location!",
                        },
                    ]}>
                    <Select
                        showSearch
                        allowClear
                        style={{ width: "300px" }}
                        filterOption={(input, option) =>
                            option.name.toLowerCase().indexOf(input.toLowerCase()) > -1 ||
                            option.value.toLowerCase().indexOf(input.toLowerCase()) > -1
                        }>
                        {allLocations
                            .sort((a, b) => (a["name"] > b["name"] ? 1 : -1))
                            .map(lt => (
                                <Option key={lt["_id"]} value={lt["_id"]} name={lt["name"]}>
                                    {<CountryName id={lt["_id"]} countries={allLocations} />}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    {...tailFormItemLayout}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: "Please input your password!",
                        },
                        {
                            pattern: new RegExp(
                                "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})"
                            ),
                            message:
                                "Password must contian at least 6 characters, a small letter, capital letter, digit and a special symbol!",
                        },
                    ]}>
                    <PasswordInput style={{ width: "300px" }} />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    label="Confirm Password"
                    dependencies={["password"]}
                    hasFeedback
                    {...tailFormItemLayout}
                    rules={[
                        {
                            required: true,
                            message: "Please confirm your password!",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }

                                return Promise.reject(
                                    new Error("The two passwords that you entered do not match!")
                                );
                            },
                        }),
                    ]}>
                    <Input.Password style={{ width: "300px" }} />
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button
                        block
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={formLoading}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Container>
    );
};

export default Register;
