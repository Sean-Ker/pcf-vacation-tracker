import json
from datetime import datetime, timedelta, timezone
from pprint import pprint

from bson import json_util
from bson.objectid import ObjectId
from flask import Blueprint, Flask, Response, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from flask_restx import Api, Resource

from resources.auth import api as auth_blueprint
from resources.users import api as users_namespace
from resources.departments import api as departments_namespace
from db import db

app = Flask(__name__)
# CORS(app)
app.config["PROPAGATE_EXCEPTIONS"] = True
app.config["JWT_SECRET_KEY"] = "PMc0kiXe0PwWSTjcPtvWBwCnHxCkQTATKvDFwfJZ"
# app.config["CORS_HEADERS"] = "Content-Type"

authorizations = {
    "Bearer Auth": {"type": "apiKey", "in": "header", "name": "Authorization"},
}
api = Api(
    title="Vacation Tracker",
    authorizations=authorizations,
    security="Bearer Auth",
    version="1.0",
    description="A REST API backend.",
)
api.add_namespace(auth_blueprint)
api.add_namespace(users_namespace)
api.add_namespace(departments_namespace)
api.init_app(app)

jwt = JWTManager(app)


@jwt_required()
@app.route("/test", methods=["GET"])
def test():
    data = list(db.users.find({"is_active": True}, {"pwd": 0}))
    return Response(json_util.dumps(data), 200)


@app.after_request
def after_request(response):
    # print("After request is running!")
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "DELETE, POST, PUT, GET, OPTIONS")
    response.headers.add(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, append,delete,entries,foreach,get,has,keys,set,values,Authorization",
    )
    return response


if __name__ == "__main__":
    app.run(port=5000, debug=True)
