import pymongo
import smtplib,hashlib,random,datetime
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']

for i in list(userdb.userdata.find()):
    for j in ['user']:
        print(i[j])