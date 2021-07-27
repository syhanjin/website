import pymongo
import smtplib,hashlib,random,datetime
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
# userdb.userdata.update_one({'user':'hanjin'},{'$set':{'admin':4}})
userdb.userdata.update_one({'user':'C181823'},{'$set':{'admin':3}})