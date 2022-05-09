import React, { useState, useContext, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { UserContext } from "../Contexts";
import { Link } from "react-router-dom";
import styles from "./Topbar.module.css";

export default function Topbar() {
    const { user } = useContext(UserContext);
    // console.log(JSON.stringify(user));
    // bg="light" fixed="top" expand="md"

    return (
        <Navbar expand="md" bg="dark" variant="dark" fixed="top">
            <Container fluid="md">
                <Navbar.Brand
                    href="/"
                    style={{ display: "flex", alignItems: "center", padding: 0 }}>
                    <img
                        alt="brand-logo"
                        className="d-inline-block align-top"
                        width="50"
                        height="50"
                        src={window.location.origin + "/logo.png"}
                    />{" "}
                    <span
                        style={{
                            marginLeft: 4,
                            fontFamily: "Poppins",
                            fontSize: "1.5rem",
                            fontWeight: 600,
                        }}>
                        Vacation Tracker
                    </span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="me-auto">
                        {user && (
                            <>
                                <Link to="/" className="nav-link">
                                    Calendar
                                </Link>
                                {user.employees.length > 0 && (
                                    <Link to="/managment" className="nav-link">
                                        Managment
                                    </Link>
                                )}
                                {user.is_admin && (
                                    <Link to="/admin" className="nav-link">
                                        Admin
                                    </Link>
                                )}
                            </>
                        )}
                    </Nav>
                    <Nav className="align-items-center">
                        {user ? (
                            <>
                                <Link
                                    to={`/user/${user.username}`}
                                    className="p-0 nav-link "
                                    style={{ marginRight: "1.5em" }}>
                                    Hello, {user.fname}!
                                </Link>
                                <Link to="/logout" className="nav-link">
                                    <Button variant="danger" size="md" className="btn-block">
                                        Logout
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Link to="/login" className="nav-link">
                                <Button size="md">Login</Button>
                            </Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
