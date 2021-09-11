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

    return render_template('qbot/kw/pc/main.html', group_id=group_id)


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
    if data is None:
        abort(400)
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
