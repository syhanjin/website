# -*- coding: utf-8 -*-
import pymongo
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']

userdb.drop_collection('friends')
userdb.create_collection('friends')