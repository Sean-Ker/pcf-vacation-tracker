import json
from datetime import datetime, timedelta, timezone
from pprint import pprint

from bson import json_util
from bson.objectid import ObjectId
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
from utils import get_user_by_id
from db import db
from uuid import uuid4
from emails.confirm_account_email import create_account_email

api = Namespace("users", description="Users Endpoints")


def check_root_stracture_acc(root, users, lst_of_ids):
    if root["_id"] in lst_of_ids:
        lst_of_ids.append(root["_id"])
        return False
    lst_of_ids.append(root["_id"])
    for managed_emp_id in root["employees"]:
        managed_emp = [u for u in users if u["_id"] == managed_emp_id][0]
        res = check_root_stracture_acc(managed_emp, users, lst_of_ids)
        if not res:
            return False
    return True


def check_root_stracture(root, users):
    lst_of_ids = []
    valid_stracture = check_root_stracture_acc(root, users, lst_of_ids)
    # print(
    #     valid_stracture, [[{_id: u["fname"]} for u in users if u["_id"] == _id][0] for _id in lst_of_ids], root["_id"]
    # )
    return valid_stracture


def check_hierarchy_stracture(new_user):
    company_id = new_user["company_id"]
    id = new_user["_id"]

    # print(db.list_collection_names())
    if "users_tmp" in db.list_collection_names():
        return Response("Error: The app currently proccesses other changes. Please try again in a second.", 400)

    prev_user = db.users.find_one({"company_id": company_id, "_id": id}, {"pwd": 0})
    prev_manager = prev_user.get("manager_id")
    prev_employees = prev_user.get("employees")

    old_users = list(db.users.find({"company_id": company_id}, {"pwd": 0}))
    db.users_tmp.insert_many(old_users)

    # Remove user id from old manager's employees array
    db.users_tmp.update_one({"company_id": company_id, "_id": prev_manager}, {"$pull": {"employees": id}})
    # Add user id to new manager's employees array
    db.users_tmp.update_one({"company_id": company_id, "_id": new_user["manager_id"]}, {"$addToSet": {"employees": id}})
    # Pull out managed employees ids from all other managers' managed employees
    db.users_tmp.update_many(
        {"company_id": company_id, "employees": {"$in": new_user["employees"]}},
        {"$pull": {"employees": {"$in": new_user["employees"]}}},
    )
    # Set manager id of previous employees to None
    prev_employees = [u for u in prev_employees if u not in new_user["employees"]]
    db.users_tmp.update_many({"company_id": company_id, "_id": {"$in": prev_employees}}, {"$set": {"manager_id": None}})
    # Set user id as the manager id for all selected employees
    db.users_tmp.update_many(
        {"company_id": company_id, "_id": {"$in": new_user["employees"]}}, {"$set": {"manager_id": id}}
    )
    db.users_tmp.update_one({"company_id": company_id, "_id": id}, {"$set": {**new_user}}, upsert=True)

    updated_users = list(db.users_tmp.find({"company_id": company_id}, {"pwd": 0}))
    db.users_tmp.delete_many({})
    user_roots = [u for u in updated_users if u["manager_id"] == None] + [new_user]
    for root in user_roots:
        res = check_root_stracture(root, updated_users)
        if not res:
            return False
    return True


@api.route("")
class Users(Resource):
    @jwt_required()
    def get(self):
        """Get all users"""
        company_id = get_jwt()["company_id"]
        all_users = list(db.users.find({"company_id": company_id}, {"pwd": 0}))

        for user in all_users:
            user["department"] = db.departments.find_one(
                {"_id": ObjectId(user["department_id"]), "company_id": company_id}
            )
            user["manager"] = db.users.find_one({"_id": user["manager_id"], "company_id": company_id})
            # user["employees"] = list(db.users.find({"manager_id": user.get("_id", None)}))

        return Response(json_util.dumps(all_users), 200)

    @jwt_required()
    def post(self):
        """Create user from admin panel"""
        data = request.json
        if set(data.keys()) != {
            "fname",
            "lname",
            "email",
            "department_id",
            "manager_id",
            "employees",
            "is_admin",
        }:
            return Response("Error: Invalid paramaters", 400)

        data["fname"] = data["fname"][:1].upper() + data["fname"][1:]
        data["lname"] = data["lname"][:1].upper() + data["lname"][1:]
        data["email"] = data["email"].lower()

        company_id = get_jwt()["company_id"]
        users = list(db.users.find({"company_id": company_id}, {"pwd": 0}))
        if [user for user in users if user["email"] == data["email"]]:
            return Response("Error: Email already exsits", 400)

        all_leaves = list(db.leave_types.find({"compnay_id": company_id}))
        data["leaves"] = {
            str(l["_id"]): {"days_this_year": l["default_value"], "days_per_year": l["default_value"]}
            for l in all_leaves
        }

        if not users:
            max_id = 0
        else:
            max_id = max(users, key=lambda d1: int(d1["_id"]))["_id"]
        new_id = str(int(max_id) + 1)
        data["_id"] = new_id
        uuid_url = uuid4()
        data["register_url"] = str(uuid_url)
        data["is_active"] = False
        data["company_id"] = company_id
        data["username"] = None

        user = data.copy()
        if not check_hierarchy_stracture(user):
            return Response(
                "Error: The new employees's manager or managed employees would make a loop in the company's hierarchy structure.",
                400,
            )

        db.users.insert_one(data)

        # Pull out managed employees ids from all other managers' managed employees
        db.users.update_many(
            {"company_id": company_id, "employees": {"$in": data["employees"]}},
            {"$pull": {"employees": {"$in": data["employees"]}}},
        )
        # Add user id to new manager's employees array
        db.users.update_one({"company_id": company_id, "_id": data["manager_id"]}, {"$addToSet": {"employees": new_id}})
        # Set user id as the manager id for all selected employees
        db.users.update_many({"company_id": company_id, "_id": {"$in": data["employees"]}}, {"manager_id": new_id})

        url = f"https://pcfvt.herokuapp.com/register/{uuid_url}"
        create_account_email(data["email"], data["fname"], url)

        return Response(f'Successfully created an account for {data["fname"]} {data["lname"]}', 200)


@api.route("/<string:id>")
class UserById(Resource):
    @jwt_required()
    def get(self, id):
        """Get user by id"""
        user = db.users.find_one({"_id": id}, {"pwd": 0})
        return user

    @jwt_required()
    def put(self, id):
        """Edit user from admin panel"""
        data = request.json
        if set(data.keys()) != {"department_id", "manager_id", "employees", "is_admin", "leaves"}:
            return Response("Error: Invalid paramaters", 400)

        company_id = get_jwt()["company_id"]
        all_leaves = list(db.leave_types.find({"company_id": company_id}))
        all_leaves_ids = [str(leave["_id"]) for leave in all_leaves]
        assert set(all_leaves_ids) == set(data["leaves"].keys())
        for leave_id in data["leaves"]:
            assert "days_per_year" in data["leaves"][leave_id] and "days_this_year" in data["leaves"][leave_id]

        prev_user = db.users.find_one({"company_id": company_id, "_id": id}, {"pwd": 0})
        if not prev_user:
            return Response(f"Error: Invalid id, {id}", 400)
        # users_prev = list(db.users.find({"company_id": company_id}, {"pwd": 0}))
        user_check = prev_user.copy()
        user_check["manager_id"] = data["manager_id"]
        user_check["employees"] = data["employees"]
        if not check_hierarchy_stracture(user_check):
            return Response(
                "Error: Editing this employees's manager or managed employees would make a loop in the company's hierarchy structure.",
                400,
            )

        # Remove user id from old manager's employees array
        db.users.update_one({"company_id": company_id, "_id": prev_user["manager_id"]}, {"$pull": {"employees": id}})
        # Add user id to new manager's employees array
        db.users.update_one({"company_id": company_id, "_id": data["manager_id"]}, {"$addToSet": {"employees": id}})
        # Pull out managed employees ids from all other managers' managed employees
        db.users.update_many(
            {"company_id": company_id, "employees": {"$in": data["employees"]}},
            {"$pull": {"employees": {"$in": data["employees"]}}},
        )
        # Set manager id of previous employees to None
        prev_employees = [u for u in prev_user["employees"] if u not in data["employees"]]
        db.users.update_many({"company_id": company_id, "_id": {"$in": prev_employees}}, {"$set": {"manager_id": None}})
        # Set user id as the manager id for all selected employees
        db.users.update_many(
            {"company_id": company_id, "_id": {"$in": data["employees"]}}, {"$set": {"manager_id": id}}
        )
        db.users.update_one({"company_id": company_id, "_id": id}, {"$set": {**data}})

        return Response(f"Successfully edited employee with id {id}.")

    @jwt_required()
    def patch(self, id):
        # Delete user using its id
        company_id = get_jwt()["company_id"]
        user = db.users.find_one({"company_id": company_id, "_id": id}, {"pwd": 0})
        if not user:
            return Response(f"Error: Invalid id, {id}", 400)
        db.users.delete_one({"company_id": company_id, "_id": id})
        db.users.update_many({"company_id": company_id, "manager_id": id}, {"$set": {"manager_id": None}})
        db.users.update_many({"company_id": company_id, "employees": id}, {"$pull": {"employees": id}})
        db.rule_groups.update_many({"company_id": company_id, "employee_ids": id}, {"$pull": {"employee_ids": id}})
        return Response(f"Successfully deleted employee {user['fname']} {user['lname']}")


@api.route("/username/<string:username>")
class UserByUsername(Resource):
    @jwt_required()
    def get(self, username):
        """Get user by username"""
        company_id = get_jwt()["company_id"]
        user = db.users.find_one({"company_id": company_id, "username": username.lower()}, {"pwd": 0})
        return user


@api.route("/uuid/<string:id>")
class UserByUUID(Resource):
    def get(self, id):
        """Get user by uuid url"""
        user = db.users.find_one({"register_url": id}, {"pwd": 0})
        if not user:
            return Response("Error: Invalid URL, please check it.", 400)
        if user["is_active"]:
            return Response("Error: user is already registered.", 400)
        return Response(json_util.dumps(user), 200)

    @jwt_required()
    def put(self, id):
        """Edit user with registration"""
        user = db.users.find_one({"register_url": id}, {"pwd": 0})
        if not user:
            return Response("Error: Invalid URL, please check it.", 400)

        data = request.json
        if set(data.keys()) != {
            "username",
            "password",
            "country_id",
        }:
            return Response("Error: Invalid paramaters", 400)

        if user["is_active"]:
            return Response("User is already registered.", 400)

        company_id = user["company_id"]
        users = list(db.users.find({"company_id": company_id}, {"pwd": 0}))
        if [user for user in users if user["username"] == data["username"]]:
            return Response("Username already exsits", 400)

        data["username"] = data["username"].lower()

        db.users.update_one(
            {"register_url": id},
            {
                "$set": {
                    "username": data["username"],
                    "pwd": data["password"],
                    "country_id": data["country_id"],
                    "is_active": True,
                }
            },
        )

        return Response("Successfully registered new user", 200)


# @api.route("/all")
# class AllUsers(Resource):
#     @jwt_required()
#     def get(self):
#         """Get all users with full information"""
#         company_id = get_jwt()["company_id"]
#         all_employees = list(db.users.find({"company_id": company_id}, {"pwd": 0}))
#         for user in all_employees:
#             user["department"] = db.departments.find_one(
#                 {"_id": ObjectId(user["department_id"]), "company_id": company_id}
#             )
#             user["manager"] = db.users.find_one({"_id": user["manager_id"], "company_id": company_id})
#             # user["employees"] = list(db.users.find({"manager_id": user.get("_id", None)}))
#         return Response(json_util.dumps(all_employees), 200)
