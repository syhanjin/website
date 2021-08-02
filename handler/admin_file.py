# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect, send_file, abort
import pymongo, random, datetime, os, shutil
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
admin_file = Blueprint('admin_file', __name__)
def getuser(_uid):
    if not _uid == session.get('_uid'):
        return None
    return _uid
def getfile(path):
    rel = {'parent':'', 'dirname':'', 'dirs':[], 'files':[]}
    for parent, dirs, files in os.walk(path, topdown=True):
        rel['parent'] = parent
        if not path == 'file':
            rel['dirname'] = os.path.dirname(path)
        for dir in sorted(dirs):
            rel['dirs'].append(dir)
        for file in sorted(files):
            rel['files'].append(file)
        break
    return rel
@admin_file.route('/admin/file', methods=['GET'])
def admin_main():
    user = userdb.userdata.find_one({'_uid':getuser(request.cookies.get('_uid'))})
    if user != None and user['admin'] > 0:
        return render_template('admin/file/pc/main.html', data=getfile('file'))
    else:
        abort(404)
@admin_file.route('/admin/file/<path:p>', methods=['GET'])
def admin_main_(p):
    user = userdb.userdata.find_one({'_uid':getuser(request.cookies.get('_uid'))})
    if user != None and user['admin'] > 0:
        path = 'file/' + p
        op = request.args.get('op')
        if op == 'mkdir':
            if not os.path.isdir(path):
                os.makedirs(path)
                return redirect('/admin/' + os.path.dirname(path))
            else:
                return 'The directory has already been created.'
        elif op == 'del':
            if os.path.isfile(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)
            return redirect('/admin/' + os.path.dirname(path))
        elif op == 'rename':
            nename = request.args.get('nename')
            nepath = os.path.dirname(path) + '/' + nename
            dirname = os.path.dirname(path)
            if os.path.exists(nepath):
                return 'This path already exists.'
            os.rename(path, nepath)
            return redirect('/admin/' + dirname)
        if os.path.isfile(path):
            try:
                return send_file(path)
            except Exception as e:
                return str(e)
        elif os.path.isdir(path):
            return render_template('admin/file/pc/main.html', data=getfile(path))
        else :
            return 'This is not a file or a directory.'
    else:
        abort(404)

@admin_file.route('/admin/file/<path:p>', methods=['POST'])
def admin_main_post_(p):
    user = userdb.userdata.find_one({'_uid':getuser(request.cookies.get('_uid'))})
    if user != None and user['admin'] > 0:
        path = 'file/' + p
        op = request.form.get('op')
        if op == 'uploadFile':
            file = request.files.get('file')
            if file:
                filename = file.filename
                file.save(os.path.abspath('') + '/' + path + '/' + filename)
                return 'True'
            else:
                return 'False'
        return 'False'
    else:
        abort(404)
