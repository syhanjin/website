# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect
import pymongo,random,datetime
#引入邮箱工具
from email.mime.text import MIMEText 
from email.header import Header
import smtplib,hashlib,random
from smtplib import SMTP_SSL

from utils import INITIAL_TIME

client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
def register(data):
    pwdmd5 = hashlib.md5(data['pwd'].encode(encoding='UTF-8')).hexdigest()
    data['pwd'] = pwdmd5
    data['photo'] = '/static/images/photo/'+str(random.randint(1,9))+'.jpg'
    data['lvl'] = 0
    data['exp'] = 0
    data['admin'] = 0
    data['titles'] = []
    data['pmodify'] = INITIAL_TIME
    data['lastLogin'] = INITIAL_TIME
    data['ConLoginDays'] = 0
    _uid = list(userdb.userdata.find().sort('_uid', -1).limit(1))[0] + 1
    data['_uid'] = _uid
    userdb.userdata.insert_one(data)
    
# 电脑版
rg = Blueprint('register', __name__)
@rg.route('/register',methods=['GET'])
def rg_pc_main():
    
    return render_template('register/pc/main.html')
# 手机版
@rg.route('/m/register',methods=['GET'])
def rg_m_main():
    
    return render_template('register/m/main.html')
@rg.route('/register',methods=['POST'])
def rg_post():
    veritime = datetime.datetime.strptime(
        session.get('rg-veritime')if('rg-veritime' in session) else '2019-9-10 0:0',
        '%Y-%m-%d %H:%M'
    )
    user=request.form.get('user')
    pwd1=request.form.get('pwd1')
    pwd2=request.form.get('pwd2')
    mail=request.form.get('mail')
    veri=request.form.get('veri')
    data=userdb.userdata.find_one({'user':user})
    if not data == None:
        return render_template('register/pc/main.html',warn=u'该用户已存在！')
    if pwd1 == None or not pwd1 == pwd2:
        return render_template('register/pc/main.html',warn=u'两次密码不一样！')
    if not 'mail' in session:
        return render_template('register/pc/main.html',warn=u'邮箱有误！')
    if not session['mail'] == mail:
        return render_template('register/pc/main.html',warn=u'邮箱有误！')
    if veri == None or 'veri' not in session or (datetime.datetime.now()-veritime).seconds > 300:
        session['veri']='000000'
        return render_template('register/pc/main.html',warn=u'验证码错误！')
    if not int(session['veri']) == int(veri):
        return render_template('register/pc/main.html',warn=u'验证码错误！')
    register({'user':user,'pwd':pwd1,'mail':mail})
    if request.form.get('device') == None:
        return render_template('register/pc/success.html',url=session.get('lpage'))
    else :
        return render_template('register/m/success.html',url=session.get('lpage'))

@rg.route('/register/judgeuser',methods=['POST'])
def rg_judge_user():
    user=request.form.get('user')
    data=userdb.userdata.find_one({'user':user})
    if data == None:
        return 'True'
    return 'False'
@rg.route('/register/judgeveri',methods=['POST'])
def rg_judge_veri():
    veritime = datetime.datetime.strptime(
        session.get('rg-veritime')if('rg-veritime' in session) else '2019-9-10 0:0',
        '%Y-%m-%d %H:%M'
    )
    uveri=request.form.get('veri')
    if uveri == None or uveri == '' or 'veri' not in session or (datetime.datetime.now()-veritime).seconds > 300:
        session['veri']='000000'
        return 'False'
    if not int(session['veri']) == int(uveri):
        return 'False'
    if int(session['veri']) == int(uveri):
        return 'True'
@rg.route('/register/emailchange',methods=['GET'])
def rg_email_change():
    session['rg-veritime']='2019-9-10 0:0'
    session['mail']=''
    return 'True'
@rg.route('/register/getvericode',methods=['POST']) #发送邮件
def rg_veri():
    veritime = datetime.datetime.strptime(
        session.get('rg-veritime')if('rg-veritime' in session) else '2019-9-10 0:0',
        '%Y-%m-%d %H:%M'
    )
    host_server = 'smtp.163.com'
    sender = 'Sakuyark@163.com'
    pwd = 'ILRUQMTUDAEPFDUI'
    sender_mail = 'Sakuyark@163.com'
    receiver = str(request.form.get('mail'))
    session['mail']=receiver
    if 'veri' not in session or (datetime.datetime.now()-veritime).seconds > 300:
        veri=random.randint(100000,999999)
    else: 
        veri=int(session['veri'])
    mail_content = u'''您好，这里是Sakuyark
您的验证码为:'''+str(veri)+u'''
请在五分钟内完成验证
    '''
    mail_title = u'Sakuyark注册验证'
    msg = MIMEText(mail_content, "plain", 'utf-8')
    msg["Subject"] = Header(mail_title, 'utf-8')
    msg["From"] = sender_mail
    msg["To"] = receiver
    try:
        smtp = SMTP_SSL(host_server)
        smtp.ehlo(host_server)
        smtp.login(sender, pwd)
        smtp.sendmail(sender_mail, receiver, msg.as_string())
        smtp.quit()
        session['veri']=str(veri)
        session['rg-veritime'] = datetime.datetime.now().__format__('%Y-%m-%d %H:%M')
        return 'True'
    except smtplib.SMTPException:
        return 'False'