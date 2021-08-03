# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect,abort
import pymongo,random,datetime
import hashlib,os
from email.mime.text import MIMEText 
from email.header import Header
import smtplib,hashlib,random
from smtplib import SMTP_SSL
randombase = ['A','B','C','D','E','F','G','H','I','J',
              'K','L','M','N','O','P','Q','R','S','T',
              'U','V','W','X','Y','Z','a','b','c','d',
              'e','f','g','h','i','j','k','l','m','n',
              'o','p','q','r','s','t','u','v','w','x',
              'y','z']
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
login = Blueprint('login', __name__)
loginm = Blueprint('loginm', __name__)

# 电脑版
@login.route('/',methods=['GET'])
def login_pc_main():
    if session.get('_uid') == request.cookies.get('_uid') != None:
        return redirect('/')
    return render_template('login/pc/main.html')
# 重置密码
@login.route('/retrieve',methods=['GET'])
def login_retrieve():
    
    return render_template('login/pc/retrieve.html')
# 重置页面
@login.route('/retrieve/reset',methods=['GET'])
def login_retrieve_reset():
    key=request.args.get('key')
    if key == None or userdb.retrieve.find_one({'key':key}) == None :
        abort(404)
    return render_template('login/pc/retrieve_reset.html',key=key)
# 重置POST
@login.route('/retrieve/reset',methods=['POST'])
def login_retrieve_reset_():
    pwd1=request.form.get('pwd1')
    pwd2=request.form.get('pwd2')
    if pwd1 == None or pwd2 == None:
        return render_template('error/pc.html',error=u'数据有误')
    if not pwd2 == pwd1:
        return render_template('error/pc.html',error=u'两次密码不一样')
    key=request.form.get('key')
    if key == None:
        return render_template('error/pc.html',error=u'key错误')
    redata=userdb.retrieve.find_one({'key':key})
    if redata == None:
        return render_template('error/pc.html',error=u'key错误')
    _uid=redata['_uid']
    pwdmd5 = hashlib.md5(pwd1.encode(encoding='UTF-8')).hexdigest()
    userdb.userdata.update_one({'_uid':_uid},{'$set':{'pwd':pwdmd5}})
    userdb.retrieve.delete_one({'key':key})
    return render_template('login/pc/retrieve_success.html')
# 登录数据POST
@login.route('/',methods=['POST'])
def login_post():
    user=request.form.get('user')
    pwd=request.form.get('pwd')
    if user == None or pwd == None:
        return render_template('login/pc/main.html',warn=u'数据结构有误')
    if user == '':
        return render_template('login/pc/main.html',warn=u'用户名不可为空')
    if pwd == '':
        return render_template('login/pc/main.html',warn=u'密码不可为空',user=user)
    data=userdb.userdata.find_one({'user':user})
    if data == None:
        return render_template('login/pc/main.html',warn=u'用户名或密码错误',user=user)
    pwdmd5 = hashlib.md5(pwd.encode(encoding='UTF-8')).hexdigest()
    if data['pwd'] == pwdmd5:
        session['_uid']=data['_uid']
        session['utime'] = datetime.datetime.now().__format__('%Y-%m-%d %H:%M:%S')
        if data.get('notActive'):
            return redirect('/login/activate')
        return render_template('login/pc/success.html',_uid=data['_uid'],url=session.get('lpage'))
    else :
        return render_template('login/pc/main.html',warn=u'用户名或密码错误',user=user)
# 激活
@login.route('/activate',methods=['GET'])
def login_activate():
    user = userdb.userdata.find_one({'_uid':session.get('_uid')}).get('user')
    return render_template('login/pc/activate.html',user=user)
    
@login.route('/activate/<key>',methods=['GET'])
def login_activate_(key):
    
    if key == None:
        abort(404)
    dt = userdb.activate.find_one({'key':str(key)})
    if dt == None:
        abort(404)
    session['_uid']=dt['_uid']
    session['utime'] = datetime.datetime.now().__format__('%Y-%m-%d %H:%M:%S')
    userdb.userdata.update_one({'_uid':dt['_uid']},{'$set':{'mail':dt['mail'],'notActive':None}})
    userdb.activate.delete_one({'key':str(key)})
    return '激活成功'


# 手机版

@loginm.route('/retrieve/reset',methods=['POST'])
def login_m_retrieve_reset_():
    pwd1=request.form.get('pwd1')
    pwd2=request.form.get('pwd2')
    if pwd1 == None or pwd2 == None:
        return render_template('error/m.html',error=u'数据有误')
    if not pwd2 == pwd1:
        return render_template('error/m.html',error=u'两次密码不一样')
    key=request.form.get('key')
    if key == None:
        return render_template('error/m.html',error=u'key错误')
    redata=userdb.retrieve.find_one({'key':key})
    if redata == None:
        return render_template('error/m.html',error=u'key错误')
    _uid=redata['_uid']
    pwdmd5 = hashlib.md5(pwd1.encode(encoding='UTF-8')).hexdigest()
    userdb.userdata.update_one({'_uid':_uid},{'$set':{'pwd':pwdmd5}})
    userdb.retrieve.delete_one({'key':key})
    return render_template('login/m/retrieve_success.html')

@loginm.route('/',methods=['GET'])
def login_m_main():
    if session.get('_uid') == request.cookies.get('_uid') != None:
        return redirect('/')
    return render_template('login/m/main.html')
@loginm.route('/retrieve',methods=['GET'])
def login_m_retrieve():
    
    return render_template('login/m/retrieve.html')
@loginm.route('/retrieve/reset',methods=['GET'])
def login_m_retrieve_reset():
    key=request.args.get('key')
    if key == None or userdb.retrieve.find_one({'key':key}) == None :
        abort(404)
    return render_template('login/m/retrieve_reset.html',key=key)

@loginm.route('/',methods=['POST'])
def login_m_post():
    user=request.form.get('user')
    pwd=request.form.get('pwd')
    if user == None or pwd == None:
        return render_template('login/m/main.html',warn=u'数据结构有误')
    if user == '':
        return render_template('login/m/main.html',warn=u'用户名不可为空')
    if pwd == '':
        return render_template('login/m/main.html',warn=u'密码不可为空',user=user)
    data=userdb.userdata.find_one({'user':user})
    if data == None:
        return render_template('login/m/main.html',warn=u'用户名或密码错误',user=user)
    pwdmd5 = hashlib.md5(pwd.encode(encoding='UTF-8')).hexdigest()
    if data['pwd'] == pwdmd5:
        session['_uid']=data['_uid']
        session['utime'] = datetime.datetime.now().__format__('%Y-%m-%d %H:%M:%S')
        if data.get('notActive'):
            return redirect('/login/activate')
        return render_template('login/m/success.html',_uid=data['_uid'],url=session.get('lpage'))
    else :
        return render_template('login/m/main.html',warn=u'用户名或密码错误',user=user)
# 激活
@loginm.route('/activate',methods=['GET'])
def login_m_activate():
    user = userdb.userdata.find_one({'_uid':session.get('_uid')}).get('_uid')
    return render_template('login/m/activate.html',user=user)
    
@loginm.route('/activate/<key>',methods=['GET'])
def login_m_activate_(key):
    
    if key == None:
        abort(404)
    dt = userdb.activate.find_one({'key':key})
    if dt == None:
        abort(404)
    session['_uid']=dt['_uid']
    session['utime'] = datetime.datetime.now().__format__('%Y-%m-%d %H:%M:%S')
    userdb.userdata.update_one({'_uid':dt['_uid']},{'$set':{'mail':dt['mail'],'notActive':None}})
    userdb.activate.delete_one({'key':str(key)})
    return render_template('login/m/success.html',_uid=dt['_uid'],url=session.get('lpage'))
    
# 发送邮件
@login.route('/retrieve',methods=['POST'])
def login_retrieve_post():
    host_server = 'smtp.163.com'
    sender = 'Sakuyark@163.com'
    pwd = 'ILRUQMTUDAEPFDUI'
    sender_mail = 'Sakuyark@163.com'
    receiver = request.form.get('mail')
    if receiver == None:
        return '邮件错误'
    data=userdb.userdata.find_one({'mail':receiver})
    if data == None:
        return '数据错误'
    _uid=data['_uid']
    key=''.join(random.sample(randombase, 24))
    while not userdb.retrieve.find_one({'key':key}) == None:
        key=''.join(random.sample(randombase, 24))
    receiver = str(receiver)
    mail_content = u'<div><div style="margin:0;"><span style="font-size: 18px;">您好：</span></div><blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><div style="margin:0;"><span style="font-size: 18px;">这里是Sakuyark，您正在重置您的密码，账户：'+data['user']+'。</span></div><div style="margin:0;"><span style="font-size: 18px;">请点击下方链接来重置您的密码：</span></div><div style="margin:0;"><br /></div><div style="text-align: left; margin: 0px;"></div></blockquote></div><blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><div><a href="https://www.sakuyark.com/login/retrieve/reset?key='+key+'" style="font-size: 18px; text-decoration: underline;"><span style="font-size: 18px;">https://www.sakuyark.com/login/retrieve/reset?key='+key+'</span></a></div></blockquote>'
    mail_title = u'Sakuyark密码重置'
    msg = MIMEText(mail_content, "html", 'utf-8')
    msg["Subject"] = Header(mail_title, 'utf-8')
    msg["From"] = sender_mail
    msg["To"] = receiver
    try:
        smtp = SMTP_SSL(host_server)
        smtp.ehlo(host_server)
        smtp.login(sender, pwd)
        smtp.sendmail(sender_mail, receiver, msg.as_string())
        smtp.quit()
        userdb.retrieve.insert_one({'key':key,'mail':receiver,'_uid':_uid,'time':datetime.datetime.now()})
        return redirect('/')
    except smtplib.SMTPException:
        return redirect('/error')
    smtp.quit()
    return redirect('/')
@login.route('/activate',methods=['POST'])
def login_activate_post():
    
    host_server = 'smtp.163.com'
    sender = 'Sakuyark@163.com'
    pwd = 'ILRUQMTUDAEPFDUI'
    sender_mail = 'Sakuyark@163.com'
    receiver = request.form.get('mail')
    if receiver == None:
        return '邮件错误'
    user=request.form.get('user')
    if user == None:
        return '用户信息错误'
    data = userdb.userdata.find_one({'user':user})
    if data == None:
        return '无此用户'
    key=''.join(random.sample(randombase, 24))
    while not userdb.retrieve.find_one({'key':key}) == None:
        key=''.join(random.sample(randombase, 24))
    receiver = str(receiver)
    mail_content = u'<div><div style="margin:0;"><span style="font-size: 18px;">您好：</span></div><blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><div style="margin:0;"><span style="font-size: 18px;">这里是Sakuyark，您的账户：'+data['user']+'。</span></div><div style="margin:0;"><span style="font-size: 18px;">请点击下方链接激活账号</span></div><div style="margin:0;"><br /></div><div style="text-align: left; margin: 0px;"></div></blockquote></div><blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;"><div><a href="https://www.sakuyark.com/login/activate/'+key+'" style="font-size: 18px; text-decoration: underline;"><span style="font-size: 18px;">https://www.sakuyark.com/login/activate/'+key+'</span></a></div></blockquote>'
    mail_title = u'Sakuyark用户激活'
    msg = MIMEText(mail_content, "html", 'utf-8')
    msg["Subject"] = Header(mail_title, 'utf-8')
    msg["From"] = sender_mail
    msg["To"] = receiver
    try:
        smtp = SMTP_SSL(host_server)
        smtp.ehlo(host_server)
        smtp.login(sender, pwd)
        smtp.sendmail(sender_mail, receiver, msg.as_string())
        smtp.quit()
        userdb.activate.insert_one({'key':key,'mail':receiver,'_uid':data['_uid'],'time':datetime.datetime.now()})
        return redirect('/login')
    except smtplib.SMTPException:
        return redirect('/error')
    smtp.quit()
    return redirect('/login')
