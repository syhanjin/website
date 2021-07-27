import pymongo,os,hashlib,random
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
c18db = client['c18']
def register(data):
    pwdmd5 = hashlib.md5(data['pwd'].encode(encoding='UTF-8')).hexdigest()
    data['pwd'] = pwdmd5
    data['photo'] = '/static/images/photo/'+str(random.randint(1,10))+'.jpg'
    data['lvl'] = 0
    data['exp'] = 0
    data['admin'] = 0
    data['titles'] = []
    data['pmodify'] = '2019-9-10 0:0:0'
    data['lastLogin'] = '2019-9-10'
    data['ConLoginDays'] = 0
    userdb.userdata.insert_one(data)

roster = list(c18db.roster.find().sort('num',1))
for i in roster:
    print('C1818'+str(i['num']).zfill(2))
    register({'user':'C1818'+str(i['num']).zfill(2),'notActive':True,'c18':True,'pwd':'C1818'+str(i['num']).zfill(2)})
    _id = userdb.userdata.find_one({'user':'C1818'+str(i['num']).zfill(2)})['_id']
    c18db.roster.update_one({'_id':i['_id']},{'$set':{'__id':_id}})