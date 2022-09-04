import React, { useEffect, useState } from "react";
import { Select, Spin, Typography, Form } from "antd";
import EmployeeName from "./EmployeeName";
import axios from "../axios";
import LoadingScreen from "./LoadingScreen";

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
        return <LoadingScreen />;
    }

    return (
        <Form>
            {/* <Typography.Text>Select the CEO: </Typography.Text>{" "} */}
            <Form.Item label={`Select the CEO of ${company["name"]}`}>
                <Select
                    showSearch
                    allowClear
                    loading={loading}
                    // placeholder={`Select the CEO of ${company["name"]}`}
                    optionFilterProp="children"
                    onChange={value => {
                        if (value) {
                            setCeoId(value);
                            axios.put("/companies", { name: company["name"], ceo_id: value });
                        }
                    }}
                    defaultValue={ceoId}
                    filterOption={(input, option) =>
                        option.name.toLowerCase().indexOf(input.toLowerCase()) > -1
                    }>
                    {users.map(u => (
                        <Option
                            label={u["fname"] + " " + u["lname"]}
                            name={u["fname"] + " " + u["lname"]}
                            key={u["_id"]}
                            value={u["_id"]}>
                            <EmployeeName
                                fname={u["fname"]}
                                lname={u["lname"]}
                                country_code={u["country_id"]}
                            />
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );
};

export default CeoSelect;
