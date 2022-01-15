from db import db


def get_user_by_id(id: int, find_managed_employees: bool = False):
    user = db.users.find_one({"_id": id}, {"pwd": 0})
    if not user:
        return None
    user["department"] = db.departments.find_one({"_id": user.get("department_id", None)})
    user["manager"] = db.users.find_one({"_id": user.get("manager_id", None)})
    if find_managed_employees:
        user["employees"] = list(db.users.find({"manager_id": user.get("_id", None)}))
    return user
