# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect, send_file
import pymongo
import random
import datetime
import _thread
import time
import os
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
maindb = client['main']
chatdb = client['chat']


def getuser(user):
    if not user == session.get('user'):
        return None
    if not 'utime' in session:
        return None
    return user


# 时间字符串统一格式
TSTRING = '%Y-%m-%d %H:%M:%S.%f'

chat = Blueprint('chat', __name__)


@chat.route('/', methods=['GET'])
def chat_():
    user = getuser(request.cookies.get('user'))
    if not user:
        return render_template('error/pc.html',
                               error='<a href="/login">登录</a>后才可以进入聊天室')
    # 判断是否第一次进入
    if not chatdb.users.find_one({'user': user}):
        chatdb.users.insert_one({'user': user, 'active': False})
    if not chatdb.users.find_one({'user': user,'active': True}):
        chatdb.messages.insert_one({
            'sender': 'system',
            'time': datetime.datetime.now(),
            'text': user+' 进入聊天室',
        })
    session['chat-lt'] = '2021-06-21 12:00:00.0000'
    return render_template('chat/pc/main.html')


@chat.route('/send', methods=['POST'])
def chat_send():
    user = getuser(request.cookies.get('user'))

    chatdb.messages.insert_one({
        'sender': user,
        'time': datetime.datetime.now(),
        'photo' : '/api/userphoto/'+user,
        'text': request.form.get('msg'),
    })

    return 'True'


@chat.route('/getmessages', methods=['GET'])
def chat_getmessages():
    user = getuser(request.cookies.get('user'))
    ltime = session.get('chat-lt')
    ltime = ltime if(ltime) else '2021-06-21 12:00:00.0000'
    ltime = datetime.datetime.strptime(ltime, TSTRING)
    mes = list(chatdb.messages.find({'time': {'$gt': ltime}}))
    for i in mes:
        i['_id'] = str(i['_id'])
        i['time'] = i['time'].__format__(TSTRING[:-3])
    session['chat-lt'] = datetime.datetime.now().__format__(TSTRING)
    chatdb.users.update_one(
        {'user': user}, {'$set': {'lt': datetime.datetime.now(), 'active': True}})
    return jsonify(mes)
