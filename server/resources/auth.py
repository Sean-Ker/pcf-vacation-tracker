import json
from datetime import datetime, timedelta, timezone
from pprint import pprint

import pymongo
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

api = Namespace("auth", description="Authentication Ednpoints")


@api.route("/login")
class Login(Resource):
    def post(self):
        email = request.json.get("email", "")
        password = request.json.get("password", "")
        user = db.users.find_one({"email": email.lower()})
        print(user)
        if user:
            is_pass_correct = safe_str_cmp(user["pwd"], password)
            if is_pass_correct:
                id = user["_id"]
                company_id = user["company_id"]
                additional_claims = {"company_id": company_id}
                refresh = create_refresh_token(identity=id, additional_claims=additional_claims)
                access = create_access_token(identity=id, additional_claims=additional_claims)

                if not user["is_active"]:
                    return {"error": "User is deactivated"}, 401

                return Response(
                    json_util.dumps({"refresh_token": refresh, "access_token": access, "company_id": company_id})
                )
            else:
                return {"error": "Wrong Credentials"}, 401
        return {"error": "Wrong Credentials"}, 401


from utils import get_user_by_id


@api.route("/me")
class Me(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        # user = db.users.find_one({"_id": user_id}, {"pwd": 0})
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"Error": "Shouldn't happen. Please report."}), 400
        return user, 200


# We are using the `refresh=True` options in jwt_required to only allow
# refresh tokens to access this route.
@api.route("/refresh")
class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()
        company_id = get_jwt()["company_id"]
        additional_claims = {"company_id": company_id}
        access_token = create_access_token(identity=identity, additional_claims=additional_claims)
        return jsonify(access_token=access_token)
