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
from resources.leave_requests import api as leave_requests_namespace
from resources.locations import api as locations_namespace
from resources.rule_groups import api as rule_groups_namespace
from resources.users import api as users_namespace
from resources.companies import api as companies_namespace
from resources.logs import api as logs_namespace

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
    prefix="/api",
)
api.add_namespace(auth_blueprint)
api.add_namespace(users_namespace)
api.add_namespace(departments_namespace)
api.add_namespace(leave_types_namespace)
api.add_namespace(leave_requests_namespace)
api.add_namespace(locations_namespace)
api.add_namespace(rule_groups_namespace)
api.add_namespace(companies_namespace)
api.add_namespace(logs_namespace)
api.init_app(app)

jwt = JWTManager(app)


# @jwt_required()
# @app.route("/test", methods=["GET"])
# def test():
#     data = list(db.users.find({"is_active": True}, {"pwd": 0}))
#     return Response(json_util.dumps(data), 200)


@app.after_request
def after_request(response):
    # print("After request is running!")
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS,PATCH,HEAD")
    response.headers.add(
        "Access-Control-Allow-Headers",
        "Accept,Access-Control-Allow-Credentials,Access-Control-Allow-Credentials,Access-Control-Allow-Headers,Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Origin,Access-Control-Expose-Headers,Access-Control-Max-Age,Access-Control-Request-Headers,Access-Control-Request-Method,Append,Authorization,contenttype,Content-Type,Delete,Dntries,Foreach,Gas,Get,Keys,Origin,Set,ValuesX-Requested-With,X-CSRF-Token,X-Requested-With,X-XSRF-Token",
    )
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Expose-Headers", "Link")
    response.headers.add("Access-Control-Max-Age", "3600")
    response.headers.add("Access-Control-Allow-Headers", "")
    return response


@app.route("/")
def serve():
    return app.send_static_file("index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(port=5000, debug=True, threaded=True)
