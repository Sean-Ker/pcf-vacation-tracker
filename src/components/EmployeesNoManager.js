import React from "react";
import { Divider, List, Card } from "antd";
import { Link as RouterLink } from "react-router-dom";
import EmployeeName from "./EmployeeName";

const EmployeesNoManager = ({ users, setSelectedUser }) => {
    return (
        <>
            <Divider orientation="left" style={{ fontWeight: "bold" }}>
                Employees with No Manager
            </Divider>
            {/* <Divider /> */}
            {/* <Typography.Title level={2}>Users with no Manager</Typography.Title> */}
            <List
                grid={{ xs: 1, sm: 2, md: 1, lg: 2, xl: 2, xxl: 2 }}
                dataSource={users}
                renderItem={user => (
                    <List.Item>
                        <div
                            onClick={e => {
                                setSelectedUser(user);
                            }}>
                            <Card
                                style={{
                                    margin: "0px 10px 10px 10px",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                }}
                                hoverable={true}
                                actions={["edit"]}>
                                <RouterLink
                                    to={`/user/${user.username}`}
                                    style={{ textDecoration: "none" }}>
                                    <EmployeeName
                                        fname={user.fname}
                                        lname={user.lname}
                                        country_code={user.country_id}
                                    />
                                </RouterLink>
                            </Card>
                        </div>
                    </List.Item>
                )}
            />
        </>
    );
};

export default EmployeesNoManager;
