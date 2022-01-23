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

api = Namespace("rule_groups")


@api.route("")
class LeaveTypes(Resource):
    def get(self):
        all_rule_groups = list(db.rule_groups.find({}))
        return Response(json_util.dumps(all_rule_groups))

    def post(self):
        if {"name"} != set(request.json.keys()):
            return Response("Invalid paramaters", 400)
        _id = db.rule_groups.insert_one({**request.json, **{"employee_ids": []}}).inserted_id
        return Response(f"Created rule group {request.json['name']}")


@api.route("/<string:id>")
class LeaveType(Resource):
    def get(self, id):
        rule_group = db.rule_groups.find_one({"_id": ObjectId(id)})
        print(rule_group)
        return Response(json_util.dumps(rule_group))

    def patch(self, id):
        db.rule_groups.delete_one({"_id": ObjectId(id)})
        # db.users.update_many({}, {"$unset": {f"rule_groups.{id}": 1}})
        return Response(f"Deleted leave type with id {id}")

    def put(self, id):
        # db.users.update_many({}, {"$push": {f"rule_groups": _id}})
        if {"employee_ids"} != set(request.json.keys()):
            return Response("Invalid paramaters", 400)
        db.rule_groups.update_one({"_id": ObjectId(id)}, {"$set": request.json})
        return Response(f"Successfully updated leave type with id {id}")


@api.route("/employee/<string:employee_id>")
class LeaveTypeEmployee(Resource):
    def get(self, employee_id):
        rule_groups = list(db.rule_groups.find({"employee_ids": employee_id}))
        return Response(json_util.dumps(rule_groups), 200)
