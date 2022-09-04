import _ from "lodash";
import { Form as FormikForm, Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { Alert, Form, Image } from "react-bootstrap";
import { FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import axios from "../axios";
import { CountriesContext, IdentityContext, UsersContext } from "../Contexts";

const setJwt = (access_token, refresh_token) => {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
};

const validationSchema = yup.object({
    email: yup.string().required().min(8).email(),
    password: yup.string().required().min(6),
});

export default function Login({ logout }) {
    const { user, setUser } = useContext(IdentityContext);
    const { users, setUsers } = useContext(UsersContext);
    const { countries, setCountries } = useContext(CountriesContext);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    // status is either null -> no msg displayed, true -> logging in or false -> error.

    // useEffect(() => {

    // }, [user, setUser, setUsers, logout, navigate]);

    debugger;
    if (logout) {
        console.log("logging out...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
        setUsers([]);
        navigate("/login");
        return;
    }

    if (user) {
        navigate("/");
        return;
    }

    return (
        <div style={{ width: "100%", maxWidth: "330px", padding: "15px", margin: "auto" }}>
            <Image fluid className="mb-4" src={"/pcf_logo.png"} alt="pcf_logo" />
            <h1 className="mb-3 h3 fw-normal">Please Sign In</h1>
            <Formik
                validateOnChange={true}
                initialValues={{ email: "skernitsman@pcfsouvenirs.com", password: "sk5352" }}
                validationSchema={validationSchema}
                onSubmit={async ({ email, password }, { setSubmitting, resetForm }) => {
                    let body = JSON.stringify({
                        email: email,
                        password: password,
                    });
                    debugger;

                    try {
                        const response = await axios.post("/auth/login", body, {
                            headers: {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Origin": "*",
                            },
                        });
                        const { access_token, refresh_token } = response.data;
                        setJwt(access_token, refresh_token);

                        const user_req = await axios.get("/auth/me");
                        const users_req = await axios.get("/users");
                        const countries_req = await axios.get("/locations");

                        setUser(user_req.data);
                        setUsers(users_req.data);
                        setCountries(countries_req.data);

                        setSubmitting(false);
                        resetForm();
                        navigate("/");
                    } catch (error) {
                        debugger;
                        setError(_.get(error, "response.data.errror", error.message));
                        setSubmitting(false);
                        resetForm();
                    }
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
                            className="w-100 btn btn-lg btn-primary"
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
