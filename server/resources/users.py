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


@api.route("")
class Users(Resource):
    @jwt_required()
    def get(self):
        all_users = db.users.find({}, {"pwd": 0})
        return Response(json_util.dumps(all_users), 200)

    @jwt_required()
    def post(self):
        data = request.json
        if set(data.keys()) != {
            "fname",
            "lname",
            "email",
            "department_id",
            "manager_id",
            "managed_employees_ids",
            "is_admin",
        }:
            return Response("Invalid paramaters", 400)

        data["fname"] = data["fname"][:1].upper() + data["fname"][1:]
        data["lname"] = data["lname"][:1].upper() + data["lname"][1:]
        data["email"] = data["email"].lower()

        users = list(db.users.find())
        if [user for user in users if user["email"] == data["email"]]:
            return Response("Email already exsits", 400)

        all_leaves = list(db.leave_types.find({}))
        data["leaves"] = [
            {f"leaves.{l._id}.days_this_year": l.default_value, f"leaves.{l._id}.days_per_year": l.default_value}
            for l in all_leaves
        ]
        print(all_leaves)

        if not users:
            max_id = 0
        else:
            max_id = max(users, key=lambda d1: int(d1["_id"]))["_id"]
        new_id = str(int(max_id) + 1)
        data["_id"] = new_id
        uuid_url = uuid4()
        data["register_url"] = str(uuid_url)
        data["is_active"] = False

        db.users.insert_one(data)

        url = f"http://192.168.1.224:5000/register/{uuid_url}"
        create_account_email(data["email"], data["fname"], url)

        return Response(f'Successfully created an account for {data["fname"]} {data["lname"]}', 200)


@api.route("/all")
class AllUsers(Resource):
    @jwt_required()
    def get(self):
        all_employees = list(db.users.find({}, {"pwd": 0}))
        for user in all_employees:
            user["department"] = db.departments.find_one({"_id": user.get("department_id", None)})
            user["manager"] = db.users.find_one({"_id": user.get("manager_id", None)})
            # user["employees"] = list(db.users.find({"manager_id": user.get("_id", None)}))
        return Response(json_util.dumps(all_employees), 200)


@api.route("/<string:id>")
class UserById(Resource):
    @jwt_required()
    def get(self, id):
        user = db.users.find_one({"_id": id}, {"pwd": 0})
        return user


@api.route("/username/<string:username>")
class UserByUsername(Resource):
    @jwt_required()
    def get(self, username):
        user = db.users.find_one({"username": username.lower()}, {"pwd": 0})
        return user


@api.route("/uuid/<string:id>")
class UserByUUID(Resource):
    def get(self, id):
        user = db.users.find_one({"register_url": id}, {"pwd": 0})
        if not user:
            return Response("Error: Invalid URL, please check it.", 400)
        if user["is_active"]:
            return Response("Error: user is already registered.", 400)
        return user

    @jwt_required()
    def put(self, id):
        user = db.users.find_one({"register_url": id}, {"pwd": 0})
        if not user:
            return Response("Error: Invalid URL, please check it.", 400)

        data = request.json
        if set(data.keys()) != {
            "username",
            "password",
            "country_id",
        }:
            return Response("Invalid paramaters", 400)

        if user["is_active"]:
            return Response("Error: User is already registered.", 400)

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
