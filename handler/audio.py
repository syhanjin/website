# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect
from flask.helpers import send_file
import pymongo
import random
import datetime
import os
import math
from pydub import AudioSegment
from werkzeug.utils import secure_filename
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
audiodb = client['audio']
audio = Blueprint('audio', __name__, url_prefix='/audio')
audiom = Blueprint('audiom', __name__, url_prefix='/m/audio')
minute = 60 * 1000
root_path = '../audio'
tmp_path = os.path.join(root_path, 'tmp')
if not os.path.exists(tmp_path):
    os.makedirs(tmp_path)


def division(file, filename, id):
    ext = filename.rsplit('.', 1)[1]
    au = AudioSegment.from_file(file, ext)
    leng = len(au)
    # 构建文件夹
    file_path = os.path.join(tmp_path, id)
    if not os.path.exists(file_path):
        os.mkdir(file_path)
    n = math.floor(leng / minute)
    for i in range(n):
        tmp = au[i * minute: (i+1) * minute + 1]
        tmp.export(os.path.join(file_path, str(i+1) + '.mp3'), format='mp3')
    if n * minute < leng:
        tmp = au[n * minute: leng]
        tmp.export(os.path.join(file_path, str(n+1) + '.mp3'), format='mp3')
        n += 1
    return n


def getuser(_uid):
    if _uid and not _uid == session.get('_uid'):
        return None
    return _uid


ALLOWED_EXTENSIONS = ['cda', 'wav', 'mp3', 'aif',
                      'aiff', 'mid', 'wma', 'ra', 'vqf', 'ape', 'm4a']


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@audio.route('/separator', methods=['GET'])
def audio_separator():
    return render_template('error/pc.html',error='该项目已关闭<br>因为有更好的：<a href="https://vocalremover.org/ch/">链接</a>')
@audiom.route('/separator', methods=['GET'])
def audio_m_separator():
    return render_template('error/m.html',error='该项目已关闭<br>因为有更好的：<a href="https://vocalremover.org/ch/">链接</a>')


'''
@audio.route('/separator', methods=['GET'])
def audio_separator():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return render_template('error/pc.html', error='请先登录再使用音轨分离')
    data = list(audiodb.separator.find({'_uid': _uid}).sort('time', -1))
    for i in data:
        if (i['time'] + datetime.timedelta(hours=24)) < datetime.datetime.now():
            i['expired'] = True
        else:
            i['expired'] = False
    return render_template('/audio/pc/separator.html', data=data)

@audiom.route('/separator', methods=['GET'])
def audio_separator():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return render_template('error/m.html', error='请先登录再使用音轨分离')
    data = list(audiodb.separator.find({'_uid': _uid}).sort('time', -1))
    for i in data:
        if (i['time'] + datetime.timedelta(hours=24)) < datetime.datetime.now():
            i['expired'] = True
        else:
            i['expired'] = False
    return render_template('/audio/m/separator.html', data=data)


@audio.route('/separator/download/<string:id>/vocals')
def audio_download_vocals(id):
    return send_file('../audio/out/'+id+'/vocals.mp3')


@audio.route('/separator/download/<string:id>/accompaniment')
def audio_download_accompaniment(id):
    return send_file('../audio/out/'+id+'/accompaniment.mp3')


@audio.route('/separator/status', methods=['GET'])
def audio_separator_status():
    _uid = getuser(request.cookies.get('_uid'))
    data = list(audiodb.separator.find({'_uid': _uid, 'time': {
                '$gte': datetime.datetime.now()-datetime.timedelta(hours=24)}}).sort('time', -1).limit(5))
    for i in data:
        i['_id'] = str(i['_id'])
    return jsonify(data)


@audio.route('/separator/upload', methods=['POST'])
def audio_separator_upload():
    _uid = getuser(request.cookies.get('_uid'))
    if not _uid:
        return '请先登录再使用音轨分离'
    f = request.files.get('audio')
    if f and allowed_file(f.filename):
        fname = secure_filename(f.filename)
        id = datetime.datetime.now().__format__('%Y%m%d%H%M%S%f') + \
            str(random.randint(10, 99))
        ext = fname.rsplit('.', 1)[1].lower()
        file_bytes = f.read()
        if len(file_bytes) > 10 * 1024 * 1024:
            return '文件太大'
        with open('../tmp/'+id+'.'+ext,'wb') as f:
            f.write(file_bytes)
        n = division(open('../tmp/'+id+'.'+ext,'rb'), fname, id)
        os.remove('../tmp/'+id+'.'+ext)
        audiodb.separator.insert_one({
            'id': id,
            'time': datetime.datetime.now(),
            'status': 'waiting',
            'n': n,
            '_uid': getuser(request.cookies.get('_uid'))
        })
        return redirect('/audio/separator')
    else:
        return '文件类型不符合'
'''