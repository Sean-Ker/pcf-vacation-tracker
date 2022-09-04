import React, { useEffect, useState } from "react";
import { TreeSelect, Spin } from "antd";
import EmployeeName from "./EmployeeName";
import { Link } from "react-router-dom";

const { SHOW_PARENT } = TreeSelect;

function generateTreeData(users, root) {
    let data = {
        title: root["username"] ? (
            <Link to={`/user/${root["username"]}`} style={{ textDecoration: "none" }}>
                <EmployeeName
                    fname={root["fname"]}
                    lname={root["lname"]}
                    country_code={root["country_id"]}
                />
            </Link>
        ) : (
            <span>{`${root["fname"]} ${root["lname"]}`}</span>
        ),
        value: root["_id"],
        key: root["_id"],
    };

    if (!root.employees || root.employees.length === 0) {
        return data;
    }

    data["children"] = [];
    for (let employee_id of root.employees) {
        if (employee_id === root["_id"]) {
            continue;
        }
        const employee = users.filter(u => u["_id"] === employee_id)[0];
        if (!employee || !employee["employees"] || employee["employees"].length === 0) {
            // Check if the user is not a manager
            continue;
        }

        data["children"].push(generateTreeData(users, employee));
    }
    return data;
}

const FilterUsersByManager = ({ users, selectedManagerIds, setSelectedManagerIds }) => {
    const root_nodes = users.filter(u => u["manager_id"] === null);
    const treeData = root_nodes.map(node => generateTreeData(users, node));

    useEffect(() => {
        if (selectedManagerIds.length === 0) {
            setSelectedManagerIds(root_nodes.map(n => n["_id"]));
        }
    }, [root_nodes, setSelectedManagerIds, selectedManagerIds]);

    console.log(treeData);

    return (
        <TreeSelect
            treeCheckable
            showSearch
            allowClear
            treeData={treeData}
            value={selectedManagerIds}
            showCheckedStrategy={SHOW_PARENT}
            onChange={newVal => setSelectedManagerIds(newVal)}
            placeholder="Select Managers"
            style={{ width: "100%" }}
            // size="large"
        />
    );
};

export default FilterUsersByManager;
