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

api = Namespace("locations")


@api.route("")
class Locations(Resource):
    def get(self):
        all_locations = list(db.countries.find({}))
        return all_locations


@api.route("/<string:code>")
class Location(Resource):
    def get(self, code):
        location = db.countries.find_one({"_id": code})
        if not location:
            return Response("Invalid country code", 400)
        return location
