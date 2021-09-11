# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, session, redirect, send_file, abort
import pymongo
from handler import _0
import random
import datetime
import os
import shutil
client = pymongo.MongoClient('127.0.0.1', 27017)
userdb = client['user']
botdb = client['qbot']
kw = Blueprint('bot_kw', __name__)


def getuser(_uid):
    if _uid and not _uid == session.get('_uid'):
        return None
    return _uid


@kw.route('/<int:group_id>')
def kw_home(group_id):
    key = request.args.get('key')
    if key is None:
        return render_template('error/pc.html', error='缺少参数key')
    data = botdb.kw_edit.find_one({
        'key': key,
        'group_id': group_id,
    })
    if data is None or data['deadtime'] < datetime.datetime.now():
        botdb.kw_edit.delete_one({
            'key': key,
            'group_id': group_id,
        })
        return render_template('error/pc.html', error='key不存在或已过期')
    return render_template('qbot/kw/pc/main.html', group_id=group_id, key=key)


@kw.route('/<int:group_id>/get', methods=['GET'])
def kw_get(group_id):

    p = request.args.get('p')
    if p is None:
        return '缺少参数', 400
    p = int(p)
    kws = list(botdb.kw.find({'group_id': group_id}).sort(
        'id', -1).skip((p-1)*20).limit(20))
    for i in kws:
        i['_id'] = str(i['_id'])
    return jsonify(kws)


@kw.route('/<int:group_id>/update', methods=['POST'])
def kw_update(group_id):
    data = request.json.get('kws')
    key = request.json.get('key')
    if (data or key) is None:
        return {'code': 1, 'error': 'not data or key'}
    keydata = botdb.kw_edit.find_one({
        'key': key,
        'group_id': group_id,
    })
    if keydata is None or keydata['deadtime'] < datetime.datetime.now():
        botdb.kw_edit.delete_one({
            'key': key,
            'group_id': group_id,
        })
        return {'code': 1, 'error': 'key已过期'}
    data = dict(data)
    for k, v in data.items():
        if v == 'deleted':
            botdb.kw.delete_one({
                'group_id': group_id,
                'id': int(k)
            })
        else:
            botdb.kw.update_one({
                'group_id': group_id,
                'id': int(k)
            }, {
                '$setOnInsert': {
                    'group_id': group_id,
                    'id': int(k)
                },
                '$set': v
            }, True)
    return _0
