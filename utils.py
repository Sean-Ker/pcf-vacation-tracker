from db import db


def get_user_by_id(id: int):
    user = db.user.find_one({"_id": id}, {"pwd": 0})
    if not user:
        return None
    user["department"] = db.departments.find_one({"_id": user.get("department_id", None)})
    user["manager"] = db.user.find_one({"_id": user.get("manager_id", None)})
    user["employees"] = list(db.user.find({"manager_id": user.get("_id", None)}))
    return user
