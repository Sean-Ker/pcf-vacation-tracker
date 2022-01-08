import pymongo

client = pymongo.MongoClient(
    "mongodb+srv://oanda:oanda5253@cluster0.skge2.mongodb.net/Main?retryWrites=true&w=majority",
    replicaSet="rs0",
)
db = client.VacationTracker
