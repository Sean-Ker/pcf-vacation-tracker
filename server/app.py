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
from flask_restx import Api, Resource

from db import db
from resources.auth import api as auth_blueprint
from resources.departments import api as departments_namespace
from resources.leave_types import api as leave_types_namespace
from resources.locations import api as locations_namespace
from resources.rule_groups import api as rule_groups_namespace
from resources.users import api as users_namespace

app = Flask(__name__, static_folder="../build", static_url_path="/")
app.config["PROPAGATE_EXCEPTIONS"] = True
app.config["JWT_SECRET_KEY"] = "PMc0kiXe0PwWSTjcPtvWBwCnHxCkQTATKvDFwfJZ"

authorizations = {
    "Bearer Auth": {"type": "apiKey", "in": "header", "name": "Authorization"},
}
api = Api(
    title="Vacation Tracker",
    authorizations=authorizations,
    security="Bearer Auth",
    version="1.0",
    description="A REST API backend.",
    doc="/api/docs",
    base_url="/api",
)
api.add_namespace(auth_blueprint)
api.add_namespace(users_namespace)
api.add_namespace(departments_namespace)
api.add_namespace(leave_types_namespace)
api.add_namespace(locations_namespace)
api.add_namespace(rule_groups_namespace)
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
    response.headers.add("Access-Control-Allow-Methods", "DELETE, POST, PUT, GET, OPTIONS, PATCH")
    response.headers.add(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin, Content-Type, Access-Control-Allow-Headers, Authorization, authorization, X-Requested-With, append,delete,entries,foreach,get,has,keys,set,values",
    )
    return response


@app.route("/")
def index():
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(port=5000, debug=True)
