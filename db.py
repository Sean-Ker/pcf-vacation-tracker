import pymongo

client = pymongo.MongoClient(
    "mongodb+srv://vacation_tracker:vt5352@cluster0.skge2.mongodb.net/Main?retryWrites=true&w=majority&replicaSet=atlas-ceg8rh-shard-0",
)
db = client.VacationTracker
