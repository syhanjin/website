import pymongo
import smtplib
import hashlib
import random
import datetime
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
# userdb.userdata.update_many({'lvl':None},{'$set':{'lvl':0}})
# userdb.userdata.update_many({'exp':None},{'$set':{'exp':0}})
# userdb.userdata.update_many({'admin':None},{'$set':{'admin':0}})
# userdb.userdata.update_many({'titles':None},{'$set':{'titles':[]}})
userdb.userdata.update_many({'ddd':None},{'$set':{'pmodify': datetime.datetime(2021, 6, 20)}})
# userdb.userdata.update_many({'lastLogin':None},{'$set':{'lastLogin':'2019-9-10'}})
# userdb.userdata.update_many({'ConLoginDays':None},{'$set':{'ConLoginDays':0}})

# for i in list(userdb.userdata.find({'_uid':None})):
#     _uid = str(random.randint(1000000,9999999))
#     while userdb.userdata.find_one({'_uid':_uid}) != None:
#         _uid = str(random.randint(1000000,9999999))
#     print(i['user'],'--> _uid = ',_uid)
#     userdb.userdata.update_one({'_id':i['_id']},{'$set':{'_uid':_uid}})

st = 100000
for i in list(userdb.userdata.find()):
    print(f"{i['user']} -> {st}")
    userdb.userdata.update_one(
        {'_uid': i['_uid']},
        {
            '$set': {'_uid': st}
        })
    st += 1
print(list(userdb.userdata.find()))
print(
    list(
        userdb.userdata.find()
        .sort('_uid', -1).limit(1)
    )
    [0]['_uid'] + 1
)
