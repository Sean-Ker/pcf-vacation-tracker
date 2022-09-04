import React, { useContext, useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { IdentityContext } from "../Contexts";
import axios from "../axios";
import LoadingScreen from "./LoadingScreen";
import { renderBoolean, renderLeaveType } from "../utils/renderUtils";

const columns = [
    {
        align: "center",
        title: "Leave Type",
        dataIndex: "leave_type",
        key: "leave_type",
        render: (text, record) => renderLeaveType(record.leave_type),
    },
    { align: "center", title: "Remaining Days", dataIndex: "days_left", key: "days_left" },
    {
        align: "center",
        title: "Days Given per Year",
        dataIndex: "days_per_year",
        key: "days_per_year",
    },
    {
        align: "center",
        title: "Unused Days Rollover",
        dataIndex: "unused_days_rollover",
        key: "unused_days_rollover",
        render: (text, record) => renderBoolean(record.unused_days_rollover),
    },
    {
        align: "center",
        title: "Reason Required",
        dataIndex: "reason_required",
        key: "reason_required",
        render: (text, record) => renderBoolean(record.reason_required),
    },
];

const LeaveStatsTable = ({ user }) => {
    const { user: loginUser } = useContext(IdentityContext);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const leaveTypesRes = await axios.get("/leave_types");
            setLeaveTypes(leaveTypesRes.data);
            setLoading(false);
        };
        fetchData();
    }, [setLoading]);

    if (loading) {
        return <LoadingScreen />;
    }

    // get the keys of a dictionary and convert to array
    const data = [];
    for (let key in user.leaves) {
        const leave = user.leaves[key];
        const leave_type = leaveTypes.find(lt => lt._id.$oid === key);
        const unused_days_rollover = leave_type.rolled_over;

        const days_this_year = leave["days_this_year"];
        const days_per_year = leave["days_per_year"];
        const days_taken = 0;
        const reason_required = leave_type["reason_required"];

        data.push({
            key: key,
            leave_type: leave_type,
            days_left: days_this_year,
            days_taken: 0,
            days_per_year: days_per_year,
            reason_required: reason_required,
            unused_days_rollover: unused_days_rollover,
        });
    }

    return <Table bordered columns={columns} dataSource={data} pagination={false} />;
};

export default LeaveStatsTable;
