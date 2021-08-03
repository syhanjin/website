# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect,make_response
import pymongo,random,datetime,re,os,hashlib
import base64
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
userb = Blueprint('user', __name__)
usermb = Blueprint('userm',__name__)
def getuser(_uid):
    if session.get('_uid') == _uid:
        return _uid
    return None
# 页面
## 电脑版
@userb.route('/settings')
def user_settings():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return redirect('/login')
    return render_template('/user/pc/settings.html')
@userb.route('/<string:_uid>')
def user_display(_uid):
    ud = userdb.userdata.find_one({'_uid':_uid})
    if ud == None:
        return render_template('error/pc.html',error='找不到用户：uid='+_uid)
    return render_template('user/pc/display.html',data=ud)

## 手机版
@usermb.route('/settings')
def user_m_settings():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return redirect('/login')
    return render_template('/user/m/settings.html')
@usermb.route('/<string:_uid>')
def user_m_display(_uid):
    ud = userdb.userdata.find_one({'_uid':_uid})
    if ud == None:
        return render_template('error/m.html',error='找不到用户：uid='+_uid)
    return render_template('user/m/display.html')

# 操作
@userb.route('/settings/uplphoto',methods=['POST'])
def user_settings_uplphoto():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return 'False'
    dataURL = request.form.get('dataURL')[23:]
    # 将base64转为图片文件
    img = base64.b64decode(dataURL)
    # 按时间生成随机文件名
    fn = 'static/photos/'+datetime.datetime.now().__format__('%Y%m%d%H%M%S')+str(random.randint(100,999))+'.jpg'
    with open(fn,'wb') as f:
        f.write(img)
    # 删除原本文件
    lp = userdb.userdata.find_one({'_uid':_uid})['photo']
    if '/static/photos' in lp: # 判断是否存在/static/photos
        try:
            os.remove(lp[1:])
        except:
            pass
    userdb.userdata.update_one({'_uid':_uid},{'$set':{'photo':'/'+fn}})
    return 'True'
@userb.route('/settings/setuser',methods=['POST'])
def user_settings_setuser():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return 'Not Logged In'
    nuser = request.form.get('user')
    if not userdb.userdata.find_one({'user':nuser}) == None:
        return 'Existed'
    data = userdb.userdata.find_one({'_uid':_uid})
#     print(data)
    if 'umodifydate' not in data or (datetime.datetime.now() - data['umodifydate']).days > 365:
        userdb.userdata.update_one({'_uid':_uid},{'$set':{'user':nuser,'umodifydate':datetime.datetime.now()}})
        return 'True'
    return 'False'
@userb.route('/settings/pwdmodify',methods=['POST'])
def user_settings_modify_pwd():
    _uid = getuser(request.cookies.get('_uid'))
    if _uid == None:
        return 'Not Logged In'
    old = request.form.get('old')
    oldmd5 = hashlib.md5(old.encode(encoding='UTF-8')).hexdigest()
    data = userdb.userdata.find_one({'_uid':_uid})
    if not data['pwd'] == oldmd5:
        return 'pwd wrong'
    new = request.form.get('new')
    newmd5 = hashlib.md5(new.encode(encoding='UTF-8')).hexdigest()
    session['utime']=datetime.datetime.now().__format__('%Y-%m-%d %H:%M:%S')
    userdb.userdata.update_one({'_uid':_uid},{'$set':{'pwd':newmd5,'pmodify':session['utime']}})
    return 'True'
