import pymongo
import smtplib,hashlib,random,datetime
client = pymongo.MongoClient('127.0.0.1',27017)
noveldb = client['novel']

noveldb.create_collection('novel_app')
noveldb.novel_app.insert_one({'name':'info',
                              'edition':'9 1.0.7-200912',
                              'list':['仙王的日常生活','都市修仙归来','一剑独尊','斗罗大陆'],
                              'update_list':['main.exe','novel.exe']
                              })