from datetime import datetime
import pymongo,datetime

client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
chatdb = client['chat']

# chatdb.drop_collection('messages')
# chatdb.create_collection('messages')

# 
chatdb.messages.insert_one({
    'time':datetime.datetime.now(),
    'sender':'hanjin',
    'text':'sb',
    'photo':'/static/photos/20210726115120323.jpg'
})