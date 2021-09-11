# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect, make_response
import pymongo
import random
import datetime
import os
import hashlib
import base64
from handler import _0

client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
activdb = client['activity']
userb = Blueprint('user', __name__)
usermb = Blueprint('userm', __name__)


def getuser(_uid):
    if _uid and not session.get('_uid') == _uid:
        return None
    return _uid


def getactivities(_uid, my_uid, page):
    '''
    动态分为3中类型  public, friends, private
                    公开    好友可见  私密
    按时间排序
    activdb = client['activity']
    _uid 为 `_uid` 的用户动态储存在 activdb['_uid'] 中
    '''
    # 检测是否存在集合
    if _uid not in list(activdb.collection_names()):
        activdb.create_collection(_uid)
        # 不存在则创建
    # 判断是否是朋友
    if userdb.friends.find_one({'_uid1': _uid, '_uid2': my_uid}):
        activities = activdb[_uid].find({
            '$or': [
                {'allow': 'public'},
                {'allow': 'friends'}
            ]
        })
    else:
        activities = activdb[_uid].find({'allow': 'public'})
    activities = list(activities.sort('time', -1).skip((page-1)*5).limit(5))
    for i in activities:
        i['_id'] = str(i['_id'])
    return activities


# 页面
# 电脑版


@userb.route('/settings')
def user_settings():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return redirect('/login')
    return render_template('/user/pc/settings.html')


@userb.route('/<string:_uid>')
def user_display(_uid):
    data = userdb.userdata.find_one({'_uid': _uid})
    if data == None:
        return render_template('error/pc.html', error='找不到用户：uid='+_uid), 404
    my_uid = getuser(request.cookies.get('_uid'))
    data['is_mine'] = (my_uid == data['_uid'])
    # 获取等级信息
    lvld = userdb.lvldata.find_one({'lvl': data['lvl']})
    data['max_exp'] = lvld['exp']
    return render_template('user/pc/display.html', data=data, my_uid=my_uid)
# 手机版


@usermb.route('/settings')
def user_m_settings():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return redirect('/login')
    return render_template('/user/m/settings.html')


@usermb.route('/<string:_uid>')
def user_m_display(_uid):
    data = userdb.userdata.find_one({'_uid': _uid})
    if data == None:
        return render_template('error/m.html', error='找不到用户：uid='+_uid)
    data['is_mine'] = (_uid == data['_uid'])
    return render_template('user/m/display.html', data=data)

# 操作
# 查找用户---目前主要为chat服务


@userb.route('/search')
def user_search():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return {'code': 3}
    u = request.args.get('u')
    users = list(userdb.userdata.find(
        {'user': {'$regex': u, '$options': 'i'}}).limit(30))
    if users == []:
        return jsonify([])
    import pandas as pd
    users = pd.DataFrame(users)
    users = users[['user', '_uid']].to_dict(orient='index')
    return jsonify(users)


@userb.route('/modify/personalized', methods=['POST'])
def user_modify_pres():
    _uid = getuser(request.cookies.get('_uid'))
    text = request.form.get('text')
    if _uid == None:
        return {'code': 3}
    if text == None:
        return {'code': 1, 'error': 'not text'}
    userdb.userdata.update_one(
        {'_uid': _uid}, {'$set': {'personalized': text}})
    return _0


@userb.route('/<string:_uid>/introduction')
def user_uid_intr(_uid):
    data = userdb.userdata.find_one({'_uid': _uid})
    if not data or 'introduction' not in data:
        return {'code': 2}
    return {'code': 0, 'data': data['introduction']}


@userb.route('/<string:_uid>/activity')
def user_uid_acti(_uid):
    my_uid = getuser(request.cookies.get('_uid'))
    page = int(request.args.get('page'))
    activities = getactivities(_uid, my_uid, page)
    return jsonify(activities)


@userb.route('/modify/introduction', methods=['POST'])
def user_modify_intr():
    _uid = getuser(request.cookies.get('_uid'))
    text = request.form.get('text')
    if _uid == None:
        return {'code': 3}
    if text == None:
        return {'code': 1, 'error': 'not text'}
    userdb.userdata.update_one({'_uid': _uid}, {'$set': {
        'introduction': text
    }})
    return _0


@userb.route('/settings/uplphoto', methods=['POST'])
def user_settings_uplphoto():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return {'code': 3}
    dataURL = request.form.get('dataURL')[23:]
    # 将base64转为图片文件
    img = base64.b64decode(dataURL)
    # 按时间生成随机文件名
    fn = 'static/photos/'+datetime.datetime.now().__format__('%Y%m%d%H%M%S') + \
        str(random.randint(100, 999))+'.jpg'
    with open(fn, 'wb') as f:
        f.write(img)
    # 删除原本文件
    lp = userdb.userdata.find_one({'_uid': _uid})['photo']
    if '/static/photos' in lp:  # 判断是否存在/static/photos
        try:
            os.remove(lp[1:])
        except:
            pass
    userdb.userdata.update_one({'_uid': _uid}, {'$set': {'photo': '/'+fn}})
    return _0


@userb.route('/settings/setuser', methods=['POST'])
def user_settings_setuser():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return {'code': 3}
    nuser = request.form.get('user')
    if not userdb.userdata.find_one({'user': nuser}) == None:
        return {'code': 2}
    data = userdb.userdata.find_one({'_uid': _uid})
#     print(data)
    if 'umodifydate' not in data or (datetime.datetime.now() - data['umodifydate']).days > 365:
        userdb.userdata.update_one({'_uid': _uid}, {
                                   '$set': {'user': nuser, 'umodifydate': datetime.datetime.now()}})
        return _0
    return {'code': -1}


@userb.route('/settings/pwdmodify', methods=['POST'])
def user_settings_modify_pwd():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return {'code': 3}
    old = request.form.get('old')
    oldmd5 = hashlib.md5(old.encode(encoding='UTF-8')).hexdigest()
    data = userdb.userdata.find_one({'_uid': _uid})
    if not data['pwd'] == oldmd5:
        return {'code': 1, 'error': 'pwd wrong'}
    new = request.form.get('new')
    newmd5 = hashlib.md5(new.encode(encoding='UTF-8')).hexdigest()
    session['utime'] = datetime.datetime.now().__format__('%Y-%m-%d %H:%M:%S')
    userdb.userdata.update_one(
        {'_uid': _uid}, {'$set': {'pwd': newmd5, 'pmodify': session['utime']}})
    return _0
