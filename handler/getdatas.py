# -*- coding: utf-8 -*-
from random import getstate
from flask import Blueprint, render_template, request, jsonify, session, redirect
from flask.helpers import send_file
import pymongo
import datetime
import os
import json
from datetime import timedelta
import base64
# from tools import userhelper
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
getdatas = Blueprint('getdatas', __name__)
userdels = ['pwd']


def getuser(_uid):
    if _uid and not (_uid == session.get('_uid')):
        return None
    if not 'utime' in session:
        return None
    return _uid


@getdatas.route('/api/about/text')
def api_about():
    data = maindb.about.find_one({'type': 'text'})
    if not data:
        return 'False'
    del data['_id']
    return jsonify(data)


@getdatas.route('/api/getnavitems')
def api_getnavitems():
    data = list(maindb.nav_item.find().sort('loca', 1))
#     print(data)
    for i in data:
        i['_id'] = str(i['_id'])
    return jsonify(data)


@getdatas.route('/api/getlinksitems')
def api_getlinksitems():
    data = list(maindb.links.find().sort('loca', 1))
    for i in data:
        i['_id'] = str(i['_id'])
    return jsonify(data)


@getdatas.route('/api/getuserdata')
def api_getuserdata():
    _uid = getuser(request.cookies.get('_uid'))
    data = userdb.userdata.find_one({'_uid': _uid})
    if data == None:
        session['_uid'] = ''
        return 'False'
    utime = datetime.datetime.strptime(
        session.get('utime'), '%Y-%m-%d %H:%M:%S')
    ptime = datetime.datetime.strptime(data['pmodify'], '%Y-%m-%d %H:%M:%S')
    # print(utime)
    # print(type(ptime))
    if utime.__lt__(ptime):
        return 'False'
    # print('T02')
    now = datetime.datetime.now()
    session['utime'] = now.__format__('%Y-%m-%d %H:%M:%S')
#     print(data['lastLogin'])
    lastlogin = datetime.datetime.strptime(data['lastLogin'], '%Y-%m-%d')
    if (lastlogin + timedelta(1)) <= now:
        cld = data['ConLoginDays'] + 1
        if (lastlogin + timedelta(2)) <= now:
            cld = 1
        exp = data['exp']
        lvl = data['lvl']
        if cld <= 7:
            exp += cld
        else:
            exp += 7
        nexp = userdb.lvldata.find_one({'lvl': data['lvl']})['exp']
        if exp >= nexp:
            exp -= nexp
            lvl += 1
        userdb.userdata.update_one({'_uid': _uid}, {'$set': {
                                   'ConLoginDays': cld, 'exp': exp, 'lvl': lvl, 'lastLogin': now.__format__('%Y-%m-%d')}})
    if 'umodifydate' not in data:
        data['umodify'] = 0
    else:
        umodify = data['umodifydate']
        day = (datetime.datetime.now() - umodify).days
        if day > 365:
            data['umodify'] = 0
        else:
            data['umodify'] = 365-day
    data['_id'] = str(data['_id'])
    for i in userdels:
        del data[i]
    return jsonify(data)


@getdatas.route('/api/getlvldata/<int:lvl>', methods=['GET'])
def api_getlvldata(lvl):
    data = userdb.lvldata.find_one({'lvl': lvl})
    if data == None:
        return False
    del data['_id']
    return jsonify(data)


# 用户头像动态获取
@getdatas.route('/api/userphoto/<_uid>')
def api_geruserphoto(_uid):
    userd = userdb.userdata.find_one({'_uid': _uid})
    if userd:
        if 'base64' in userd['photo']:
            return send_file(base64.b64decode(userd['photo'][23:]))
        return send_file(userd['photo'][1:])
    else:
        return send_file('static/images/user.png')


@getdatas.route('/novel/api/edition')
def novel_edition():
    rel = noveldb.novel_app.find_one({'name': 'info'})[
        'edition']  # '''9 1.0.7-200912'''
    return rel.encode('GBK')


@getdatas.route('/novel/api/list', methods=['GET'])
def novel_api_list():
    rel = ''
    for i in noveldb.novel_app.find_one({'name': 'info'})['list']:
        rel += i+'\n'
    return rel.encode('gbk')


@getdatas.route('/novel/api/update_list', methods=['GET'])
def novel_api_update_list():
    rel = ''
    for i in noveldb.novel_app.find_one({'name': 'info'})['update_list']:
        rel += i+'\n'
    return rel.encode('gbk')


@getdatas.route('/novel/api/bookcontent')
def novel_api_content():
    id = request.args.get('id')
    chapter = request.args.get('chapter')
    content = noveldb.novel_content.find_one(
        {'id': id, 'chapter': int(chapter)})['content']
    msg = content.split('\n')
    rel = ''''''
    for i in range(len(msg)):
        if not msg[i] == '':
            rel += '<p em="2" style="text-indent: 2em;margin-left: 10px;margin-right:10px;font-size:28px;">' + \
                msg[i] + '</p>'
    rel = rel + '<a style="display:block;font-size:28px;" href="/novel/api/bookcontent?id=' + \
        id + '&chapter=' + str(int(chapter) + 1) + '">下一章</a>'
    return rel


@getdatas.route('/admin/logs', methods=['GET'])
def admin_logs():
    return '''<form method='post' active='/admin/logs' style="width: 100%;height:100%;">
<input type="password" name="password" placeholder="密码" />
<input type="submit" value="OK" />
</form>
'''


'''
@getdatas.route('/admin/logs', methods=['POST'])
def admin_logs_post():
    pwd = request.form.get('password')
    if pwd == None or not pwd == '106.15.75.84@Aichi':
        return redirect('/')
    f = open('log_443.log', 'r')
    text = f.read().replace('&', '&&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace('\'', '&apos;').replace('\n', '<br/>')
    return text
'''


@getdatas.route('/api/gaa/list/timestamp')
def gaa_list_timestamp():
    return str(os.path.getmtime('static/file/GAA/host-list.txt'))


@getdatas.route('/api/gaa/list')
def gaa_list():
    return send_file('static/file/GAA/host-list.txt')


@getdatas.route('/api/gaa/win/timestamp')
def gaa_win_timestamp():
    return str(os.path.getmtime('static/file/GAA/GitHub-Access-Acceleration.exe'))


@getdatas.route('/api/gaa/win')
def gaa_win():
    return send_file('static/file/GAA/GitHub-Access-Acceleration.exe')


@getdatas.route('/api/gaa/py')
def gaa_py():
    return send_file('static/file/GAA/GitHub-Access-Acceleration.py')


@getdatas.route('/api/gaa/edid')
def gaa_edid():
    return '5'

# uni-app 自动更新请求


@getdatas.route('/api/uniapp/update', methods=['POST'])
def api_uniapp_update():
    version = float(request.form.get('version'))
    version_dict = {
        "isUpdate": True,
        "downloadAndroidUrl": 'https://sakuyark.com/static/file/sakuyark.apk',
        "downloadIOSUrl": 'null',
        "note": "版本已更新,请下载最新版本v1.4",
    } if version < 1.4 else {
        "isUpdate": False,
        "note": "当前已经是最新版本",
    }
    return jsonify(version_dict)
