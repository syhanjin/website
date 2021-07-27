# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect,send_file
import pymongo, random, datetime, os
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
maindb = client['main']
c18db = client['c18']
c18 = Blueprint('c18', __name__)
def getuser(user):
    if not user == session.get('user'):
        return None
    return user
def get_c18_data(user):
    user = userdb.userdata.find_one({'user':user})
    if not user:
        return None
    stu = c18db.roster.find_one({'__id':user['_id']})
    if (not stu):
        return None
    else:
        return stu
    tch = c18db.teacher.find_one({'__id':user['_id']})
    if (not tch):
        return None
    else:
        return tch
    par = c18db.parents.find_one({'__id':user['_id']})
    if (not par):
        return None
    else:
        return par
#电脑版
@c18.route('/')
def c18_main():
    first = 'c18-first' not in session
    session['c18-first'] = True
    together = list(c18db.together.find({'main':True}).sort('loca', 1))
    data = {'first':first, 'together':together}
    return render_template('c18/pc/main.html', data=data)
@c18.route('/roster')
def c18_roster():
    return render_template('/c18/pc/roster.html') 
@c18.route('/roster/<int:num>', methods=['GET'])
def c18_roster_(num):
    user = getuser(request.cookies.get('user'))
    data = get_c18_data(user)
    if not data:
        return render_template('/error/pc.html',error='再往下就是我们班专属了的哦，如果你是我们班的，那请<a href="/login">登录</a>')
    return render_template('/c18/pc/roster_item.html',num=num,data=data)
@c18.route('/roster/<int:num>/editor', methods=['GET'])
def c18_roster__editor(num):
    user = getuser(request.cookies.get('user'))
    data = get_c18_data(user)
    if (not data) or data['num'] != num:
        return render_template('/error/pc.html',error='权限不足')
    return render_template('/c18/pc/roster_item_editor.html')
@c18.route('/roster/<int:num>/editor', methods=['POST'])
def c18_roster__editor_post(num):
    un=getuser(request.cookies.get('user'))
    user = userdb.userdata.find_one({'user':un})
    data = get_c18_data(un)
    if (not data) or data['num'] != num:
        return 'False'
    pp = request.form.get('pp')
    if not pp:
        pp = []
    c18db.roster.update_one({'__id':user['_id']}, {'$set':{
            'tel':request.form.get('tel'),
            'nick' : request.form.get('nick'),
            'addr' : request.form.get('addr'),
            'seni' : request.form.get('seni'),
            'qq' : request.form.get('qq'),
            'message' : request.form.get('message'),
            'pp' : pp
            
            
    }})
    return 'True'
@c18.route('/teachers')
def c18_teachers():
    return render_template('/c18/pc/teachers.html')

@c18.route('/d&h')
def c18_developer_helper():
    un=getuser(request.cookies.get('user'))
    user = userdb.userdata.find_one({'user':un})
    if not user:
        user={'c18':False}
    return render_template('c18/pc/d&h.html',code_theme='vs2015',theme='Whitelines/whitelines',user=user)

#手机版
c18m = Blueprint('c18m', __name__)
@c18m.route('/')
def c18_m_main():
    first = 'c18-first' not in session
    session['c18-first'] = True
    together = list(c18db.together.find({'main':True}).sort('loca', 1))
    data = {'first':first, 'together':together}
    return render_template('c18/m/main.html', data=data)
@c18m.route('/roster')
def c18_m_roster():
    return render_template('/c18/m/roster.html') 
@c18m.route('/roster/<int:num>', methods=['GET'])
def c18_m_roster_(num):
    user = getuser(request.cookies.get('user'))
    data = get_c18_data(user)
    if not data:
        return render_template('/error/m.html',error='再往下就是我们班专属了的哦，如果你是我们班的，那请<a href="/login">登录</a>')
    return render_template('/c18/m/roster_item.html',num=num,data=data)
@c18m.route('/roster/<int:num>/editor', methods=['GET'])
def c18_m_roster__editor(num):
    user = getuser(request.cookies.get('user'))
    data = get_c18_data(user)
    if (not data) or data['num'] != num:
        return render_template('/error/m.html',error='权限不足')
    return render_template('/c18/m/roster_item_editor.html')
@c18m.route('/roster/<int:num>/editor', methods=['POST'])
def c18_m_roster__editor_post(num):
    un=getuser(request.cookies.get('user'))
    user = userdb.userdata.find_one({'user':un})
    data = get_c18_data(un)
    if (not data) or data['num'] != num:
        return 'False'
    
    pp = request.form.get('pp')
    if not pp:
        pp = []
    c18db.roster.update_one({'__id':user['_id']}, {'$set':{
            'tel':request.form.get('tel'),
            'nick' : request.form.get('nick'),
            'addr' : request.form.get('addr'),
            'seni' : request.form.get('seni'),
            'qq' : request.form.get('qq'),
            'message' : request.form.get('message'),
            'pp' : pp
    }})
    return 'True'
@c18m.route('/teachers')
def c18_m_teachers():
    return render_template('/c18/m/teachers.html')

@c18m.route('/d&h')
def c18_developer_helper():
    un=getuser(request.cookies.get('user'))
    user = userdb.userdata.find_one({'user':un})
    if not user:
        user={'c18':False}
    return render_template('c18/m/d&h.html',code_theme='vs2015',theme='Whitelines/whitelines',user=user)


# api
@c18.route('/api/getteachers', methods=['GET'])
def c18_api_getteachers():
    data = list(c18db.teachers.find())
    for i in data:
        i['_id']=str(i['_id'])
    return jsonify(data)
@c18.route('/api/getstuinfo', methods=['GET'])
def c18_api_getstuinfo():
    user = getuser(request.cookies.get('user'))
    data = get_c18_data(user)
    if (not data):
        return 'False'
    num = int(request.args.get('num'))
    data = c18db.roster.find_one({'num':num})
    if data:
        data['_id'] = str(data['_id'])
        data['__id'] = str(data['__id'])
        return jsonify(data)
    else:
        return False
@c18.route('/api/getroster')
def c18_api_getroster():
    data = list(c18db.roster.find().sort('num', 1))
    for i in data:
        i['_id'] = str(i['_id'])
        i['__id'] = str(i['__id'])
    return jsonify(data)
@c18.route('/api/getnavitems')
def c18_api_getnavitems():
    items = list(c18db.nav_item.find().sort('loca', 1))
    for i in items:
        i['_id'] = str(i['_id'])
    return jsonify(items)

# 访问图片
@c18.route('/api/pictures/<path:p>')
def api_pictures(p):
    user = getuser(request.cookies.get('user'))
    data = get_c18_data(user)
    if (not data):
        return 'False'
    path='c18/'+p
    if os.path.isfile(path):
        try:
            return send_file(path)
        except Exception as e:
            return str(e)
    return 'Is not a file.'