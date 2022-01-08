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
from flask_restx import Api, Resource, Namespace

from db import db

api = Namespace("users", description="Cats related operations")


@api.route("/")
class Users(Resource):
    @jwt_required()
    def get(self):
        data = list(db.user.find({}, {"pwd": 0}))
        return Response(json_util.dumps(data), 200)
