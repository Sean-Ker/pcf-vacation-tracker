import { Table, Tag, Typography } from "antd";
import _ from "lodash";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";
import { IdentityContext, UsersContext } from "../Contexts";
import EmployeeName from "./EmployeeName";
import LoadingScreen from "./LoadingScreen";
import { renderUser, renderDate, renderStatus, renderLeaveType } from "../utils/renderUtils";
import LeaveModal from "./Modals/LeaveModal";

const LeavesTable = ({ leaves, hideCols = [] }) => {
    const [selectedLeave, setSelectedLeave] = useState(null); // Controls the visibility of the modal <LeaveModal />
    // const { user } = useContext(IdentityContext);
    const { users } = useContext(UsersContext);
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

    const columns = [
        {
            align: "center",
            title: "Requester",
            dataIndex: "requester",
            key: "requester",
            render: (text, record) => renderUser(record.requester),
        },
        {
            align: "center",
            title: "Manager",
            dataIndex: "manager",
            key: "manager",
            render: (text, record) => renderUser(record.manager),
        },
        {
            align: "center",
            title: "Leave Type",
            dataIndex: "leave_type",
            key: "leave_type",
            render: (text, record) => renderLeaveType(record.leave_type),
        },
        {
            align: "center",
            title: "Start Date",
            dataIndex: "start_date",
            key: "start_date",
            render: (text, record) => renderDate(text),
        },
        {
            align: "center",
            title: "End Date",
            dataIndex: "end_date",
            key: "end_date",
            render: (text, record) => renderDate(text),
        },
        { title: "Days Out of Office", dataIndex: "days", key: "days", align: "center" },
        {
            align: "center",
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (text, record) => renderStatus(text),
        },
        {
            align: "center",
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (text, record) => (
                <Typography.Link onClick={() => setSelectedLeave(record)}>View</Typography.Link>
            ),
        },
    ];

    if (!_.isEmpty(hideCols)) {
        columns.forEach(col => {
            if (hideCols.includes(col.dataIndex)) {
                col.hidden = true;
            }
        });
    }

    let data = [];
    for (let leave of _.sortBy(leaves, "start_date")) {
        // console.log(leave);
        const leave_type_name = leave.leave_type;
        const days = moment(leave.end_date).diff(moment(leave.start_date), "days") + 1;

        const requester = users.find(u =>
            Object.keys(_.get(u, "leave_requests", {})).includes(leave._id)
        );
        const manager = users.find(u => u._id === _.get(requester, "manager_id", ""));

        data.push({
            ...leave,
            _id: leave._id,
            key: leave._id,
            requester: requester,
            manager: manager,
            leave_type: leave_type_name,
            start_date: leave.start_date,
            days: days,
            end_date: leave.end_date,
            status: leave.status,
        });
    }

    return (
        <>
            <Table
                bordered={true}
                columns={columns.filter(c => !c.hidden)}
                dataSource={data}
                pagination={false}
            />
            {!_.isEmpty(selectedLeave) && (
                <LeaveModal
                    leave={selectedLeave}
                    setLeave={setSelectedLeave}
                    leaveTypes={leaveTypes}
                />
            )}
            {/* Leaves:
            <pre>{JSON.stringify(leaves, null, 2)}</pre> */}
        </>
    );
};

export default LeavesTable;
