# -*- coding: utf-8 -*-
import re
from typing_extensions import Required
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
chatdb = client['chat']
chatb = Blueprint('chat', __name__)

'''
# chat
# s_uid ==> 发送者_uid
# r_uid ==> 接收者_uid
# text  ==> 内容
# ---------- 发送消息 ----------

# 头像动态获取 ---> /api/userphoto/`s_uid`
-- OK --
chatdb.messages.insert_one({
    's_uid': s_uid,
    'r_uid': r_uid,
    'time': datetime.datetime.now(),
    'text': text,
    'read': False
})
-- OK --
# ---------- 接收消息 ----------
# 统计未读消息数量
-- OK --
chatdb.messages.find({'read': False, 'r_uid': r_uid}).count()
-- OK --
# 统计 s_uid 发送的未读消息数量
-- OK --
chatdb.messages.find({'read': False, 's_uid': s_uid, 'r_uid': r_uid}).count()
-- OK --

# 获取 s_uid 发送的消息 第page页 每页消息 20条 (未读消息一定是连续的最新的)
-- OK --
list(chatdb.messages.find({'s_uid': s_uid,'r_uid':r_uid}).sort(
    'time', -1).skip((page - 1) * 20).limit(20))
-- OK --
# 将所有消息设为已读
-- OK --
chatdb.messages.update_many({'s_uid': s_uid, 'r_uid': r_uid}, {
                            '$set': {'read': True}})
-- OK --

# sender 的顺序列表
-- OK --
# ↓ 发送消息后执行 ↓
if chatdb.list.find_one({'s_uid': s_uid, 'r_uid': r_uid}): # 如果已有就升级
    chatdb.list.update_one({'s_uid': s_uid, 'r_uid': r_uid},{'$set':{
        'time': datetime.datetime.now(),
        'intro': text[:50]
    }})
else: # 没有就添加
    chatdb.list.insert_one({
        's_uid': s_uid,
        'r_uid': r_uid,
        'time': datetime.datetime.now(),
        'intro': text[:50],
    })
-- OK --
# 获取列表，因为量不会太多，一次获取
-- OK --
chatdb.list.find({'r_uid':r_uid}).sort('time',-1)
-- OK --
'''


def send_msg(s_uid, r_uid, text):  # 发送消息
    #
    chatdb.messages.insert_one({
        's_uid': s_uid,
        'r_uid': r_uid,
        'time': datetime.datetime.now(),
        'text': text,
        'read': False
    })
    # 更新列表
    if chatdb.list.find_one({'s_uid': s_uid, 'r_uid': r_uid}):  # 如果已有就升级
        chatdb.list.update_one({'s_uid': s_uid, 'r_uid': r_uid}, {'$set': {
            'time': datetime.datetime.now(),
            'intro': text[:50]
        }})
    else:  # 没有就添加
        chatdb.list.insert_one({
            's_uid': s_uid,
            'r_uid': r_uid,
            'time': datetime.datetime.now(),
            'intro': text[:50],
        })


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


# 操作
# 发送 消息
@chatb.route('/send_msg', methods=['POST'])
def chat_send_msg():
    _uid = getuser(request.cookies.get('_uid'))
    r_uid = request.form.get('r_uid')
    text = request.form.get('text')
    if not _uid or not r_uid or not text:
        return 'False'
    send_msg(_uid, r_uid, text)
    return 'True'


# 获取未读消息数量
@chatb.route('/unread_msg/count')
def chat_unread_msg_count():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return 'False'
    return chatdb.messages.find({'read': False, 'r_uid': _uid}).count()


# 获取未读消息
@chatb.route('/unread_msg/<string:s_uid>')
def chat_unread_msg_s_uid(s_uid):
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return 'False'
    datas = list(chatdb.messages.find(
        {'read': False, 's_uid': s_uid, 'r_uid': _uid}))
    # 将所有未读消息设置为已读
    chatdb.messages.update_many({'s_uid': s_uid, 'r_uid': _uid}, {
        '$set': {'read': True}})
    for data in datas:
        data['_id'] = str(data['_id'])
    return jsonify(datas)


# 获取消息 & 页码 & timestamp
@chatb.route('/all_msg/<string:s_uid>')
def chat_all_msg_s_uid(s_uid):
    _uid = getuser(request.cookies.get('_uid'))
    page = request.args.get('p')
    timestamp = request.args.get('t')
    if not _uid or not page or not timestamp:
        return 'False'
    time = datetime.datetime.fromtimestamp(float(timestamp))
    # 获取消息，只获取timestamp以前的消息，因为新消息会打乱分页
    datas = list(chatdb.messages.find({
        's_uid': s_uid,
        'r_uid': _uid,
        'time': {'$lte': time}
    }).sort('time', -1).skip((page - 1) * 20).limit(20))
    # 将所有未读消息设置为已读
    chatdb.messages.update_many({
        's_uid': s_uid,
        'r_uid': _uid
    }, {'$set': {'read': True}})
    for data in datas:
        data['_id'] = str(data['_id'])
    return jsonify(datas)


# 获取 sender 列表
@chatb.route('/list')
def chat_list():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return 'False'
    datas = list(chatdb.list.find({'r_uid': _uid}))
    for data in datas:
        data['count'] = chatdb.messages.find(
            {'read': False, 's_uid': data['s_uid'], 'r_uid': _uid}).count()
        data['s_user'] = userdb.userdata.find_one(
            {'_uid': data['s_uid']})['user']
        data['_id'] = str(data['_id'])
    return jsonify(data)


# 修改信息 是否允许陌生人发消息
@chatb.route('/modify/allowStrangers')
def modify_allow_strangers():
    _uid = getuser(request.cookies.get('_uid'))
    s = request.args.get('s')
    if not s or not _uid:
        return 'False'
    userdb.userdata.update_one(
        {'_uid': _uid}, {'$set': {'allowStrangers': (s == 'yes')}})
    return 'True'
