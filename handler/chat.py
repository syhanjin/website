# -*- coding: utf-8 -*-
import re
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
TSTRING = "%Y-%m-%d %H:%M:%S"
chatb = Blueprint('chat', __name__)


# 更新消息列表
def msg_list(s_uid, r_uid, text, type, T=False):
    if type == 'text':
        if chatdb.list.find_one({'s_uid': s_uid, 'r_uid': r_uid}):  # 如果已有就升级
            chatdb.list.update_one({'s_uid': s_uid, 'r_uid': r_uid}, {'$set': {
                'time': datetime.datetime.now(),
                'last_msg': text[:50]
            }})
        else:  # 没有就添加
            chatdb.list.insert_one({
                's_uid': s_uid,
                'r_uid': r_uid,
                'time': datetime.datetime.now(),
                'last_msg': text[:50],
            })
        if not T:
            msg_list(r_uid, s_uid, text, type, True)  # 双向边
    elif type == 'mkfriends':
        # 双方的提示信息不同
        msg_list(s_uid, r_uid, '对方请求添加你为好友', 'text', True)
        msg_list(r_uid, s_uid, '交友请求已发送', 'text', True)
    elif type == 'refuse_friend':
        # 拒绝交友
        send_msg(s_uid, r_uid, '对方拒绝了你的交友请求', TOLIST=False)
        msg_list(s_uid, r_uid, '对方拒绝了你的交友请求', 'text', True)
        # 删除自己收到的消息
        chatdb.messages.delete_many(
            {'s_uid': r_uid, 'r_uid': s_uid, 'type': 'mkfriends'})
        chatdb.list.delete_one({'s_uid': r_uid, 'r_uid': s_uid})
    pass


# 发送一条消息
def send_msg(s_uid, r_uid, text, type='text', TOLIST=True):
    chatdb.messages.insert_one({
        's_uid': s_uid,
        'r_uid': r_uid,
        'time': datetime.datetime.now(),
        'text': text,
        'type': type,
        'read': False
    })
    # 更新消息列表
    if TOLIST:
        msg_list(s_uid, r_uid, text, type)


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
# 判断是否有这个人
@chatb.route('/has_uid')
def has_uid():
    u = request.args.get('u')
    data = userdb.userdata.find_one({'_uid':u})
    if not data:
        return 'False'
    return data['user']


# 请求添加好友
@chatb.route('/make_friends',methods=['POST'])
def make_friends():
    _uid = getuser(request.cookies.get('_uid'))
    _uid2 = request.form.get('u')
    text = request.form.get('t')
    if not _uid or not _uid2 or not text:
        return 'False'
    if userdb.friends.find_one({'_uid1': _uid, '_uid2': _uid2}):  # 如果已经是好友
        return 'True'
    if chatdb.messages.find_one({
        's_uid': _uid,
        'r_uid': _uid2,
        'read': False,
        'type': 'mkfriends'
    }):  # 如果发送过交友请求且对方未读
        return 'False'
    send_msg(_uid, _uid2, text, 'mkfriends')
    return 'True'


# 同意添加好友
@chatb.route('/make_friends/accept')
def agree_make_friends():  # GET u ==> 对方 _uid
    _uid = getuser(request.cookies.get('_uid'))
    _uid2 = request.args.get('u')
    if not _uid or not _uid2:
        return 'False'
    if userdb.friends.find_one({'_uid1': _uid, '_uid2': _uid2}):  # 如果已经是好友
        return 'True'
    # 交友，建双向边
    userdb.friends.insert_many([
        {'_uid1': _uid, '_uid2': _uid2},
        {'_uid1': _uid2, '_uid2': _uid}
    ])
    # 发送一条消息
    send_msg(_uid, _uid2, '我们已经是好友啦，一起来聊天吧！')
    # 删除原本的交友请求
    chatdb.messages.delete_many(
        {'s_uid': _uid2, 'r_uid': _uid, 'type': 'mkfriends'})
    return 'True'


# 不同意添加好友
@chatb.route('/make_friends/refuse')
def disagree_make_friends():  # GET u ==> 对方 _uid
    _uid = getuser(request.cookies.get('_uid'))
    _uid2 = request.args.get('u')
    if not _uid or not _uid2:
        return 'False'
    # 发送一条消息
    msg_list(_uid, _uid2, '', 'refuse_friend')
    return 'True'


# 发送 消息
@chatb.route('/send_msg', methods=['POST'])
def chat_send_msg():  # post r_uid, text
    _uid = getuser(request.cookies.get('_uid'))
    r_uid = request.form.get('r_uid')
    text = request.form.get('text')
    if not _uid or not r_uid or not text:
        return 'False'
    # 首先判断对方是否允许陌生人发消息
    if not userdb.userdata.find_one({'_uid': r_uid}).get('allowStrangers'):
        # 如果不允许判断是否是好友
        if not userdb.friends.find_one({'_uid1': _uid, '_uid2': r_uid}):
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
        {'read': False, 's_uid': s_uid, 'r_uid': _uid}).sort('time', 1))
    # 将所有未读消息设置为已读
    chatdb.messages.update_many({'s_uid': s_uid, 'r_uid': _uid, 'read': False}, {
        '$set': {'read': True}})
    for data in datas:
        data['_id'] = str(data['_id'])
        data['time'] = data['time'].__format__(TSTRING)
    return jsonify(datas)


# 获取消息 & 页码 & timestamp
@chatb.route('/all_msg/<string:s_uid>')
def chat_all_msg_s_uid(s_uid):  # p ==> page, t ==> timestamp
    _uid = getuser(request.cookies.get('_uid'))
    page = int(request.args.get('p'))
    timestamp = request.args.get('t')
    if not _uid or not page or not timestamp:
        return 'False'
    time = datetime.datetime.fromtimestamp(float(timestamp))
    # 获取消息，只获取timestamp以前的消息，因为新消息会打乱分页
    datas = list(chatdb.messages.find({
        '$or':[
            {'s_uid': s_uid,'r_uid': _uid},
            {'s_uid': _uid,'r_uid': s_uid}
        ],
        'time': {'$lte': time}
    }).sort('time', -1).skip((page - 1) * 20).limit(20))
    # 将timestamp之前的未读消息设置为已读
    chatdb.messages.update_many({
        's_uid': s_uid,
        'r_uid': _uid,
        'read': False,
        'time': {'$lte': time}
    }, {'$set': {'read': True}})
    for data in datas:
        data['_id'] = str(data['_id'])
        data['time'] = data['time'].__format__(TSTRING)
    return jsonify(datas)


# 获取 sender 列表
@chatb.route('/list')
def chat_list():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return 'False'
    datas = list(chatdb.list.find({'r_uid': _uid}).sort('time', -1))
    for data in datas:
        data['count'] = chatdb.messages.find(
            {'read': False, 's_uid': data['s_uid'], 'r_uid': _uid}).count()
        data['s_user'] = userdb.userdata.find_one(
            {'_uid': data['s_uid']})['user']
        data['_id'] = str(data['_id'])
        data['time'] = data['time'].__format__(TSTRING)
    return jsonify(datas)


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


# 修改信息 是否使用 Ctrl + Enter 发送消息
@chatb.route('/modify/MSG_CTRL')
def modify_msg_ctrl():
    _uid = getuser(request.cookies.get('_uid'))
    s = request.args.get('s')
    if not s or not _uid:
        return 'False'
    userdb.userdata.update_one(
        {'_uid': _uid}, {'$set': {'MSG_CTRL': (s == 'yes')}})
    return 'True'
