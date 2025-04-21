from pymongo import MongoClient

MONGO_URL = "mongodb+srv://suyog:Srd%401998@cluster0.byl3n.mongodb.net/"
client = MongoClient(MONGO_URL)
db = client["iHelp"]
users_collection = db["users"]
help_collection = db["help_requests"]
help_offer_collection = db["help_offers"]
