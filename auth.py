import json
from datetime import datetime, timedelta, timezone
from pprint import pprint

import pymongo
import validators
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
from flask_restx import Api, Resource, Namespace
from werkzeug.security import safe_str_cmp

from db import db

api = Namespace("auth", description="Cats related operations")


@api.route("/login")
class Login(Resource):
    def post(self):
        email = request.json.get("email", "")
        password = request.json.get("password", "")
        user = db.user.find_one({"email": email})
        if user:
            is_pass_correct = safe_str_cmp(user["pwd"], password)
            if is_pass_correct:
                # print(user)
                id = user["_id"]
                pprint(id)
                refresh = create_refresh_token(identity=json_util.dumps(id))
                access = create_access_token(identity=json_util.dumps(id))

                return Response(
                    json_util.dumps(
                        {
                            "refresh_token": refresh,
                            "access_token": access,
                        }
                    )
                )
        return Response(json_util.dumps({"error": "Wrong credentials"}), 401)


@api.route("/me")
class Me(Resource):
    @jwt_required()
    def get(self):
        user_id = json.loads(get_jwt_identity())
        pprint(user_id)
        user = db.user.find_one({"_id": user_id}, {"pwd": 0})
        if not user:
            return jsonify({"error": "Shouldn't happen. Please check"}), 400
        print(user)
        return user, 200


# We are using the `refresh=True` options in jwt_required to only allow
# refresh tokens to access this route.
@api.route("/refresh")
class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        return jsonify(access_token=access_token)
