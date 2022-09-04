import { Tag } from "antd";
import _ from "lodash";
import moment from "moment";
import { Link } from "react-router-dom";
import EmployeeName from "../components/EmployeeName";
import titleCase from "./titleCase";

const renderUser = user => (
    <Link to={`/user/${user.username}`}>
        <EmployeeName fname={user.fname} lname={user.lname} country_code={user.country_id} />
    </Link>
);

const renderStatus = status => {
    // const status_text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const status_text = _.isEmpty(status) ? "N/A" : titleCase(status);
    if (status === "OPEN") {
        return <Tag color="blue">{status_text}</Tag>;
    } else if (status === "APPROVED") {
        return <Tag color="green">{status_text}</Tag>;
    } else if (status === "REJECTED") {
        return <Tag color="red">{status_text}</Tag>;
    } else if (status === "CANCELLED") {
        return <Tag color="orange">{status_text}</Tag>;
    } else {
        return <Tag color="grey">{status_text}</Tag>;
    }
};

const renderLeaveType = leaveType => <Tag color={leaveType.color}>{leaveType.name}</Tag>;

const renderDate = date => moment(date).format("MMM Do, YYYY");

const renderBoolean = bool => {
    if (bool) {
        return <Tag color="green">Yes</Tag>;
    }
    return <Tag color="red">No</Tag>;
};

export { renderUser, renderStatus, renderLeaveType, renderDate, renderBoolean };
