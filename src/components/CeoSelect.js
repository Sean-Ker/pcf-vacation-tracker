import React, { useEffect, useState } from "react";
import { Select, Spin, Typography } from "antd";
import EmployeeName from "./EmployeeName";
import axios from "../api/axios";

const { Option } = Select;

const CeoSelect = ({ ceoId, setCeoId, users }) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get("/companies").then(res => {
            const companyRes = res["data"][0];
            setCompany(companyRes);
            setCeoId(companyRes["ceo_id"]);
            setLoading(false);
        });
    }, [setCeoId]);

    if (loading) {
        return (
            <div style={{ textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ marginBottom: "8px" }}>
            <Typography.Text>CEO: </Typography.Text>
            <Select
                showSearch
                allowClear
                style={{ width: "260px" }}
                loading={loading}
                placeholder={`Select the CEO of ${company["name"]}`}
                optionFilterProp="children"
                onChange={value => {
                    setCeoId(value);
                    axios.put("/companies", { name: company["name"], ceo_id: value });
                }}
                defaultValue={ceoId}
                filterOption={(input, option) =>
                    option.name.toLowerCase().indexOf(input.toLowerCase()) > -1
                }>
                {users.map(u => (
                    <Option name={u["fname"] + " " + u["lname"]} key={u["_id"]} value={u["_id"]}>
                        <EmployeeName
                            fname={u["fname"]}
                            lname={u["lname"]}
                            country_code={u["country_id"]}
                        />
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default CeoSelect;
