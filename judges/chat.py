import pymongo,datetime,os,time
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
maindb = client['main']
chatdb = client['chat']

TSTRING = '%Y-%m-%d %H:%M:%S.%f'
while True:
    users = list(chatdb.users.find({'active':True}))
    for user in users:
        lt=user['lt']
        if (datetime.datetime.now() - lt).seconds > 60:
            chatdb.messages.insert_one({
                'sender': 'system',
                'time': datetime.datetime.now(),
                'text': user['user']+' 退出聊天室',
            })
            print(datetime.datetime.now().__format__(TSTRING),user['user'],'退出')
            chatdb.users.update_one({'user':user['user']},{'$set':{'active':False}})
    time.sleep(1)