# -*- coding: utf-8 -*-
import datetime
from datetime import timedelta
import pymongo
client = pymongo.MongoClient('127.0.0.1', 27017)
audiodb = client['audio']


audiodb.drop_collection('separator')
audiodb.create_collection('separator')
audiodb.separator.insert_one({
    'id': '123456',
    'status': 'finished',
    '_uid': '9889573',
    'time': datetime.datetime.now()
})
audiodb.separator.insert_one({
    'id': '1234567',
    'status': 'finished',
    '_uid': '9889573',
    'time': datetime.datetime.now()-datetime.timedelta(hours=25)
})
