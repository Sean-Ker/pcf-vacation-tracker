import pymongo

client = pymongo.MongoClient(
    "mongodb+srv://vacation_tracker:vt5352@cluster0.skge2.mongodb.net/VacationTracker?retryWrites=true&w=majority",
)
db = client.VacationTracker
