# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect, make_response
import pymongo
import random
import datetime
import os
import hashlib
import base64
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
maindb = client['main']
chatb = Blueprint('chat', __name__)


def getuser(_uid):
    if _uid and not session.get('_uid') == _uid:
        return None
    return _uid
# 电脑版


@chatb.route('/', methods=['GET'])
def chat():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return redirect('/login')
    return render_template('chat/pc/main.html')


'''
@chatb.route('/mes')
def chat_mes():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return 'False'
    mess = chat
'''


# 操作
@chatb.route('/modify/allowStrangers')
def modify_allow_strangers():
    _uid = getuser(request.cookies.get('_uid'))
    s = request.args.get('s')
    if not s or not _uid:
        return 'False'
    userdb.userdata.update_one(
        {'_uid': _uid}, {'$set': {'allowStrangers': (s == 'yes')}})
    return 'True'
