import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import {
    List,
    Modal,
    Input,
    Form,
    DatePicker,
    Divider,
    Select,
    Typography,
    message,
    notification,
    Tooltip,
} from "antd";
import axios from "../../api/axios";
import { UserContext } from "../../Contexts";

import EmployeeName from "../EmployeeName";
import { Link } from "react-router-dom";

const { RangePicker } = DatePicker;

const calcDaysReq = dates => {
    return dates[0] ? moment.duration(dates[1].diff(dates[0])).asDays() + 1 : 0;
};

const NewRequestModal = ({
    modalVisible,
    setModalVisible,
    users,
    allLeaveTypes,
    allRuleGroups,
}) => {
    const [leaveType, setLeaveType] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]);
    const [overlapping, setOverlapping] = useState([]);
    const { user } = useContext(UserContext);

    const [form] = Form.useForm();

    const { Option } = Select;
    const { TextArea } = Input;

    const dateFormat = "YYYY-MM-DD";
    const manager = users.find(u => u._id === user.manager_id);
    const daysThisYear = leaveType ? user["leaves"][leaveType["_id"]["$oid"]]["days_this_year"] : 0;
    const daysRequested = calcDaysReq(dateRange);

    useEffect(() => {
        if (dateRange && dateRange[0]) {
            axios
                .get("/leave_requests/overlapping", {
                    params: {
                        start_date: dateRange[0].format(dateFormat),
                        end_date: dateRange[1].format(dateFormat),
                    },
                })
                .then(res => {
                    setOverlapping(res["data"]);
                })
                .catch(res => {
                    console.log(res);
                });
        }
    }, [dateRange, leaveType]);

    return (
        <Modal
            width={800}
            visible={modalVisible}
            title="New Leave Request"
            okText="Submit"
            getContainer={false}
            onOk={() => {
                form.validateFields()
                    .then(async values => {
                        console.log(values);
                        const data = {
                            start_date: values.dates[0].format(dateFormat),
                            end_date: values.dates[1].format(dateFormat),
                            leave_type: values.leaveType,
                            reason: values.reason,
                        };
                        axios
                            .post("/leave_requests", data)
                            .then(() => {
                                form.resetFields();
                                setModalVisible(false);
                            })
                            .catch(res => {
                                message.error(res["response"]["data"], 5);
                            });
                    })
                    .catch(info => {
                        console.log("Validate Failed:", info);
                    });
            }}
            onCancel={() => {
                setModalVisible(false);
            }}>
            <Form
                form={form}
                name="modalForm"
                wrapperCol={{ span: 10 }}
                labelCol={{ span: 5 }}
                autoComplete="off">
                <Form.Item label="Manager:">
                    <Link to={`/user/${manager["username"]}`} style={{ textDecoration: "none" }}>
                        <EmployeeName
                            fname={manager["fname"]}
                            lname={manager["lname"]}
                            country_code={manager["country_id"]}
                        />
                    </Link>
                </Form.Item>
                <Form.Item
                    name="leaveType"
                    label="Leave Type:"
                    rules={[{ required: true, message: "Please select a leave type!" }]}>
                    <Select
                        // showSearch
                        placeholder="Select a Leave Type"
                        optionFilterProp="children"
                        onChange={value => {
                            const daysThisYear = user["leaves"][value]["days_this_year"];

                            if (daysRequested > daysThisYear) {
                                notification.warning({
                                    message: "Warning: Not enough days",
                                    description:
                                        "Note: You don't have enough days this year. Your manager would be able to give you extra paid and unpaid leave days.",
                                    placement: "bottomRight",
                                });
                            }

                            setLeaveType(allLeaveTypes.find(lt => lt["_id"]["$oid"] === value));
                        }}>
                        {allLeaveTypes.map(lt => (
                            <Option key={lt["_id"]["$oid"]} value={lt["_id"]["$oid"]}>
                                {lt["name"]}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Tooltip
                    title={`The start and end date are inclusive. You selected ${daysRequested} days.`}>
                    <Form.Item
                        name="dates"
                        label="Leave Dates:"
                        rules={[
                            {
                                type: "array",
                                required: true,
                                message: "Please select the range of your leave!",
                            },
                        ]}>
                        <RangePicker
                            value={dateRange}
                            onChange={v => {
                                const daysRequested = calcDaysReq(v);
                                if (leaveType && daysRequested > daysThisYear) {
                                    notification.warning({
                                        message: "Warning: Not enough days",
                                        description:
                                            "Note: You don't have enough days this year. Your manager would be able to give you extra paid and unpaid leave days.",
                                        placement: "bottomRight",
                                    });
                                }
                                setDateRange(v);
                            }}
                            format={dateFormat}
                        />
                    </Form.Item>
                </Tooltip>
                {/* <Divider>Leave Type</Divider> */}

                {leaveType && (
                    <>
                        <Form.Item label="Needs Approval:">
                            {daysRequested > daysThisYear && !leaveType["needs_approval"] ? (
                                <Tooltip title="The leave type does not require approval but your manager would need to approve your extra days.">
                                    Yes*
                                </Tooltip>
                            ) : leaveType["needs_approval"] ? (
                                "Yes"
                            ) : (
                                "No"
                            )}
                        </Form.Item>

                        <Form.Item label="Days left this year:">{daysThisYear}</Form.Item>
                        <Form.Item
                            label="Reason for the leave:"
                            name="reason"
                            rules={
                                leaveType["reason_required"]
                                    ? [
                                          {
                                              required: true,
                                              message: "Please provide a leave reason!",
                                          },
                                          {
                                              min: 10,
                                              message:
                                                  "Message must contain at least 10 characters.",
                                          },
                                      ]
                                    : [{ required: false }, { min: 0 }]
                            }>
                            <TextArea
                                rows={2}
                                maxLength={200}
                                minLength={10}
                                autoSize={{ minRows: 2, maxRows: 6 }}
                                showCount
                            />
                        </Form.Item>
                        {overlapping.length > 0 && (
                            <List
                                bordered
                                header={
                                    <span style={{ color: "red", fontWeight: "bold" }}>
                                        Warning: Overlapping Employees
                                    </span>
                                }
                                footer="Please note that your manager would take the overlapping employees into consideration when approving or rejecting your leave request."
                                dataSource={overlapping}
                                renderItem={item => {
                                    const otherEmp = users.find(u => u._id === item.user_id);
                                    const ruleGroup = allRuleGroups.find(
                                        rg => rg["_id"]["$oid"] === item.rule_group_id
                                    );
                                    const otherLeave =
                                        otherEmp["leave_requests"][item["user_leave_id"]];
                                    const otherLeaveType = allLeaveTypes.find(
                                        lt => lt["_id"]["$oid"] === otherLeave["leave_type"]
                                    );
                                    return (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={`${ruleGroup["name"]} - ${otherEmp["fname"]} ${otherEmp["lname"]}`}
                                                description={`Your current days overlap with ${
                                                    otherEmp["fname"]
                                                }'s ${otherLeaveType["name"].toLowerCase()} from ${
                                                    otherLeave["start_date"]
                                                } to ${otherLeave["end_date"]}.`}
                                            />
                                        </List.Item>
                                    );
                                }}
                            />
                        )}
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default NewRequestModal;
