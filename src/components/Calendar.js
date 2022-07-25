import React, { useContext } from "react";
import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
    TimelineMarkers,
    CustomMarker,
    TodayMarker,
    CursorMarker,
} from "react-calendar-timeline";
import moment from "moment";
import { Link } from "react-router-dom";
import EmployeeName from "./EmployeeName";
import { IdentityContext, UsersContext } from "../Contexts";
import { pickTextColorBasedOnBgColor } from "../utils";

const itemRenderer = ({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
    return (
        <div
            {...getItemProps({
                style: {
                    background: item.background,
                    color: item.color,
                    // borderColor: item.background,
                    opacity: 0.9,
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderRadius: 4,
                },
            })}>
            <div
                style={{
                    textAlign: "center",
                    height: itemContext.dimensions.height,
                    overflow: "hidden",
                    // paddingLeft: 3,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}>
                {itemContext.title}
            </div>
        </div>
    );
};

const Calendar = ({ leaveTypes }) => {
    debugger;
    const { user } = useContext(IdentityContext);
    const { users } = useContext(UsersContext);

    moment.locale("en", {
        week: {
            dow: 1,
        },
    });

    const defaultTimeStart = moment().startOf("week").toDate();
    const defaultTimeEnd = moment().startOf("week").add(1, "week").toDate();

    const groups = users
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
    users.forEach(u => {
        for (const lr_id in u["leave_requests"]) {
            const leaveRequest = u["leave_requests"][lr_id];
            const leaveRequestType = leaveTypes.find(
                lr => lr["_id"]["$oid"] === leaveRequest["leave_type"]
            );
            leaveRequests.push({
                id: lr_id,
                group: u["_id"],
                title: `${leaveRequestType["name"]} - ${leaveRequest["status"]}`,
                start_time: moment(leaveRequest["start_date"]),
                end_time: moment(leaveRequest["end_date"]).add(1, "days"), // Adding one day to account for inclusive dates, where library expects exclusive end date.
                background: leaveRequestType["color"],
                color: pickTextColorBasedOnBgColor(leaveRequestType["color"]),
            });
        }
    });

    return (
        <Timeline
            groups={groups}
            items={leaveRequests}
            showCursorLine
            itemsSorted
            fixedHeader="fixed"
            itemTouchSendsClick={false}
            sidebarWidth={200}
            lineHeight={40}
            itemHeightRatio={0.75}
            canMove={false}
            canResize={false}
            minZoom={24 * 60 * 60 * 1000}
            maxZoom={365.24 * 86400 * 1000}
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
            defaultTimeEnd={defaultTimeEnd}>
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
    );
};

export default Calendar;
