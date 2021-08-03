#!/usr/bin/python
# -*- coding: utf-8 -*-
import pymongo
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
guestbookdb = client['guestbook']
maindb = client['main']
noveldb = client['novel']
# print(noveldb.novel_content.find_one({'chapter':1}))
# t=''
f=open('斗罗大陆.txt', 'r')
t=f.read().decode('gbk').encode('utf-8')
novels=t.split('|')
for i in range(len(novels)):
    print(i+1)
    noveldb.novel_content.insert_one({'id':'10000005','name':'斗罗大陆','chapter':i+1,'title':'','content':novels[i]})