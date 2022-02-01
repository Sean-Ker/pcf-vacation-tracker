import pymongo

client = pymongo.MongoClient(
    "mongodb+srv://vacation_tracker:vt5352@cluster0.skge2.mongodb.net/VacationTracker?retryWrites=true&w=majority",
)
db = client.VacationTracker

if __name__ == "__main__":
    from pprint import pprint
    import json
    from bson import ObjectId

    """ Save users to json """
    # users = list(db.users.find({}))
    # for user in users:
    #     employees = list(db.users.find({"manager_id": user.get("_id", None)}, {"_id": 1}))
    #     employees = [employee["_id"] for employee in employees]
    #     user["employees"] = employees
    # with open("users.json", "w+") as f:
    #     f.write(json.dumps(users))

    """ Delete all leave types """
    # db.users.update_many({}, {"$unset": {"leaves": 1}})

    """ Change all emails to lowercase """
    # users = list(db.users.find({}))
    # for user in users:
    #     id = user["_id"]
    #     db.users.update_one({"_id": id}, {"$set": {"email": user["email"].lower()}})

    """ Change all the departments id to ObjectId """
    # db.users.delete_many({})
    # db.departments.delete_many({})
    departments = list(db.departments.find({}))
    users = list(db.users.find())
    for d in departments:
        did = d["_id"]
        print(f"Old department id: {did}")
        db.departments.delete_one({"_id": did})
        data = d
        del data["_id"]
        db.departments.insert_one(data)
        new_did = db.departments.find_one({"name": d["name"]})
        new_did = str(new_did["_id"])
        print(f"New department id: {new_did}")
        db.users.update_many({"department_id": did}, {"$set": {"department_id": new_did}})

    """ Convert department_id object to string """
    # users = list(db.users.find())
    # for u in users:
    #     db.users.update_many(
    #         {"department_id": u["department_id"]}, {"$set": {"department_id": str(u["department_id"]["_id"])}}
    #     )
