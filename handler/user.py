# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect,make_response
import pymongo,random,datetime,re,os,hashlib
import base64
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
userb = Blueprint('user', __name__)
def getuser(user):
    if 'user' in session and session['user'] == user:
        return user
    return None
@userb.route('/settings')
def user_settings():
    user = getuser(request.cookies.get('user'))
#     if user == None:
#         return request.cookies.get('user') +','+session['user']
#         return redirect('/login')
    return render_template('/user/pc/settings.html')
# @usermb.route('/m/user/settings')
# def m_user_settings():
#     user = getuser(request.cookies.get('user'))
# #     if user == None:
# #         return redirect('/login')
#     return render_template('/user/m/settings.html')
@userb.route('/settings/uplphoto',methods=['POST'])
def user_settings_uplphoto():
    user = getuser(request.cookies.get('user'))
    if user == None:
        return 'False'
    dataURL = request.form.get('dataURL')[23:]
    # 将base64转为图片文件
    img = base64.b64decode(dataURL)
    # 按时间生成随机文件名
    fn = 'static/photos/'+datetime.datetime.now().__format__('%Y%m%d%H%M%S')+str(random.randint(100,999))+'.jpg'
    with open(fn,'wb') as f:
        f.write(img)
    # 删除原本文件
    lp = userdb.userdata.find_one({'user':user})['photo']
    if '/static/photos' in lp: # 判断是否存在/static/photos
        try:
            os.remove(lp[1:])
        except:
            pass
    userdb.userdata.update_one({'user':user},{'$set':{'photo':'/'+fn}})
    return 'True'
@userb.route('/settings/setuser',methods=['POST'])
def user_settings_setuser():
    user = getuser(request.cookies.get('user'))
    if user == None:
        return 'Not Logged In'
    nuser = request.form.get('user')
    if not userdb.userdata.find_one({'user':nuser}) == None:
        return 'Existed'
    data = userdb.userdata.find_one({'user':user})
#     print(data)
    if 'umodifydate' not in data or (datetime.datetime.now() - data['umodifydate']).days > 365:
        userdb.userdata.update_one({'user':user},{'$set':{'user':nuser,'umodifydate':datetime.datetime.now()}})
        session['user']=nuser
        return 'True'
    return False
@userb.route('/settings/pwdmodify',methods=['POST'])
def user_settings_modify_pwd():
    user = getuser(request.cookies.get('user'))
    if user == None:
        return 'Not Logged In'
    old = request.form.get('old')
    oldmd5 = hashlib.md5(old.encode(encoding='UTF-8')).hexdigest()
    data = userdb.userdata.find_one({'user':user})
    if not data['pwd'] == oldmd5:
        return 'pwd wrong'
    new = request.form.get('new')
    newmd5 = hashlib.md5(new.encode(encoding='UTF-8')).hexdigest()
    session['utime']=datetime.datetime.now().__format__('%Y-%m-%d %H:%M:%S')
    userdb.userdata.update_one({'user':user},{'$set':{'pwd':newmd5,'pmodify':session['utime']}})
    return 'True'
