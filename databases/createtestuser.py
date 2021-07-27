import pymongo
import smtplib,hashlib,random,datetime
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
data={'user':'test','pwd':'12345678','mail':'12345678@sakuyark.com'}
pwdmd5 = hashlib.md5(data['pwd'].encode(encoding='UTF-8')).hexdigest()
data['pwd'] = pwdmd5
data['photo'] = '/static/images/photo/'+str(random.randint(1,10))+'.jpg'
userdb.userdata.insert_one(data)
# userdb.userdata.update_one({'user':'hanjin'},{'$set':{'umodifydate':datetime.datetime.strptime('1949-10-1 00:00','%Y-%m-%d %H:%M')}})
# data=list(userdb.userdata.find())
# userdb.userdata.update_one({'user':'hanjin'},{'$set':{'lvl':0,'exp':500,'admin':4}})
# userdb.userdata.update_one({'user':'hanjin'},{'$set':{'titles':[{'class':'Sakuyark','text':'Sakuyark'}]}})
# userdb.userdata.update_one({'user':'hanjin'},{'$inc':{'lvl':1}})

# userdb.userdata.update_many({'user':'hanjin'},{'$set':{'lastLogin':'2019-9-10'}})
# print(data)