# -*- coding: utf-8 -*-
from flask import Flask, json, jsonify, request, render_template, session, redirect, make_response, send_file
from handler import getdatas, register, login, user, games, c18, blog, photo, chat, audio, qbot  # special_res
from handler.tools import EL
from handler.admin import file
import socket
import base64
import datetime
from datetime import timedelta

substations = ['c18']  # 分站列表
mobile_rules = {}


def get_host_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.0.0.1', 8080))
        ip = s.getsockname()[0]
    finally:
        s.close()
    return ip


sy = Flask(__name__)
sy.config['SECRET_KEY'] = 'sakuyark_secret_key_2021'
sy.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
# sy.config['SERVER_NAME'] = 'sakuyark.com'
sy.debug = True


@sy.route('/')
def home():
    session.permanent = True
    return render_template('main.html')


@sy.route('/m')
@sy.route('/m/')
def m():
    session.permanent = True
    if 'last' in session:
        last = session.get('last')
        del session['last']
        return redirect(last)
    return render_template('m.html')


@sy.route('/about')
def about():
    return render_template('about/pc/main.html')


# region 500
''' 
# 捕获500错误，并发送邮件
@sy.errorhandler(500)
def handle_500_error(err):
    # 引入邮箱工具
    from email.mime.text import MIMEText
    from email.header import Header
    import smtplib
    from smtplib import SMTP_SSL
    host_server = 'smtp.163.com'
    sender = 'Sakuyark@163.com'
    pwd = 'ILRUQMTUDAEPFDUI'
    sender_mail = 'Sakuyark@163.com'
    receiver = '2819469337@qq.com'
    mail_content = err
    mail_title = u'SY服务器500错误'
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
        return '服务器产生一个500错误，已报告管理员，错误信息：\n' + err
    except smtplib.SMTPException:
        return '服务器产生一个500错误，未成功报告管理员，错误信息：\n' + err
'''
# endregion


@sy.errorhandler(404)
def handle_404_error(err_msg):
    UserAgent = request.headers.get("User-Agent")
    for i in ['iPhone', 'iPod', 'Android', 'ios', 'iPad']:
        if i in UserAgent:
            return render_template('error/m.html', error='404 Not Found!')
    return render_template('error/pc.html', error='404 Not Found!'), 404


@sy.before_request
def before_request():  # 记录上一次访问
    url = request.url
    for i in ['/login', '/register', '/api', '/static']:  # 排除掉登录，注册，api和静态文件请求
        if i in url:
            return
    session['lpage'] = url


# region 对 /m/c18进行重定向
@sy.route('/m/c18')
def c18_redirect():
    return redirect('/c18/m')


@sy.route('/m/c18/<path:p>')
def c18_redirect_(p):
    return redirect('/c18/m/'+p)
# endregion


# region robots.txt
@sy.route('/robots.txt')
def robots():
    try:
        return send_file('robots.txt')
    except Exception as e:
        return str(e)
# endregion


@sy.after_request
def after_request(resp):
    try:
        if request.url.rsplit('.', 1)[1] == 'js':
            resp.mimetype = 'text/javascript'
    except:
        pass
    if resp.mimetype == 'application/json':
        data = json.loads(resp.data)
        if 'code' in data:
            return jsonify(data)
        return jsonify({
            'code': 0,
            'data': data
        })
    return resp


'''
# reqeuest tests
@sy.route('/test')
def test():
    print(request.remote_addr, request.headers)
    return ''#request
'''

# region login
sy.register_blueprint(login.login, url_prefix='/login')
sy.register_blueprint(login.loginm, url_prefix='/m/login')
# endregion
# region register
sy.register_blueprint(register.rg)
# endregion
# region user
sy.register_blueprint(user.userb, url_prefix='/user')
sy.register_blueprint(user.usermb, url_prefix='/m/user')
# endregion
# region chat
sy.register_blueprint(chat.chatb, url_prefix='/chat')
sy.register_blueprint(chat.chatmb, url_prefix='/m/chat')
# endregion
# region games
sy.register_blueprint(games.games, url_prefix='/games')
# endregion
# region blog
sy.register_blueprint(blog.blog, url_prefix='/blog')
sy.register_blueprint(blog.blogm, url_prefix='/m/blog')
# endregion
# region audio
sy.register_blueprint(audio.audio, url_prefix='/audio')
sy.register_blueprint(audio.audiom, url_prefix='/m/audio')
# endregion
# region photo
sy.register_blueprint(photo.photo, url_prefix='/photo')
# endregion
# region api
sy.register_blueprint(getdatas.getdatas)
# endregion
# region admin
sy.register_blueprint(file.admin_file)
# endregion
# region qbot
sy.register_blueprint(qbot.kw, url_prefix='/qbot/kw')
# endregion

# region others
# sy.register_blueprint(special_res.sr,url_prefix='/res')
# endregion
# region tools
sy.register_blueprint(EL.EL)
# endregion

# 分站
# region c18
sy.register_blueprint(c18.c18, url_prefix='/c18')
sy.register_blueprint(c18.c18m, url_prefix='/c18/m')
# endregion
# region 预备作家协会
# sy.register_blueprint(pwa.pwa, subdomain='pwa')
# endregion

# region 处理手机版
'''技术难度过大，终止
# 调试
# from werkzeug.routing import MapAdapter,Map,Rule
# print(sy.url_map._rules[0].rule)
# m = MapAdapter(sy.url_map)
# print(m)


# 处理手机页面
import re
# print(re.match('^\\|/+?m$','/m'))
# exit()
for i in sy.url_map._rules:
    print(i.rule)
    print(i._regex)
    print(i.match('/m'))
    continue
    # 判断是否在主站
    p = re.compile(r'^/m')
    if p.match(i.rule):
        print(i.rule)
    pass

exit()
'''
# endregion

# 运行
LocalIP = get_host_ip()  # 获取ip
sy.run(host=LocalIP, port=443, ssl_context=('sakuyark.com.pem', 'sakuyark.com.key'))#启动服务器
# sy.run(host=LocalIP, port=80)  # 启动服务器
# sy.run(host='127.0.0.1', port=80)
