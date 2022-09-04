import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Layout, Menu, Space } from "antd";
import { FaRegBuilding, FaDoorOpen } from "react-icons/fa";
import { IoPeopleOutline } from "react-icons/io5";
import { BsFileEarmarkRuled } from "react-icons/bs";
import { RiFilePaper2Line } from "react-icons/ri";
import NotFound from "../NotFound";

const { Sider, Content } = Layout;

const AdminLayout = ({ isAuthorized }) => {
    const navigate = useNavigate();

    if (!isAuthorized) {
        navigate("/");
        return;
    }

    return (
        <>
            <Layout hasSider>
                <Sider
                    width={200}
                    className="site-layout-background"
                    style={{
                        overflow: "hidden",
                        height: "calc(100vh-70px)",
                        position: "fixed",
                        left: 0,
                        top: "70px",
                        bottom: 0,
                    }}>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={["1"]}
                        defaultOpenKeys={["sub1"]}>
                        <Menu.Item key="1">
                            <Link to="/admin/employees" style={{ textDecoration: "none" }}>
                                <IoPeopleOutline style={{ marginRight: "1em" }} />
                                Employees
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Link to="/admin/leave_types" style={{ textDecoration: "none" }}>
                                <FaDoorOpen style={{ marginRight: "1em" }} />
                                Leave Types
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Link to="/admin/departments" style={{ textDecoration: "none" }}>
                                <FaRegBuilding style={{ marginRight: "1em" }} />
                                Departments
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <Link to="/admin/rule_groups" style={{ textDecoration: "none" }}>
                                <BsFileEarmarkRuled style={{ marginRight: "1em" }} />
                                Rule Groups
                            </Link>
                        </Menu.Item>
                        {/* <Menu.Item key="5">
                            <Link to="/admin/logs" style={{ textDecoration: "none" }}>
                                <RiFilePaper2Line style={{ marginRight: "1em" }} />
                                Logs
                            </Link>
                        </Menu.Item> */}
                    </Menu>
                </Sider>
                <Layout style={{ marginLeft: 200 }}>
                    <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default AdminLayout;
