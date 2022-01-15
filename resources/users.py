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

api = Namespace("users", description="Users Endpoints")


@api.route("")
class Users(Resource):
    @jwt_required()
    def get(self):
        all_users = db.users.find({"is_active": True}, {"pwd": 0})
        return Response(json_util.dumps(all_users), 200)


@api.route("/all")
class AllUsers(Resource):
    @jwt_required()
    def get(self):
        all_ids = list(db.users.find({"is_active": True}, {"_id": 1}))
        all_users = []
        for id_obj in all_ids:
            id = id_obj["_id"]
            user = get_user_by_id(id)
            all_users.append(user)
        return Response(json_util.dumps(all_users), 200)


@api.route("/<string:username>")
class UserById(Resource):
    @jwt_required()
    def put(self, username):
        id_obj = db.users.find_one({"username": username}, {"_id": 1})
        if not id_obj:
            return None
        id = id_obj["_id"]
        user = get_user_by_id(id)
        return user
