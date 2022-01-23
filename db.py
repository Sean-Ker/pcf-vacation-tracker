import pymongo

client = pymongo.MongoClient(
    "mongodb+srv://vacation_tracker:vt5352@cluster0.skge2.mongodb.net/VacationTracker?retryWrites=true&w=majority",
)
db = client.VacationTracker

if __name__ == "__main__":
    from pprint import pprint
    import json

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
