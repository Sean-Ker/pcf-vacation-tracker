import { List, Card } from "antd";
import _ from "lodash";
import React, { useContext } from "react";
import { UsersContext } from "../Contexts";
import { renderUser } from "../utils/renderUtils";

const RuleGroups = ({ ruleGroup, setRuleGroup, ruleGroups, renderActions }) => {
    const { users } = useContext(UsersContext);

    const renderRuleGroup = item => {
        return (
            <Card
                style={{
                    margin: "10px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    textAlign: "center",
                    marginTop: 12,
                    fontWeight: "bold",
                }}
                onClick={() => {
                    if (renderActions && !_.isEmpty(item)) {
                        setRuleGroup(item);
                    }
                }}
                title={item.name}
                hoverable={true}
                actions={renderActions ? ["View"] : []}>
                <List
                    dataSource={users.filter(u => item["employee_ids"].includes(u["_id"]))}
                    renderItem={employee => <List.Item>{renderUser(employee)}</List.Item>}></List>
            </Card>
        );
    };

    return (
        <List
            grid={{
                xs: 1,
                sm: 1,
                md: 2,
                lg: 3,
                xl: 3,
                xxl: 3,
            }}
            dataSource={ruleGroups}
            renderItem={renderRuleGroup}
        />
    );
};

export default RuleGroups;
