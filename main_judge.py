# -*- coding: utf-8 -*-
import pymongo,datetime,time
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']

def judge_retrieve():
    time = datetime.datetime.now() + datetime.timedelta(minutes=-15)
    userdb.retrieve.delete_many({'time':{'$lt':time}})
    # print(time.strftime('%Y-%m-%d %H:%M:%S'))
    # print(userdb.retrieve.find().count())
def judge_activate():
    time = datetime.datetime.now() + datetime.timedelta(minutes=-15)
    userdb.activate.delete_many({'time':{'$lt':time}})
    # print(time.strftime('%Y-%m-%d %H:%M:%S'))
    # print(userdb.retrieve.find().count())

while True:
    judge_retrieve()
    judge_activate()
    time.sleep(15)