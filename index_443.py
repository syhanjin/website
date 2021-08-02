# -*- coding: utf-8 -*-
from flask import Flask,request,render_template, session,redirect,make_response,send_file #引入flask
from handler import getdatas,register,login,pwa,user,games,tool_EL,admin_file,c18,blogs,photo,chat
import socket,base64,datetime
from datetime import timedelta
def get_host_ip():
    try:
        s = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
        s.connect(('10.0.0.1',8080))
        ip= s.getsockname()[0]
    finally:
        s.close()
    return ip
sy = Flask(__name__)
sy.config['SECRET_KEY']='sakuyark_secret_key_2021'
sy.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
# sy.config['SERVER_NAME'] = 'sakuyark.com'
sy.debug = True
@sy.route('/')
def home():
    session.permanent=True
    return render_template('main.html')
@sy.route('/m')
@sy.route('/m/')
def m():
    session.permanent=True
    if 'last' in session :
        last = session.get('last')
        del session['last']
        return redirect(last)
    return render_template('m.html')

@sy.route('/about')
def about():
    return render_template('about/pc/main.html')





@sy.errorhandler(404)
def handle_404_error(err_msg):
    UserAgent = request.headers.get("User-Agent")
    for i in ['iPhone','iPod','Android','ios','iPad']:
        if i in UserAgent:
            return render_template('error/m.html',error='404 Not Found!')
    return render_template('error/pc.html',error='404 Not Found!')

@sy.before_request
def before_request(): # 记录上一次访问
    url = request.url
    for i in ['/login','/register','/api','/static']:# 排除掉登录，注册，api和静态文件请求
        if i in url:
            return
    session['lpage'] = url
#     print(url)

# 对 /m/c18进行重定向
@sy.route('/m/c18')
def c18_redirect():
    return redirect('/c18/m')
@sy.route('/m/c18/<path:p>')
def c18_redirect_(p):
    return redirect('/c18/m/'+p)
# robots.txt
@sy.route('/robots.txt')
def robots():
    try:
        return send_file('robots.txt')
    except Exception as e:
        return str(e)

sy.register_blueprint(getdatas.getdatas)
sy.register_blueprint(register.rg)
sy.register_blueprint(login.login,url_prefix='/login')
sy.register_blueprint(login.loginm,url_prefix='/m/login')
sy.register_blueprint(user.userb,url_prefix='/user')
sy.register_blueprint(user.usermb,url_prefix='/m/user')
sy.register_blueprint(games.games,url_prefix='/games')
sy.register_blueprint(tool_EL.EL)
sy.register_blueprint(admin_file.admin_file)
sy.register_blueprint(c18.c18,url_prefix='/c18')
sy.register_blueprint(c18.c18m,url_prefix='/c18/m')
sy.register_blueprint(blogs.blogs,url_prefix='/blogs')
sy.register_blueprint(blogs.blogsm,url_prefix='/m/blogs')
sy.register_blueprint(photo.photo,url_prefix='/photo')
# sy.register_blueprint(chat.chat,url_prefix='/chat') # 聊天室暂关

# sy.register_blueprint(pwa.pwa, subdomain='pwa')
LocalIP = get_host_ip()#获取ip
# sy.run(host=LocalIP, port=443, ssl_context=('sakuyark.com.pem', 'sakuyark.com.key'))#启动服务器
sy.run(host=LocalIP, port=80)#启动服务器
# sy.run(host='127.0.0.1', port=80)
