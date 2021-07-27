# -*- coding: utf-8 -*-
from flask import Flask,redirect
import socket
def get_host_ip():
    try:
        s = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
        s.connect(('10.0.0.1',8080))
        ip= s.getsockname()[0]
    finally:
        s.close()
    return ip
sy = Flask(__name__)
@sy.route('/')
def home():
    return redirect('https://sakuyark.com')
@sy.route('/<path:p>')
def home2(p):
    return redirect('https://sakuyark.com/'+p)
LocalIP = get_host_ip()
sy.run(host=LocalIP, port=80)#启动服务器
