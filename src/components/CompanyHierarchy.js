import React, { useState } from "react";
import { Tree, Input } from "antd";
import EmployeeName from "./EmployeeName";
import { Link } from "react-router-dom";
import _ from "lodash";

const { Search } = Input;

function generateTreeData(users, root, searchValue) {
    let data = {
        title: root["username"] ? (
            <Link to={`/user/${root["username"]}`} style={{ textDecoration: "none" }}>
                <EmployeeName
                    fname={root["fname"]}
                    lname={root["lname"]}
                    country_code={root["country_id"]}
                    style={
                        searchValue !== "" &&
                        `${root["fname"]} ${root["lname"]}`
                            .toLowerCase()
                            .indexOf(searchValue.toLowerCase()) > -1
                            ? { color: "#f50" }
                            : {}
                    }
                />
            </Link>
        ) : (
            <span>{`${root["fname"]} ${root["lname"]}`}</span>
        ),
        name: `${root["fname"]} ${root["lname"]}`,
        key: root["_id"],
        disabled: !root.is_active,
    };
    if (!root.employees || root.employees.length === 0) {
        return data;
    }
    data["children"] = [];
    for (let employee_id of root.employees) {
        if (employee_id === root["_id"]) continue;
        const employee = users.filter(u => u["_id"] === employee_id)[0];
        if (employee === undefined) {
            debugger;
        }
        data["children"].push(generateTreeData(users, employee, searchValue));
    }
    return data;
}

const CompanyHierarchy = ({ users }) => {
    const [searchValue, setSearchValue] = useState("");
    const [expandedKeys, setExpandedKeys] = useState();
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const root_nodes = users.filter(u => !_.get(u, "manager_id", null));
    const treeData = root_nodes.map(node => generateTreeData(users, node, searchValue));

    const dataList = [];
    const generateList = data => {
        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            const { key, name } = node;
            dataList.push({ key, name: name });
            if (node.children) {
                generateList(node.children);
            }
        }
    };
    generateList(treeData);

    const getParentKey = (key, tree) => {
        let parentKey;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some(item => item.key === key)) {
                    parentKey = node.key;
                } else if (getParentKey(key, node.children)) {
                    parentKey = getParentKey(key, node.children);
                }
            }
        }
        return parentKey;
    };

    const onExpand = expandedKeys => {
        setExpandedKeys(expandedKeys);
        setAutoExpandParent(false);
    };

    const onSearchChange = e => {
        const { value } = e.target;
        if (value === "") {
            setExpandedKeys([]);
            setSearchValue(value);
            setAutoExpandParent(true);
        }
        const expandedKeys = dataList
            .map(item => {
                if (item.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    return getParentKey(item.key, treeData);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        // console.log(expandedKeys);
        setExpandedKeys(expandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };

    return (
        <>
            {/* {JSON.stringify(treeData)} */}
            <Input.Group compact>
                <Search
                    style={{ marginBottom: 8 }}
                    placeholder="Search Employee"
                    onChange={onSearchChange}
                    value={searchValue}
                />
                <Tree
                    treeData={treeData}
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                />
            </Input.Group>
        </>
    );
};

export default CompanyHierarchy;
