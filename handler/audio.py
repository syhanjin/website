# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect
import pymongo, random, datetime, os, shutil
from pydub import AudioSegment
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
audiodb = client['audio']
audio = Blueprint('audio', __name__)
def getuser(_uid):
    if not _uid == session.get('_uid'):
        return None
    return _uid
ALLOWED_EXTENSIONS = ['cda','wav','mp3','aif','aiff','mid','wma','ra','vqf','ape']
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS
@audio.route('/separator',methods=['GET'])
def audio_separator():
    
    return render_template('/audio/pc/separator.html')
@audio.route('/separator/upload',methods=['POST'])
def audio_separator_upload():
    f=request.files.get('audio')
    if f and allowed_file(f.filename):
        fname=secure_filename(f.filename)
        id = datetime.datetime.now().__format__('%Y%m%d%H%M%S%f') + str(random.randint(10,99))
        ext = fname.rsplit('.',1)[1]
        audio_segment = AudioSegment.from_file(f, format=ext)
        if len(audio_segment) > 360000:
            return 'TooLong'
        f.save('/root/audio/in/'+id+'.'+ext)
        audiodb.separator.insert_one({
            'id':id,
            'time':datetime.datetime.now(),
            'status':'waiting',
            'ext':ext,
            '_uid':getuser(request.cookies.get('_uid'))
        })
        return jsonify({'id':id})
    else:
        return 'False'