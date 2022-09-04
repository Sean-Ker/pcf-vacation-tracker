"""
Supporting functions:
1. leave_requests_from_user - validates the leave requests of a user and returns a list of leave requests objects
2. get_overlapping_users - gets all other users that are overlapping with the specified leave dates

Endpoints:
1. /leave_requests - GET - get all leave requests that the current user has access to
2. /leave_requests - POST - create a leave request
3. /leave_requests - PATCH - Deletes all leave requests. User must be an admin.
4. /leave_requests/<leave_request_id> - GET - get a leave request by its id
5. /leave_requests/<leave_request_id> - PUT - Answer a leave request. User must be the employees manager or an admin.
6. /leave_requests/<leave_request_id> - DELETE - Delete a leave request. User must be an admin.
7. /overlapping - GET - get all overlapping leave requests for the current user
8. /overlapping/<string:id> - GET - get all overlapping leave requests for the user with the specified id
9. /cancel/<string:id> - PUT - cancel a leave request. User must be that employee, its manager or an admin.
"""

import json
from datetime import datetime, timedelta, timezone
from pprint import pprint
from uuid import uuid4

from bson import json_util
from bson.objectid import ObjectId
from db import db
from flask import Blueprint, Flask, Response, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from flask_restx import Api, Namespace, Resource

from .logs import LogTypes

api = Namespace("leave_requests")


class LeaveStatus:
    OPEN = "OPEN"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    ALL_OPTIONS = ["OPEN", "APPROVED", "REJECTED", "CANCELLED"]


def leave_requests_from_user(user, user_identity, leave_types):
    leave_requests = []
    for lr_id, lr in user["leave_requests"].items():
        required_fields = ["start_date", "end_date", "leave_type", "request_date", "status"]
        for req_key in required_fields:
            if req_key not in lr:
                return Response(f"Error: The leave request with id {lr_id} is missing the {req_key} field.", 400)

        if lr["status"] in [LeaveStatus.OPEN, LeaveStatus.CANCELLED, LeaveStatus.REJECTED]:
            if not user_identity["is_admin"] and user["_id"] not in (
                user_identity.get("employees", []) + [user_identity["_id"]]
            ):
                continue

        lt = [lt for lt in leave_types if lt["_id"] == ObjectId(lr["leave_type"])]
        if len(lt) != 1:
            return Response(
                f"Error: The leave request with id {lr_id} has an invalid leave type: {lr['leave_type']}.", status=400
            )
        lr["_id"] = str(lr_id)
        lr["leave_type"] = lt[0]

        lr["start_date"] = datetime.fromisoformat(lr["start_date"])
        lr["end_date"] = datetime.fromisoformat(lr["end_date"])
        leave_duration = (lr["end_date"] - lr["start_date"]).days
        if leave_duration < 0:
            return Response(f"Error: The leave request with id {lr_id} has an invalid start and end date.", status=400)

        # Check lr based on status?? What need to check?
        # Check if leave request is answered by anyone and if so that the other fields are presented
        # Check if reason is required and if it is provided

        leave_requests.append(lr)

    return leave_requests


def get_overlapping_users(leaving_user, start_date: str, end_date: str):
    company_id = get_jwt()["company_id"]
    rule_groups_with_user = list(db.rule_groups.find({"company_id": company_id, "employee_ids": leaving_user["_id"]}))
    rule_groups_users_ids = [
        [id for id in rg["employee_ids"] if id != leaving_user["_id"]] for rg in rule_groups_with_user
    ]
    # flatten the list of lists
    rule_groups_users_ids = [item for sublist in rule_groups_users_ids for item in sublist]

    # get all users that are in the same rule group as the leaving user
    users = list(db.users.find({"company_id": company_id, "_id": {"$in": rule_groups_users_ids}}))
    overlapping = []
    for rg in rule_groups_with_user:
        for emp_id in rg["employee_ids"]:
            if emp_id == leaving_user["_id"]:
                continue
            other_emp = [u for u in users if u["_id"] == emp_id]
            if not other_emp:
                return Response(f"Error: The employee with id {emp_id} does not exist. Please report.", 400)
            else:
                other_emp = other_emp[0]

            for other_leave_id in other_emp.get("leave_requests", []):
                other_leave = other_emp["leave_requests"][other_leave_id]

                if (
                    other_leave["status"] == "APPROVED"
                    and datetime.fromisoformat(other_leave["end_date"]) >= datetime.fromisoformat(start_date)
                    and datetime.fromisoformat(other_leave["start_date"]) <= datetime.fromisoformat(end_date)
                ):
                    overlapping.append(
                        {"rule_group_id": str(rg["_id"]), "user_id": emp_id, "user_leave_id": other_leave_id}
                    )
    return overlapping


@api.route("")
class LeaveRequests(Resource):
    @jwt_required()
    def get(self):
        """Get all leave requests data based on your identity.
        All users (Admins, managers and regular employees) can get their own leave requests.

        APPROVED leave requests are public records, and so they're viewable to everyone else in the company, no matter their identity.

        Admins can get all leave requests.
        Manager can get all leave requests for his/her employees.
        Regular Employees can only get all leave requests for themselves.
        """
        company_id = get_jwt()["company_id"]
        users_with_leave_requests = list(
            db.users.find({"company_id": company_id, "leave_requests": {"$exists": True}}, {"leave_requests": 1})
        )

        # Check the identity of the current user
        user_id = get_jwt_identity()
        user = db.users.find_one({"company_id": company_id, "_id": user_id})
        if not user:
            return Response(f"Error: The user with id {user_id} does not exist. Please report.", 400)

        leave_requests = []
        leave_types = list(db.leave_types.find({"company_id": company_id}))
        for u in users_with_leave_requests:
            leaves_res = leave_requests_from_user(u, user, leave_types)
            if isinstance(leaves_res, Response):
                return leaves_res

            # print(leaves_res)
            for lr in leaves_res:
                lr["start_date"] = lr["start_date"].strftime("%Y-%m-%d")
                lr["end_date"] = lr["end_date"].strftime("%Y-%m-%d")
                leave_requests.append(lr)

        # User is a regular employee.
        return Response(json_util.dumps(leave_requests), 200, mimetype="application/json")

    @jwt_required()
    def post(self):
        """Create new leave request"""
        company_id = get_jwt()["company_id"]
        user_id = get_jwt_identity()

        data = request.json
        leave_types = list(db.leave_types.find({"company_id": company_id}))
        leave_type = [lt for lt in leave_types if lt["_id"] == ObjectId(data["leave_type"])]
        if len(leave_type) != 1:
            return Response(f"Error: The leave type with id {data['leave_type']} does not exist or duplicated.", 400)
        else:
            leave_type = leave_type[0]

        if set(data.keys()) != {"start_date", "end_date", "leave_type", "reason"}:
            return Response("Error: Invalid paramaters", 400)

        start_date = datetime.fromisoformat(data["start_date"])
        end_date = datetime.fromisoformat(data["end_date"])

        reason_required = bool(leave_type["reason_required"])
        if reason_required and not data["reason"].strip():
            return Response("Error: A reason message is required.", 400)

        if end_date < start_date:
            return Response(
                f"Error: The start date ({data['start_date']}) can't be greater than the end date ({data['end_date']}) of the leave.",
                400,
            )

        user = db.users.find_one({"company_id": company_id, "_id": user_id})
        if not user:
            return Response("Error", 400)

        leave_requests = leave_requests_from_user(user, user, leave_types)
        for lr in leave_requests:
            if lr["status"] not in ["OPEN", "APPROVED"]:
                continue
            if lr["end_date"] >= start_date and lr["start_date"] <= end_date:
                return Response(
                    "Error: You can't overlap new leave requests with previous open or approved requests.", 400
                )

        data["request_date"] = str(datetime.now())
        data["status"] = "OPEN"
        leave_request_id = str(uuid4())
        db.users.update_one(
            {"company_id": company_id, "_id": user_id}, {"$set": {f"leave_requests.{leave_request_id}": data}}
        )

        logs_data = {
            "type": LogTypes.REQUEST_CREATED,
            "company_id": company_id,
            "date": str(datetime.now()),
            "by": user_id,
            "leave_request_id": leave_request_id,
        }
        db.logs.insert_one(logs_data)
        return Response(f"Successfully requested a {leave_type['name']} for user with id {user_id}", 200)

    @jwt_required()
    def patch(self):
        """Deletes all vacation requests and logs but doesn't return employee's days back"""
        user_id = get_jwt_identity()
        company_id = get_jwt()["company_id"]
        user = db.users.find_one({"company_id": company_id, "_id": user_id})
        if not user["is_admin"]:
            return Response("Error: You don't have permission to do that.")
        db.logs.delete_many({"company_id": company_id})
        db.users.update_many({"company_id": company_id}, {"$unset": {"leave_requests": 1}})
        return Response("Successfully deleted all leave requests and logs.", 200)


@api.route("/<string:id>")
class LeaveRequest(Resource):
    @jwt_required()
    def get(self, id):
        """Returns the user with the specified leave request id"""
        company_id = get_jwt()["company_id"]
        leaving_user = db.users.find_one({"company_id": company_id, f"leave_requests.{id}": {"$exists": True}})
        if not leaving_user:
            return Response(f"Error: Leave request with id {id} does not exist. Please report.", 400)
        return Response(json_util.dumps(leaving_user))

    @jwt_required()
    def put(self, id):
        """Endpoint to answer leave requests"""
        data = request.json
        company_id = get_jwt()["company_id"]
        leaving_user = db.users.find_one({"company_id": company_id, f"leave_requests.{id}": {"$exists": True}})
        if not leaving_user:
            return Response(f"Error: Leave request with id {id} does not exist. Please report.", 400)

        leave_request = leaving_user["leave_requests"][id]
        leave_type = db.leave_types.find_one({"company_id": company_id, "_id": ObjectId(leave_request["leave_type"])})
        if not leave_type:
            return Response(
                "Error: The admin has removed this leave type. If you see this message, please report it to your admin.",
                400,
            )

        changer_id = get_jwt_identity()
        changer = db.users.find_one({"company_id": company_id, "_id": changer_id, "is_active": True}, {"pwd": 0})
        start_date = datetime.fromisoformat(leave_request["start_date"])
        end_date = datetime.fromisoformat(leave_request["end_date"])
        leave_request_days = (end_date - start_date).days
        user_days_this_year = leaving_user["leaves"][str(leave_type["_id"])]["days_this_year"]
        is_enough_days = user_days_this_year >= leave_request_days
        reason_required = bool(leave_type["reason_required"])

        needed_data_keys = [
            "is_approving",
            "response",
        ]  # Respnose is always mendatory for simplicity. Could be empty string.
        if not is_enough_days and data["is_approving"]:
            needed_data_keys += ["extra_days", "extra_days_paid"]
        if set(data.keys()) != set(needed_data_keys):
            return Response(
                f"Error: Invalid paramaters. Please provide the following paramaters: {needed_data_keys}.", 400
            )

        is_approving = bool(data["is_approving"])
        extra_days = int(data.get("extra_days", 0))
        extra_days_paid = int(data.get("extra_days_paid", 0))
        response = str(data["response"])

        if leave_request["status"] == "CANCELLED":
            return Response(
                f"Error: Can't {'approve' if is_approving else 'reject'} this request as it is already cancelled. Please report.",
                400,
            )
        if leave_request["status"] != "OPEN":
            return Response(
                f"Error: Can't {'approve' if is_approving else 'reject'} this request as it was already {'approved' if is_approving else 'rejected'}. Please report.",
                400,
            )
        if not changer:
            return Response("Error: You don't have a permission to do that. Please report.", 400)
        if not (changer["is_admin"] or leaving_user["manager_id"] == changer_id):
            return Response("Error: You don't have a permission to do that. Please report.", 400)
        if not bool(leave_type["needs_approval"]):
            return Response(
                "Error: This leave type does not require an approval. If you see this message, please report it to your admin.",
                400,
            )
        if start_date.year != end_date.year:
            return Response(
                f"Error: Unable to schedule leaves spanning {start_date.year} and {end_date.year}. Please submit a seperate leave request for each year.",
                400,
            )
        if reason_required and not response.strip():
            return Response("Error: A message response is required.", 400)
        if (
            is_approving
            and not is_enough_days
            and (leave_request_days != (user_days_this_year + extra_days + extra_days_paid))
        ):
            return Response(
                f"Error: The number of requested days ({leave_request_days}) does not match the number of the user's left-over days ({user_days_this_year}) + \
                    extra days ({extra_days}) + extra paid days ({extra_days_paid}).",
                400,
            )

        update_request_data = {
            f"leaves.{leave_request['leave_type']}.days_this_year": max(user_days_this_year - leave_request_days, 0),
            f"leave_requests.{id}.status": "APPROVED" if is_approving else "REJECTED",
            f"leave_requests.{id}.response": response,
            f"leave_requests.{id}.response_by": changer_id,
            f"leave_requests.{id}.response_date": str(datetime.now()),
        }

        if is_approving and not is_enough_days:
            update_request_data[f"leave_requests.{id}.extra_days"] = extra_days
            update_request_data[f"leave_requests.{id}.extra_days_paid"] = extra_days_paid

        db.users.update_one({"company_id": company_id, "_id": leaving_user["_id"]}, {"$set": update_request_data})
        logs_data = {
            "type": LogTypes.REQUEST_APPROVED if is_approving else LogTypes.REQUEST_REJECTED,
            "company_id": company_id,
            "date": str(datetime.now()),
            "by": changer_id,
            "leave_request_id": id,
        }
        db.logs.insert_one(logs_data)
        return Response(f"Successfully {'approved' if is_approving else 'rejected'} leave request with id {id}.")


@api.route("/overlapping")
class NewRequestOverlap(Resource):
    @jwt_required()
    def get(self):
        """Return ids of users with overlapping dates"""
        data = dict(request.args)
        if set(data.keys()) != {"start_date", "end_date"}:
            return Response("Error: Invalid paramaters", 400)

        user_id = get_jwt_identity()
        company_id = get_jwt()["company_id"]
        leaving_user = db.users.find_one({"company_id": company_id, "_id": user_id})
        if not leaving_user:
            return Response(f"Error: Leave request with ID {id} does not exist. Please report.", 400)

        overlapping_ids = get_overlapping_users(leaving_user, data["start_date"], data["end_date"])
        if type(overlapping_ids) == Response:
            return overlapping_ids
        return Response(json_util.dumps(overlapping_ids), 200)


@api.route("/overlapping/<string:id>")
class LeaveRequestOverlap(Resource):
    @jwt_required()
    def get(self, id):
        """Return ids of users with overlapping dates"""
        company_id = get_jwt()["company_id"]
        leaving_user = db.users.find_one({"company_id": company_id, f"leave_requests.{id}": {"$exists": True}})
        if not leaving_user:
            return Response(f"Error: Leave request with ID {id} does not exist. Please report.", 400)

        leave_request = leaving_user["leave_requests"][id]
        overlapping_ids = get_overlapping_users(leaving_user, leave_request["start_date"], leave_request["end_date"])
        if type(overlapping_ids) == Response:
            return overlapping_ids
        return Response(json_util.dumps(overlapping_ids), 200)


@api.route("/cancel/<string:id>")
class CancelLeaveRequest(Resource):
    @jwt_required()
    def put(self, id):
        """Cancel a leave request"""
        company_id = get_jwt()["company_id"]
        leaving_user = db.users.find_one(
            {"company_id": company_id, f"leave_requests.{id}": {"$exists": True}}
        )  # , {f"leave_requests.{id}": 1}

        if not leaving_user:
            return Response(f"Error: Leave request with ID {id} does not exist. Please report.", 400)

        leave_request = leaving_user["leave_requests"][id]
        if leave_request["status"] == "CANCELLED":
            return Response(f"Error: Can't cancel an already cancelled leave.", 400)
        elif leave_request["status"] != "OPEN":
            return Response(f"Can't cacel this leave with status \"{leave_request['status']}\". Work in progress.", 400)
        if not leaving_user["is_active"]:
            return Response(f"Error: Can't cancel this leave as {leaving_user['fname']} is an inactive user.", 400)

        changer_id = get_jwt_identity()
        changer = db.users.find_one({"company_id": company_id, "_id": changer_id, "is_active": True}, {"pwd": 0})
        if not changer:
            return Response("Error: You don't have permissions to do that. Please report.", 400)

        if not (changer["is_admin"] or leaving_user["manager_id"] == changer_id or leaving_user["_id"] == changer_id):
            return Response("Error: You don't have permissions to that. Please report.", 400)

        new_data = {
            f"leave_requests.{id}.status": "CANCELLED",
            f"leave_requests.{id}.response_by": changer_id,
            f"leave_requests.{id}.response_date": str(datetime.now()),
        }
        db.users.update_one({"company_id": company_id, "_id": leaving_user["_id"]}, {"$set": new_data})

        logs_data = {
            "type": LogTypes.REQUEST_CANCELLED,
            "company_id": company_id,
            "date": str(datetime.now()),
            "by": changer_id,
            "leave_request_id": id,
        }
        db.logs.insert_one(logs_data)
        return Response(f"Successfully canceled {leaving_user['fname']}'s leave")
