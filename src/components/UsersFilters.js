import React from "react";
import { Form, Select } from "antd";
import FilterUsersByManager from "./FilterUsersByManager";



const UsersFilters = ({
    users,
    setSelectedDepartments,
    selectedDepartments,
    departmentOptions,
    locationOptions,
    selectedLocations,
    setSelectedLocations,
    selectedManagerIds,
    setSelectedManagerIds,
}) => {


    return (
        <Form
            labelCol={{
                span: 2,
            }}
            wrapperCol={{
                span: 22,
            }}>
            <Form.Item label="Department">
                <Select
                    mode="multiple"
                    placeholder="Select Departments"
                    allowClear
                    style={{ display: "block", width: "100%" }}
                    defaultValue={selectedDepartments}
                    onChange={value => {
                        console.log(value);
                        setSelectedDepartments(value);
                    }}>
                    {departmentOptions}
                </Select>
            </Form.Item>
            <Form.Item label="Locations">
                <Select
                    mode="multiple"
                    placeholder="Select Locations"
                    allowClear
                    style={{
                        display: "block",
                        width: "100%",
                    }}
                    defaultValue={selectedLocations}
                    onChange={value => {
                        console.log(value);
                        setSelectedLocations(value);
                    }}>
                    {locationOptions}
                </Select>
            </Form.Item>
            <Form.Item label="Managers">
                {/* Create a FilterUsersByManager component and pass to it selectedManagers and setSelectedManagers */}
                <FilterUsersByManager
                    users={users}
                    selectedManagerIds={selectedManagerIds}
                    setSelectedManagerIds={setSelectedManagerIds}
                />
            </Form.Item>
        </Form>
    );
};

export default UsersFilters;
