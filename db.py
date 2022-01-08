import pymongo

client = pymongo.MongoClient(
    "mongodb+srv://oanda:oanda5253@cluster0.skge2.mongodb.net/Main?retryWrites=true&w=majority"
)
db = client.VacationTracker
