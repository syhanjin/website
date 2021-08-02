import pymongo
import smtplib,hashlib,random,datetime
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
# userdb.userdata.update_many({'lvl':None},{'$set':{'lvl':0}})
# userdb.userdata.update_many({'exp':None},{'$set':{'exp':0}})
# userdb.userdata.update_many({'admin':None},{'$set':{'admin':0}})
# userdb.userdata.update_many({'titles':None},{'$set':{'titles':[]}})
# userdb.userdata.update_many({'pmodify':None},{'$set':{'pmodify':'2019-9-10 0:0:0'}})
# userdb.userdata.update_many({'lastLogin':None},{'$set':{'lastLogin':'2019-9-10'}})
# userdb.userdata.update_many({'ConLoginDays':None},{'$set':{'ConLoginDays':0}})

for i in list(userdb.userdata.find({'_uid':None})):
    _uid = str(random.randint(1000000,9999999))
    while userdb.userdata.find_one({'_uid':_uid}) != None:
        _uid = str(random.randint(1000000,9999999))
    print(i['user'],'--> _uid = ',_uid)
    userdb.userdata.update_one({'_id':i['_id']},{'$set':{'_uid':_uid}})