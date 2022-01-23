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

api = Namespace("departments")


@api.route("")
class Departments(Resource):
    @jwt_required()
    def get(self):
        departments = list(db.departments.find({}))
        return departments

    @jwt_required()
    def post(self):
        department_name = request.json.get("name", "")
        if not department_name:
            return Response("Department name cannot be empty", 400)
        departments = list(db.departments.find())
        if not departments:
            max_id = 0
        else:
            max_id = max(departments, key=lambda d1: int(d1["_id"]))["_id"]
        new_id = str(int(max_id) + 1)
        # print(new_id)
        db.departments.insert_one({"_id": str(new_id), "name": department_name})
        return Response(f"Created {department_name}", 201)


@api.route("/<string:id>")
class Department(Resource):
    @jwt_required()
    def get(self, id):
        """Get department and all employees in department by id"""
        department = db.departments.find_one({"_id": id})
        if not department:
            return None
        department["employees"] = list(db.users.find({"department_id": id}))
        return department, 200

    @jwt_required()
    def put(self, id):
        """Edit department name"""
        new_name = request.json.get("name", "")
        if not new_name:
            return Response("Department name cannot be empty", 400)
        db.departments.update_one({"_id": id}, {"$set": {"name": new_name}})
        return Response(f"Succesffully renamed department with id {id} to {new_name}", 200)

    @jwt_required()
    def patch(self, id):
        """Delete Department, check that there are no employees at that department"""
        db.departments.delete_one({"_id": id})
