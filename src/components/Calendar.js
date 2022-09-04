import _ from "lodash";
import moment from "moment";
import { useContext, useState } from "react";
import Timeline, {
    CursorMarker,
    DateHeader,
    SidebarHeader,
    TimelineHeaders,
    TimelineMarkers,
    TodayMarker,
} from "react-calendar-timeline";
import { Link } from "react-router-dom";
import { IdentityContext, UsersContext } from "../Contexts";
import { renderStatus } from "../utils/renderUtils";
import textColorFromBg from "../utils/textColorFromBg";
import titleCase from "../utils/titleCase";
import EmployeeName from "./EmployeeName";
import LeaveModal from "./Modals/LeaveModal";

// Destracture selectedUsers and rename it to users:
const Calendar = ({ leaves, leaveTypes, selectedUsers }) => {
    const { user } = useContext(IdentityContext);
    const { users } = useContext(UsersContext);
    const [leave, setLeave] = useState(null);

    moment.locale("en", {
        week: {
            dow: 1,
        },
    });

    const itemRenderer = ({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
        return (
            <div
                {...getItemProps({
                    style: {
                        background: item.background,
                        color: item.color,
                        borderColor: item.color,
                        opacity: 0.9,
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        borderStyle: "solid",
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                    onMouseDown: () => {
                        const selectedLeave = leaveRequests.find(leave => leave._id === item._id);
                        console.log(JSON.stringify(selectedLeave, null, 2));
                        setLeave(selectedLeave);
                    },
                })}>
                {item.title} ({titleCase(item.status)})
            </div>
        );
    };

    const defaultTimeStart = moment().startOf("week").toDate();
    const defaultTimeEnd = moment().startOf("week").add(1, "week").toDate();

    const groups = selectedUsers
        .filter(u => u["is_active"])
        .map(u => ({
            id: u["_id"],
            title: (
                <Link
                    to={`/user/${u.username}`}
                    style={{
                        textDecoration: "none",
                        color: u ? (u["_id"] === user["_id"] ? "IndianRed" : "") : "",
                    }}>
                    <EmployeeName fname={u.fname} lname={u.lname} country_code={u.country_id} />
                </Link>
            ),
        }));

    const leaveRequests = [];
    for (const leave of leaves) {
        const leave_type_name = leave.leave_type;
        const days = moment(leave.end_date).diff(moment(leave.start_date), "days") + 1;

        const requester = users.find(u =>
            Object.keys(_.get(u, "leave_requests", {})).includes(leave._id)
        );
        // const manager = users.find(u => u._id === _.get(requester, "manager_id", ""));

        leaveRequests.push({
            ...leave,
            _id: leave._id,
            id: leave._id,
            key: leave._id,
            group: requester["_id"],
            status: leave.status,
            title: leave.leave_type.name,
            start_time: moment(leave["start_date"]).toDate(),
            end_time: moment(leave["end_date"]).add(1, "days").toDate(),
            background: leave.leave_type.color,
            color: textColorFromBg(leave.leave_type.color),
            requester: requester,
            leave_type: leave_type_name,
            start_date: leave.start_date,
            days: days,
            end_date: leave.end_date,
        });
    }

    debugger;
    console.log(JSON.stringify(leaveRequests, null, 2));
    return (
        <>
            <Timeline
                groups={groups}
                items={leaveRequests}
                showCursorLine
                itemsSorted
                fixedHeader="fixed"
                sidebarWidth={200}
                lineHeight={35}
                itemHeightRatio={0.75}
                canMove={false}
                canResize={false}
                canSelect={false}
                minZoom={1000 * 60 * 1440 * 7 * 1.5}
                maxZoom={1000 * 60 * 1440 * 31 * 1.5}
                timeSteps={{
                    second: 0,
                    minute: 0,
                    hour: 0,
                    day: 1,
                    month: 1,
                    year: 1,
                }}
                itemRenderer={itemRenderer}
                defaultTimeStart={defaultTimeStart}
                defaultTimeEnd={defaultTimeEnd}
                itemTouchSendsClick={false}>
                <TimelineHeaders className="headerSticky">
                    <SidebarHeader />
                    <DateHeader unit="primaryHeader" />
                    <DateHeader />
                    <TimelineMarkers>
                        <TodayMarker />
                        <CursorMarker />
                    </TimelineMarkers>
                </TimelineHeaders>
            </Timeline>
            {!_.isEmpty(leave) && (
                <LeaveModal leave={leave} setLeave={setLeave} leaveTypes={leaveTypes} />
            )}
        </>
    );
};

export default Calendar;
