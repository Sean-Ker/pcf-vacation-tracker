import json
from datetime import datetime, timezone, timedelta
from pprint import pprint

import validators
from bson import json_util
from bson.objectid import ObjectId
from flask import Blueprint, Flask, Response, request, jsonify
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_jwt,
    jwt_required,
)
from flask_restx import Api, Resource

from auth import api as auth_blueprint
from users import api as users_namespace

app = Flask(__name__)
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
)
api.add_namespace(auth_blueprint)
api.add_namespace(users_namespace)
api.init_app(app)

jwt = JWTManager(app)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
