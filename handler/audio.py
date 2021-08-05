# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect
from flask.helpers import send_file
import pymongo
import random
import datetime
import os
import shutil
from werkzeug.utils import secure_filename
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
audiodb = client['audio']
audio = Blueprint('audio', __name__)


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


@audio.route('/separator/download/<string:id>/vocals')
def audio_download_vocals(id):
    return send_file('../audio/out/'+id+'/vocals.wav')


@audio.route('/separator/download/<string:id>/accompaniment')
def audio_download_accompaniment(id):
    return send_file('../audio/out/'+id+'/accompaniment.wav')


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
        return render_template('error/pc.html', error='请先登录再使用音轨分离')
    f = request.files.get('audio')
    if f and allowed_file(f.filename):
        fname = secure_filename(f.filename)
        id = datetime.datetime.now().__format__('%Y%m%d%H%M%S%f') + \
            str(random.randint(10, 99))
        ext = fname.rsplit('.', 1)[1].lower()
        file_bytes = f.read()
        if len(file_bytes) > 5 * 1024 * 1024:
            return '文件太大'
        with open('../audio/in/'+id+'.'+ext, 'wb') as f:
            f.write(file_bytes)
        audiodb.separator.insert_one({
            'id': id,
            'time': datetime.datetime.now(),
            'status': 'waiting',
            'ext': ext,
            '_uid': getuser(request.cookies.get('_uid'))
        })
        return redirect('/audio/separator')
    else:
        return '文件类型不符合'
