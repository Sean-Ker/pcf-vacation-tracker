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

from db import db

api = Namespace("companies")


@api.route("")
class Companies(Resource):
    @jwt_required()
    def get(self):
        company_id = get_jwt()["company_id"]
        company = db.companies.find({"_id": ObjectId(company_id)})
        return Response(json_util.dumps(company), 200)

    def post(self):
        data = request.json
        if set(data.keys()) != {"name"}:
            return Response("Error: Invalid paramaters", 400)

        db.companies.insert_one({**data, "ceo_id": None})
        return Response(f"Successfully created the company {data['name']}.", 200)

    @jwt_required()
    def put(self):
        data = request.json
        if set(data.keys()) != {"name", "ceo_id"}:
            return Response("Error: Invalid paramaters", 400)

        company_id = get_jwt()["company_id"]
        db.companies.update_one({"_id": ObjectId(company_id)}, {"$set": {**data}})
        return Response(f"Succesffully edited company with id {company_id}", 200)


@api.route("/<string:id>")
class Company(Resource):
    def get(self, id):
        company = db.companies.find_one({"_id": ObjectId(id)})
        print(company)
        if not company:
            return Response(f"Error: Could not find company with id {id}", 400)
        return Response(json_util.dumps(company), 200)


# /api/companies/61e48322d4d312f7d21d7011
# /api/companies/61e48322d4d312f7d21d7011
