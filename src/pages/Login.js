import React, { useState, useContext } from "react";
import { Image, Form, InputGroup, Alert } from "react-bootstrap";
import { Formik, Field, Form as FormikForm, useField, FieldAttributes } from "formik";
import * as yup from "yup";
import { setJwt } from "../api/api";
import { UserContext } from "../Contexts";
import { FaUser, FaLock } from "react-icons/fa";
import axios from "../api/axios";
// import { useNavigate } from "react-router";

export default function Login({ logout }) {
    const { user, setUser } = useContext(UserContext);
    const [error, setError] = useState("");
    // status is either null -> no msg displayed, true -> logging in or false -> error.

    const validationSchema = yup.object({
        email: yup.string().required().min(8).email(),
        password: yup.string().required().min(6),
    });

    if (logout) {
        // console.log("logging out...");
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.replace("/");
    }

    if (user !== null) {
        window.location.replace("/");
    }

    return (
        <div style={{ width: "100%", maxWidth: "330px", padding: "15px", margin: "auto" }}>
            <Image
                fluid
                className="mb-4"
                src={window.location.origin + "/pcf_logo.png"}
                alt="pcf_logo"
            />
            <h1 className="h3 mb-3 fw-normal">Please Sign In</h1>
            <Formik
                validateOnChange={true}
                initialValues={{ email: "skernitsman@pcfsouvenirs.com", password: "sk5352" }}
                validationSchema={validationSchema}
                onSubmit={async ({ email, password }, { setSubmitting, resetForm }) => {
                    let body = JSON.stringify({
                        email: email,
                        password: password,
                    });

                    return axios
                        .post("/auth/login", body, {
                            headers: {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json",
                            },
                        })
                        .then(response => {
                            // success login
                            // debugger;
                            setSubmitting(false);
                            response.data &&
                                setJwt(
                                    response.data["access_token"],
                                    response.data["refresh_token"]
                                );
                            window.location.replace("/");
                            // navigate("/");
                        })
                        .catch(error => {
                            // failed login
                            debugger;
                            console.log(error);
                            resetForm();
                            setSubmitting(false);
                            setError(
                                error["response"] !== undefined
                                    ? error.response.data["error"]
                                    : error["message"]
                            );
                            // setError("Unatuhtoir");
                        });
                }}>
                {({ values, errors, isSubmitting, handleBlur, handleChange }) => (
                    <FormikForm>
                        <Form.Group className="form-floating">
                            <Form.Control
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="form-control"
                                id="floatingInput"
                                placeholder="Email"
                                isInvalid={!!errors.email}
                            />
                            <Form.Label htmlFor="floatingInput vertical-align-middle">
                                <FaUser /> Email
                            </Form.Label>
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="form-floating">
                            <Form.Control
                                type="password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="form-control"
                                id="floatingPassword"
                                placeholder="Password"
                                isInvalid={!!errors.password}
                            />
                            <Form.Label htmlFor="floatingPassword">
                                <FaLock /> Password
                            </Form.Label>
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <button
                            disabled={isSubmitting}
                            className="w-100  btn btn-lg btn-primary"
                            type="submit">
                            Sign in
                        </button>

                        {error !== "" && (
                            <>
                                {/* <div>{error}</div> */}
                                <Alert
                                    variant="danger"
                                    onClose={() => setError("")}
                                    show={error !== ""}>
                                    <Alert.Heading>Error!</Alert.Heading>
                                    {error}
                                </Alert>
                            </>
                        )}
                        {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
                        {/* <pre>{JSON.stringify(errors, null, 2)}</pre> */}
                    </FormikForm>
                )}
            </Formik>
        </div>
    );
}
