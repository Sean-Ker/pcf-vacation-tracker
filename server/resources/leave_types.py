import json
from datetime import datetime, timedelta, timezone
from pprint import pprint

from bson import json_util
from bson import ObjectId, json_util
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

api = Namespace("leave_types")


@api.route("")
class LeaveTypes(Resource):
    @jwt_required()
    def get(self):
        company_id = get_jwt()["company_id"]
        all_leave_types = list(db.leave_types.find({"company_id": company_id}))
        return Response(json_util.dumps(all_leave_types))

    @jwt_required()
    def post(self):
        if set(request.json.keys()) != {
            "name",
            "needs_approval",
            "default_value",
            "reason_required",
            "rolled_over",
            "color",
        }:
            return Response("Invalid paramaters", 400)
        company_id = get_jwt()["company_id"]
        _id = db.leave_types.insert_one({**request.json, "company_id": company_id}).inserted_id
        default_value = request.json["default_value"]
        db.users.update_many(
            {}, {"$set": {f"leaves.{_id}.days_this_year": default_value, f"leaves.{_id}.days_per_year": default_value}}
        )
        return Response(f"Created leave type {request.json['name']}")


@api.route("/<string:id>")
class LeaveType(Resource):
    @jwt_required()
    def get(self, id):
        company_id = get_jwt()["company_id"]
        leave_type = db.leave_types.find_one({"_id": ObjectId(id), "company_id": company_id})
        print(leave_type)
        return Response(json_util.dumps(leave_type))

    @jwt_required()
    def patch(self, id):
        company_id = get_jwt()["company_id"]
        db.leave_types.delete_one({"_id": ObjectId(id), "company_id": company_id})
        db.users.update_many({"company_id": company_id}, {"$unset": {f"leaves.{id}": 1}})
        return Response(f"Deleted leave type with id {id}")

    @jwt_required()
    def put(self, id):
        # print(request.json)
        for field in list(request.json.keys()):
            if field not in ["name", "needs_approval", "default_value", "reason_required", "rolled_over", "color"]:
                return Response(f"Error: Invalid field {field}", 400)

        company_id = get_jwt()["company_id"]
        db.leave_types.update_one({"_id": ObjectId(id), "company_id": company_id}, {"$set": request.json})
        return Response(f"Successfully updated leave type with id {id}")
