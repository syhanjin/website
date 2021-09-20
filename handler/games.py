# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect,make_response
import pymongo,random,datetime,re,os,hashlib
import base64
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
games = Blueprint('games', __name__)

# 因为懒，此BP不接数据库
games_data=[
    {
        'name':'Fight for Freedom',
        'name-zn':'自由之战',
        'maker':'狸梦',
        'maker-host':'',
        'introduction':'一款老少皆宜的塔防游戏，极易上手。',
        'photo':'/static/images/games/FF.jpg',
        'play':'/games/fightforfreedom',
        'edition':'v1.41'
    },{
        'name':'A Dark Room',
        'name-zn':'小黑屋',
        'maker':'doublespeakgames',
        'maker-host':'http://doublespeakgames.com',
        'introduction':'A minimalist text adventure.',
        'photo':'http://www.doublespeakgames.com/images/adr.png',
        'play':'/games/adarkroom?lang=zh_cn'
    }
]

@games.route('/',methods=['GET'])
def games_():
    return render_template('games/main.html',data=games_data)

@games.route('/fightforfreedom',methods=['GET'])
def ScratchWar():
    return render_template('games/html/fight_for_freedom/fight for freedom1.41.html',edition="1.41")

@games.route('/adarkroom',methods=['GET'])
def a_dark_room():
    UserAgent = request.headers.get("User-Agent")
    for i in ['iPhone','iPod','Android','ios','iPad']:
        if i in UserAgent:
            return render_template('games/html/doublespeakgames/adarkroom/mobileWarning.html')
    return render_template('games/html/doublespeakgames/adarkroom/index.html')