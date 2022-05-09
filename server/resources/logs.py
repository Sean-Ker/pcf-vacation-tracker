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

api = Namespace("logs")


class LogTypes:
    REQUEST_CREATED = "REQUEST_CREATED"
    REQUEST_CANCELLED = "REQUEST_CANCELLED"
    REQUEST_APPROVED = "REQUEST_APPROVED"
    REQUEST_REJECTED = "REQUEST_REJECTED"
    ALL_OPTIONS = ["REQUEST_CREATED", "REQUEST_CREATED", "REQUEST_APPROVED", "REQUEST_REJECTED"]


@api.route("")
class Logs(Resource):
    @jwt_required()
    def get(self):
        """Returns all logs"""
        company_id = get_jwt()["company_id"]
        logs = list(db.logs.find({"company_id": company_id}))
        return Response(json_util.dumps(logs), 200)
