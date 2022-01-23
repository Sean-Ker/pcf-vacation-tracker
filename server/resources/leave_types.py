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

api = Namespace("leave_types")


@api.route("")
class LeaveTypes(Resource):
    def get(self):
        all_leave_types = list(db.leave_types.find({}))
        return Response(json_util.dumps(all_leave_types))

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
        _id = db.leave_types.insert_one(request.json).inserted_id
        default_value = request.json["default_value"]
        db.users.update_many(
            {}, {"$set": {f"leaves.{_id}.days_this_year": default_value, f"leaves.{_id}.days_per_year": default_value}}
        )
        return Response(f"Created leave type {request.json['name']}")


@api.route("/<string:id>")
class LeaveType(Resource):
    def get(self, id):
        leave_type = db.leave_types.find_one({"_id": ObjectId(id)})
        print(leave_type)
        return Response(json_util.dumps(leave_type))

    def patch(self, id):
        db.leave_types.delete_one({"_id": ObjectId(id)})
        db.users.update_many({}, {"$unset": {f"leaves.{id}": 1}})
        return Response(f"Deleted leave type with id {id}")

    def put(self, id):
        # print(request.json)
        for field in list(request.json.keys()):
            if field not in ["name", "needs_approval", "default_value", "reason_required", "rolled_over", "color"]:
                return Response(f"Error: Invalid field {field}", 400)
        db.leave_types.update_one({"_id": ObjectId(id)}, {"$set": request.json})
        return Response(f"Successfully updated leave type with id {id}")
