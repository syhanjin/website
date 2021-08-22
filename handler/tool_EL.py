# -*- coding: utf-8 -*-
import datetime
import random
import os
from flask import Blueprint, render_template, request, jsonify, session, redirect
from flask.helpers import send_file
from flask.wrappers import Response
from pydub.audio_segment import AudioSegment
path = os.path.join('.','tmp','EL')
if not os.path.exists(path):
    os.makedirs(path)
path = os.path.join('.','tmp','EL_download')
if not os.path.exists(path):
    os.makedirs(path)

EL = Blueprint('EL', __name__)

def audio_add(tmp,id,R=False):
    path = os.path.join('.','tmp','EL',id+'.mp3')
    # tmp.save(path)
    f = open(path,'wb')
    f.write(tmp.read())
    f.close()
    tmp_au = AudioSegment.from_mp3(path)
    if R:
        tmp_au += tmp_au
    os.remove(path)
    return tmp_au


@EL.route('/tools/EL')
def EL_home():
    return render_template('tools/EL/pc/main.html')


@EL.route('/tools/EL/upload', methods=['POST'])
def EL_upload():
    id = datetime.datetime.now().__format__('%Y%m%d%H%M%S%f') + \
            str(random.randint(10, 99))
    # print('英语听力，开始处理(id:',id,')')
    au = AudioSegment.empty()
    tmp = request.files.get('au-title')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id)
    au += AudioSegment.silent(2000)
    au += AudioSegment.from_mp3('static/tools/EL/01.mp3')
    au += AudioSegment.silent(5000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt1')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt2')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt3')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt4')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt5')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(5000)
    au += AudioSegment.from_mp3('static/tools/EL/02.mp3')
    au += AudioSegment.from_mp3('static/tools/EL/03.mp3')
    au += AudioSegment.silent(5000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt6')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/04.mp3')
    au += AudioSegment.silent(1000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt7')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/05.mp3')
    au += AudioSegment.silent(1000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt8')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/06.mp3')
    au += AudioSegment.silent(1000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt9')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/07.mp3')
    au += AudioSegment.silent(1000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt10')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id,True)
    au += AudioSegment.silent(10000)
    au += AudioSegment.from_mp3('static/tools/EL/08.mp3')
    au += AudioSegment.silent(1000)
    au += AudioSegment.from_mp3('static/tools/EL/dingdong.mp3')
    tmp = request.files.get('au-pt11')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id)
    tmp = request.files.get('au-pt12')
    if not tmp:
        return 'False'
    au += audio_add(tmp,id)
    path = os.path.join('.','tmp','EL_download',id+'.mp3')
    au.export(path)
    return id
@EL.route('/tools/EL/download/<string:id>')
def EL_download(id):
    path = os.path.join('.','tmp','EL_download',id+'.mp3')
    return send_file(path)
